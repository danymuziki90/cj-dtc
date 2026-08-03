import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Fallback statiques par pageKey si la DB n'est pas disponible
const STATIC_FALLBACKS: Record<string, string> = {
  home:        '/lor-de-formation.jpeg',
  about:       '/apropos.jpeg',
  sessions:    '/img/Formaions 2.jpg',
  entreprises: '/img/ceo.jpeg',
  actualites:  '/img/actu.jpeg',
  contact:     '/img/team.jpeg',
  emplois:     '/img/actu.jpeg',
  galerie:     '/img/actu.jpeg',
  partenaires: '/img/certificat 1.jpeg',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pageKey = searchParams.get('pageKey')

  try {
    // Si un pageKey est demandé, retourner les données complètes du hero
    if (pageKey) {
      const hero = await prisma.heroSection.findUnique({
        where: { pageKey },
        include: {
          slides: { orderBy: { order: 'asc' } },
        },
      })

      if (!hero) {
        // Retourner le fallback statique si la section n'existe pas encore en DB
        return NextResponse.json({
          imageUrl: STATIC_FALLBACKS[pageKey] ?? null,
          slides: [],
        })
      }

      return NextResponse.json({
        id: hero.id,
        pageKey: hero.pageKey,
        isActive: hero.isActive,
        imageUrl: hero.imageUrl ?? hero.defaultImageUrl ?? STATIC_FALLBACKS[pageKey] ?? null,
        imageAlt: hero.imageAlt,
        eyebrowFr: hero.eyebrowFr,
        eyebrowEn: hero.eyebrowEn,
        titleFr: hero.titleFr,
        titleEn: hero.titleEn,
        descriptionFr: hero.descriptionFr,
        descriptionEn: hero.descriptionEn,
        ctasFr: hero.ctasFr,
        ctasEn: hero.ctasEn,
        badgesFr: hero.badgesFr,
        badgesEn: hero.badgesEn,
        overlayOpacity: hero.overlayOpacity,
        compact: hero.compact,
        slides: hero.slides.map((s) => ({
          id: s.id,
          order: s.order,
          imageUrl: s.imageUrl,
          imageAlt: s.imageAlt,
          eyebrowFr: s.eyebrowFr,
          eyebrowEn: s.eyebrowEn,
          titleFr: s.titleFr,
          titleEn: s.titleEn,
          descriptionFr: s.descriptionFr,
          descriptionEn: s.descriptionEn,
          badgeFr: s.badgeFr,
          badgeEn: s.badgeEn,
        })),
      })
    }

    // Sans pageKey : retourner la liste des images du hero home (rétrocompatibilité)
    const homeHero = await prisma.heroSection.findUnique({
      where: { pageKey: 'home' },
      include: { slides: { orderBy: { order: 'asc' } } },
    })

    if (homeHero && homeHero.slides.length > 0) {
      return NextResponse.json(homeHero.slides.map((s) => s.imageUrl))
    }

    // Fallback statique
    return NextResponse.json([
      '/lor-de-formation.jpeg',
      '/img/certificat 1.jpeg',
      '/apropos.jpeg',
    ])
  } catch (error) {
    console.error('[/api/hero-images] DB error, using static fallback:', error)

    if (pageKey) {
      return NextResponse.json({
        imageUrl: STATIC_FALLBACKS[pageKey] ?? null,
        slides: [],
      })
    }

    return NextResponse.json([
      '/lor-de-formation.jpeg',
      '/img/certificat 1.jpeg',
      '/apropos.jpeg',
    ])
  }
}

