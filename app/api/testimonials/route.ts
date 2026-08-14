import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

// ── Types ──────────────────────────────────────────────────────────────────────

interface PublicTestimonialItem {
  id: number
  name: string
  rating: number
  title: string | null
  titleEn?: string | null
  content: string
  contentEn?: string | null
  formation: string | null
  formationEn?: string | null
  sessionDate: string | null
  createdAt: string
}

// ── GET — Témoignages publics (status = "approved") ───────────────────────────

export async function GET() {
  // Vérification de la variable d'environnement obligatoire
  if (!process.env.DATABASE_URL) {
    console.warn('[API testimonials GET] DATABASE_URL manquante — retour tableau vide')
    return NextResponse.json([])
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      include: {
        Student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        Formation: {
          select: {
            title: true,
            titleEn: true,
          },
        },
        TrainingSession: {
          select: {
            startDate: true,
            endDate: true,
          },
        },
      },
    })

    // Aucun témoignage approuvé → tableau vide (pas une erreur)
    if (!testimonials || testimonials.length === 0) {
      return NextResponse.json([])
    }

    const mapped: PublicTestimonialItem[] = testimonials.map((t) => {
      // Nom affiché : initiale du prénom + nom de famille (ex : M. Dupont)
      const firstName = t.Student?.firstName ?? ''
      const lastName = t.Student?.lastName ?? ''
      const displayName =
        firstName && lastName
          ? `${firstName[0]}. ${lastName}`
          : firstName || lastName || 'Étudiant CJ DTC'

      // Date de session lisible
      let sessionDate: string | null = null
      if (t.TrainingSession?.startDate) {
        const year = new Date(t.TrainingSession.startDate).getFullYear()
        const endYear = t.TrainingSession.endDate
          ? new Date(t.TrainingSession.endDate).getFullYear()
          : null
        sessionDate =
          endYear && endYear !== year
            ? `Session ${year}–${endYear}`
            : `Session ${year}`
      }

      return {
        id: t.id,
        name: displayName,
        rating: t.rating ?? 5,
        title: t.title ?? null,
        titleEn: (t as any).titleEn ?? null,
        content: t.content,
        contentEn: t.contentEn ?? null,
        formation: t.Formation?.title ?? null,
        formationEn: t.Formation?.titleEn ?? null,
        sessionDate,
        createdAt: t.createdAt.toISOString(),
      }
    })

    return NextResponse.json(mapped)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[API testimonials GET] Erreur Prisma :', message)
    // Retourner un tableau vide plutôt qu'une erreur 500 pour ne pas casser la page
    return NextResponse.json([])
  }
}

// ── POST — Soumission d'un témoignage (étudiant connecté requis) ──────────────

export async function POST(request: NextRequest) {
  // Vérification de la variable d'environnement obligatoire
  if (!process.env.DATABASE_URL) {
    console.warn('[API testimonials POST] DATABASE_URL manquante')
    return NextResponse.json(
      { error: 'Service temporairement indisponible.' },
      { status: 503 }
    )
  }

  // Authentification étudiant obligatoire
  const authResult = await requireStudent(request)
  if (authResult.error) {
    return NextResponse.json(
      {
        error:
          'Vous devez être connecté à votre espace étudiant pour soumettre un témoignage.',
      },
      { status: 401 }
    )
  }

  const student = authResult.student!

  // Parsing et validation du corps de la requête
  let body: {
    content?: unknown
    rating?: unknown
    title?: unknown
    formation?: unknown
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const rating =
    typeof body.rating === 'number' ? body.rating : parseInt(String(body.rating ?? '5'), 10)
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const formationName =
    typeof body.formation === 'string' ? body.formation.trim() : ''

  // Validations
  if (content.length < 20) {
    return NextResponse.json(
      {
        error:
          'Le témoignage doit contenir au moins 20 caractères.',
      },
      { status: 422 }
    )
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'La note doit être comprise entre 1 et 5.' },
      { status: 422 }
    )
  }

  // Résolution optionnelle de la formation par nom
  let formationId: number | null = null
  if (formationName) {
    try {
      const formation = await prisma.formation.findFirst({
        where: {
          title: {
            contains: formationName,
            mode: 'insensitive',
          },
        },
        select: { id: true },
      })
      if (formation) formationId = formation.id
    } catch (err: unknown) {
      // Non-bloquant : log uniquement
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[API testimonials POST] Formation introuvable :', formationName, msg)
    }
  }

  // Vérification de doublons récents (même étudiant, même contenu — anti-spam simple)
  try {
    const recent = await prisma.testimonial.findFirst({
      where: {
        studentId: student.id,
        content: { equals: content },
      },
      select: { id: true },
    })
    if (recent) {
      return NextResponse.json(
        { error: 'Ce témoignage a déjà été soumis.' },
        { status: 409 }
      )
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[API testimonials POST] Erreur vérification doublon :', msg)
  }

  // Création du témoignage
  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        studentId: student.id,
        content,
        rating,
        title: title || null,
        formationId,
        status: 'pending', // Toujours en attente de validation admin
      },
      select: { id: true, status: true, createdAt: true },
    })

    console.info(
      `[API testimonials POST] Nouveau témoignage #${testimonial.id} soumis par student=${student.id}`
    )

    return NextResponse.json(
      {
        id: testimonial.id,
        status: testimonial.status,
        createdAt: testimonial.createdAt,
        message:
          'Votre témoignage a été soumis avec succès et sera visible après validation.',
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[API testimonials POST] Erreur création Prisma :', message)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l\u2019enregistrement. Veuillez r\u00e9essayer." },
      { status: 500 }
    )
  }
}
