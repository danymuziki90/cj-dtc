import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'
import { revalidateTag } from 'next/cache'
import { R2StorageError, uploadToR2 } from '@/lib/r2'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

/** PUT /api/admin/heroes/[id]/slides/[slideId] — Mettre à jour un slide */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slideId: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, slideId } = await params

  try {
    const existingSlide = await prisma.heroSlide.findUnique({
      where: { id: slideId },
      // Ne sélectionner que les champs nécessaires : les anciennes bases ne
      // possèdent pas forcément les colonnes récentes du carrousel.
      select: { id: true, heroId: true, hero: { select: { id: true, pageKey: true } } },
    })

    if (!existingSlide || existingSlide.heroId !== id) {
      return NextResponse.json({ error: 'Slide introuvable' }, { status: 404 })
    }

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
        where: { id: slideId },
        data: { imageUrl },
      })

      const pageKey = existingSlide.hero?.pageKey
      if (pageKey) {
        try { revalidateTag(`hero-${pageKey}`, 'max') } catch {}
      }

      return NextResponse.json({ slide })
    }

    // Mise à jour des champs texte
    const body = await request.json()
    const {
      imageUrl,
      imageAlt,
      eyebrowFr,
      eyebrowEn,
      titleFr,
      titleEn,
      descriptionFr,
      descriptionEn,
      badgeFr,
      badgeEn,
      ctaLabelFr,
      ctaLabelEn,
      ctaHref,
      order,
      isActive,
    } = body

    let slide: any
    try {
      slide = await prisma.heroSlide.update({
        where: { id: slideId },
        data: {
          ...(imageUrl !== undefined && { imageUrl: imageUrl || '' }),
          ...(imageAlt !== undefined && { imageAlt }),
          ...(eyebrowFr !== undefined && { eyebrowFr }),
          ...(eyebrowEn !== undefined && { eyebrowEn }),
          ...(titleFr !== undefined && { titleFr: titleFr || '' }),
          ...(titleEn !== undefined && { titleEn: titleEn || '' }),
          ...(descriptionFr !== undefined && { descriptionFr }),
          ...(descriptionEn !== undefined && { descriptionEn }),
          ...(badgeFr !== undefined && { badgeFr }),
          ...(badgeEn !== undefined && { badgeEn }),
          ...(ctaLabelFr !== undefined && { ctaLabelFr }),
          ...(ctaLabelEn !== undefined && { ctaLabelEn }),
          ...(ctaHref !== undefined && { ctaHref }),
          ...(order !== undefined && { order: Number(order) || 0 }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        },
      })
    } catch (error) {
      console.warn('[PUT /api/admin/heroes/[id]/slides/[slideId]] Fallback update without extended columns:', error)
      slide = await prisma.heroSlide.update({
        where: { id: slideId },
        data: {
          ...(imageUrl !== undefined && { imageUrl: imageUrl || '' }),
          ...(imageAlt !== undefined && { imageAlt }),
          ...(titleFr !== undefined && { titleFr: titleFr || '' }),
          ...(titleEn !== undefined && { titleEn: titleEn || '' }),
          ...(order !== undefined && { order: Number(order) || 0 }),
        },
      })
    }

    const pageKey = existingSlide.hero?.pageKey
    if (pageKey) {
      try { revalidateTag(`hero-${pageKey}`, 'max') } catch {}
    }

    return NextResponse.json({ slide })
  } catch (error: any) {
    console.error('[PUT /api/admin/heroes/[id]/slides/[slideId]]', error)
    if (error instanceof R2StorageError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 503 })
    }
    return NextResponse.json({ error: error?.message || 'Erreur interne du serveur' }, { status: 500 })
  }
}

/** DELETE /api/admin/heroes/[id]/slides/[slideId] — Supprimer un slide */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slideId: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, slideId } = await params

  try {
    const existingSlide = await prisma.heroSlide.findUnique({
      where: { id: slideId },
      // `include` charge toutes les colonnes HeroSlide, dont certaines peuvent
      // manquer si la migration carousel n'a pas encore été appliquée.
      select: { id: true, heroId: true, hero: { select: { pageKey: true } } },
    })

    if (!existingSlide || existingSlide.heroId !== id) {
      return NextResponse.json({ error: 'Slide introuvable' }, { status: 404 })
    }

    await prisma.heroSlide.delete({
      where: { id: slideId },
      select: { id: true },
    })

    if (existingSlide.hero?.pageKey) {
      try { revalidateTag(`hero-${existingSlide.hero.pageKey}`, 'max') } catch {}
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE /api/admin/heroes/[id]/slides/[slideId]]', error)
    return NextResponse.json({ error: error?.message || 'Erreur interne du serveur' }, { status: 500 })
  }
}
