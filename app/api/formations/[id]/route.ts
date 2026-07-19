import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { parseSessionMetadata } from '@/lib/sessions/metadata'

export const runtime = "nodejs"

function isPublicRegistration(session: { status: string; startDate: Date; maxParticipants: number; currentParticipants: number; prerequisites?: string | null }) {
  if (session.status !== 'ouverte' || session.startDate < new Date() || session.currentParticipants >= session.maxParticipants) return false
  const deadline = parseSessionMetadata(session.prerequisites).metadata.registrationDeadline
  return !deadline || new Date(deadline).getTime() >= Date.now()
}

// GET /api/formations/[id] - Récupérer une formation spécifique avec toutes les données enrichies
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        enrollments: {
          where: { status: 'confirmed' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            createdAt: true
          }
        },
        sessions: {
          include: {
            instructors: {
              include: {
                instructor: true
              }
            }
          },
          orderBy: { startDate: 'asc' }
        },
        evaluations: {
          select: {
            overallRating: true,
            overallComment: true,
            contentRating: true,
            instructorRating: true,
            submittedAt: true
          }
        },
        documents: {
          where: { isPublic: true },
          select: {
            id: true,
            title: true,
            description: true,
            fileName: true,
            category: true
          }
        }
      }
    })

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    // Enrichir les données
    if (formation.statut !== 'publie') {
      return NextResponse.json({ error: 'Formation non disponible' }, { status: 404 })
    }

    const enrollmentCount = formation.enrollments.length
    const evaluations = formation.evaluations
    
    // Calculer la note moyenne
    const rating = evaluations.length > 0
      ? evaluations.reduce((sum, ev) => sum + ev.overallRating, 0) / evaluations.length
      : undefined
    
    const reviewCount = evaluations.length

    // Prochaine session
    const now = new Date()
    const nextSession = formation.sessions
      .filter(s => isPublicRegistration(s))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]

    // Prix supprimé (gratuit ou piloté hors paiement)
    const price = 0
    const originalPrice = undefined

    // Instructeur principal
    const instructor = nextSession?.instructors?.[0]?.instructor || 
                       formation.sessions[0]?.instructors?.[0]?.instructor

    // Sessions disponibles
    const availableSessions = formation.sessions
      .filter(s => isPublicRegistration(s))
      .map(s => ({
        id: s.id,
        startDate: s.startDate.toISOString(),
        endDate: s.endDate.toISOString(),
        location: s.location || 'À définir',
        format: s.format,
        price: 0,
        maxParticipants: s.maxParticipants,
        currentParticipants: s.currentParticipants,
        status: s.status,
        availableSeats: s.maxParticipants - s.currentParticipants
      }))

    const enrichedFormation = {
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
        currentParticipants: nextSession.currentParticipants,
        status: nextSession.status,
        availableSeats: nextSession.maxParticipants - nextSession.currentParticipants
      } : undefined,
      sessions: availableSessions,
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
      hasCertificate: !!formation.certification,
      hasSupports: true,
      hasPracticalExercises: true,
      hasCoaching: false,
      hasAccompaniment: false,
      featured: enrollmentCount > 50 || (rating && rating >= 4.5),
      completionRate: 85, // À calculer depuis les données réelles
      // Enlever les données sensibles
      enrollments: undefined,
      evaluations: undefined
    }

    return NextResponse.json(enrichedFormation)
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    )
  }
}

// PUT /api/formations/[id] - Mettre à jour une formation
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await req.json()
    const { 
      title, 
      description,
      objectifs,
      categorie, 
      duree, 
      modules, 
      methodes, 
      certification, 
      statut,
      imageUrl 
    } = body

    // Vérifier que la formation existe
    const existingFormation = await prisma.formation.findUnique({
      where: { id }
    })

    if (!existingFormation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    // Générer un nouveau slug si le titre a changé
    let slug = existingFormation.slug
    if (title && title !== existingFormation.title) {
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
      
      slug = generateSlug(title)
      
      // Vérifier l'unicité
      let counter = 1
      let uniqueSlug = slug
      while (await prisma.formation.findFirst({ 
        where: { 
          slug: uniqueSlug,
          id: { not: id }
        } 
      })) {
        uniqueSlug = `${slug}-${counter}`
        counter++
      }
      slug = uniqueSlug
    }

    const updatedFormation = await prisma.formation.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && slug !== existingFormation.slug && { slug }),
        ...(description !== undefined && { description }),
        ...(objectifs !== undefined && { objectifs }),
        ...(categorie !== undefined && { categorie }),
        ...(duree !== undefined && { duree }),
        ...(modules !== undefined && { modules }),
        ...(methodes !== undefined && { methodes }),
        ...(certification !== undefined && { certification }),
        ...(statut && { statut }),
        ...(imageUrl !== undefined && { imageUrl })
      }
    })

    return NextResponse.json(updatedFormation)
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la formation', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/formations/[id] - Supprimer une formation
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Vérifier que la formation existe
    const existingFormation = await prisma.formation.findUnique({
      where: { id },
      include: {
        enrollments: true,
        sessions: true
      }
    })

    if (!existingFormation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    // Vérifier s'il y a des inscriptions ou des sessions actives
    if (existingFormation.enrollments.length > 0 || existingFormation.sessions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Impossible de supprimer une formation avec des inscriptions ou des sessions actives. Veuillez d\'abord archiver la formation.' 
        },
        { status: 400 }
      )
    }

    await prisma.formation.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Formation supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la formation' },
      { status: 500 }
    )
  }
}
