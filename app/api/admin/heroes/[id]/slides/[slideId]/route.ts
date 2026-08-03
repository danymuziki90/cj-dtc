import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'
import { revalidateTag } from 'next/cache'
import { uploadToR2 } from '@/lib/r2'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

/** PUT /api/admin/heroes/[id]/slides/[slideId] — Mettre à jour un slide */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slideId: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, slideId } = await params

  try {
    // Vérifier si c'est un upload multipart ou JSON
    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
      // Upload d'image pour le slide
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Format non autorisé' }, { status: 400 })
      }
      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json({ error: 'Fichier trop volumineux (max 5 MB)' }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `hero-slide-${slideId}-${Date.now()}.${ext}`
      const imageUrl = await uploadToR2(buffer, fileName, 'heroes', file.type)

      const slide = await prisma.heroSlide.update({
        where: { id: slideId, heroId: id },
        data: { imageUrl },
      })

      const hero = await prisma.heroSection.findUnique({ where: { id } })
      if (hero) revalidateTag(`hero-${hero.pageKey}`)

      return NextResponse.json({ slide })
    }

    // Mise à jour des champs texte
    const body = await request.json()
    const { imageUrl, imageAlt, eyebrowFr, eyebrowEn, titleFr, titleEn,
            descriptionFr, descriptionEn, badgeFr, badgeEn, order } = body

    const slide = await prisma.heroSlide.update({
      where: { id: slideId, heroId: id },
      data: {
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imageAlt !== undefined && { imageAlt }),
        ...(eyebrowFr !== undefined && { eyebrowFr }),
        ...(eyebrowEn !== undefined && { eyebrowEn }),
        ...(titleFr !== undefined && { titleFr }),
        ...(titleEn !== undefined && { titleEn }),
        ...(descriptionFr !== undefined && { descriptionFr }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(badgeFr !== undefined && { badgeFr }),
        ...(badgeEn !== undefined && { badgeEn }),
        ...(order !== undefined && { order }),
      },
    })

    const hero = await prisma.heroSection.findUnique({ where: { id } })
    if (hero) revalidateTag(`hero-${hero.pageKey}`)

    return NextResponse.json({ slide })
  } catch (error) {
    console.error('[PUT /api/admin/heroes/[id]/slides/[slideId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/admin/heroes/[id]/slides/[slideId] — Supprimer un slide */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slideId: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, slideId } = await params

  try {
    await prisma.heroSlide.delete({
      where: { id: slideId, heroId: id },
    })

    const hero = await prisma.heroSection.findUnique({ where: { id } })
    if (hero) revalidateTag(`hero-${hero.pageKey}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/heroes/[id]/slides/[slideId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
