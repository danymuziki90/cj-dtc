import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const testimonialId = parseInt(id, 10)

    if (isNaN(testimonialId)) {
      return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })
    }

    const body = await req.json()
    const { status, adminReply, adminNote, title, content, rating } = body

    const updateData: any = {}

    if (status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
      }
      updateData.status = status
    }

    if (adminReply !== undefined) {
      updateData.adminReply = adminReply
    }

    if (adminNote !== undefined) {
      updateData.adminNote = adminNote
    }

    if (title !== undefined) {
      updateData.title = title
    }

    if (content !== undefined) {
      if (content.trim().length < 20) {
        return NextResponse.json({ error: 'Le contenu doit faire au moins 20 caractères' }, { status: 400 })
      }
      updateData.content = content
    }

    if (rating !== undefined) {
      const numRating = parseInt(rating, 10)
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return NextResponse.json({ error: 'La note doit être comprise entre 1 et 5' }, { status: 400 })
      }
      updateData.rating = numRating
    }

    const updated = await prisma.testimonial.update({
      where: { id: testimonialId },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        formation: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/admin/testimonials/[id]]', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du témoignage.' }, { status: 500 })
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
    const testimonialId = parseInt(id, 10)

    if (isNaN(testimonialId)) {
      return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })
    }

    await prisma.testimonial.delete({
      where: { id: testimonialId }
    })

    return NextResponse.json({ success: true, message: 'Témoignage supprimé avec succès' })
  } catch (error) {
    console.error('[DELETE /api/admin/testimonials/[id]]', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du témoignage.' }, { status: 500 })
  }
}
