import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE /api/sessions/[id]/waitlist/[waitlistId] - Retirer de la liste d'attente
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; waitlistId: string }> }
) {
  try {
    const resolvedParams = await params
    const waitlistId = parseInt(resolvedParams.waitlistId)

    const waitlistItem = await prisma.waitlist.findUnique({
      where: { id: waitlistId }
    })

    if (!waitlistItem) {
      return NextResponse.json(
        { error: 'Entrée de liste d\'attente non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer l'entrée
    await prisma.waitlist.delete({
      where: { id: waitlistId }
    })

    // Réorganiser les positions des autres entrées
    const remainingItems = await prisma.waitlist.findMany({
      where: {
        sessionId: waitlistItem.sessionId,
        position: { gt: waitlistItem.position }
      }
    })

    for (const item of remainingItems) {
      await prisma.waitlist.update({
        where: { id: item.id },
        data: { position: item.position - 1 }
      })
    }

    return NextResponse.json({
      message: 'Retiré de la liste d\'attente',
      waitlistId
    })
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
