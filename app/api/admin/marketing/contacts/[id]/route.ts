import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(req)
    if (auth.error) {
      return auth.error
    }

    const { id } = await params
    const messageId = parseInt(id, 10)
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
      data: updateData,
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
    const auth = await requireAdmin(req)
    if (auth.error) {
      return auth.error
    }

    const { id } = await params
    const messageId = parseInt(id, 10)
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    await prisma.contactMessage.delete({
      where: { id: messageId },
    })

    return NextResponse.json({ message: 'Message supprimé avec succès' })
  } catch (error) {
    console.error('Error DELETE /api/admin/marketing/contacts/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
