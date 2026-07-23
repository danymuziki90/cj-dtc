'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react'

export interface HeroSlideItem {
  id: number
  eyebrowFr: string
  eyebrowEn: string
  titleFr: string
  titleEn: string
  descFr: string
  descEn: string
  image: string
  badgeFr: string
  badgeEn: string
}

export const HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 1,
    eyebrowFr: 'Centre de Formation Panafricain',
    eyebrowEn: 'Pan-African Training Center',
    titleFr: 'CJ DEVELOPMENT TRAINING CENTER',
    titleEn: 'CJ DEVELOPMENT TRAINING CENTER',
    descFr: 'Former, accompagner, inspirer et révéler les talents pour bâtir des carrières solides, des entreprises performantes et des leaders d\'impact.',
    descEn: 'Training, guiding, inspiring, and unleashing talents to build solid careers, high-performing enterprises, and impactful leaders.',
    image: '/lor-de-formation.jpeg',
    badgeFr: 'Excellence Panafricaine',
    badgeEn: 'Pan-African Excellence',
  },
  {
    id: 2,
    eyebrowFr: 'Ressources Humaines & Management',
    eyebrowEn: 'Human Resources & Management',
    titleFr: 'Management Stratégique des Ressources Humaines',
    titleEn: 'Strategic Human Resources Management',
    descFr: 'Développez les compétences RH qui transforment les organisations. Formez-vous au Management Stratégique des Ressources Humaines et devenez un acteur clé de la performance de votre entreprise.',
    descEn: 'Develop HR skills that transform organizations. Train in Strategic HR Management and become a key driver of your company\'s performance.',
    image: '/img/Formation.jpeg',
    badgeFr: 'Masterclass & Certification',
    badgeEn: 'Masterclass & Certification',
  },
  {
    id: 3,
    eyebrowFr: 'Accompagnement & Carrière',
    eyebrowEn: 'Career Guidance & Support',
    titleFr: 'Orientation et Insertion Professionnelle',
    titleEn: 'Career Guidance & Professional Insertion',
    descFr: 'Préparez votre avenir professionnel avec confiance. Nous vous accompagnons dans votre orientation, la construction de votre projet de carrière et votre insertion sur le marché de l\'emploi.',
    descEn: 'Prepare your professional future with confidence. We guide your orientation, career project building, and employment market insertion.',
    image: '/apropos.jpeg',
    badgeFr: 'Parcours IOP Certifié',
    badgeEn: 'Certified IOP Program',
  },
  {
    id: 4,
    eyebrowFr: 'Employabilité & Recrutement',
    eyebrowEn: 'Employability & Recruitment',
    titleFr: 'Préparation à l\'Emploi',
    titleEn: 'Job Readiness & Preparation',
    descFr: 'Votre diplôme est un point de départ. Développez les compétences, les attitudes et les outils qui font la différence auprès des recruteurs. Votre emploi commence par une bonne préparation.',
    descEn: 'Your degree is just a starting point. Develop the skills, mindsets, and tools that stand out to recruiters. Your job begins with preparation.',
    image: '/img/certificat.jpeg',
    badgeFr: 'Boosteur d\'Employabilité',
    badgeEn: 'Employability Booster',
  },
  {
    id: 5,
    eyebrowFr: 'Événements & Réseau',
    eyebrowEn: 'Events & Networking',
    titleFr: 'Forums, Conférences et Networking',
    titleEn: 'Forums, Conferences & Networking',
    descFr: 'Participez à des forums et conférences inspirants pour apprendre des experts, élargir votre réseau professionnel et découvrir les opportunités qui accélèrent votre carrière.',
    descEn: 'Join inspiring forums and conferences to learn from experts, expand your professional network, and discover career-accelerating opportunities.',
    image: '/books-wood.jpg',
    badgeFr: 'Réseau d\'Experts',
    badgeEn: 'Expert Network',
  },
  {
    id: 6,
    eyebrowFr: 'Suivi Sur Mesure',
    eyebrowEn: 'Tailored Support',
    titleFr: 'Coaching Personnalisé',
    titleEn: 'Personalized Coaching',
    descFr: 'Bénéficiez d\'un accompagnement personnalisé pour atteindre vos objectifs académiques, professionnels ou entrepreneuriaux grâce à un coaching adapté à vos besoins.',
    descEn: 'Benefit from tailored coaching to achieve your academic, professional, or entrepreneurial goals designed around your exact needs.',
    image: '/img/ceo.jpeg',
    badgeFr: 'Coaching 1-on-1',
    badgeEn: '1-on-1 Coaching',
  },
  {
    id: 7,
    eyebrowFr: 'Solutions Pour Entreprises',
    eyebrowEn: 'Enterprise Solutions',
    titleFr: 'Formations Professionnelles pour les Entreprises',
    titleEn: 'Corporate Professional Training',
    descFr: 'Renforcez les compétences de vos collaborateurs grâce à des formations professionnelles sur mesure, conçues pour améliorer la performance, le leadership et la productivité de votre organisation.',
    descEn: 'Empower your teams with customized professional training designed to enhance performance, leadership, and productivity.',
    image: '/img/certificat 1.jpeg',
    badgeFr: 'Sur Mesure & In-Company',
    badgeEn: 'Customized & In-Company',
  },
  {
    id: 8,
    eyebrowFr: 'Compétences Digitales',
    eyebrowEn: 'Digital Skills',
    titleFr: 'Création de Contenu & Monétisation des Réseaux Sociaux',
    titleEn: 'Content Creation & Social Media Monetization',
    descFr: 'Transformez votre présence en ligne en source de revenus. Apprenez à créer du contenu de valeur, développer votre audience et monétiser efficacement les réseaux sociaux.',
    descEn: 'Turn your online presence into a revenue stream. Learn to create high-value content, grow your audience, and monetize social media effectively.',
    image: '/img/Formaions 2.jpg',
    badgeFr: 'Digital & Influence',
    badgeEn: 'Digital & Influence',
  }
]

const institutionalProofs = [
  { value: '2018',   labelFr: 'Année de création', labelEn: 'Founded' },
  { value: '8 500+', labelFr: 'Impacts réels',     labelEn: 'Real impacts' },
  { value: '10+',    labelFr: 'Pays couverts',     labelEn: 'Countries reached' },
  { value: '50+',    labelFr: 'Promotions actives', labelEn: 'Active sessions' },
]

export default function Hero() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'
  const isFr = locale === 'fr'

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentSlide = HERO_SLIDES[currentIndex]

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    timerRef.current = setInterval(() => {
      nextSlide()
    }, 6000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, nextSlide])

  return (
    <section
      className="hero-bg-unified relative min-h-[85vh] pt-28 pb-16 overflow-hidden flex flex-col justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background slideshow (8 synchronized images) */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.image}
              alt={isFr ? slide.titleFr : slide.titleEn}
              fill
              priority={index === 0}
              className={`object-cover ${
                index === currentIndex ? 'scale-105 transition-transform duration-[6000ms] ease-out' : 'scale-100'
              }`}
              sizes="100vw"
            />
          </div>
        ))}
        {/* Dark Gradient Overlay for maximum readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/60 z-20" />
      </div>

      {/* Nav Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 focus:outline-none hidden md:flex"
        aria-label={isFr ? "Diapositive précédente" : "Previous slide"}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 focus:outline-none hidden md:flex"
        aria-label={isFr ? "Diapositive suivante" : "Next slide"}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Progress Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/15 shadow-xl">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(index)}
            className={`relative h-2.5 rounded-full transition-all duration-300 overflow-hidden focus:outline-none ${
              index === currentIndex ? 'w-10 bg-white/20' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Aller au message ${index + 1}`}
            title={isFr ? slide.titleFr : slide.titleEn}
          >
            {index === currentIndex && (
              <div
                key={currentIndex}
                className={`absolute inset-0 bg-gradient-to-r from-[var(--cj-red)] to-red-500 rounded-full ${
                  !isPaused ? 'animate-hero-progress' : 'w-full'
                }`}
              />
            )}
          </button>
        ))}
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full my-auto">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Synchronized Text Block with Fade & Slide animation */}
          <div key={currentIndex} className="lg:col-span-7 space-y-6 animate-hero-fade-in">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200 backdrop-blur-sm shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--cj-red)] animate-pulse" aria-hidden="true" />
              {isFr ? currentSlide.eyebrowFr : currentSlide.eyebrowEn}
            </div>

            {/* Titre */}
            <h1 className="hero-title-unified drop-shadow-md">
              {isFr ? currentSlide.titleFr : currentSlide.titleEn}
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-white/95 font-opensans drop-shadow-sm">
              {isFr ? currentSlide.descFr : currentSlide.descEn}
            </p>

            {/* Actions CTAs (Always visible & functional) */}
            <div className="flex flex-col gap-4 sm:flex-row pt-4">
              <Link
                href={`/${locale}/formations`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-red)] px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-900/30 transition duration-300 hover:bg-[var(--cj-red-700)] hover:scale-[1.02] hover:shadow-red-900/40 group"
              >
                {isFr ? 'Voir nos formations' : 'View courses'}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition duration-300 hover:bg-white/20 hover:scale-[1.02]"
              >
                {isFr ? 'Demander un conseil' : 'Contact advisor'}
              </Link>
            </div>
          </div>

          {/* Right Column Glassmorphism Badge */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[200px] lg:min-h-0">
            <div className="relative rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur-md shadow-2xl transition duration-500 hover:scale-[1.02] max-w-sm hover:border-white/30">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-red-500/20 blur-lg opacity-60 pointer-events-none" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl font-bold shadow-inner">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-xs font-mono font-bold text-white/80 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                    0{currentIndex + 1} / 0{HERO_SLIDES.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                    {isFr ? currentSlide.badgeFr : currentSlide.badgeEn}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {isFr ? currentSlide.titleFr : currentSlide.titleEn}
                  </h3>
                  <p className="text-xs text-blue-100/90 leading-relaxed font-opensans line-clamp-2">
                    {isFr ? currentSlide.descFr : currentSlide.descEn}
                  </p>
                </div>
                <div className="border-t border-white/15 pt-3 flex items-center justify-between text-[11px] font-semibold text-blue-100/90 font-opensans">
                  <span>{isFr ? "Excellence CJ DTC" : "CJ DTC Excellence"}</span>
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
  )
}
