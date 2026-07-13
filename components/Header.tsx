'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { resolveSiteLocale, type SiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'
import { useActiveLink } from '@/hooks/useActiveLink'

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

/** Desktop navigation link with animated active underline */
function NavLink({ href, label }: { href: string; label: string }) {
  const isActive = useActiveLink(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`
        relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200
        ${isActive
          ? 'text-[var(--cj-red)] font-semibold'
          : 'text-slate-700 hover:bg-slate-100 hover:text-[var(--cj-blue)]'
        }
      `}
    >
      {label}

      {/* Animated underline bar */}
      <span
        aria-hidden="true"
        className={`
          absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--cj-red)]
          origin-left transition-all duration-300 ease-out
          ${isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
        `}
      />
    </Link>
  )
}

/** Mobile navigation link */
function MobileNavLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick: () => void
}) {
  const isActive = useActiveLink(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={`
        flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200
        ${isActive
          ? 'bg-red-50 text-[var(--cj-red)] font-semibold'
          : 'text-gray-700 hover:bg-slate-100 hover:text-[var(--cj-blue)]'
        }
      `}
    >
      {/* Active indicator dot */}
      {isActive && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--cj-red)]"
        />
      )}
      {label}
    </Link>
  )
}

/** Desktop navigation contact link button with active styling */
function NavLinkContact({ href, label }: { href: string; label: string }) {
  const isActive = useActiveLink(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`
        inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200
        ${isActive
          ? 'bg-[var(--cj-red-700)] ring-2 ring-[var(--cj-red)] ring-offset-2 scale-[0.98]'
          : 'bg-[var(--cj-red)] hover:bg-[var(--cj-red-700)]'
        }
      `}
    >
      {label}
    </Link>
  )
}

/** Mobile navigation contact link button with active styling */
function MobileNavLinkContact({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick: () => void
}) {
  const isActive = useActiveLink(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={`
        btn-primary mt-2 inline-block py-2 text-center transition-all duration-200
        ${isActive
          ? 'bg-[var(--cj-red-700)] ring-2 ring-[var(--cj-red)] ring-offset-2 shadow-inner font-bold'
          : ''
        }
      `}
    >
      {label}
    </Link>
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
      { href: `/${locale}/formations#sessions`, label: labels.sessions },
      { href: `/${locale}/entreprises`, label: labels.entreprises },
      { href: `/${locale}/actualites`, label: labels.news },
      { href: `/${locale}/espace-etudiants`, label: labels.studentSpace },
    ],
    [labels, locale]
  )

  return (
    <header className="header sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href={`/${locale}`} className="flex items-center gap-3" aria-label="CJ Development Training Center — Accueil">
          <Image
            src="/logo.png"
            alt="CJ DEVELOPMENT TRAINING CENTER"
            width={80}
            height={80}
            className="h-14 w-auto sm:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
          <div className="mx-2">
            <LanguageSwitcher locale={locale} pathname={pathname} search={search} />
          </div>
          <NavLinkContact href={`/${locale}/contact`} label={labels.contact} />
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
        <nav className="flex flex-col gap-1 border-t border-gray-200 bg-white/95 px-3 pb-4 pt-2" aria-label="mobile primary navigation">
          {links.map((link) => (
            <MobileNavLink
              key={link.href}
              href={link.href}
              label={link.label}
              onClick={() => setOpen(false)}
            />
          ))}
          <div className="pt-3">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{labels.language}</p>
            <div className="px-3">
              <LanguageSwitcher locale={locale} pathname={pathname} search={search} onNavigate={() => setOpen(false)} />
            </div>
          </div>
          <MobileNavLinkContact
            href={`/${locale}/contact`}
            label={labels.contact}
            onClick={() => setOpen(false)}
          />
        </nav>
      </div>
    </header>
  )
}
