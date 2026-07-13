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
    const messageId = parseInt(id)
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await req.json()
    const { status, notes } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const updated = await prisma.contactMessage.update({
      where: { id: messageId },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error PUT /api/admin/marketing/contacts/[id]:', error)
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
    const messageId = parseInt(id)
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    await prisma.contactMessage.delete({
      where: { id: messageId }
    })

    return NextResponse.json({ message: 'Message supprimé avec succès' })
  } catch (error) {
    console.error('Error DELETE /api/admin/marketing/contacts/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
