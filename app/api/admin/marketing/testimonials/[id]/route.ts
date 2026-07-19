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
    const testimonialId = parseInt(id)
    if (isNaN(testimonialId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await req.json()
    const { name, location, quote, approved, order, status, adminReply, title, rating, photoUrl, showName, showPhoto } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (location !== undefined) updateData.location = location
    if (quote !== undefined) updateData.quote = quote
    if (approved !== undefined) {
      updateData.approved = approved
      updateData.status = approved ? 'approved' : 'pending'
      updateData.publishedAt = approved ? new Date() : null
    }
    if (status !== undefined && ['pending', 'approved', 'rejected'].includes(status)) {
      updateData.status = status
      updateData.approved = status === 'approved'
      updateData.publishedAt = status === 'approved' ? new Date() : null
    }
    if (order !== undefined) updateData.order = order
    if (adminReply !== undefined) updateData.adminReply = String(adminReply || '').trim() || null
    if (title !== undefined) updateData.title = String(title || '').trim() || null
    if (rating !== undefined) updateData.rating = Number(rating) || null
    if (photoUrl !== undefined) updateData.photoUrl = String(photoUrl || '').trim() || null
    if (showName !== undefined) updateData.showName = Boolean(showName)
    if (showPhoto !== undefined) updateData.showPhoto = Boolean(showPhoto)

    const updated = await prisma.testimonial.update({
      where: { id: testimonialId },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error PUT /api/admin/marketing/testimonials/[id]:', error)
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
    const testimonialId = parseInt(id)
    if (isNaN(testimonialId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    await prisma.testimonial.delete({
      where: { id: testimonialId }
    })

    return NextResponse.json({ message: 'Témoignage supprimé avec succès' })
  } catch (error) {
    console.error('Error DELETE /api/admin/marketing/testimonials/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
