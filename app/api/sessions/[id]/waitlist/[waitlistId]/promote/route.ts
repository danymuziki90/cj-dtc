import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = "nodejs"

// POST /api/sessions/[id]/waitlist/[waitlistId]/promote - Promouvoir depuis la liste d'attente
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; waitlistId: string }> }
) {
  try {
    const resolvedParams = await params
    const sessionId = parseInt(resolvedParams.id)
    const enrollmentId = parseInt(resolvedParams.waitlistId)

    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    if (session.currentParticipants >= session.maxParticipants) {
      return NextResponse.json(
        { error: 'La session est complète' },
        { status: 400 }
      )
    }

    // Mettre à jour l'inscription pour l'assigner à la session
    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        sessionId: sessionId,
        status: 'confirmed'
      }
    })

    // Mettre à jour le nombre de participants
    await prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        currentParticipants: session.currentParticipants + 1
      }
    })

    return NextResponse.json({
      message: 'Promu depuis la liste d\'attente',
      enrollment
    })
  } catch (error: any) {
    console.error('Erreur lors de la promotion:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la promotion' },
      { status: 500 }
    )
  }
}
