'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import RecentSessions from '../../components/RecentSessions'
import RecentArticles from '../../components/RecentArticles'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

const copy = publicMessages.home

// Preuves institutionnelles fixes — données réelles sous le Hero
const institutionalProofs = [
  { value: '2018',   labelFr: 'Année de création', labelEn: 'Founded' },
  { value: '8 500+', labelFr: 'Impacts réels',     labelEn: 'Real impacts' },
  { value: '10+',    labelFr: 'Pays couverts',     labelEn: 'Countries reached' },
  { value: '50+',    labelFr: 'Promotions actives', labelEn: 'Active sessions' },
]

const FALLBACK_IMAGES = ["/lor-de-formation.jpeg", "/books-wood.jpg", "/apropos.jpeg"]

export default function HomePage() {
  const params = useParams<{ locale?: string }>()
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]
  const isFr = locale === 'fr'

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [dbFaqs, setDbFaqs] = useState<any[]>([])
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([])

  // Image Carousel state & settings
  const [images, setImages] = useState<string[]>(FALLBACK_IMAGES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch images from directory API
  useEffect(() => {
    let active = true
    fetch('/api/hero-images')
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data) && data.length > 0) {
          setImages(data)
        }
      })
      .catch(err => console.error("Error fetching hero images:", err))

    fetch('/api/faq')
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data) && data.length > 0) {
          setDbFaqs(data)
        }
      })
      .catch(err => console.error("Error fetching FAQs:", err))

    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (active && Array.isArray(data) && data.length > 0) {
          setDbTestimonials(data)
        }
      })
      .catch(err => console.error("Error fetching testimonials:", err))

    return () => {
      active = false
    }
  }, [])

  const startAutoplay = useCallback(() => {
    stopAutoplay()
    autoplayTimerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 6000) // Transition every 6 seconds
  }, [images.length])

  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current)
      autoplayTimerRef.current = null
    }
  }, [])

  const resetAutoplayWithDelay = useCallback(() => {
    stopAutoplay()
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current)
    }
    // Resume autoplay after 8 seconds of user inactivity
    interactionTimeoutRef.current = setTimeout(() => {
      startAutoplay()
    }, 8000)
  }, [startAutoplay, stopAutoplay])

  useEffect(() => {
    startAutoplay()
    return () => {
      stopAutoplay()
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }
    }
  }, [startAutoplay, stopAutoplay])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    resetAutoplayWithDelay()
  }, [images.length, resetAutoplayWithDelay])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    resetAutoplayWithDelay()
  }, [images.length, resetAutoplayWithDelay])

  const handleSelect = useCallback((index: number) => {
    setCurrentIndex(index)
    resetAutoplayWithDelay()
  }, [resetAutoplayWithDelay])

  return (
    <div>
      <section className="hero-bg-unified relative min-h-[85vh] pt-28 pb-16 overflow-hidden flex items-center">
        {/* Background slideshow */}
        <div className="absolute inset-0 z-0 select-none overflow-hidden">
          {images.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={src}
                alt={`Hero Slide ${index + 1}`}
                fill
                priority={index === 0}
                className={`object-cover ${index === currentIndex ? 'animate-kenburns' : ''}`}
                sizes="100vw"
              />
            </div>
          ))}
          {/* Dark Overlay semi-transparent to ensure text readability */}
          <div className="absolute inset-0 bg-black/60 z-20" />
        </div>

        {/* Directional navigation arrows (Desktop only for clean UX) */}
        <button
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 hidden md:flex"
          aria-label={isFr ? "Image précédente" : "Previous image"}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 hidden md:flex"
          aria-label={isFr ? "Image suivante" : "Next image"}
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Carousel indicators (dots) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                index === currentIndex 
                  ? 'w-6 bg-[var(--cj-red)]' 
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={isFr ? `Aller à l'image ${index + 1}` : `Go to image ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Colonne gauche (Texte & Actions) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Pill Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[var(--cj-red)] animate-pulse" aria-hidden="true" />
                {t.heroEyebrow}
              </div>

              {/* Titre */}
              <h1 className="hero-title-unified">
                {t.heroTitle}
              </h1>

              {/* Description */}
              <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-white font-opensans">
                {t.heroDescription}
              </p>

              {/* CTAs */}
              <div className="flex flex-col gap-4 sm:flex-row pt-4">
                <Link
                  href={`/${locale}/formations`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-red)] px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-900/30 transition duration-300 hover:bg-[var(--cj-red-700)] hover:scale-[1.02] hover:shadow-red-900/40 group"
                >
                  {t.primaryCta}
                  <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition duration-300 hover:bg-white/15 hover:scale-[1.02]"
                >
                  {t.secondaryCta}
                </Link>
              </div>
            </div>

            {/* Colonne droite (Glassmorphism validation badge) */}
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[200px] lg:min-h-0">
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl transition duration-500 hover:scale-[1.02] max-w-sm hover:border-white/20">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-red-500/10 blur-lg opacity-50 pointer-events-none" />
                <div className="relative space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl font-bold shadow-inner">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {isFr ? "Vérifié" : "Verified"}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-snug">
                      {isFr ? "Certification Professionnelle" : "Professional Certification"}
                    </h3>
                    <p className="text-xs text-blue-200/80 leading-relaxed font-opensans">
                      {isFr 
                        ? "CJ DTC délivre des certifications vérifiables, adossées à des parcours réels et à une validation rigoureuse des acquis."
                        : "CJ DTC issues verifiable certifications backed by real-world courses and rigorous validation of learning."
                      }
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px] font-semibold text-blue-100/90 font-opensans">
                    <span>{isFr ? "Preuve d'impact" : "Impact Proof"}</span>
                    <span className="text-[var(--cj-red)] font-bold">{isFr ? "Réseau Panafricain" : "Pan-African Network"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bande de preuves chiffrées en grille sous le Hero */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {institutionalProofs.map((proof) => (
              <div
                key={proof.value}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-md transition duration-300 hover:bg-white/8 hover:border-white/20 shadow-md"
              >
                <p className="text-3xl font-black text-white sm:text-4xl font-montserrat">{proof.value}</p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-blue-200/95 font-opensans">
                  {isFr ? proof.labelFr : proof.labelEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pourquoi CJ Development ────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center rounded-full border border-[var(--cj-blue)]/20 bg-[var(--cj-blue-50)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cj-blue)]">
              {t.whyChooseBadge}
            </span>
            <h2 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl font-montserrat">
              {t.whyChooseTitlePrefix}
              <span className="text-[var(--cj-blue)]">{t.whyChooseTitleHighlight}</span>
              {t.whyChooseTitleSuffix}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 font-opensans leading-relaxed">
              {t.whyChooseDescription}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {t.whyChooseCards.map((card, index) => {
              const accents = [
                { border: 'border-t-[var(--cj-blue)]', icon: '🎓' },
                { border: 'border-t-blue-400', icon: '🤝' },
                { border: 'border-t-[var(--cj-red)]', icon: '🌍' },
                { border: 'border-t-emerald-500', icon: '🚀' },
              ]
              const { border, icon } = accents[index]

              return (
                <article
                  key={card.title}
                  className={`rounded-2xl border border-slate-200 border-t-4 ${border} bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between`}
                >
                  <div>
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                      {icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 font-montserrat">{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 font-opensans">{card.description}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-8 border-t border-slate-100 pt-5">
                    <div>
                      <p className="text-2xl font-black text-[var(--cj-blue)] font-montserrat">
                        {['100%', '1:1', '10+', '85%'][index]}
                      </p>
                      <p className="text-[10px] text-slate-500 font-opensans uppercase tracking-wider">{card.stats[0]}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-[var(--cj-blue)] font-montserrat">
                        {isFr 
                          ? ['Terrain', 'Suivi', 'Région', 'Débouchés'][index] 
                          : ['Hands-on', 'Coaching', 'Region', 'Outcomes'][index]}
                      </p>
                      <p className="text-[10px] text-slate-500 font-opensans uppercase tracking-wider">{card.stats[1]}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Programmes phares ─────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cj-red)]">
                {isFr ? 'Programmes phares' : 'Flagship programs'}
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl font-montserrat leading-tight">
                {isFr ? 'Trois parcours structurés, concrets et orientés résultats.' : 'Three structured, concrete, and outcome-oriented pathways.'}
              </h2>
              <p className="mt-4 text-base text-slate-600 font-opensans leading-relaxed">
                {isFr
                  ? "Chaque programme est conçu autour d'objectifs d'apprentissage précis, de cas pratiques intensifs et d'un encadrement par des experts du secteur."
                  : 'Each program is designed around clear learning objectives, intensive casework, and mentoring by industry experts.'}
              </p>
            </div>
            <Link
              href={`/${locale}/formations`}
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--cj-blue)] hover:text-[var(--cj-blue-700)] transition duration-200 shrink-0"
            >
              {isFr ? 'Voir toutes les formations' : 'See all training'}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                title: isFr ? 'IOP – Leadership & RH' : 'IOP – Leadership & HR',
                objective: isFr
                  ? 'Renforcer la stratégie RH et le leadership des managers pour piloter la performance humaine.'
                  : 'Strengthen HR strategy and leadership for managers to drive human performance.',
                format: isFr ? 'Blended, ateliers & coaching' : 'Blended, workshops & coaching',
                audience: isFr ? 'Managers RH, responsables opérationnels' : 'HR managers, operational leaders',
                benefits: isFr
                  ? ['Certification incluse', 'Accompagnement individuel', 'Projets applicables immédiatement']
                  : ['Certification included', 'Individual support', 'Immediately applicable projects'],
              },
              {
                title: isFr ? 'Formation RH pratique' : 'Practical HR training',
                objective: isFr
                  ? 'Maîtriser le recrutement, la gestion de carrière et l’efficacité opérationnelle des équipes.'
                  : 'Master recruitment, career management and operational efficiency for your teams.',
                format: isFr ? 'Mix présentiel / distanciel' : 'Hybrid in-person / remote',
                audience: isFr ? 'Professionnels RH et responsables de talent' : 'HR professionals and talent leaders',
                benefits: isFr
                  ? ['Outils concrets', 'Modules terrain', 'Résultats mesurables']
                  : ['Concrete tools', 'Field-centered modules', 'Measurable results'],
              },
              {
                title: isFr ? 'Leadership & influence' : 'Leadership & influence',
                objective: isFr
                  ? 'Développer la posture de décision, la communication stratégique et l’impact collectif.'
                  : 'Develop decision-making posture, strategic communication and collective impact.',
                format: isFr ? 'Sessions intensives + coaching' : 'Intensive sessions + coaching',
                audience: isFr ? 'Cadres, responsables de projet, dirigeants' : 'Executives, project leaders, decision makers',
                benefits: isFr
                  ? ['Posture renforcée', 'Plan d’action concret', 'Feedback expert']
                  : ['Stronger posture', 'Concrete action plan', 'Expert feedback'],
              },
            ].map((item) => (
              <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center rounded-full bg-[var(--cj-blue)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--cj-blue)]">
                    {isFr ? 'Programme certifiant' : 'Certified program'}
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-slate-950 font-montserrat">{item.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 font-opensans">{item.objective}</p>

                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600 font-opensans">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-2 w-2 rounded-full bg-[var(--cj-red)]" />
                      <span><strong>{isFr ? 'Format : ' : 'Format: '}</strong>{item.format}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-2 w-2 rounded-full bg-[var(--cj-red)]" />
                      <span><strong>{isFr ? 'Public : ' : 'Audience: '}</strong>{item.audience}</span>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-sm text-slate-600 font-opensans">
                    {item.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/${locale}/formations`}
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                >
                  {isFr ? 'Découvrir le programme' : 'Discover the program'}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bloc Résultats ─────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-20 sm:py-24 text-white relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute inset-0 z-0 opacity-15">
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-96 h-96 rounded-full bg-[var(--cj-red)]/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              {isFr ? "Mesure d'impact" : 'Impact Metrics'}
            </span>
            <h2 className="mt-5 text-3xl font-black sm:text-4xl lg:text-5xl font-montserrat">
              {isFr ? 'Des résultats réels et vérifiables.' : 'Real and verifiable results.'}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 font-opensans leading-relaxed">
              {isFr
                ? "Notre modèle pédagogique combine théorie et immersion terrain pour des indicateurs d'insertion et de réussite concrets."
                : 'Our educational model combines theory and field immersion for concrete placement and success indicators.'}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '98%', label: isFr ? 'Taux de satisfaction' : 'Satisfaction rate', desc: isFr ? 'Évalué par nos apprenants à la fin de leur cursus.' : 'Rated by our learners at the end of their path.' },
              { value: '85%', label: isFr ? 'Taux d’insertion' : 'Placement rate', desc: isFr ? 'De nos diplômés en poste dans les 6 mois.' : 'Of our graduates in jobs within 6 months.' },
              { value: '10+', label: isFr ? 'Pays d’impact' : 'Impacted countries', desc: isFr ? 'Une présence active à travers toute l’Afrique.' : 'Active presence across the African continent.' },
              { value: '50+', label: isFr ? 'Promotions certifiées' : 'Certified cohorts', desc: isFr ? 'Sessions réalisées avec évaluation rigoureuse.' : 'Sessions completed with rigorous evaluation.' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-8 transition duration-300 hover:bg-white/10 hover:border-white/20 shadow-xl">
                <p className="text-4xl sm:text-5xl font-black text-white font-montserrat">{stat.value}</p>
                <p className="mt-4 text-lg font-bold text-[var(--cj-red)] font-montserrat">{stat.label}</p>
                <p className="mt-2 text-sm text-slate-400 font-opensans leading-relaxed">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* Institutional Partners / Grid */}
          <div className="mt-20 border-t border-white/10 pt-16">
            <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-blue-200 mb-8">
              {isFr ? 'Ils soutiennent nos initiatives et certifiés' : 'They support our initiatives and graduates'}
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-center">
              {[
                'World Bank Group',
                'UNESCO',
                'African Union',
                'SHRM Member',
                'Harvard Business Publishing',
                'Microsoft'
              ].map((partner) => (
                <div key={partner} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm font-bold text-slate-200 backdrop-blur-sm flex items-center justify-center min-h-[60px] hover:bg-white/10 transition">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bloc Entreprises ────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Value Prop */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center rounded-full border border-red-500/20 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cj-red)]">
                {isFr ? 'Pour les entreprises' : 'For businesses'}
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl font-montserrat leading-tight">
                {isFr 
                  ? 'Développez le capital humain de votre organisation.'
                  : 'Develop your organization\'s human capital.'}
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-opensans leading-relaxed">
                {isFr
                  ? 'CJ Development accompagne les entreprises dans la structuration de leurs services RH, l’évaluation de leurs équipes et la montée en compétences managériales grâce à des parcours sur-mesure de haute qualité.'
                  : 'CJ Development supports companies in structuring their HR departments, evaluating teams, and raising managerial skills through high-quality tailored programs.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link 
                  href={`/${locale}/services`} 
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--cj-blue)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--cj-blue-700)] shadow-md"
                >
                  {isFr ? 'Découvrir nos solutions' : 'Discover our solutions'}
                </Link>
                <Link 
                  href={`/${locale}/contact`} 
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                >
                  {isFr ? 'Parler à un conseiller B2B' : 'Talk to a B2B advisor'}
                </Link>
              </div>
            </div>

            {/* Premium Services Cards */}
            <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2">
              {[
                { title: isFr ? 'Audit & Diagnostic RH' : 'HR Audit & Diagnostics', desc: isFr ? 'Analyse globale de vos processus de gestion des talents et recommandations opérationnelles.' : 'Global review of your talent management systems with operational recommendations.' },
                { title: isFr ? 'Recrutement Stratégique' : 'Strategic Recruitment', desc: isFr ? 'Sourcing et évaluation de profils qualifiés et de leaders adaptés à votre culture.' : 'Sourcing and assessment of qualified professionals and leaders that fit your culture.' },
                { title: isFr ? 'Formations Sur-Mesure' : 'Custom Corporate Training', desc: isFr ? 'Co-construction de modules axés sur vos enjeux spécifiques de performance.' : 'Co-designed coursework built around your specific performance challenges.' },
                { title: isFr ? 'Coaching de Dirigeants' : 'Executive Coaching', desc: isFr ? 'Accompagnement individuel des managers et dirigeants pour accélérer la prise de décision.' : 'One-on-one coaching for managers and executives to accelerate decision execution.' },
              ].map((srv) => (
                <div key={srv.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition duration-300 hover:border-[var(--cj-blue)]/30 hover:shadow-md">
                  <h3 className="text-base font-bold text-slate-900 font-montserrat">{srv.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 font-opensans">{srv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bloc Témoignages ────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cj-blue)]">
              {isFr ? 'Retours d’expérience' : 'Alumni Feedback'}
            </span>
            <h2 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl font-montserrat">
              {isFr ? 'Ce qu’ils disent de CJ Development.' : 'What they say about CJ Development.'}
            </h2>
            <p className="mt-4 text-base text-slate-600 font-opensans">
              {isFr
                ? 'Découvrez les témoignages de nos certifiés, des directeurs RH et des étudiants de nos cohortes.'
                : 'Read stories from our certified graduates, HR managers, and active program students.'}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {((dbTestimonials && dbTestimonials.length > 0)
              ? dbTestimonials.map((item: any) => ({
                  role: isFr ? 'Diplômé / Partenaire' : 'Alumni / Partner',
                  name: item.name,
                  location: item.location || (isFr ? 'Kinshasa, RDC' : 'Kinshasa, DRC'),
                  quote: item.quote,
                  company: isFr ? 'CJ DTC Alumni' : 'CJ DTC Alumni'
                }))
              : [
                  {
                    role: isFr ? 'Ancien Participant' : 'Alumni',
                    name: 'Amina K.',
                    location: isFr ? 'Kinshasa, RDC' : 'Kinshasa, DRC',
                    quote: isFr 
                      ? "Grâce au programme IOP, j'ai décroché un poste de Responsable RH deux mois après ma formation. La qualité pratique de l'enseignement et le mentorat individuel ont fait toute la différence."
                      : "Thanks to the IOP program, I landed an HR Manager position two months after graduation. The practical quality of training and individual mentorship made all the difference.",
                    company: 'Directrice RH — IOP Promotion 2024'
                  },
                  {
                    role: isFr ? 'Entreprise Partenaire' : 'Corporate Client',
                    name: 'Patricia M.',
                    location: isFr ? 'Conakry, Guinée' : 'Conakry, Guinea',
                    quote: isFr
                      ? "Nous avons confié la formation de nos managers à CJ Development. Les cas réels travaillés en session ont permis une application immédiate, améliorant notre efficacité opérationnelle de manière mesurable."
                      : "We entrusted our managers' training to CJ Development. The real cases studied in session enabled immediate application, improving operational efficiency in a measurable way.",
                    company: 'Directrice Talent Management'
                  },
                  {
                    role: isFr ? 'Étudiant Actif' : 'Active Student',
                    name: 'Ousmane S.',
                    location: isFr ? 'Dakar, Sénégal' : 'Dakar, Senegal',
                    quote: isFr
                      ? "Le format blended learning s'adapte parfaitement à mon emploi du temps de professionnel. L'application directe sur le terrain et la rigueur de l'accompagnement me permettent de progresser chaque semaine."
                      : "The blended learning format fits my professional schedule perfectly. Direct field application and the strict support allow me to progress week after week.",
                    company: 'Participant — Leadership & Influence'
                  }
                ]
            ).map((tst, i) => (
              <div key={i} className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
                <span className="absolute top-6 right-6 text-5xl font-serif text-[var(--cj-blue)]/10 select-none">“</span>
                <span className="inline-flex items-center rounded-full bg-[var(--cj-red)]/10 px-3 py-1 text-xs font-semibold text-[var(--cj-red)] uppercase tracking-wider mb-6">
                  {tst.role}
                </span>
                <blockquote className="text-slate-700 leading-relaxed text-sm font-opensans mb-6">
                  « {tst.quote} »
                </blockquote>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cj-blue)] text-sm font-bold text-white uppercase">
                    {tst.name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-montserrat">{tst.name}</h4>
                    <p className="text-xs text-slate-500 font-opensans">{tst.company} • {tst.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ d'orientation ───────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cj-blue)]">
              FAQ
            </span>
            <h2 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl font-montserrat">
              {t.faqTitle}
            </h2>
            <p className="mt-4 text-base text-slate-600 font-opensans">
              {t.faqDescription}
            </p>
          </div>

          <div className="space-y-4">
            {((dbFaqs && dbFaqs.length > 0) ? dbFaqs : (t.faqItems || [])).map((item: { question: string; answer: string }, index: number) => {
              const isOpen = openFaqIndex === index
              return (
                <div 
                  key={index} 
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 transition hover:bg-slate-50"
                  >
                    <span className="text-base sm:text-lg font-montserrat">{item.question}</span>
                    <span className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--cj-blue)]/10 text-[var(--cj-blue)] transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[var(--cj-blue)] text-white' : ''}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[300px] border-t border-slate-100' : 'max-h-0'}`}
                  >
                    <div className="p-6 text-sm sm:text-base leading-relaxed text-slate-600 font-opensans bg-slate-50/50">
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Closing footer ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="cj-cta-banner relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(227,6,19,0.18),transparent_45%)]" />
          
          <div className="relative z-10">
            <div className="mx-auto max-w-3xl text-center mb-14">
              <span className="cj-eyebrow-dark">
                {isFr ? 'Accès directs' : 'Direct Access'}
              </span>
              <h2 className="mt-5 text-3xl font-black sm:text-4xl font-montserrat text-white">
                {isFr ? 'Choisissez votre parcours.' : 'Choose your path.'}
              </h2>
              <p className="mt-4 text-base text-white font-opensans leading-relaxed">
                {isFr
                  ? 'Sélectionnez le canal adapté à votre situation pour commencer votre collaboration avec CJ Development.'
                  : 'Select the channel suited to your needs to start working with CJ Development.'}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: isFr ? 'Je veux me former' : 'I want to train',
                  description: isFr
                    ? 'Découvrez nos programmes certifiants, vérifiez les sessions ouvertes et réservez votre place.'
                    : 'Discover our certified programs, check open sessions and reserve your seat.',
                  href: `/${locale}/formations`,
                  label: isFr ? 'Voir les programmes' : 'View programs'
                },
                {
                  title: isFr ? 'Je représente une entreprise' : 'I represent a business',
                  description: isFr
                    ? 'Explorez nos solutions sur-mesure de formation, de recrutement et d’accompagnement RH.'
                    : 'Explore our tailored training, recruiting and HR consulting solutions.',
                  href: `/${locale}/services`,
                  label: isFr ? 'Découvrir l’offre B2B' : 'Discover B2B services'
                },
                {
                  title: isFr ? 'Je suis déjà étudiant' : 'I am already a student',
                  description: isFr
                    ? 'Accédez à votre espace sécurisé, suivez vos cours, téléchargez vos documents et certificats.'
                    : 'Log in to your secure portal, view courses, download documents and credentials.',
                  href: `/${locale}/espace-etudiants`,
                  label: isFr ? 'Accéder à mon espace' : 'Log in to my portal'
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-8 text-left transition duration-300 hover:border-[var(--cj-red)] hover:bg-white/10 hover:scale-[1.02] shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--cj-red)] transition font-montserrat">{item.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-white/85 font-opensans">{item.description}</p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white/70 group-hover:text-[var(--cj-red)] transition">
                    {item.label}
                    <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sessions récentes ─────────────────────────────────────────────── */}
      <RecentSessions />

      {/* ── Actualités récentes ───────────────────────────────────────────── */}
      <RecentArticles />
    </div>
  )
}
