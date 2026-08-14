import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'
import { revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

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

    const body = await request.json()
    const { imageUrl, imageAlt, eyebrowFr, eyebrowEn, titleFr, titleEn,
            descriptionFr, descriptionEn, badgeFr, badgeEn, order, isActive } = body

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
