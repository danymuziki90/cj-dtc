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
  if (!authResult.ok) {
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
  if (!authResult.ok) {
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
            descriptionFr, descriptionEn, badgeFr, badgeEn, order } = body

    if (!imageUrl || !titleFr || !titleEn) {
      return NextResponse.json({ error: 'imageUrl, titleFr and titleEn are required' }, { status: 400 })
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
        order: slideOrder,
      },
    })

    revalidateTag(`hero-${hero.pageKey}`)

    return NextResponse.json({ slide }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/heroes/[id]/slides]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
