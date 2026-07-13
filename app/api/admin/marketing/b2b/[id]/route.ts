import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const requestId = parseInt(id)
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await req.json()
    const { status, notes } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const updated = await prisma.b2BRequest.update({
      where: { id: requestId },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error PUT /api/admin/marketing/b2b/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const requestId = parseInt(id)
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    await prisma.b2BRequest.delete({
      where: { id: requestId }
    })

    return NextResponse.json({ message: 'Demande supprimée avec succès' })
  } catch (error) {
    console.error('Error DELETE /api/admin/marketing/b2b/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
