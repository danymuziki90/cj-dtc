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
    const faqId = parseInt(id)
    if (isNaN(faqId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await req.json()
    const { question, answer, category, order } = body

    const updateData: any = {}
    if (question !== undefined) updateData.question = question
    if (answer !== undefined) updateData.answer = answer
    if (category !== undefined) updateData.category = category
    if (order !== undefined) updateData.order = order

    const updated = await prisma.fAQ.update({
      where: { id: faqId },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error PUT /api/admin/marketing/faq/[id]:', error)
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
    const faqId = parseInt(id)
    if (isNaN(faqId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    await prisma.fAQ.delete({
      where: { id: faqId }
    })

    return NextResponse.json({ message: 'Entrée FAQ supprimée avec succès' })
  } catch (error) {
    console.error('Error DELETE /api/admin/marketing/faq/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
