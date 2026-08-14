import { prisma } from '@/lib/prisma'
import type { HeroSectionData, HeroSlideData, HeroCta, HeroBadge } from './types'

/**
 * Récupère les données d'un Hero depuis la base de données.
 * Retourne null si la section n'existe pas ou est inactive.
 * Le composant appelant peut utiliser les valeurs codées en dur comme fallback.
 */
export async function getHeroData(pageKey: string): Promise<HeroSectionData | null> {
  try {
    const hero = await prisma.heroSection.findUnique({
      where: { pageKey },
      include: {
        slides: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!hero || !hero.isActive) return null

    return {
      id: hero.id,
      pageKey: hero.pageKey,
      isActive: hero.isActive,
      imageUrl: hero.imageUrl,
      imageAlt: hero.imageAlt,
      defaultImageUrl: hero.defaultImageUrl,
      eyebrowFr: hero.eyebrowFr,
      titleFr: hero.titleFr,
      descriptionFr: hero.descriptionFr,
      eyebrowEn: hero.eyebrowEn,
      titleEn: hero.titleEn,
      descriptionEn: hero.descriptionEn,
      ctasFr: hero.ctasFr as HeroCta[] | null,
      ctasEn: hero.ctasEn as HeroCta[] | null,
      badgesFr: hero.badgesFr as HeroBadge[] | null,
      badgesEn: hero.badgesEn as HeroBadge[] | null,
      overlayOpacity: hero.overlayOpacity,
      compact: hero.compact,
      carouselEnabled: hero.carouselEnabled,
      slideDuration: hero.slideDuration,
      slides: hero.slides.map(
        (s): HeroSlideData => ({
          id: s.id,
          order: s.order,
          isActive: s.isActive,
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
          ctaLabelFr: s.ctaLabelFr,
          ctaLabelEn: s.ctaLabelEn,
          ctaHref: s.ctaHref,
        })
      ),
      createdAt: hero.createdAt.toISOString(),
      updatedAt: hero.updatedAt.toISOString(),
    }
  } catch (err) {
    // En cas d'erreur DB (ex: table pas encore migrée), retourner null
    // pour que les composants utilisent leurs fallbacks statiques
    console.error('[getHeroData] Error fetching hero for pageKey:', pageKey, err)
    return null
  }
}

/**
 * Récupère l'image effective d'un Hero (imageUrl ou defaultImageUrl).
 * Retourne null si aucune image n'est configurée.
 */
export async function getHeroImageUrl(pageKey: string): Promise<string | null> {
  try {
    const hero = await prisma.heroSection.findUnique({
      where: { pageKey },
      select: { imageUrl: true, defaultImageUrl: true },
    })
    if (!hero) return null
    return hero.imageUrl || hero.defaultImageUrl || null
  } catch {
    return null
  }
}
