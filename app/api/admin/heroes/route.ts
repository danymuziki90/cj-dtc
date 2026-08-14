import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

// L'écran d'Apparence est un gestionnaire de médias : il ne lit que les
// colonnes nécessaires aux images. Ce select reste compatible avec les bases
// qui n'ont pas encore reçu la migration des contrôles de carousel.
const heroMediaSelect = {
  id: true,
  pageKey: true,
  isActive: true,
  imageUrl: true,
  imageAlt: true,
  defaultImageUrl: true,
  overlayOpacity: true,
  compact: true,
  createdAt: true,
  updatedAt: true,
  slides: {
    orderBy: { order: 'asc' as const },
    select: {
      id: true,
      order: true,
      imageUrl: true,
      imageAlt: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const

const heroCarouselSelect = {
  ...heroMediaSelect,
  carouselEnabled: true,
  slideDuration: true,
  slides: {
    ...heroMediaSelect.slides,
    select: { ...heroMediaSelect.slides.select, isActive: true },
  },
} as const

function hasMissingColumn(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2022'
}

/** GET /api/admin/heroes — Liste toutes les sections Hero */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Supprimer automatiquement la section 'galerie' si présente dans la base de données
    await prisma.heroSection
      .deleteMany({
        where: { pageKey: 'galerie' },
      })
      .catch(() => {})

    // L'espace étudiant utilise la même configuration que les autres bannières.
    await prisma.heroSection.upsert({
      where: { pageKey: 'student_space' },
      update: {},
      create: {
        pageKey: 'student_space',
        defaultImageUrl: '/books-wood.jpg',
        imageAlt: 'Livres et salle de formation CJ Development',
        titleFr: 'Espace Étudiant',
        titleEn: 'Student Space',
      },
      select: heroMediaSelect,
    })

    let heroes: Array<Record<string, unknown>>
    try {
      heroes = await prisma.heroSection.findMany({
        where: { NOT: { pageKey: 'galerie' } },
        select: heroCarouselSelect,
        orderBy: { pageKey: 'asc' },
      })
    } catch (error) {
      if (!hasMissingColumn(error)) throw error
      console.warn('[GET /api/admin/heroes] Migration carousel absente, repli sur les médias existants.')
      heroes = await prisma.heroSection.findMany({
        where: { NOT: { pageKey: 'galerie' } },
        select: heroMediaSelect,
        orderBy: { pageKey: 'asc' },
      })
    }

    return NextResponse.json({
      heroes: heroes
        .filter((hero) => (hero.pageKey as string)?.toLowerCase() !== 'galerie')
        .map((hero) => ({
          ...hero,
          carouselEnabled: hero.carouselEnabled ?? true,
          slideDuration: hero.slideDuration ?? 6000,
          slides: ((hero.slides as Array<Record<string, unknown>>) ?? []).map((slide) => ({
            ...slide,
            isActive: slide.isActive ?? true,
          })),
        })),
    })
  } catch (error) {
    console.error('[GET /api/admin/heroes] Erreur lors du chargement des Hero Sections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
