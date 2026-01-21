import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/sessions/[id]/waitlist - Récupérer la liste d'attente
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const sessionId = parseInt(resolvedParams.id)

    const waitlist = await prisma.waitlist.findMany({
      where: { sessionId },
      include: {
        enrollment: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        position: 'asc'
      }
    })

    return NextResponse.json(waitlist.map((item, index) => ({
      id: item.id,
      email: item.enrollment.email,
      firstName: item.enrollment.firstName,
      lastName: item.enrollment.lastName,
      addedAt: item.addedAt.toISOString(),
      position: item.position || index + 1,
      notifiedAt: item.notifiedAt?.toISOString() || null
    })))
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la liste d\'attente:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la liste d\'attente' },
      { status: 500 }
    )
  }
}

// POST /api/sessions/[id]/waitlist - Ajouter à la liste d'attente
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const sessionId = parseInt(resolvedParams.id)
    const { enrollmentId } = await req.json()

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'enrollmentId est requis' },
        { status: 400 }
      )
    }

    // Vérifier que la session est complète
    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    if (session.currentParticipants < session.maxParticipants) {
      return NextResponse.json(
        { error: 'La session n\'est pas encore complète' },
        { status: 400 }
      )
    }

    // Compter le nombre d'entrées existantes pour déterminer la position
    const existingCount = await prisma.waitlist.count({
      where: { sessionId }
    })

    // Vérifier si déjà en liste d'attente
    const existing = await prisma.waitlist.findUnique({
      where: {
        sessionId_enrollmentId: {
          sessionId,
          enrollmentId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Déjà en liste d\'attente' },
        { status: 409 }
      )
    }

    // Créer l'entrée dans la liste d'attente
    const waitlistItem = await prisma.waitlist.create({
      data: {
        sessionId,
        enrollmentId,
        position: existingCount + 1
      },
      include: {
        enrollment: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(waitlistItem, { status: 201 })
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout à la liste d\'attente:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout à la liste d\'attente' },
      { status: 500 }
    )
  }
}
