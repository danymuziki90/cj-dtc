'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Home, CheckCircle2, Award, GraduationCap, Sparkles } from 'lucide-react'
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
  /** Augmente uniquement la hauteur du Hero sur les écrans desktop. */
  desktopTall?: boolean
  /** Variante plus haute, réservée aux pages nécessitant davantage d'espace visuel sur desktop. */
  desktopExtraTall?: boolean
  locale?: string
  /** Identifie explicitement la page lorsque les données distantes sont indisponibles. */
  pageKey?: string
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
    titleFr: 'Développez vos compétences. Construisez votre avenir.',
    titleEn: 'Build your skills. Shape your future.',
    descriptionFr: 'Des formations pratiques et professionnalisantes conçues pour développer des compétences concrètes, obtenir des certifications et progresser dans votre carrière.',
    descriptionEn: 'Practical, career-focused training designed to build concrete skills, earn certifications, and advance your career.',
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
  overlayOpacity = 55, compact = false, desktopTall = false, desktopExtraTall = false,
  locale: defaultLocale,
  pageKey,
  children,
}: UnifiedHeroProps) {
  const params = useParams<{ locale?: string }>()
  const locale = defaultLocale || params?.locale || 'fr'
  const isFr = locale !== 'en'
  const shouldReduceMotion = useReducedMotion()

  const effectiveCompact = heroData?.compact ?? compact
  const effectiveOpacity = heroData?.overlayOpacity ?? overlayOpacity
  const isHomeHero = pageKey === 'home' || heroData?.pageKey === 'home' || (!heroData && !image && title === 'CJ DEVELOPMENT TRAINING CENTER')

  // Determine slides
  let slides: any[] = []
  
  if (heroData?.carouselEnabled !== false && heroData?.slides && heroData.slides.filter((slide) => slide.isActive !== false).length > 0) {
    // Si l'admin a configuré des slides (carrousel activé pour cette page)
    slides = heroData.slides.filter((slide) => slide.isActive !== false)
  } else if (isHomeHero) {
    // Page d'accueil sans configuration DB : fallback par défaut (carrousel)
    slides = DEFAULT_HOME_SLIDES
  } else {
    // Mode image unique (fallback pour les autres pages)
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

  const isSlideshow = isHomeHero && slides.length > 1
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
    if (!isSlideshow || isPaused || shouldReduceMotion) return
    timerRef.current = setInterval(() => {
      nextSlide()
    }, heroData?.slideDuration ?? 6000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [heroData?.slideDuration, isSlideshow, isPaused, nextSlide, shouldReduceMotion])

  if (!slides.length) return null

  const currentSlide = slides[currentIndex] || slides[0]
  const contentSlide = {
    ...currentSlide,
    eyebrowFr: heroData?.eyebrowFr || currentSlide.eyebrowFr,
    eyebrowEn: heroData?.eyebrowEn || currentSlide.eyebrowEn,
    titleFr: heroData?.titleFr || currentSlide.titleFr,
    titleEn: heroData?.titleEn || currentSlide.titleEn,
    descriptionFr: heroData?.descriptionFr || currentSlide.descriptionFr,
    descriptionEn: heroData?.descriptionEn || currentSlide.descriptionEn,
  }
  const slideCtaLabel = isFr
    ? contentSlide.ctaLabelFr
    : contentSlide.ctaLabelEn || contentSlide.ctaLabelFr
  const slideCtas: HeroCta[] = !isHomeHero && contentSlide.ctaHref && slideCtaLabel
    ? [{ label: slideCtaLabel, href: currentSlide.ctaHref }]
    : effectiveCtas
  const isPageHero = !isHomeHero
  const showPageVisual = isPageHero && Boolean(currentSlide.imageUrl)

  return (
    <section 
      className={`hero-bg-unified relative overflow-hidden flex flex-col justify-center w-full ${
        isHomeHero 
          ? 'hero-home min-h-[420px] sm:min-h-[460px] lg:min-h-[540px] xl:min-h-[580px] py-8 sm:py-10 lg:py-12' 
          : 'hero-page'
      } ${
        effectiveCompact 
          ? (desktopExtraTall 
              ? 'min-h-[260px] sm:min-h-[300px] lg:min-h-[440px] xl:min-h-[480px] py-5 sm:py-6 lg:py-8' 
              : desktopTall 
                ? 'min-h-[260px] sm:min-h-[300px] lg:min-h-[400px] xl:min-h-[440px] py-5 sm:py-6 lg:py-8' 
                : 'min-h-[240px] sm:min-h-[280px] lg:min-h-[320px] py-5 sm:py-6 lg:py-8') 
          : 'min-h-[260px] sm:min-h-[300px] lg:min-h-[360px] py-6 sm:py-8 lg:py-10'
      }`}
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
                className={`object-cover object-center ${
                  index === currentIndex && !shouldReduceMotion ? 'scale-105 transition-transform duration-[8000ms] ease-out' : 'scale-100'
                }`}
                sizes="100vw"
              />
            )}
          </div>
        ))}

        {/* ── Gradient Overlays ── */}
        {isHomeHero
          ? <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#000d1f]/95 via-[#000d1f]/72 to-[#000d1f]/42" style={{ opacity: effectiveOpacity / 100 }} />
          : <div className="absolute inset-0 z-20 bg-[#000d1f]" style={{ opacity: effectiveOpacity / 100 }} />
        }
        {isHomeHero && (
          <>
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#000d1f]/80 via-[#000d1f]/40 to-transparent z-20 pointer-events-none lg:hidden" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#000d1f]/70 to-transparent z-20 pointer-events-none" />
          </>
        )}
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
          <div className="absolute bottom-4 sm:bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 shadow-xl backdrop-blur-md">
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
            className={isHomeHero
              ? 'grid gap-8 lg:grid-cols-12 lg:items-center'
              : 'flex flex-col items-center text-center'
            }
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Left Column (Text & CTAs) */}
            <div className={`space-y-4 sm:space-y-5 ${
              isHomeHero
                ? isSlideshow && (currentSlide.badgeFr || currentSlide.badgeEn)
                  ? 'lg:col-span-7'
                  : 'lg:col-span-8'
                : 'w-full max-w-3xl mx-auto'
            }`}>
              {/* Breadcrumb */}
              {(breadcrumbs.length > 0) && (
                <motion.nav
                  aria-label="Breadcrumb"
                  custom={0} variants={fadeIn}
                  className={`mb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium text-white/75 ${
                    isPageHero ? 'justify-center' : ''
                  }`}
                >
                  <Link href={homeHref} className="inline-flex items-center gap-1 transition-colors hover:text-white">
                    <Home className="h-3.5 w-3.5" />{homeLabel}
                  </Link>
                  {breadcrumbs.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                      {item.href
                          ? <Link href={item.href} className="transition-colors hover:text-white">{item.label}</Link>
                          : <span className="font-semibold text-white">{item.label}</span>
                      }
                    </span>
                  ))}
                </motion.nav>
              )}

              {/* Eyebrow */}
              {(isHomeHero || (isFr ? contentSlide.eyebrowFr : contentSlide.eyebrowEn)) && (
                <motion.div custom={0.05} variants={fadeUp}
                  className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur-sm ${
                    isPageHero ? 'self-center' : ''
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)] animate-pulse" />
                  {isHomeHero ? 'CJ DEVELOPMENT' : (isFr ? contentSlide.eyebrowFr : contentSlide.eyebrowEn)}
                </motion.div>
              )}

              {/* Title */}
              <motion.h1 custom={0.12} variants={fadeUp}
                className={`hero-title-unified text-white drop-shadow-md ${
                  isPageHero ? 'max-w-3xl mx-auto' : 'max-w-4xl'
                }`}
              >
                {isFr ? contentSlide.titleFr : contentSlide.titleEn}
              </motion.h1>
              {(isHomeHero || isPageHero) && (
                <motion.div custom={0.16} variants={fadeUp} className={`h-1 w-16 rounded-full bg-[var(--cj-red)] ${
                  isPageHero ? 'mx-auto' : ''
                }`} />
              )}

              {/* Description */}
              {(isFr ? contentSlide.descriptionFr : contentSlide.descriptionEn) && (
                <motion.p custom={0.2} variants={fadeUp}
                  className={`hero-home-description text-base leading-relaxed font-opensans text-white/90 drop-shadow-sm sm:text-lg ${
                    isPageHero ? 'max-w-2xl mx-auto' : 'max-w-2xl'
                  }`}
                >
                  {isFr ? contentSlide.descriptionFr : contentSlide.descriptionEn}
                </motion.p>
              )}

              {/* Badges (For Single Image Mode mostly) */}
              {!isSlideshow && effectiveBadges.length > 0 && (
                <motion.div custom={0.28} variants={fadeUp} className={`flex flex-wrap gap-2 pt-2 ${
                  isPageHero ? 'justify-center' : ''
                }`}>
                  {effectiveBadges.map((b, i) => (
                    <span key={i} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${BADGE_COLORS[b.color || 'blue']}`}>
                      {b.label}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Actions CTAs */}
              {(slideCtas.length > 0 || isSlideshow) && (
                <motion.div custom={0.35} variants={fadeUp} className={`flex flex-col gap-4 sm:flex-row pt-4 ${
                  isPageHero ? 'justify-center' : ''
                }`}>
                  {slideCtas.length > 0 ? (
                    slideCtas.map((cta, i) => (
                      cta.variant === 'secondary'
                        ? <Link key={i} href={cta.href}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition duration-200 hover:scale-[1.02] hover:bg-white/20 active:scale-95">
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
                      <Link href={`/${locale}/espace-etudiants`} className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:scale-[1.02] hover:bg-white/20">
                        {isFr ? 'Espace étudiant' : 'Student space'}
                      </Link>
                    </>
                  ) : null}
                </motion.div>
              )}

              {isHomeHero && (
                <motion.ul custom={0.42} variants={fadeUp} className="grid gap-2 pt-2 text-xs font-semibold text-white/85 sm:grid-cols-3">
                  {[
                    { label: isFr ? 'Formations pratiques' : 'Practical training', icon: GraduationCap },
                    { label: isFr ? 'Accompagnement personnalisé' : 'Personalized support', icon: Sparkles },
                    { label: isFr ? 'Certifications professionnelles' : 'Professional certifications', icon: Award },
                  ].map(({ label, icon: Icon }) => (
                    <li key={label} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-[var(--cj-red)]" aria-hidden="true" />
                      <span>{label}</span>
                    </li>
                  ))}
                </motion.ul>
              )}

              {/* Children (e.g. extra stats blocks) */}
              {children && (
                <motion.div
                  custom={0.4}
                  variants={fadeUp}
                  className={isPageHero ? (effectiveCompact ? 'mt-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3.5 sm:p-4 text-white shadow-lg' : 'mt-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-5 text-white shadow-xl') : 'mt-6 pt-6 border-t border-white/10'}
                >
                  {children}
                </motion.div>
              )}
            </div>

            {false && isHomeHero && currentSlide.imageUrl && (
              <motion.div custom={0.28} variants={fadeIn} className="relative order-last mt-2 lg:col-span-6 lg:mt-0">
                <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-blue-100 bg-[var(--cj-blue)] shadow-[0_28px_60px_-30px_rgba(10,79,179,0.55)] sm:min-h-[360px] lg:min-h-[470px]">
                  <Image
                    src={currentSlide.imageUrl}
                    alt={currentSlide.imageAlt || currentSlide.titleFr || 'CJ Development'}
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#052a62]/65 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-[var(--cj-blue)] shadow-sm backdrop-blur-sm sm:left-6 sm:top-6">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--cj-red)]" />
                    {isFr ? 'Apprendre. Progresser. Réussir.' : 'Learn. Grow. Succeed.'}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-slate-950/65 p-4 text-white shadow-xl backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[280px]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">CJ Development</p>
                    <p className="hero-home-visual-copy mt-1 text-sm font-semibold leading-snug">
                      {isFr ? 'Des compétences concrètes pour avancer avec confiance.' : 'Practical skills to move forward with confidence.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {false && showPageVisual && (
              <motion.div custom={0.28} variants={fadeIn} className="relative order-last hidden lg:col-span-5 lg:block">
                <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-blue-100 bg-[var(--cj-blue)] shadow-[0_24px_54px_-32px_rgba(10,79,179,0.55)]">
                  <Image
                    src={currentSlide.imageUrl}
                    alt={currentSlide.imageAlt || currentSlide.titleFr || 'CJ Development'}
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 1024px) 34vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#052a62]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/90 p-4 text-[var(--cj-blue)] shadow-lg">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--cj-red)]">CJ Development</p>
                    <p className="mt-1 text-sm font-bold leading-snug">
                      {isFr ? 'Une expérience claire, moderne et orientée résultat.' : 'A clear, modern, results-focused experience.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Right Column Glassmorphism Badge (Only for Slideshow mode if badge exists) */}
            {!isHomeHero && !showPageVisual && isSlideshow && (currentSlide.badgeFr || currentSlide.badgeEn) && (
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
