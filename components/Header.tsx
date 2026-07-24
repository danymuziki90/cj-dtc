'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Home,
  Info,
  GraduationCap,
  Building2,
  Newspaper,
  UserCheck,
  Send,
  X,
  ChevronRight,
  Globe,
  Sparkles,
  Phone,
} from 'lucide-react'
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
            className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.16em] transition-all duration-200 ${
              active
                ? 'bg-[var(--cj-blue)] text-white shadow-sm scale-105'
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

/** Desktop navigation contact link button with active styling */
function NavLinkContact({ href, label }: { href: string; label: string }) {
  const isActive = useActiveLink(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`
        inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200
        ${isActive
          ? 'bg-[var(--cj-red-700)] ring-2 ring-[var(--cj-red)] ring-offset-2 scale-[0.98]'
          : 'bg-[var(--cj-red)] hover:bg-[var(--cj-red-700)] hover:shadow-md active:scale-95'
        }
      `}
    >
      <Send className="h-4 w-4" />
      {label}
    </Link>
  )
}

/** Mobile navigation item with icon, stagger animation & active state */
function MobileNavItem({
  href,
  label,
  icon: Icon,
  isActive,
  index,
  isOpen,
  onClick,
}: {
  href: string
  label: string
  icon: any
  isActive: boolean
  index: number
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      style={{
        transitionDelay: isOpen ? `${70 + index * 40}ms` : '0ms',
      }}
      className={`
        group relative flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium
        transition-all duration-300 ease-out active:scale-[0.98]
        ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}
        ${
          isActive
            ? 'bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50/50 text-[var(--cj-blue)] font-bold shadow-sm border-l-4 border-[var(--cj-red)]'
            : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-950'
        }
      `}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`
            flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110
            ${
              isActive
                ? 'bg-[var(--cj-blue)] text-white shadow-md shadow-blue-900/20'
                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-[var(--cj-blue)]'
            }
          `}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="tracking-wide">{label}</span>
      </div>

      <ChevronRight
        className={`h-4 w-4 transition-transform duration-200 ${
          isActive
            ? 'text-[var(--cj-red)] translate-x-0.5'
            : 'text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1'
        }`}
      />
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

  // Lock background scroll & handle Escape key press when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const links = useMemo(
    () => [
      { href: `/${locale}`, label: labels.home, icon: Home },
      { href: `/${locale}/about`, label: labels.about, icon: Info },
      { href: `/sessions`, label: locale === 'fr' ? 'Nos Sessions' : 'Our Sessions', icon: GraduationCap },
      { href: `/${locale}/entreprises`, label: labels.entreprises, icon: Building2 },
      { href: `/${locale}/actualites`, label: labels.news, icon: Newspaper },
      { href: `/${locale}/espace-etudiants`, label: labels.studentSpace, icon: UserCheck },
    ],
    [labels, locale]
  )

  return (
    <header className="header sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Brand Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3" aria-label="CJ Development Training Center — Accueil">
          <Image
            src="/logo.png"
            alt="CJ DEVELOPMENT TRAINING CENTER"
            width={80}
            height={80}
            className="h-14 w-auto sm:h-16 transition-transform duration-200 hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
          <div className="mx-2">
            <LanguageSwitcher locale={locale} pathname={pathname} search={search} />
          </div>
          <NavLinkContact href={`/${locale}/contact`} label={labels.contact} />
        </nav>

        {/* Mobile Header Actions */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher locale={locale} pathname={pathname} search={search} />

          {/* Animated Hamburger / X Toggle Button */}
          <button
            type="button"
            aria-label={open ? labels.closeMenu : labels.openMenu}
            aria-expanded={open}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setOpen(!open)}
            className={`
              relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-[var(--cj-blue)] focus:ring-offset-2
              ${
                open
                  ? 'border-[var(--cj-red-200)] bg-[var(--cj-red-50)] text-[var(--cj-red)] shadow-sm rotate-90'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
              }
            `}
          >
            <div className="relative flex h-5 w-5 flex-col items-center justify-center">
              <span
                aria-hidden="true"
                className={`
                  absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out
                  ${open ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}
                `}
              />
              <span
                aria-hidden="true"
                className={`
                  absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out
                  ${open ? 'opacity-0 scale-x-0' : 'opacity-100'}
                `}
              />
              <span
                aria-hidden="true"
                className={`
                  absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out
                  ${open ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}
                `}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Glassmorphism Overlay Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer Panel */}
      <aside
        id="mobile-navigation-drawer"
        aria-label="Navigation mobile"
        aria-hidden={!open}
        className={`
          fixed top-0 right-0 bottom-0 z-50 flex w-[85vw] max-w-sm flex-col justify-between
          border-l border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-2xl transition-transform duration-300 ease-out md:hidden
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Drawer Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--cj-blue)] to-blue-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[var(--cj-blue)]">CJ DTC</p>
              <p className="text-[10px] font-semibold text-slate-500">Menu Principal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Links List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <p className="mb-2 px-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
            Navigation
          </p>

          {links.map((link, index) => {
            const isActive = pathname === link.href || (link.href !== `/${locale}` && pathname.startsWith(link.href))

            return (
              <MobileNavItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                isActive={isActive}
                index={index}
                isOpen={open}
                onClick={() => setOpen(false)}
              />
            )
          })}
        </div>

        {/* Drawer Footer Actions & Info */}
        <div className="border-t border-slate-100 bg-slate-50/80 p-4 space-y-3">
          {/* Primary Contact CTA Button */}
          <Link
            href={`/${locale}/contact`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--cj-red)] to-red-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition-all duration-200 hover:shadow-red-900/30 active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            {labels.contact}
          </Link>

          {/* Quick Language Selection Footer Bar */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Globe className="h-4 w-4 text-[var(--cj-blue)]" />
              <span>{labels.language}</span>
            </div>
            <LanguageSwitcher locale={locale} pathname={pathname} search={search} onNavigate={() => setOpen(false)} />
          </div>

          <p className="text-center text-[10px] text-slate-400">
            © {new Date().getFullYear()} CJ Development Training Center
          </p>
        </div>
      </aside>
    </header>
  )
}
