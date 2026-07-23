import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { buildRateLimitIdentifier, consumeRateLimit } from '@/lib/auth-portal/rate-limit'

const enrollSchema = z.object({
  formationId: z.number().int().positive().optional(),
  sessionId: z.number().int().positive().optional(),
})

const ENROLL_LIMIT = 10
const ENROLL_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const enrollments = await prisma.enrollment.findMany({
    where: {
      OR: [
        { studentId: auth.student.id },
        { email: { equals: auth.student.email, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      createdAt: true,
      formation: {
        select: { id: true, title: true, slug: true, categorie: true, imageUrl: true },
      },
    },
  })

  return NextResponse.json({ enrollments })
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const rateLimitKey = buildRateLimitIdentifier(request, auth.student.id)
  const rateLimit = consumeRateLimit({
    bucket: 'student-enroll',
    identifier: rateLimitKey,
    limit: ENROLL_LIMIT,
    windowMs: ENROLL_WINDOW_MS,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Trop de demandes. Veuillez réessayer dans une heure.' },
      { status: 429 }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = enrollSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Session ou formation invalide.' }, { status: 400 })
  }

  let formationId = parsed.data.formationId
  const sessionId = parsed.data.sessionId

  let session: any = null
  let formation: any = null

  if (sessionId) {
    session = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: { formation: true },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session introuvable.' }, { status: 404 })
    }

    const statusLower = (session.status || '').toLowerCase().trim()
    if (['brouillon', 'archive', 'annulee', 'cancelled', 'draft'].includes(statusLower)) {
      return NextResponse.json({ error: 'Cette session n\'est pas ouverte actuellement.' }, { status: 422 })
    }

    formationId = session.formationId
    formation = session.formation
  } else if (formationId) {
    formation = await prisma.formation.findUnique({
      where: { id: formationId },
    })
  }

  if (!formation) {
    return NextResponse.json({ error: 'Formation introuvable.' }, { status: 404 })
  }

  // Marquer la formation comme publiée si elle n'était pas encore marquée
  if (formation.statut !== 'publie') {
    await prisma.formation.update({
      where: { id: formation.id },
      data: { statut: 'publie' },
    }).catch(() => null)
  }

  // Prévenir les doublons d'inscriptions actives pour la même session ou formation
  const existing = await prisma.enrollment.findFirst({
    where: {
      OR: [
        { studentId: auth.student.id },
        { email: { equals: auth.student.email, mode: 'insensitive' } },
      ],
      ...(sessionId ? { sessionId } : { formationId }),
      status: { notIn: ['rejected', 'cancelled'] },
    },
    select: { id: true, status: true },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Vous êtes déjà inscrit à cette session.', enrollmentId: existing.id },
      { status: 409 }
    )
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: auth.student.id,
      firstName: auth.student.firstName,
      lastName: auth.student.lastName,
      email: auth.student.email,
      phone: auth.student.phone || null,
      address: auth.student.address || null,
      formationId: formation.id,
      sessionId: session?.id || null,
      startDate: session?.startDate || new Date(),
      status: 'pending',
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      formation: { select: { id: true, title: true, slug: true } },
    },
  })

  // Envoi de l'email de confirmation
  try {
    const datesText = session
      ? `${new Date(session.startDate).toLocaleDateString('fr-FR')} au ${new Date(session.endDate).toLocaleDateString('fr-FR')}`
      : new Date(enrollment.createdAt).toLocaleDateString('fr-FR')

    const sessionMeta = session
      ? (session.prerequisites?.startsWith('{')
          ? JSON.parse(session.prerequisites)
          : null)
      : null
    const sessionTitle = sessionMeta?.customTitle || formation.title || (session ? `#${session.id}` : '')

    const variables: Record<string, string> = {
      Nom_etudiant: `${auth.student.firstName} ${auth.student.lastName}`,
      Formation: formation.title,
      Session: sessionTitle,
      Dates: datesText,
      Lieu: session?.location || 'À distance',
      Coordonnees_contact: process.env.CONTACT_EMAIL || 'contact@cjdevelopmenttc.org',
      Signature: 'CJ Development Training Center',
    }

    const replaceVars = (text: string) => {
      return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || variables[key.toLowerCase()] || '')
    }

    const template = await prisma.emailTemplate.findUnique({ where: { id: 'pending' } })

    let emailSubject = `Demande d'inscription reçue - ${sessionTitle}`
    let emailBody = `Bonjour ${variables.Nom_etudiant},\n\nNous avons bien reçu votre demande d'inscription à la session "${sessionTitle}".\n\nVotre demande est actuellement en cours d'examen par nos services.`

    if (template) {
      emailSubject = replaceVars(template.subject)
      emailBody = replaceVars(template.body)
    }

    const { sendEmail, renderBrandedEmailLayout } = await import('@/lib/email')
    const htmlContent = renderBrandedEmailLayout({
      eyebrow: 'Inscription',
      title: emailSubject,
      introHtml: emailBody.replace(/\n/g, '<br />'),
      bodyHtml: ''
    })

    await sendEmail({
      to: auth.student.email,
      subject: emailSubject,
      html: htmlContent,
      text: emailBody
    })
  } catch (emailErr) {
    console.error("Erreur lors de l'envoi de l'email de confirmation d'inscription :", emailErr)
  }

  return NextResponse.json({ success: true, enrollment }, { status: 201 })
}
