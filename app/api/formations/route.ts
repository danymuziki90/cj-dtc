import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, ApiError } from '@/lib/api-error'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { parseSessionMetadata } from '@/lib/sessions/metadata'

const formationSchema = z.object({
  title: z.string().trim().min(2, 'Titre requis'),
  description: z.string().trim().nullish().transform(val => val ?? ''),
  categorie: z.string().trim().nullish().transform(val => val ?? ''),
  duree: z.string().trim().nullish().transform(val => val ?? ''),
  modules: z.string().trim().nullish().transform(val => val ?? ''),
  methodes: z.string().trim().nullish().transform(val => val ?? ''),
  certification: z.string().trim().nullish().transform(val => val ?? ''),
  statut: z.string().trim().default('brouillon'),
  imageUrl: z.string().trim().nullish().transform(val => val ?? undefined),
  objectifs: z.string().trim().nullish().transform(val => val ?? ''),
  name: z.string().trim().nullish().transform(val => val ?? undefined),
  shortDescription: z.string().trim().nullish().transform(val => val ?? undefined),
  gallery: z.string().trim().nullish().transform(val => val ?? undefined),
  skillsAcquired: z.string().trim().nullish().transform(val => val ?? undefined),
  prerequisites: z.string().trim().nullish().transform(val => val ?? undefined),
  publicTargets: z.string().trim().nullish().transform(val => val ?? undefined),
  level: z.string().trim().nullish().transform(val => val ?? undefined),
  format: z.string().trim().nullish().transform(val => val ?? undefined),
  languages: z.string().trim().nullish().transform(val => val ?? undefined),
})

export const runtime = "nodejs"
export const dynamic = 'force-dynamic'
export const revalidate = 0

function isPublicRegistration(session: { status: string; startDate: Date; endDate?: Date; maxParticipants: number; enrollments?: { id: number }[]; prerequisites?: string | null }) {
  const statusOk = ['ouverte', 'open', 'complete', 'complet', 'active', 'publie', 'published'].includes((session.status || '').toLowerCase().trim())
  if (!statusOk) return false
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const isUpcomingOrActive = (session.endDate && new Date(session.endDate) >= today) || (session.startDate && new Date(session.startDate) >= today)
  if (!isUpcomingOrActive) return false
  if ((session.enrollments?.length || 0) >= session.maxParticipants) return false
  const deadline = parseSessionMetadata(session.prerequisites).metadata.registrationDeadline
  return !deadline || new Date(deadline).getTime() >= Date.now()
}

export const GET = apiHandler(async (req: NextRequest) => {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ formations: [] })
  }

    const { searchParams } = new URL(req.url)
    const includeStats = searchParams.get('stats') === 'true'
    const status = searchParams.get('status') || 'publie'

    // Récupérer les formations avec toutes les relations
    const formations = await prisma.formation.findMany({
      where: status !== 'all' ? { statut: status } : undefined,
      include: {
        sessions: {
          include: {
            instructors: {
              include: {
                instructor: true
              }
            },
            enrollments: {
              where: {
                status: {
                  notIn: ['waitlist', 'rejected', 'cancelled']
                }
              },
              select: {
                id: true
              }
            }
          },
          orderBy: { startDate: 'asc' }
        },
        enrollments: {
          where: { status: 'confirmed' }
        },
        evaluations: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Enrichir les données avec des calculs
    const enrichedFormations = formations.map(formation => {
      const enrollmentCount = formation.enrollments.length
      const evaluations = formation.evaluations
      
      // Calculer la note moyenne
      const rating = evaluations.length > 0
        ? evaluations.reduce((sum, ev) => sum + ev.overallRating, 0) / evaluations.length
        : undefined
      
      const reviewCount = evaluations.length

      // Trouver la prochaine session
      const now = new Date()
      const nextSession = formation.sessions
        .filter(s => isPublicRegistration(s))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]

      // Prix supprimé (gratuit ou piloté hors paiement)
      const price = 0
      const originalPrice = undefined

      // Instructeur principal (premier instructeur de la première session)
      const instructor = nextSession?.instructors?.[0]?.instructor || 
                        formation.sessions[0]?.instructors?.[0]?.instructor

      // Tags depuis la catégorie et modules
      const tags: string[] = []
      if (formation.categorie) tags.push(formation.categorie)
      if (formation.certification) tags.push('Certification')

      return {
        ...formation,
        enrollmentCount,
        rating: rating ? Math.round(rating * 10) / 10 : undefined,
        reviewCount,
        nextSession: nextSession ? {
          id: nextSession.id,
          startDate: nextSession.startDate.toISOString(),
          endDate: nextSession.endDate.toISOString(),
          location: nextSession.location || 'À définir',
          format: nextSession.format,
          price: 0,
          maxParticipants: nextSession.maxParticipants,
          currentParticipants: nextSession.enrollments?.length || 0,
          status: nextSession.status
        } : undefined,
        price,
        originalPrice: undefined,
        instructor: instructor ? {
          id: instructor.id.toString(),
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          title: instructor.expertise || 'Formateur expert',
          bio: instructor.bio,
          photoUrl: instructor.photoUrl,
          expertise: instructor.expertise?.split(',').map(e => e.trim())
        } : undefined,
        tags,
        hasCertificate: !!formation.certification,
        hasSupports: true, // Par défaut, toutes les formations incluent des supports
        hasPracticalExercises: true,
        hasCoaching: false,
        hasAccompaniment: false,
        featured: enrollmentCount > 50 || (rating && rating >= 4.5),
        sessions: formation.sessions
          .filter(s => isPublicRegistration(s))
          .map(s => ({
            id: s.id,
            startDate: s.startDate.toISOString(),
            endDate: s.endDate.toISOString(),
            startTime: s.startTime,
            endTime: s.endTime,
            location: s.location || 'À définir',
            format: s.format,
            price: 0,
            maxParticipants: s.maxParticipants,
            currentParticipants: s.enrollments?.length || 0,
            status: s.status,
            availableSeats: Math.max(0, s.maxParticipants - (s.enrollments?.length || 0))
          })),
        enrollments: undefined,
        evaluations: undefined
      }
    })

    // Retourner avec ou sans stats
    if (includeStats) {
      const stats = {
        totalFormations: enrichedFormations.length,
        totalStudents: enrichedFormations.reduce((sum, f) => sum + f.enrollmentCount, 0),
        averageRating: enrichedFormations.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / enrichedFormations.filter(f => f.rating).length || 0,
        successRate: 95
      }
      return NextResponse.json({ formations: enrichedFormations, stats })
    }

  return NextResponse.json({ formations: enrichedFormations })
})

export const POST = apiHandler(async (req: NextRequest) => {
  const { 
    title, 
    description, 
      categorie, 
      duree, 
      modules, 
      methodes, 
      certification, 
      statut,
      imageUrl,
      objectifs,
      name,
      shortDescription,
      gallery,
      skillsAcquired,
      prerequisites,
      publicTargets,
      level,
      format,
      languages
    } = formationSchema.parse(await req.json())

    // Générer un slug à partir du titre
    const generateSlug = (text: string) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    let slug = generateSlug(title)
    
    // Vérifier l'unicité du slug
    let counter = 1
    let uniqueSlug = slug
    while (await prisma.formation.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const created = await prisma.formation.create({
      data: {
        title,
        slug: uniqueSlug,
        description: description || '',
        objectifs: objectifs || '',
        categorie: categorie || '',
        duree: duree || '',
        modules: modules || '',
        methodes: methodes || '',
        certification: certification || '',
        statut,
        imageUrl: imageUrl || null,
        name: name || undefined,
        shortDescription: shortDescription || undefined,
        gallery: gallery || undefined,
        skillsAcquired: skillsAcquired || undefined,
        prerequisites: prerequisites || undefined,
        publicTargets: publicTargets || undefined,
        level: level || undefined,
        format: format || undefined,
        languages: languages || undefined
      }
  })
  return NextResponse.json(created, { status: 201 })
})
