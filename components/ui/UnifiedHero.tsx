'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Home, CheckCircle2 } from 'lucide-react'
import type { HeroSectionData, HeroSlideData, HeroBadge, HeroCta } from '@/lib/hero/types'
import { useParams } from 'next/navigation'

export type BreadcrumbItem = {
  label: string
  href?: string
}

export interface UnifiedHeroProps {
  /** If provided, overrides default static props */
  heroData?: HeroSectionData | null

  // Static Fallbacks
  image?: string
  imageAlt?: string
  eyebrow?: string
  title?: React.ReactNode
  description?: string
  badges?: HeroBadge[]
  ctas?: HeroCta[]
  breadcrumbs?: BreadcrumbItem[]
  
  homeLabel?: string
  homeHref?: string
  overlayOpacity?: number
  compact?: boolean
  locale?: string
  children?: React.ReactNode
}

const BADGE_COLORS: Record<string, string> = {
  blue:   'bg-blue-500/20 border-blue-300/30 text-blue-100',
  green:  'bg-emerald-500/20 border-emerald-300/30 text-emerald-100',
  red:    'bg-red-500/20 border-red-300/30 text-red-100',
  purple: 'bg-purple-500/20 border-purple-300/30 text-purple-100',
  amber:  'bg-amber-500/20 border-amber-300/30 text-amber-100',
}

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay } }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
}

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (delay = 0) => ({ opacity: 1, transition: { duration: 0.5, delay } }),
}

// ─── Default Slides for Home Page (Fallback) ──────────────────────────────────
const DEFAULT_HOME_SLIDES = [
  {
    id: '1',
    imageUrl: '/lor-de-formation.jpeg',
    eyebrowFr: 'Centre de Formation Panafricain',
    eyebrowEn: 'Pan-African Training Center',
    titleFr: 'CJ DEVELOPMENT TRAINING CENTER',
    titleEn: 'CJ DEVELOPMENT TRAINING CENTER',
    descriptionFr: "Former, accompagner, inspirer et révéler les talents pour bâtir des carrières solides, des entreprises performantes et des leaders d'impact.",
    descriptionEn: 'Training, guiding, inspiring, and unleashing talents to build solid careers, high-performing enterprises, and impactful leaders.',
    badgeFr: 'Excellence Panafricaine',
    badgeEn: 'Pan-African Excellence',
  },
  {
    id: '2',
    imageUrl: '/img/certificat 1.jpeg',
    eyebrowFr: 'Solutions Pour Entreprises',
    eyebrowEn: 'Enterprise Solutions',
    titleFr: 'Formations Professionnelles pour les Entreprises',
    titleEn: 'Corporate Professional Training',
    descriptionFr: 'Renforcez les compétences de vos collaborateurs grâce à des formations professionnelles sur mesure, conçues pour améliorer la performance, le leadership et la productivité de votre organisation.',
    descriptionEn: 'Empower your teams with customized professional training designed to enhance performance, leadership, and productivity.',
    badgeFr: 'Sur Mesure & In-Company',
    badgeEn: 'Customized & In-Company',
  },
  {
    id: '3',
    imageUrl: '/apropos.jpeg',
    eyebrowFr: 'Accompagnement & Carrière',
    eyebrowEn: 'Career Guidance & Support',
    titleFr: 'Orientation et Insertion Professionnelle',
    titleEn: 'Career Guidance & Professional Insertion',
    descriptionFr: "Préparez votre avenir professionnel avec confiance. Nous vous accompagnons dans votre orientation, la construction de votre projet de carrière et votre insertion sur le marché de l'emploi.",
    descriptionEn: 'Prepare your professional future with confidence. We guide your orientation, career project building, and employment market insertion.',
    badgeFr: 'Parcours IOP Certifié',
    badgeEn: 'Certified IOP Program',
  },
]

export default function UnifiedHero({
  heroData,
  image, imageAlt = '', eyebrow, title, description,
  badges = [], ctas = [], breadcrumbs = [],
  homeLabel = 'Accueil', homeHref = '/',
  overlayOpacity = 55, compact = false,
  locale: defaultLocale,
  children,
}: UnifiedHeroProps) {
  const params = useParams<{ locale?: string }>()
  const locale = defaultLocale || params?.locale || 'fr'
  const isFr = locale !== 'en'

  const effectiveCompact = heroData?.compact ?? compact
  const effectiveOpacity = heroData?.overlayOpacity ?? overlayOpacity

  // Determine slides
  let slides: any[] = []
  
  if (heroData?.pageKey === 'home' || (!heroData && !image && title === 'CJ DEVELOPMENT TRAINING CENTER')) {
    // It's the home page
    slides = heroData?.slides?.length ? heroData.slides : DEFAULT_HOME_SLIDES
  } else {
    // Single image mode
    slides = [{
      id: 'single',
      imageUrl: heroData?.imageUrl ?? heroData?.defaultImageUrl ?? image,
      imageAlt: heroData?.imageAlt ?? imageAlt,
      eyebrowFr: heroData?.eyebrowFr ?? eyebrow,
      eyebrowEn: heroData?.eyebrowEn ?? eyebrow,
      titleFr: heroData?.titleFr ?? title,
      titleEn: heroData?.titleEn ?? title,
      descriptionFr: heroData?.descriptionFr ?? description,
      descriptionEn: heroData?.descriptionEn ?? description,
    }]
  }

  const isSlideshow = slides.length > 1
  const effectiveCtas = isFr ? (heroData?.ctasFr ?? ctas) : (heroData?.ctasEn ?? ctas)
  const effectiveBadges = isFr ? (heroData?.badgesFr ?? badges) : (heroData?.badgesEn ?? badges)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (!isSlideshow || isPaused) return
    timerRef.current = setInterval(() => {
      nextSlide()
    }, 6000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isSlideshow, isPaused, nextSlide])

  if (!slides.length) return null

  const currentSlide = slides[currentIndex] || slides[0]

  return (
    <section 
      className={`hero-bg-unified relative overflow-hidden flex flex-col justify-center w-full ${effectiveCompact ? 'min-h-[400px] lg:min-h-[50vh] pt-32 pb-12' : 'min-h-[450px] lg:min-h-[75vh] pt-36 pb-16'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background Slides ── */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden bg-[#001020]">
        {slides.map((slide, index) => (
          <div
            key={`${slide.id}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {slide.imageUrl && (
              <Image
                src={slide.imageUrl}
                alt={slide.imageAlt || slide.titleFr || 'Hero Image'}
                fill
                priority={index === 0}
                className={`object-cover ${
                  index === currentIndex ? 'scale-105 transition-transform duration-[8000ms] ease-out' : 'scale-100'
                }`}
                sizes="100vw"
              />
            )}
          </div>
        ))}

        {/* ── Gradient Overlays ── */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/80 via-black/50 to-black/30" style={{ opacity: effectiveOpacity / 100 }} />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#000d1f]/80 via-[#000d1f]/40 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-20 pointer-events-none" />
      </div>

      {/* ── Nav Arrows (for Slideshow) ── */}
      {isSlideshow && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 focus:outline-none hidden md:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 focus:outline-none hidden md:flex"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Progress Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/15 shadow-xl">
            {slides.map((slide, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => setCurrentIndex(index)}
                className={`relative h-2.5 rounded-full transition-all duration-300 overflow-hidden focus:outline-none ${
                  index === currentIndex ? 'w-10 bg-white/20' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentIndex && (
                  <div className={`absolute inset-0 bg-gradient-to-r from-[var(--cj-red)] to-red-500 rounded-full ${!isPaused ? 'animate-hero-progress' : 'w-full'}`} />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Content ── */}
      <div className="relative z-30 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-auto mb-auto lg:my-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            className="grid gap-10 lg:grid-cols-12 lg:items-center"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Left Column (Text & CTAs) */}
            <div className={isSlideshow && (currentSlide.badgeFr || currentSlide.badgeEn) ? "lg:col-span-7 space-y-6" : "lg:col-span-9 space-y-6"}>
              {/* Breadcrumb */}
              {(breadcrumbs.length > 0) && (
                <motion.nav
                  aria-label="Breadcrumb"
                  custom={0} variants={fadeIn}
                  className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium text-white/70"
                >
                  <Link href={homeHref} className="inline-flex items-center gap-1 hover:text-white transition-colors">
                    <Home className="h-3.5 w-3.5" />{homeLabel}
                  </Link>
                  {breadcrumbs.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                      {item.href
                        ? <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                        : <span className="text-white font-semibold">{item.label}</span>
                      }
                    </span>
                  ))}
                </motion.nav>
              )}

              {/* Eyebrow */}
              {(isFr ? currentSlide.eyebrowFr : currentSlide.eyebrowEn) && (
                <motion.div custom={0.05} variants={fadeUp}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-200 backdrop-blur-sm shadow-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)] animate-pulse" />
                  {isFr ? currentSlide.eyebrowFr : currentSlide.eyebrowEn}
                </motion.div>
              )}

              {/* Title */}
              <motion.h1 custom={0.12} variants={fadeUp}
                className="hero-title-unified drop-shadow-md text-white max-w-4xl"
              >
                {isFr ? currentSlide.titleFr : currentSlide.titleEn}
              </motion.h1>

              {/* Description */}
              {(isFr ? currentSlide.descriptionFr : currentSlide.descriptionEn) && (
                <motion.p custom={0.2} variants={fadeUp}
                  className="max-w-2xl text-base sm:text-lg leading-relaxed text-white/90 font-opensans drop-shadow-sm"
                >
                  {isFr ? currentSlide.descriptionFr : currentSlide.descriptionEn}
                </motion.p>
              )}

              {/* Badges (For Single Image Mode mostly) */}
              {!isSlideshow && effectiveBadges.length > 0 && (
                <motion.div custom={0.28} variants={fadeUp} className="flex flex-wrap gap-2 pt-2">
                  {effectiveBadges.map((b, i) => (
                    <span key={i} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${BADGE_COLORS[b.color || 'blue']}`}>
                      {b.label}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Actions CTAs */}
              {(effectiveCtas.length > 0 || isSlideshow) && (
                <motion.div custom={0.35} variants={fadeUp} className="flex flex-col gap-4 sm:flex-row pt-4">
                  {effectiveCtas.length > 0 ? (
                    effectiveCtas.map((cta, i) => (
                      cta.variant === 'secondary'
                        ? <Link key={i} href={cta.href}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition duration-200 hover:bg-white/20 hover:scale-[1.02] active:scale-95">
                            {cta.label}
                          </Link>
                        : <Link key={i} href={cta.href}
                            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-red)] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition duration-200 hover:bg-[var(--cj-red-700)] hover:scale-[1.02] active:scale-95">
                            {cta.label}
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                          </Link>
                    ))
                  ) : isSlideshow ? (
                    // Default Slideshow CTAs
                    <>
                      <Link href={`/${locale}/formations`} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-red)] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition duration-300 hover:bg-[var(--cj-red-700)] hover:scale-[1.02]">
                        {isFr ? 'Découvrir nos formations' : 'Discover our courses'}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                      <Link href={`/${locale}/inscription`} className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:bg-white/20 hover:scale-[1.02]">
                        {isFr ? "S'inscrire maintenant" : 'Register now'}
                      </Link>
                    </>
                  ) : null}
                </motion.div>
              )}

              {/* Children (e.g. extra stats blocks) */}
              {children && (
                <motion.div custom={0.4} variants={fadeUp} className="mt-8 pt-8 border-t border-white/10">
                  {children}
                </motion.div>
              )}
            </div>

            {/* Right Column Glassmorphism Badge (Only for Slideshow mode if badge exists) */}
            {isSlideshow && (currentSlide.badgeFr || currentSlide.badgeEn) && (
              <motion.div custom={0.4} variants={fadeIn} className="lg:col-span-5 relative flex items-center justify-center min-h-[200px] lg:min-h-0 hidden md:flex">
                <div className="relative rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur-md shadow-2xl transition duration-500 hover:scale-[1.02] max-w-sm hover:border-white/30">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-red-500/20 blur-lg opacity-60 pointer-events-none" />
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl font-bold shadow-inner">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <span className="text-xs font-mono font-bold text-white/80 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                        0{currentIndex + 1} / 0{slides.length}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                        {isFr ? currentSlide.badgeFr : currentSlide.badgeEn}
                      </span>
                      <h3 className="text-lg font-bold text-white leading-snug">
                        {isFr ? currentSlide.titleFr : currentSlide.titleEn}
                      </h3>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
