import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'
import { revalidatePath, revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

const heroEditorSelect = {
  id: true, pageKey: true, isActive: true, imageUrl: true, imageAlt: true,
  defaultImageUrl: true, eyebrowFr: true, titleFr: true, descriptionFr: true,
  eyebrowEn: true, titleEn: true, descriptionEn: true, ctasFr: true,
  ctasEn: true, badgesFr: true, badgesEn: true, overlayOpacity: true,
  compact: true, createdAt: true, updatedAt: true,
  slides: {
    orderBy: { order: 'asc' as const },
    select: {
      id: true, heroId: true, order: true, imageUrl: true, imageAlt: true,
      eyebrowFr: true, eyebrowEn: true, titleFr: true, titleEn: true,
      descriptionFr: true, descriptionEn: true, badgeFr: true, badgeEn: true,
      createdAt: true, updatedAt: true,
    },
  },
} as const

const heroEditorCarouselSelect = {
  ...heroEditorSelect,
  carouselEnabled: true,
  slideDuration: true,
  slides: {
    ...heroEditorSelect.slides,
    select: { ...heroEditorSelect.slides.select, isActive: true },
  },
} as const

/** Mapping pageKey → chemins à revalider */
const REVALIDATE_PATHS: Record<string, string[]> = {
  home:        ['/fr', '/en', '/'],
  about:       ['/fr/about', '/en/about'],
  sessions:    ['/fr/sessions', '/en/sessions'],
  entreprises: ['/fr/entreprises', '/en/entreprises'],
  actualites:  ['/fr/actualites', '/en/actualites'],
  contact:     ['/fr/contact', '/en/contact'],
  emplois:     ['/fr/emplois', '/en/emplois'],
  galerie:     ['/fr/galerie', '/en/galerie'],
  partenaires: ['/fr/partenaires', '/en/partenaires'],
}

/** GET /api/admin/heroes/[id] — Détail d'un hero */
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
    let hero: Record<string, unknown> | null = null
    try {
      hero = await prisma.heroSection.findFirst({
        where: { OR: [{ id }, { pageKey: id }] },
        select: heroEditorCarouselSelect,
      })
    } catch (error) {
      console.warn('[GET /api/admin/heroes/[id]] Retrying with legacy select:', error)
      hero = await prisma.heroSection.findFirst({
        where: { OR: [{ id }, { pageKey: id }] },
        select: heroEditorSelect,
      })
    }

    if (!hero) {
      return NextResponse.json({ error: 'Hero not found' }, { status: 404 })
    }

    const normalizedHero = {
      ...hero,
      carouselEnabled: hero.carouselEnabled ?? true,
      slideDuration: hero.slideDuration ?? 6000,
      slides: ((hero.slides as Array<Record<string, unknown>>) ?? []).map((slide) => ({
        ...slide,
        isActive: slide.isActive ?? true,
      })),
    }
    return NextResponse.json({ ...normalizedHero, hero: normalizedHero })
  } catch (error) {
    console.error('[GET /api/admin/heroes/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/admin/heroes/[id] — Mise à jour d'un hero */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Identifier la section soit par son ID direct soit par son pageKey
    const existing = await prisma.heroSection.findFirst({
      where: { OR: [{ id }, { pageKey: id }] },
      select: { id: true, pageKey: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Section Hero introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const {
      isActive,
      imageUrl,
      imageAlt,
      eyebrowFr, titleFr, descriptionFr,
      eyebrowEn, titleEn, descriptionEn,
      ctasFr, ctasEn,
      badgesFr, badgesEn,
      overlayOpacity,
      compact,
      carouselEnabled,
      slideDuration,
    } = body

    const targetId = existing.id

    let hero: any
    try {
      hero = await prisma.heroSection.update({
        where: { id: targetId },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(imageAlt !== undefined && { imageAlt }),
          ...(eyebrowFr !== undefined && { eyebrowFr }),
          ...(titleFr !== undefined && { titleFr }),
          ...(descriptionFr !== undefined && { descriptionFr }),
          ...(eyebrowEn !== undefined && { eyebrowEn }),
          ...(titleEn !== undefined && { titleEn }),
          ...(descriptionEn !== undefined && { descriptionEn }),
          ...(ctasFr !== undefined && { ctasFr }),
          ...(ctasEn !== undefined && { ctasEn }),
          ...(badgesFr !== undefined && { badgesFr }),
          ...(badgesEn !== undefined && { badgesEn }),
          ...(overlayOpacity !== undefined && { overlayOpacity: Number(overlayOpacity) || 55 }),
          ...(compact !== undefined && { compact: Boolean(compact) }),
          ...(carouselEnabled !== undefined && { carouselEnabled: Boolean(carouselEnabled) }),
          ...(slideDuration !== undefined && {
            slideDuration: Math.max(2000, Math.min(30000, Number(slideDuration) || 6000)),
          }),
        },
        select: heroEditorCarouselSelect,
      })
    } catch (error) {
      console.warn('[PUT /api/admin/heroes/[id]] Primary update failed, attempting fallback update:', error)
      hero = await prisma.heroSection.update({
        where: { id: targetId },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(imageAlt !== undefined && { imageAlt }),
          ...(eyebrowFr !== undefined && { eyebrowFr }),
          ...(titleFr !== undefined && { titleFr }),
          ...(descriptionFr !== undefined && { descriptionFr }),
          ...(eyebrowEn !== undefined && { eyebrowEn }),
          ...(titleEn !== undefined && { titleEn }),
          ...(descriptionEn !== undefined && { descriptionEn }),
          ...(ctasFr !== undefined && { ctasFr }),
          ...(ctasEn !== undefined && { ctasEn }),
          ...(badgesFr !== undefined && { badgesFr }),
          ...(badgesEn !== undefined && { badgesEn }),
          ...(overlayOpacity !== undefined && { overlayOpacity: Number(overlayOpacity) || 55 }),
          ...(compact !== undefined && { compact: Boolean(compact) }),
        },
        select: heroEditorSelect,
      })
    }

    const pageKey = hero.pageKey || existing.pageKey
    if (pageKey) {
      const paths = REVALIDATE_PATHS[pageKey] ?? []
      for (const path of paths) {
        try {
          revalidatePath(path)
        } catch {}
      }
      try {
        revalidateTag(`hero-${pageKey}`)
      } catch {}
    }

    const normalizedHero = {
      ...hero,
      carouselEnabled: hero.carouselEnabled ?? carouselEnabled ?? true,
      slideDuration: hero.slideDuration ?? slideDuration ?? 6000,
      slides: ((hero.slides as Array<Record<string, unknown>>) ?? []).map((slide) => ({
        ...slide,
        isActive: slide.isActive ?? true,
      })),
    }

    return NextResponse.json({ hero: normalizedHero, ...normalizedHero })
  } catch (error: any) {
    console.error('[PUT /api/admin/heroes/[id]]', error)
    return NextResponse.json({ error: error?.message || 'Erreur interne du serveur' }, { status: 500 })
  }
}

/** DELETE /api/admin/heroes/[id] — Supprimer une section Hero */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const existing = await prisma.heroSection.findFirst({
      where: { OR: [{ id }, { pageKey: id }] },
      select: { id: true, pageKey: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Section Hero introuvable' }, { status: 404 })
    }

    await prisma.heroSection.delete({
      where: { id: existing.id },
    })

    const paths = REVALIDATE_PATHS[existing.pageKey] ?? []
    for (const path of paths) {
      try {
        revalidatePath(path)
      } catch {}
    }
    try {
      revalidateTag(`hero-${existing.pageKey}`)
    } catch {}

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE /api/admin/heroes/[id]]', error)
    return NextResponse.json({ error: error?.message || 'Erreur interne du serveur' }, { status: 500 })
  }
}
