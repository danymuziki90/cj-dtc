'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

const copy = publicMessages.footer

const trainingLinks = [
  { slug: '', key: 'allTraining' },
  { slug: '/iop', label: 'IOP' },
  { slug: '/mrh', label: 'MRH' },
  { slug: '/leadership', label: 'Leadership' },
]

const resourceLinks = [
  { href: '/actualites', key: 'news' },
  { href: '/certificates', key: 'verifyCertificate' },
  { href: '/espace-etudiants', key: 'studentSpace' },
  { href: '/partenaires', key: 'partners' },
  { href: '/services', key: 'services' },
]

export default function Footer() {
  const params = useParams<{ locale?: string }>()
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-900 text-white">
      <div className="absolute inset-0">
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-blue-500 opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-blue-500 opacity-10 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-96 w-96 rounded-full bg-blue-500 opacity-5 blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="relative">
        <svg className="h-16 w-full fill-slate-900" viewBox="0 0 1440 64" preserveAspectRatio="none">
          <path d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z" opacity="0.3" />
          <path d="M0,48 C480,16 960,80 1440,48 L1440,64 L0,64 Z" opacity="0.5" />
        </svg>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:mb-16 lg:grid-cols-5 lg:gap-8">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <div className="group">
              <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 opacity-50 blur-lg transition-opacity duration-300 group-hover:opacity-75" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg sm:h-12 sm:w-12">
                    <Image
                      src="/logo.png"
                      alt="CJ DTC"
                      width={32}
                      height={32}
                      className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white sm:text-xl">CJ DEVELOPMENT</h3>
                  <p className="text-xs font-medium text-blue-300 sm:text-sm">TRAINING CENTER</p>
                </div>
              </div>

              <p className="mb-4 text-xs leading-relaxed text-gray-300 sm:mb-6 sm:text-sm">
                {t.brandTagline} <span className="font-semibold text-white">{t.brandHighlight}</span>
              </p>

              <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-4">
                <div className="text-center">
                  <div className="mb-1 text-lg font-bold text-white sm:text-2xl">15+</div>
                  <div className="text-xs text-blue-300">{t.stats[0]}</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-lg font-bold text-white sm:text-2xl">10+</div>
                  <div className="text-xs text-blue-300">{t.stats[1]}</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-lg font-bold text-white sm:text-2xl">8500+</div>
                  <div className="text-xs text-blue-300">{t.stats[2]}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white sm:text-sm">{t.followUs}</h4>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <a href="https://www.linkedin.com/company/CJDevelopmentCenter" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="group relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20 sm:h-10 sm:w-10">
                  <svg className="h-4 w-4 text-[#0A66C2] sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065z" />
                  </svg>
                </a>
                <a href="https://www.facebook.com/CJDevelopmentCenter" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="group relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20 sm:h-10 sm:w-10">
                  <svg className="h-4 w-4 text-[#1877F2] sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="https://x.com/CJDevelopmentCenter" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20">
                  <svg className="h-5 w-5 text-black" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.36 5.64a1 1 0 0 0-1.41 0L12 10.59 7.05 5.64A1 1 0 0 0 5.64 7.05L10.59 12l-4.95 4.95a1 1 0 1 0 1.41 1.41L12 13.41l4.95 4.95a1 1 0 0 0 1.41-1.41L13.41 12l4.95-4.95a1 1 0 0 0 0-1.41z" />
                  </svg>
                </a>
                <a href="https://t.me/+ukOVkVi8tlA2ZTI0" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20">
                  <svg className="h-5 w-5 text-[#26A5E3]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1.4 14.2l-1.2-1.5-2.6 1 5.3-6.3 1.9 1.3-4.4 5.5z" />
                  </svg>
                </a>
                <a href="https://chat.whatsapp.com/CuzmyG3JobMGm4Lhk0DROb" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20">
                  <svg className="h-5 w-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.52 3.48A11.92 11.92 0 0012 0C5.37 0 .08 5.29.08 11.92c0 2.1.54 4.16 1.56 5.98L0 24l6.35-1.64A11.92 11.92 0 0012 23.92c6.63 0 11.92-5.29 11.92-11.92 0-3.18-1.24-6.17-3.4-8.52zM12 21.77c-1.37 0-2.71-.36-3.88-1.05l-.28-.16-3.77.97.98-3.67-.18-.29A8.01 8.01 0 013.92 11.92c0-4.42 3.58-8 8-8 4.42 0 8 3.58 8 8 0 4.42-3.58 8-8 8zm4.35-6.9c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12s-.62.78-.76.94c-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.12-.12.26-.31.38-.47.12-.16.16-.28.24-.46.08-.18.04-.35-.02-.49-.06-.15-.54-1.29-.74-1.77-.2-.48-.4-.41-.55-.41-.14 0-.3-.02-.46-.02s-.49.08-.75.36c-.26.28-1 1-1 2.43s1.02 2.82 1.16 3.01c.14.19 2.01 3.07 4.87 4.3 1.86.8 2.51.84 3.41.7.9-.14 2.86-1.17 3.27-2.29.4-1.12.4-2.09.28-2.29-.12-.2-.44-.32-.68-.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="relative mb-6 text-lg font-bold text-white">
              <span className="relative z-10">{t.sections.formations}</span>
              <div className="absolute -bottom-2 left-0 h-1 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-400" />
            </h4>
            <ul className="space-y-3">
              {trainingLinks.map((item) => (
                <li key={item.slug || 'all'}>
                  <Link href={item.slug ? `/${locale}/formations${item.slug}` : `/${locale}/formations`} className="group flex items-center text-sm text-gray-300 transition-all duration-300 hover:text-white">
                    <svg className="mr-2 h-4 w-4 text-blue-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {'label' in item ? item.label : t.links[item.key as keyof typeof t.links]}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/${locale}/programmes`} className="group flex items-center text-sm text-gray-300 transition-all duration-300 hover:text-white">
                  <svg className="mr-2 h-4 w-4 text-blue-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {t.links.programs}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="relative mb-6 text-lg font-bold text-white">
              <span className="relative z-10">{t.sections.resources}</span>
              <div className="absolute -bottom-2 left-0 h-1 w-8 rounded-full bg-gradient-to-r from-blue-400 to-red-400" />
            </h4>
            <ul className="space-y-3">
              {resourceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={`/${locale}${item.href}`} className="group flex items-center text-sm text-gray-300 transition-all duration-300 hover:text-white">
                    <svg className="mr-2 h-4 w-4 text-blue-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {t.links[item.key as keyof typeof t.links]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="relative mb-6 text-lg font-bold text-white">
              <span className="relative z-10">{t.sections.contact}</span>
              <div className="absolute -bottom-2 left-0 h-1 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-400" />
            </h4>
            <ul className="space-y-4">
              <li className="group">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 transition-transform duration-300 group-hover:scale-110">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a href="mailto:contact@cjdevelopmenttc.org" className="text-sm text-gray-300 transition-colors duration-300 hover:text-white">
                    <span className="font-medium text-white">{t.contactLabels.email}</span>
                    <br />
                    contact@cjdevelopmenttc.org
                  </a>
                </div>
              </li>
              <li className="group">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 transition-transform duration-300 group-hover:scale-110">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="font-medium text-white">{t.contactLabels.drc}</span>
                    <div className="mt-1 flex flex-col gap-1">
                      <a href="tel:+243995136626" className="text-white transition-colors duration-300 hover:text-white">+243 995 136 626</a>
                      <a href="tel:+243999482140" className="text-white transition-colors duration-300 hover:text-white">+243 999 482 140</a>
                    </div>
                  </div>
                </div>
              </li>
              <li className="group">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 transition-transform duration-300 group-hover:scale-110">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="font-medium text-white">{t.contactLabels.guinea}</span>
                    <div className="mt-1">
                      <a href="tel:+224626146065" className="text-white transition-colors duration-300 hover:text-white">+224 626 14 60 65</a>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/20 to-blue-600/20 p-8 backdrop-blur-sm">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xl font-bold text-white">{t.newsletter.title}</h3>
                <p className="text-sm text-gray-300">{t.newsletter.description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder={t.newsletter.placeholder}
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all duration-300 focus:bg-white/15 focus:border-white/40 focus:outline-none"
                />
                <button className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  {t.newsletter.button}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="flex flex-col items-center gap-4 text-sm text-gray-300 sm:flex-row">
              <p>&copy; {currentYear} CJ DEVELOPMENT TRAINING CENTER</p>
              <span className="hidden text-gray-500 sm:inline">|</span>
              <p>{t.bottom.rights}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm lg:justify-end">
              <Link href={`/${locale}/about`} className="group flex items-center text-gray-300 transition-all duration-300 hover:text-white">
                {t.bottom.about}
                <svg className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href={`/${locale}/contact`} className="group flex items-center text-gray-300 transition-all duration-300 hover:text-white">
                {t.sections.contact}
                <svg className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#" className="group flex items-center text-gray-300 transition-all duration-300 hover:text-white">
                {t.bottom.legal}
                <svg className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#" className="group flex items-center text-gray-300 transition-all duration-300 hover:text-white">
                {t.bottom.privacy}
                <svg className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="h-8 w-full fill-slate-900" viewBox="0 0 1440 32" preserveAspectRatio="none">
            <path d="M0,16 C480,32 960,0 1440,16 L1440,32 L0,32 Z" opacity="0.3" />
          </svg>
        </div>
      </div>
    </footer>
  )
}
