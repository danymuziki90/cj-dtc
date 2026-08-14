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

/** GET /api/admin/heroes — Liste toutes les sections Hero */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // L'espace étudiant utilise la même configuration que les autres bannières.
    // L'upsert rend cette section éditable immédiatement sur les installations
    // qui possèdent déjà les anciennes sections Hero.
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

    const heroes = await prisma.heroSection.findMany({
      select: heroMediaSelect,
      orderBy: { pageKey: 'asc' },
    })

    return NextResponse.json({
      heroes: heroes.map((hero) => ({
        ...hero,
        // Valeurs par défaut pour le frontend sur une base avant migration.
        carouselEnabled: true,
        slideDuration: 6000,
        slides: hero.slides.map((slide) => ({ ...slide, isActive: true })),
      })),
    })
  } catch (error) {
    console.error('[GET /api/admin/heroes] Erreur lors du chargement des Hero Sections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
