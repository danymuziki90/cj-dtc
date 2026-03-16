'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { resolveSiteLocale, type SiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

const navigationLabels = publicMessages.header

function buildLocaleHref(pathname: string, search: string, targetLocale: SiteLocale) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] === 'fr' || segments[0] === 'en') {
    segments[0] = targetLocale
  } else {
    segments.unshift(targetLocale)
  }

  const localizedPath = `/${segments.join('/')}`
  return search ? `${localizedPath}?${search}` : localizedPath
}

function LanguageSwitcher({
  locale,
  pathname,
  search,
  onNavigate,
}: {
  locale: SiteLocale
  pathname: string
  search: string
  onNavigate?: () => void
}) {
  const options: SiteLocale[] = ['fr', 'en']

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm shadow-slate-200/70 backdrop-blur">
      {options.map((option) => {
        const active = locale === option

        return (
          <Link
            key={option}
            href={buildLocaleHref(pathname, search, option)}
            hrefLang={option}
            onClick={onNavigate}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.16em] transition ${
              active
                ? 'bg-[var(--cj-blue)] text-white shadow-sm'
                : 'text-slate-600 hover:text-[var(--cj-blue)]'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {option.toUpperCase()}
          </Link>
        )
      })}
    </div>
  )
}

export default function Header() {
  const params = useParams<{ locale?: string }>()
  const pathname = usePathname() || '/fr'
  const searchParams = useSearchParams()
  const locale = resolveSiteLocale(params?.locale)
  const [open, setOpen] = useState(false)

  const search = searchParams.toString()
  const labels = navigationLabels[locale]

  const links = useMemo(
    () => [
      { href: `/${locale}`, label: labels.home },
      { href: `/${locale}/about`, label: labels.about },
      { href: `/${locale}/formations`, label: labels.formations },
      { href: `/${locale}/programmes`, label: labels.sessions },
      { href: `/${locale}/espace-etudiants`, label: labels.studentSpace },
      { href: `/${locale}/actualites`, label: labels.news },
    ],
    [labels, locale]
  )

  return (
    <header className="header sticky top-0 z-50 bg-transparent">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="CJ DEVELOPMENT TRAINING CENTER"
            width={80}
            height={80}
            className="h-16 w-auto sm:h-20"
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-700 transition-colors duration-200 hover:text-[var(--cj-blue)]"
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher locale={locale} pathname={pathname} search={search} />
          <Link href={`/${locale}/contact`} className="btn-primary">
            {labels.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher locale={locale} pathname={pathname} search={search} />
          <button
            type="button"
            aria-label={open ? labels.closeMenu : labels.openMenu}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--cj-blue)]"
          >
            {open ? (
              <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${open ? 'max-h-[32rem]' : 'max-h-0'}`}
        aria-hidden={!open}
      >
        <nav className="flex flex-col gap-1 border-t border-gray-200 bg-white/95 px-4 pb-4" aria-label="mobile primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-sm text-gray-700 hover:text-[var(--cj-blue)]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{labels.language}</p>
            <LanguageSwitcher locale={locale} pathname={pathname} search={search} onNavigate={() => setOpen(false)} />
          </div>
          <Link href={`/${locale}/contact`} className="btn-primary inline-block py-2" onClick={() => setOpen(false)}>
            {labels.contact}
          </Link>
        </nav>
      </div>
    </header>
  )
}
