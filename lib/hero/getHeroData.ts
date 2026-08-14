import { prisma } from '@/lib/prisma'
import type { HeroSectionData, HeroSlideData, HeroCta, HeroBadge } from './types'

const legacyHeroSelect = {
  id: true,
  pageKey: true,
  isActive: true,
  imageUrl: true,
  imageAlt: true,
  defaultImageUrl: true,
  eyebrowFr: true,
  titleFr: true,
  descriptionFr: true,
  eyebrowEn: true,
  titleEn: true,
  descriptionEn: true,
  ctasFr: true,
  ctasEn: true,
  badgesFr: true,
  badgesEn: true,
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
      eyebrowFr: true,
      eyebrowEn: true,
      titleFr: true,
      titleEn: true,
      descriptionFr: true,
      descriptionEn: true,
      badgeFr: true,
      badgeEn: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const

function toHeroSectionData(hero: any): HeroSectionData {
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
    // Valeurs de compatibilité pour les bases où la migration carousel n'est
    // pas encore déployée : les slides existants restent immédiatement visibles.
    carouselEnabled: hero.carouselEnabled ?? true,
    slideDuration: hero.slideDuration ?? 6000,
    slides: hero.slides.map((s: any): HeroSlideData => ({
      id: s.id,
      order: s.order,
      isActive: s.isActive ?? true,
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
    })),
    createdAt: hero.createdAt.toISOString(),
    updatedAt: hero.updatedAt.toISOString(),
  }
}

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
    return toHeroSectionData(hero)
  } catch (err) {
    // Lors d'un déploiement progressif, le client Prisma peut connaître les
    // nouveaux champs avant que leurs colonnes soient créées. On relit alors
    // explicitement les champs historiques au lieu de masquer toute la Hero.
    try {
      const legacyHero = await prisma.heroSection.findUnique({ where: { pageKey }, select: legacyHeroSelect })
      if (!legacyHero || !legacyHero.isActive) return null
      console.warn('[getHeroData] Legacy hero fallback used for pageKey:', pageKey)
      return toHeroSectionData(legacyHero)
    } catch (legacyError) {
      console.error('[getHeroData] Error fetching hero for pageKey:', pageKey, { err, legacyError })
      return null
    }
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
