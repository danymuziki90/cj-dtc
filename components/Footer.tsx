'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

const copy = publicMessages.footer

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function IconLinkedIn() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
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

function IconYouTube() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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

function IconWhatsApp() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.52 3.48A11.92 11.92 0 0012 0C5.37 0 .08 5.29.08 11.92c0 2.1.54 4.16 1.56 5.98L0 24l6.35-1.64A11.92 11.92 0 0012 23.92c6.63 0 11.92-5.29 11.92-11.92 0-3.18-1.24-6.17-3.4-8.52zM12 21.77c-1.37 0-2.71-.36-3.88-1.05l-.28-.16-3.77.97.98-3.67-.18-.29A8.01 8.01 0 013.92 11.92c0-4.42 3.58-8 8-8 4.42 0 8 3.58 8 8 0 4.42-3.58 8-8 8zm4.35-6.9c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12s-.62.78-.76.94c-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.12-.12.26-.31.38-.47.12-.16.16-.28.24-.46.08-.18.04-.35-.02-.49-.06-.15-.54-1.29-.74-1.77-.2-.48-.4-.41-.55-.41-.14 0-.3-.02-.46-.02s-.49.08-.75.36c-.26.28-1 1-1 2.43s1.02 2.82 1.16 3.01c.14.19 2.01 3.07 4.87 4.3 1.86.8 2.51.84 3.41.7.9-.14 2.86-1.17 3.27-2.29.4-1.12.4-2.09.28-2.29-.12-.2-.44-.32-.68-.44z" />
    </svg>
  )
}

function IconCheckCircle() {
  return (
    <svg className="h-5 w-5 flex-shrink-0 text-[var(--cj-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

// ── Section heading component ────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-white">{children}</h4>
      <div className="mt-2 h-0.5 w-8 bg-[var(--cj-red)]" />
    </div>
  )
}

// ── Social icons row ─────────────────────────────────────────────────────────
function SocialRow() {
  return (
    <div className="flex gap-2">
      <a href="https://www.linkedin.com/company/CJDevelopmentCenter" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-200 hover:scale-110 hover:bg-white/20">
        <IconLinkedIn />
      </a>
      <a href="https://www.facebook.com/CJDevelopmentCenter" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-200 hover:scale-110 hover:bg-white/20">
        <IconFacebook />
      </a>
      <a href="https://www.instagram.com/CJDevelopmentCenter" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-200 hover:scale-110 hover:bg-white/20">
        <IconInstagram />
      </a>
      <a href="https://x.com/CJDevelopmentTC" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-200 hover:scale-110 hover:bg-white/20">
        <IconX />
      </a>
      <a href="https://www.youtube.com/@CJDevelopmentCenter" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-200 hover:scale-110 hover:bg-white/20">
        <IconYouTube />
      </a>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Footer() {
  const params = useParams<{ locale?: string }>()
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

  return (
    <footer className="relative overflow-hidden text-white">
      {/* ── SECTION A — Pre-footer CTA Banner ──────────────────────────────── */}
      <section className="bg-[var(--cj-blue)] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div className="text-center lg:text-left">
            <p className="text-xl font-bold text-white sm:text-2xl">{cta.heading}</p>
            <p className="mt-1 text-sm text-blue-200">{cta.sub}</p>
          </div>
          <a
            href={`/${locale}/contact`}
            className="inline-block rounded-xl bg-white px-8 py-3 text-sm font-bold text-[var(--cj-blue)] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            {cta.cta}
          </a>
        </div>
      </section>

      {/* ── SECTION B — Main footer body ───────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-[#001a4d] to-slate-900">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6">

            {/* Col 1 — Brand / stats / social */}
            <div className="lg:col-span-2 space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Image src="/logo.png" alt="CJ DTC" width={50} height={50} className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <p className="text-base font-bold leading-tight text-white">CJ DEVELOPMENT</p>
                  <p className="text-xs font-medium text-blue-300">TRAINING CENTER</p>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-xs leading-relaxed text-gray-300">{t.brandTagline}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                {(['15+', '10+', '8 500+'] as const).map((val, i) => (
                  <div key={i} className="text-center">
                    <div className="text-lg font-bold text-white">{val}</div>
                    <div className="mt-0.5 text-xs text-blue-300">{t.stats[i]}</div>
                  </div>
                ))}
              </div>

              {/* Social */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">{t.followUs}</p>
                <SocialRow />
              </div>
            </div>

            {/* Col 2 — Navigation rapide */}
            <div>
              <SectionHeading>
                {locale === 'fr' ? 'Navigation rapide' : 'Quick links'}
              </SectionHeading>
              <ul className="space-y-2.5">
                {[
                  { href: `/${locale}`, label: locale === 'fr' ? 'Accueil' : 'Home' },
                  { href: `/${locale}/about`, label: locale === 'fr' ? 'À propos' : 'About' },
                  { href: `/${locale}/formations`, label: locale === 'fr' ? 'Formations' : 'Training' },
                  { href: `/${locale}/espace-etudiants`, label: locale === 'fr' ? 'Espace étudiant' : 'Student Space' },
                  { href: `/${locale}/actualites`, label: locale === 'fr' ? 'Blog / Actualités' : 'Blog / News' },
                  { href: `/${locale}/contact`, label: locale === 'fr' ? 'Contact' : 'Contact' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="group flex items-center gap-2 text-xs text-gray-400 transition-colors duration-200 hover:text-white">
                      <IconChevronRight />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Nos formations */}
            <div>
              <SectionHeading>{t.sections.formations}</SectionHeading>
              <ul className="space-y-2.5">
                <li>
                  <Link href={`/${locale}/formations`} className="group flex items-center gap-2 text-xs text-gray-400 transition-colors duration-200 hover:text-white">
                    <IconChevronRight />
                    {t.links.allTraining}
                  </Link>
                </li>
                {[
                  { slug: 'iop', label: 'IOP' },
                  { slug: 'mrh', label: 'MRH' },
                  { slug: 'leadership', label: 'Leadership' },
                  { slug: 'cj-master-system', label: 'CJ Master System' },
                ].map((item) => (
                  <li key={item.slug}>
                    <Link href={`/${locale}/formations/${item.slug}`} className="group flex items-center gap-2 text-xs text-gray-400 transition-colors duration-200 hover:text-white">
                      <IconChevronRight />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>



            {/* Col 5 — Contact */}
            <div>
              <SectionHeading>{t.sections.contact}</SectionHeading>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:contact@cjdevelopmenttc.org" className="group flex items-start gap-3 text-xs text-gray-400 transition-colors duration-200 hover:text-white">
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-gray-300 group-hover:bg-white/20">
                      <IconMail />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-white">{t.contactLabels.email}</span>
                      contact@cjdevelopmenttc.org
                    </span>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-gray-300">
                      <IconPhone />
                    </span>
                    <div className="text-xs text-gray-400">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-white">{t.contactLabels.drc}</span>
                      <a href="tel:+243995136626" className="block transition-colors duration-200 hover:text-white">+243 995 136 626</a>
                      <a href="tel:+243999482140" className="block transition-colors duration-200 hover:text-white">+243 999 482 140</a>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-gray-300">
                      <IconPhone />
                    </span>
                    <div className="text-xs text-gray-400">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-white">{t.contactLabels.guinea}</span>
                      <a href="tel:+224626146065" className="block transition-colors duration-200 hover:text-white">+224 626 14 60 65</a>
                    </div>
                  </div>
                </li>
                <li>
                  <a href="https://wa.me/243995136626" target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-xs text-gray-400 transition-colors duration-200 hover:text-white">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-gray-300 group-hover:bg-white/20">
                      <IconWhatsApp />
                    </span>
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── SECTION C — Trust band ─────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl border-t border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 py-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                locale === 'fr' ? 'Réponse en moins de 24h' : 'Response within 24h',
                locale === 'fr' ? 'Accompagnement personnalisé' : 'Personalised support',
                locale === 'fr' ? 'Équipe disponible' : 'Available team',
                locale === 'fr' ? 'Certifications reconnues' : 'Recognised certifications',
              ].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <IconCheckCircle />
                  <span className="text-xs text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION D — Legal bar ─────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl border-t border-white/10 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-gray-500 sm:flex-row">
            <p>
              © {currentYear} CJ DEVELOPMENT TRAINING CENTER —{' '}
              <span className="text-gray-400">{t.bottom.rights}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
              <a href="#" className="transition-colors duration-200 hover:text-white">{t.bottom.legal}</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="transition-colors duration-200 hover:text-white">{t.bottom.privacy}</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="transition-colors duration-200 hover:text-white">
                {locale === 'fr' ? "Conditions d'utilisation" : 'Terms of use'}
              </a>
              <span className="text-gray-700">|</span>
              <a href="#" className="transition-colors duration-200 hover:text-white">Cookies</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
