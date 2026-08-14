import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'
import { revalidateTag } from 'next/cache'
import { uploadToR2 } from '@/lib/r2'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

/** GET /api/admin/heroes/[id]/slides — Liste les slides d'un hero */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const slides = await prisma.heroSlide.findMany({
      where: { heroId: id },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ slides })
  } catch (error) {
    console.error('[GET /api/admin/heroes/[id]/slides]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/admin/heroes/[id]/slides — Créer un nouveau slide */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const hero = await prisma.heroSection.findUnique({ where: { id } })
    if (!hero) {
      return NextResponse.json({ error: 'Hero not found' }, { status: 404 })
    }

    const contentType = request.headers.get('content-type') ?? ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file || !ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE_BYTES) {
        return NextResponse.json({ error: 'Image invalide ou supérieure à 5 Mo.' }, { status: 400 })
      }

      const lastSlide = await prisma.heroSlide.findFirst({ where: { heroId: id }, orderBy: { order: 'desc' } })
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop() || 'jpg'
      const imageUrl = await uploadToR2(buffer, `hero-slide-${hero.pageKey}-${Date.now()}.${ext}`, 'heroes', file.type)
      const slide = await prisma.heroSlide.create({
        data: {
          heroId: id,
          imageUrl,
          titleFr: '',
          titleEn: '',
          order: lastSlide ? lastSlide.order + 1 : 0,
        },
      })
      revalidateTag(`hero-${hero.pageKey}`)
      return NextResponse.json({ slide }, { status: 201 })
    }

    const body = await request.json()
    const { imageUrl, imageAlt, eyebrowFr, eyebrowEn, titleFr, titleEn,
            descriptionFr, descriptionEn, badgeFr, badgeEn, ctaLabelFr, ctaLabelEn, ctaHref, order, isActive } = body

    const fallbackImageUrl = hero.imageUrl || hero.defaultImageUrl
    if (!imageUrl && !fallbackImageUrl) {
      return NextResponse.json({ error: 'Ajoutez une image principale ou indiquez une URL d’image pour ce slide.' }, { status: 400 })
    }

    // Calculer l'ordre si non fourni
    const lastSlide = await prisma.heroSlide.findFirst({
      where: { heroId: id },
      orderBy: { order: 'desc' },
    })
    const slideOrder = order ?? (lastSlide ? lastSlide.order + 1 : 0)

    const slide = await prisma.heroSlide.create({
      data: {
        heroId: id,
        imageUrl: imageUrl || fallbackImageUrl!,
        imageAlt,
        eyebrowFr,
        eyebrowEn,
        titleFr: titleFr || 'Nouveau slide',
        titleEn: titleEn || 'New slide',
        descriptionFr,
        descriptionEn,
        badgeFr,
        badgeEn,
        ctaLabelFr,
        ctaLabelEn,
        ctaHref,
        order: slideOrder,
        isActive: isActive ?? true,
      },
    })

    revalidateTag(`hero-${hero.pageKey}`)

    return NextResponse.json({ slide }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/heroes/[id]/slides]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
