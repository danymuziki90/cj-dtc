import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(req)
    if (auth.error) return auth.error

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

    try {
      revalidatePath('/')
      revalidatePath('/[locale]', 'page')
      revalidatePath('/fr')
      revalidatePath('/en')
    } catch (e) {
      console.error('Revalidation error:', e)
    }

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
    const auth = await requireAdmin(req)
    if (auth.error) return auth.error

    const { id } = await params
    const testimonialId = parseInt(id, 10)

    if (isNaN(testimonialId)) {
      return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })
    }

    await prisma.testimonial.delete({
      where: { id: testimonialId }
    })

    try {
      revalidatePath('/')
      revalidatePath('/[locale]', 'page')
      revalidatePath('/fr')
      revalidatePath('/en')
    } catch (e) {
      console.error('Revalidation error:', e)
    }

    return NextResponse.json({ success: true, message: 'Témoignage supprimé avec succès' })
  } catch (error) {
    console.error('[DELETE /api/admin/testimonials/[id]]', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du témoignage.' }, { status: 500 })
  }
}
