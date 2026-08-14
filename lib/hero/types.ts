// ─── Types partagés — Système Hero Dynamique ─────────────────────────────────

export type HeroCta = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
}

export type HeroBadge = {
  label: string
  color?: 'blue' | 'green' | 'red' | 'purple' | 'amber'
}

export type HeroSlideData = {
  id: string
  order: number
  isActive: boolean
  imageUrl: string
  imageAlt?: string | null
  eyebrowFr?: string | null
  eyebrowEn?: string | null
  titleFr: string
  titleEn: string
  descriptionFr?: string | null
  descriptionEn?: string | null
  badgeFr?: string | null
  badgeEn?: string | null
  ctaLabelFr?: string | null
  ctaLabelEn?: string | null
  ctaHref?: string | null
}

export type HeroSectionData = {
  id: string
  pageKey: string
  isActive: boolean

  // Image
  imageUrl?: string | null
  imageAlt?: string | null
  defaultImageUrl?: string | null
  defaultEyebrowFr?: string | null
  defaultEyebrowEn?: string | null
  defaultTitleFr?: string | null
  defaultTitleEn?: string | null
  defaultDescriptionFr?: string | null
  defaultDescriptionEn?: string | null

  // Contenu FR
  eyebrowFr?: string | null
  titleFr: string
  descriptionFr?: string | null

  // Contenu EN
  eyebrowEn?: string | null
  titleEn: string
  descriptionEn?: string | null

  // CTAs
  ctasFr?: HeroCta[] | null
  ctasEn?: HeroCta[] | null

  // Badges
  badgesFr?: HeroBadge[] | null
  badgesEn?: HeroBadge[] | null

  // Options
  overlayOpacity: number
  compact: boolean
  carouselEnabled: boolean
  slideDuration: number

  // Slides (home uniquement)
  slides?: HeroSlideData[]

  createdAt: string
  updatedAt: string
}

/** Clés de page valides pour le système Hero */
export const HERO_PAGE_KEYS = [
  'home',
  'about',
  'sessions',
  'entreprises',
  'actualites',
  'contact',
  'emplois',
  'galerie',
  'partenaires',
  'student_space',
] as const

export type HeroPageKey = (typeof HERO_PAGE_KEYS)[number]
