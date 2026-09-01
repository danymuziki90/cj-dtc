'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Globe2,
  GraduationCap,
  MapPinIcon,
  TargetIcon,
  TrendingUp,
  Users,
} from 'lucide-react'
import { resolveSiteLocale, type SiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'
import Breadcrumbs from '@/components/Breadcrumbs'
import UnifiedHero from '@/components/ui/UnifiedHero'
import type { HeroSectionData } from '@/lib/hero/types'

type AboutModernPageProps = {
  locale?: string
  homeHref: string
  formationsHref: string
  contactHref: string
  heroData?: HeroSectionData | null
}

const PROOF_STATS = [
  { value: '8 500+', label: 'Apprenants formés',    labelEn: 'Learners trained',      icon: Users },
  { value: '10+',    label: 'Pays couverts',         labelEn: 'Countries reached',     icon: Globe2 },
  { value: '2018',   label: 'Année de création',    labelEn: 'Year of creation',       icon: TargetIcon },
  { value: '95%',    label: 'Taux de satisfaction',  labelEn: 'Satisfaction rate',     icon: Award },
  { value: '29+',    label: 'Promotions certifiées', labelEn: 'Certified cohorts',     icon: GraduationCap },
  { value: '85%',    label: "Taux d'insertion",      labelEn: 'Placement rate',        icon: TrendingUp },
]

const TIMELINE = {
  fr: [
    { year: '2018', text: 'Lancement du centre à Kinshasa, RD Congo. Premier programme IOP.' },
    { year: '2019', text: 'Premiers partenariats institutionnels. Extension en Guinée.' },
    { year: '2021', text: 'Déploiement multi-pays. 1 000 apprenants certifiés.' },
    { year: '2023', text: 'Lancement de la plateforme digitale et des sessions hybrides.' },
    { year: '2024', text: 'Certification à grande échelle. 8 500+ apprenants formés.' },
  ],
  en: [
    { year: '2018', text: 'Center launched in Kinshasa, DRC. First IOP program.' },
    { year: '2019', text: 'First institutional partnerships. Expansion to Guinea.' },
    { year: '2021', text: 'Multi-country rollout. 1,000 certified learners.' },
    { year: '2023', text: 'Launch of the digital platform and hybrid sessions.' },
    { year: '2024', text: 'Large-scale certification. 8,500+ learners trained.' },
  ],
}

const VALUES = {
  fr: [
    {
      icon: Award,
      title: 'Excellence opérationnelle',
      desc: 'Chaque programme est conçu pour produire des compétences directement applicables, pas seulement des diplômes.',
    },
    {
      icon: CheckCircle2,
      title: 'Intégrité et rigueur',
      desc: 'Transparence, discipline et redevabilité dans chaque session, chaque interaction, chaque décision pédagogique.',
    },
    {
      icon: Users,
      title: 'Leadership utile',
      desc: "Nous formons des profils capables de décider, d'agir et de faire avancer leurs équipes dans des contextes africains et globaux.",
    },
    {
      icon: Globe2,
      title: 'Impact social mesurable',
      desc: 'Chaque promotion vise un résultat concret : insertion, promotion, création d\'entreprise ou renforcement institutionnel.',
    },
  ],
  en: [
    {
      icon: Award,
      title: 'Operational excellence',
      desc: 'Every program is designed to produce directly applicable skills, not just credentials.',
    },
    {
      icon: CheckCircle2,
      title: 'Integrity and rigor',
      desc: 'Transparency, discipline and accountability in every session, every interaction, every pedagogical decision.',
    },
    {
      icon: Users,
      title: 'Useful leadership',
      desc: 'We train people who can decide, act and move their teams forward in African and global contexts.',
    },
    {
      icon: Globe2,
      title: 'Measurable social impact',
      desc: 'Every cohort targets a concrete outcome: placement, promotion, business creation or institutional strengthening.',
    },
  ],
}

const TEAM = {
  fr: [
    {
      name: 'Expertise Pédagogique',
      role: 'Formateurs Certifiés',
      desc: 'Nos formateurs sont des praticiens expérimentés qui partagent leur vécu.',
      image: '/img/Formaions 2.jpg'
    },
    {
      name: 'Accompagnement',
      role: 'Coachs Carrière',
      desc: 'Un suivi personnalisé pour construire votre trajectoire professionnelle.',
      image: '/apropos.jpeg'
    },
    {
      name: 'Réseau',
      role: 'Partenaires Entreprises',
      desc: 'Une connexion directe avec les recruteurs et les leaders de l\'industrie.',
      image: '/lor-de-formation.jpeg'
    }
  ],
  en: [
    {
      name: 'Pedagogical Expertise',
      role: 'Certified Trainers',
      desc: 'Our trainers are experienced practitioners who share their real-world experience.',
      image: '/img/Formaions 2.jpg'
    },
    {
      name: 'Guidance',
      role: 'Career Coaches',
      desc: 'Personalized support to build your professional trajectory.',
      image: '/apropos.jpeg'
    },
    {
      name: 'Network',
      role: 'Corporate Partners',
      desc: 'A direct connection with recruiters and industry leaders.',
      image: '/lor-de-formation.jpeg'
    }
  ]
}

export default function AboutModernPage({
  locale,
  homeHref,
  formationsHref,
  contactHref,
  heroData,
}: AboutModernPageProps) {
  const resolvedLocale: SiteLocale = resolveSiteLocale(locale)
  const isFr = resolvedLocale === 'fr'
  const t = publicMessages.about[resolvedLocale]
  const nav = publicMessages.header[resolvedLocale]

  const values  = isFr ? VALUES.fr : VALUES.en
  const timeline = isFr ? TIMELINE.fr : TIMELINE.en
  const team = isFr ? TEAM.fr : TEAM.en

  return (
    <div className="bg-slate-50 text-slate-900 pb-8 sm:pb-12">
      
      {/* ── Hero Section Standardisée ─────────────────────────────────────── */}
      <UnifiedHero 
        eyebrow={t.heroEyebrow}
        title={t.heroTitle}
        description={t.heroDescription}
        image="/apropos.jpeg"
        ctas={[
          {
            label: t.ctaPrimary,
            href: formationsHref,
            variant: 'primary'
          },
          {
            label: t.ctaSecondary,
            href: contactHref,
            variant: 'secondary'
          }
        ]}
        heroData={heroData}
        locale={resolvedLocale}
        compact
        desktopTall
      />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: nav.about }]} homeHref={homeHref} />

        {/* ── Notre histoire ───────────────────── */}
        <section className="mt-6 sm:mt-8 grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8 items-center">
          <article className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cj-red)]">
                {isFr ? 'Notre histoire' : 'Our story'}
              </p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-black text-[var(--cj-blue)] leading-tight">
                {isFr
                  ? "Né d'un constat : le diplôme seul ne suffit pas."
                  : 'Born from an observation: a degree alone is not enough.'}
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              {isFr
                ? "En 2018, CJ Development Training Center est fondé à Kinshasa avec une conviction simple : des milliers de jeunes africains obtiennent des diplômes sans trouver d'emploi, parce que leurs compétences opérationnelles ne correspondent pas aux attentes réelles des entreprises."
                : 'In 2018, CJ Development Training Center was founded in Kinshasa with a simple conviction: thousands of young Africans obtain degrees without finding jobs, because their operational skills do not match what employers actually need.'}
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              {isFr
                ? "Nous avons créé un espace pour combler cet écart — pas avec des cours supplémentaires, mais avec une méthode pratique, un accompagnement humain et un réseau actif."
                : "We created a space to bridge that gap — not with more courses, but with a practical method, human support and an active network."}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--cj-blue)] mb-3 sm:mb-4">
              {t.timelineTitle}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {timeline.map((item, i) => (
                <div key={item.year} className="flex gap-3.5 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-12 sm:h-9 sm:w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--cj-blue-50)] text-xs sm:text-sm font-bold text-[var(--cj-blue)]">
                      {item.year}
                    </span>
                    {i < timeline.length - 1 && (
                      <div className="mt-1.5 w-px flex-1 bg-slate-200" />
                    )}
                  </div>
                  <p className="pb-1.5 pt-0.5 text-xs sm:text-sm leading-relaxed text-slate-700">{item.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* ── Mission et valeurs ───────────────────────────────────────── */}
        <section className="mt-8 sm:mt-10 lg:mt-12">
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cj-red)]">
              ADN CJ DTC
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-[var(--cj-blue)] lg:text-4xl">
              {isFr ? 'Mission, Vision & Valeurs' : 'Mission, Vision & Values'}
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 mb-6 sm:mb-8">
            <div className="rounded-3xl border-2 border-[var(--cj-blue-50)] bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cj-blue)] text-white mb-3 sm:mb-4">
                <TargetIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--cj-blue)] mb-2">{t.missionTitle}</h3>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{t.missionDescription}</p>
            </div>
            <div className="rounded-3xl border-2 border-red-50 bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cj-red)] text-white mb-3 sm:mb-4">
                <Globe2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--cj-blue)] mb-2">{t.visionTitle}</h3>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{t.visionDescription}</p>
            </div>
          </div>

          <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:-translate-y-1 transition duration-300"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)] mb-2.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">{value.title}</h4>
                  <p className="text-xs leading-relaxed text-slate-600">{value.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Notre impact — BLOC COMPACTÉ ────────────────────────── */}
        <section className="mt-8 sm:mt-10 lg:mt-12 overflow-hidden rounded-3xl bg-[var(--cj-blue)] px-5 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-10 text-white shadow-xl relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(227,6,19,0.15),transparent_50%)] pointer-events-none" />
          
          <div className="relative z-10 mb-5 sm:mb-6 text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              {isFr ? 'Les chiffres parlent' : 'The numbers speak'}
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {isFr ? 'Notre Impact' : 'Our Impact'}
            </h2>
          </div>
          
          <div className="relative z-10 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROOF_STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <article
                  key={stat.value}
                  className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4 backdrop-blur text-center transition-all duration-300 hover:bg-white/10"
                >
                  <Icon className="h-5 w-5 text-blue-300 mb-1.5" />
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-blue-200">
                    {isFr ? stat.label : stat.labelEn}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        {/* ── Équipe / Expertise ───────────────────────────────────── */}
        <section className="mt-8 sm:mt-10 lg:mt-12">
          <div className="mb-5 sm:mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cj-red)]">
              {isFr ? 'Notre écosystème' : 'Our ecosystem'}
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-[var(--cj-blue)]">
              {isFr ? "L'Expertise CJ DTC" : "CJ DTC Expertise"}
            </h2>
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-slate-600">
              {isFr 
                ? "Une équipe dédiée de formateurs, coachs et partenaires pour garantir votre succès."
                : "A dedicated team of trainers, coaches and partners to guarantee your success."}
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 sm:grid-cols-3">
            {team.map((member, i) => (
              <div key={i} className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 transition hover:shadow-md">
                <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--cj-red)] bg-white px-2 py-0.5 rounded inline-block mb-1">
                      {member.role}
                    </p>
                    <h3 className="text-sm sm:text-base font-bold leading-tight">{member.name}</h3>
                  </div>
                </div>
                <div className="p-3.5 sm:p-4">
                  <p className="text-xs text-slate-600 leading-relaxed">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
