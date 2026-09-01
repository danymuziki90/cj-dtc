'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams, usePathname } from 'next/navigation'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

const copy = publicMessages.footer

// ── Réseaux sociaux officiels (Exactement 4) ──────────────────────────────────
const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://web.facebook.com/CoachJimanel2021/?_rdc=1&_rdr#',
    icon: IconFacebook,
  },
  {
    name: 'X (Twitter)',
    href: 'https://x.com/CJDevelopmentTC',
    icon: IconX,
  },
  {
    name: 'LinkedIn',
    href: 'https://cd.linkedin.com/company/coach-jimanel-development',
    icon: IconLinkedIn,
  },
  {
    name: 'Telegram',
    href: 'https://t.me/+ukOVkVi8tlA2ZTI0',
    icon: IconTelegram,
  },
]

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
function IconFacebook() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function IconX() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function IconLinkedIn() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function IconTelegram() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.78 18.65 9.95 14l8.47-7.64c.37-.34-.08-.51-.57-.21L7.39 12.76 2.88 11.35c-.97-.29-.98-.96.22-1.44L20.7 3.13c.81-.3 1.59.2 1.33 1.44l-3 14.16c-.21 1-.82 1.24-1.65.77l-4.58-3.38-2.2 2.12c-.24.24-.45.45-.82.41z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function IconMapPin() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function IconCheckCircle() {
  return (
    <svg className="h-4 w-4 flex-shrink-0 text-[var(--cj-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// ── Titre de colonne ──────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-white">{children}</h3>
      <div className="mt-1.5 h-0.5 w-6 bg-[var(--cj-red)] rounded-full" />
    </div>
  )
}

// ── Composant Principal Footer ────────────────────────────────────────────────
export default function Footer() {
  const params = useParams<{ locale?: string }>()
  const pathname = usePathname() || ''
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]
  const currentYear = new Date().getFullYear()

  const ctaBanner = {
    fr: {
      heading: 'Vous avez un projet de formation\u00a0?',
      sub: 'Notre équipe est prête à vous accompagner dans votre démarche de montée en compétences.',
      cta: 'Parler à un conseiller',
    },
    en: {
      heading: 'Do you have a training project?',
      sub: 'Our team is ready to support you in your skills development journey.',
      cta: 'Talk to an advisor',
    },
  }
  const cta = ctaBanner[locale]
  const hideTrainingCta = ['/about', '/a-propos', '/formations', '/entreprises', '/contact'].some((path) => pathname.endsWith(path))

  return (
    <footer className="relative overflow-hidden text-white bg-slate-950" aria-label="Pied de page">
      {/* ── SECTION A — Bannière Pré-footer CTA ───────────────────────────── */}
      {!hideTrainingCta && (
        <section className="bg-[var(--cj-blue)] py-10 sm:py-12 border-b border-blue-900/40">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:px-8">
            <div className="text-center lg:text-left">
              <p className="text-xl font-bold text-white sm:text-2xl font-montserrat">{cta.heading}</p>
              <p className="mt-1 text-sm text-blue-100 font-opensans">{cta.sub}</p>
            </div>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-bold text-[var(--cj-blue)] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:bg-slate-50 shrink-0 active:scale-95"
            >
              {cta.cta}
            </Link>
          </div>
        </section>
      )}

      {/* ── SECTION B — Corps principal du footer ─────────────────────────── */}
      <div className="bg-gradient-to-b from-slate-900 via-[#07162c] to-slate-950">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">

            {/* 1. Bloc Marque, Contact & Réseaux Sociaux (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Logo & Nom */}
              <Link href={`/${locale}`} className="inline-flex items-center gap-3 group" aria-label="CJ Development Training Center">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
                  <Image src="/logo.png" alt="CJ DTC Logo" width={48} height={48} className="h-full w-full object-contain" />
                </div>
                <div>
                  <span className="block text-sm font-black leading-tight tracking-wide text-white group-hover:text-blue-300 transition-colors">
                    CJ DEVELOPMENT
                  </span>
                  <span className="block text-[11px] font-bold text-[var(--cj-red)] tracking-wider">
                    TRAINING CENTER
                  </span>
                </div>
              </Link>

              {/* Tagline / Description */}
              <p className="text-xs leading-relaxed text-slate-300 font-opensans max-w-sm">
                {t.brandDescription || t.brandTagline}
              </p>

              {/* Contact essentiel & compact */}
              <div className="space-y-2 text-xs text-slate-300">
                <a
                  href="mailto:contact@cjdevelopmenttc.org"
                  className="flex items-center gap-2.5 transition-colors hover:text-white group"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-slate-300 group-hover:bg-[var(--cj-blue)] group-hover:text-white transition-colors">
                    <IconMail />
                  </span>
                  <span className="truncate">contact@cjdevelopmenttc.org</span>
                </a>

                <div className="flex items-center gap-2.5 group">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-slate-300">
                    <IconPhone />
                  </span>
                  <div className="flex flex-wrap items-center gap-x-2">
                    <a href="tel:+243995136626" className="hover:text-white transition-colors">
                      +243 995 136 626
                    </a>
                    <span className="text-slate-600">•</span>
                    <a href="tel:+224626146065" className="hover:text-white transition-colors">
                      +224 626 14 60 65
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-slate-300">
                    <IconMapPin />
                  </span>
                  <span>{t.contactLabels.drc} • {t.contactLabels.guinea}</span>
                </div>
              </div>

              {/* 4 Réseaux Sociaux Officiels (Facebook, X, LinkedIn, Telegram) */}
              <div className="pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {t.followUs}
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {SOCIAL_LINKS.map((item) => {
                    const Icon = item.icon
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.name}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-200 border border-white/10 transition-all duration-200 hover:scale-110 hover:bg-[var(--cj-blue)] hover:border-[var(--cj-blue)] hover:text-white shadow-sm"
                      >
                        <Icon />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 2. Colonne À propos (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <SectionHeading>{t.sections.about}</SectionHeading>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    href={`/${locale}/about`}
                    className="group inline-flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-white"
                  >
                    <IconChevronRight />
                    {t.links.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/contact`}
                    className="group inline-flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-white"
                  >
                    <IconChevronRight />
                    {t.links.contact}
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. Colonne Formations & Sessions (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <SectionHeading>{t.sections.formations}</SectionHeading>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    href={`/${locale}/formations`}
                    className="group inline-flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-white"
                  >
                    <IconChevronRight />
                    {t.links.formations}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/sessions`}
                    className="group inline-flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-white"
                  >
                    <IconChevronRight />
                    {t.links.sessions}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/entreprises`}
                    className="group inline-flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-white"
                  >
                    <IconChevronRight />
                    {t.links.entreprises}
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. Colonne Opportunités (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <SectionHeading>{t.sections.opportunities}</SectionHeading>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    href={`/${locale}/actualites`}
                    className="group inline-flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-white"
                  >
                    <IconChevronRight />
                    {t.links.news}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/emplois`}
                    className="group inline-flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-white"
                  >
                    <IconChevronRight />
                    {t.links.jobs}
                  </Link>
                </li>
              </ul>
            </div>

            {/* 5. Colonne Espace Étudiant (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <SectionHeading>{t.sections.studentPortal}</SectionHeading>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    href={`/${locale}/espace-etudiants`}
                    className="group inline-flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-white"
                  >
                    <IconChevronRight />
                    {t.links.studentSpace}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/auth/student-login`}
                    className="group inline-flex items-center gap-1.5 text-slate-300 transition-colors duration-200 hover:text-white"
                  >
                    <IconChevronRight />
                    {t.links.login}
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* ── SECTION C — Bande de réassurance / Valeurs ───────────────────── */}
        <div className="mx-auto max-w-7xl border-t border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="py-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                locale === 'fr' ? 'Réponse sous 24h' : 'Response within 24h',
                locale === 'fr' ? 'Accompagnement dédié' : 'Dedicated support',
                locale === 'fr' ? 'Formateurs experts' : 'Expert trainers',
                locale === 'fr' ? 'Certifications reconnues' : 'Recognised certificates',
              ].map((label) => (
                <div key={label} className="flex items-center gap-2 text-slate-300 text-xs">
                  <IconCheckCircle />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION D — Barre légale & Copyright dynamique ───────────────── */}
        <div className="mx-auto max-w-7xl border-t border-white/10 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-400 sm:flex-row">
            <p className="text-center sm:text-left">
              © {currentYear} CJ Development Training Center. {t.bottom.rights}
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-end text-slate-400">
              <Link
                href={`/${locale}/politique-de-confidentialite`}
                className="transition-colors duration-200 hover:text-white"
              >
                {t.bottom.privacy}
              </Link>
              <span className="text-slate-700 select-none">•</span>
              <Link
                href={`/${locale}/mentions-legales`}
                className="transition-colors duration-200 hover:text-white"
              >
                {t.bottom.legal}
              </Link>
              <span className="text-slate-700 select-none">•</span>
              <Link
                href={`/${locale}/conditions-d-utilisation`}
                className="transition-colors duration-200 hover:text-white"
              >
                {t.bottom.terms}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
