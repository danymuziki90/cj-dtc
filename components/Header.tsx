'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  ArrowUpRight,
  ShieldCheck,
  Linkedin,
  Facebook,
  Mail,
  Phone,
  MessageCircle,
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
  darkVariant = false,
  onNavigate,
}: {
  locale: SiteLocale
  pathname: string
  search: string
  darkVariant?: boolean
  onNavigate?: () => void
}) {
  const options: SiteLocale[] = ['fr', 'en']

  return (
    <div
      className={`inline-flex items-center rounded-full p-1 shadow-sm backdrop-blur ${
        darkVariant
          ? 'border border-slate-800 bg-slate-900/90 shadow-slate-950'
          : 'border border-slate-200 bg-white/90 shadow-slate-200/70'
      }`}
    >
      {options.map((option) => {
        const active = locale === option

        return (
          <Link
            key={option}
            href={buildLocaleHref(pathname, search, option)}
            hrefLang={option}
            onClick={onNavigate}
            className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.16em] transition-all duration-200 ${
              active
                ? 'bg-[var(--cj-blue)] text-white shadow-md scale-105'
                : darkVariant
                ? 'text-slate-400 hover:text-white'
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
        relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200
        ${isActive
          ? 'text-[var(--cj-red)] font-semibold'
          : 'text-slate-700 hover:bg-slate-100/80 hover:text-[var(--cj-blue)]'
        }
      `}
    >
      {label}

      <span
        aria-hidden="true"
        className={`
          absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full bg-[var(--cj-red)]
          origin-left transition-all duration-300 ease-out
          ${isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
        `}
      />
    </Link>
  )
}

/** Desktop navigation contact CTA button */
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

/** Types for Fullscreen Navigation Links */
type NavItemConfig = {
  href: string
  label: string
  description?: string
  icon: any
  badge?: string
}

type NavCategoryConfig = {
  id: string
  categoryNumber: string
  categoryName: string
  items: NavItemConfig[]
}

/** Fullscreen Navigation Link Item Component with Stagger Entrance */
function FullscreenNavItem({
  item,
  isActive,
  index,
  isOpen,
  onClick,
}: {
  item: NavItemConfig
  isActive: boolean
  index: number
  isOpen: boolean
  onClick: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      style={{
        transitionDelay: isOpen ? `${60 + index * 35}ms` : '0ms',
      }}
      className={`
        group relative flex items-center justify-between rounded-2xl p-3.5 transition-all duration-300 ease-out active:scale-[0.98]
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        ${
          isActive
            ? 'bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-blue-950/40 text-white border-l-4 border-[var(--cj-red)] shadow-lg shadow-blue-950/50'
            : 'text-slate-300 hover:bg-slate-900/60 hover:text-white'
        }
      `}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`
            flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110
            ${
              isActive
                ? 'bg-gradient-to-tr from-[var(--cj-blue)] to-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-white'
            }
          `}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-wide">{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-[var(--cj-red)]/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--cj-red)] border border-[var(--cj-red)]/30">
                {item.badge}
              </span>
            )}
          </div>
          {item.description && (
            <p className="mt-0.5 text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
              {item.description}
            </p>
          )}
        </div>
      </div>

      <ChevronRight
        className={`h-5 w-5 shrink-0 transition-all duration-300 ${
          isActive
            ? 'text-[var(--cj-red)] translate-x-1'
            : 'text-slate-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-white'
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
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const search = searchParams.toString()
  const labels = navigationLabels[locale]

  // Prevent background scrolling, manage keyboard Escape & Focus Trap when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      closeButtonRef.current?.focus()
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

  // Fullscreen Navigation Structure grouped by non-clickable Category Headers
  const navigationCategories = useMemo<NavCategoryConfig[]>(
    () => [
      {
        id: 'academy',
        categoryNumber: '01',
        categoryName: locale === 'fr' ? 'ACADÉMIE & FORMATIONS' : 'ACADEMY & COURSES',
        items: [
          {
            href: `/${locale}`,
            label: labels.home,
            description: locale === 'fr' ? 'Page d\'accueil du centre de formation' : 'Main training center homepage',
            icon: Home,
          },
          {
            href: `/sessions`,
            label: locale === 'fr' ? 'Nos Sessions Ouvertes' : 'Open Training Sessions',
            description: locale === 'fr' ? 'Consultez les dates et inscrivez-vous' : 'View session dates and register',
            icon: GraduationCap,
            badge: locale === 'fr' ? 'Inscriptions' : 'Enrollment',
          },
          {
            href: `/${locale}/about`,
            label: labels.about,
            description: locale === 'fr' ? 'Notre mission, équipe et accréditations' : 'Our mission, team & accreditations',
            icon: Info,
          },
        ],
      },
      {
        id: 'corporate',
        categoryNumber: '02',
        categoryName: locale === 'fr' ? 'SOLUTIONS ENTREPRISES & B2B' : 'CORPORATE & B2B',
        items: [
          {
            href: `/${locale}/entreprises`,
            label: labels.entreprises,
            description: locale === 'fr' ? 'Formations sur-mesure pour vos équipes' : 'Custom corporate team training',
            icon: Building2,
          },
        ],
      },
      {
        id: 'portal',
        categoryNumber: '03',
        categoryName: locale === 'fr' ? 'PORTAIL ÉTUDIANT & BLOG' : 'STUDENT PORTAL & NEWS',
        items: [
          {
            href: `/${locale}/actualites`,
            label: labels.news,
            description: locale === 'fr' ? 'Articles, guides et annonces officielles' : 'Articles, guides and announcements',
            icon: Newspaper,
          },
          {
            href: `/${locale}/espace-etudiants`,
            label: labels.studentSpace,
            description: locale === 'fr' ? 'Accès devoirs, supports et espace élève' : 'Assignments, courseware & student portal',
            icon: UserCheck,
            badge: 'Portail',
          },
        ],
      },
    ],
    [labels, locale]
  )

  // Flat links array for desktop navigation
  const desktopLinks = useMemo(
    () => [
      { href: `/${locale}`, label: labels.home },
      { href: `/${locale}/about`, label: labels.about },
      { href: `/sessions`, label: locale === 'fr' ? 'Nos Sessions' : 'Our Sessions' },
      { href: `/${locale}/entreprises`, label: labels.entreprises },
      { href: `/${locale}/actualites`, label: labels.news },
      { href: `/${locale}/espace-etudiants`, label: labels.studentSpace },
    ],
    [labels, locale]
  )

  let globalIndexCounter = 0

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

        {/* Desktop Navigation Menu */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {desktopLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
          <div className="mx-2">
            <LanguageSwitcher locale={locale} pathname={pathname} search={search} />
          </div>
          <NavLinkContact href={`/${locale}/contact`} label={labels.contact} />
        </nav>

        {/* Mobile Header Quick Actions */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher locale={locale} pathname={pathname} search={search} />

          {/* Animated Hamburger / X Transformation Toggle Button */}
          <button
            type="button"
            aria-label={open ? labels.closeMenu : labels.openMenu}
            aria-expanded={open}
            aria-controls="fullscreen-navigation-overlay"
            onClick={() => setOpen(!open)}
            className={`
              relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-[var(--cj-blue)] focus:ring-offset-2
              ${
                open
                  ? 'border-[var(--cj-red-200)] bg-[var(--cj-red-50)] text-[var(--cj-red)] shadow-md scale-105'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
              }
            `}
          >
            <div className="relative flex h-5 w-5 flex-col items-center justify-center">
              <span
                aria-hidden="true"
                className={`
                  absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out
                  ${open ? 'rotate-45 translate-y-0 bg-[var(--cj-red)]' : '-translate-y-1.5'}
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
                  ${open ? '-rotate-45 translate-y-0 bg-[var(--cj-red)]' : 'translate-y-1.5'}
                `}
              />
            </div>
          </button>
        </div>
      </div>

      {/* FULLSCREEN MOBILE NAVIGATION OVERLAY */}
      <div
        id="fullscreen-navigation-overlay"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal de navigation"
        aria-hidden={!open}
        className={`
          fixed inset-0 z-50 flex flex-col justify-between md:hidden
          bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-slate-950
          text-slate-100 backdrop-blur-3xl transition-all duration-400 ease-out
          ${open ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'}
        `}
      >
        {/* Fullscreen Overlay Top Bar Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4 backdrop-blur-xl bg-slate-950/60">
          <Link
            href={`/${locale}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3"
            aria-label="Accueil CJ DTC"
          >
            <Image
              src="/logo.png"
              alt="CJ DEVELOPMENT TRAINING CENTER"
              width={70}
              height={70}
              className="h-12 w-auto brightness-110 filter"
            />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[var(--cj-blue)]">CJ DTC</p>
              <p className="text-[10px] font-medium text-slate-400">Centre de Formation</p>
            </div>
          </Link>

          {/* Close Button X */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu plein écran"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-300 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800 hover:text-white active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Fullscreen Categorized Navigation Scroll Container */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
          {navigationCategories.map((cat) => (
            <div key={cat.id} className="space-y-2.5">
              {/* Non-clickable Category Section Header */}
              <div className="flex items-center gap-2 px-2 pb-1 border-b border-slate-800/60">
                <span className="text-[11px] font-black text-[var(--cj-blue)] tracking-wider">
                  {cat.categoryNumber}.
                </span>
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  {cat.categoryName}
                </h3>
              </div>

              {/* Category Link Items */}
              <div className="space-y-1.5">
                {cat.items.map((item) => {
                  const currentIndex = globalIndexCounter++
                  const isActive =
                    pathname === item.href || (item.href !== `/${locale}` && pathname.startsWith(item.href))

                  return (
                    <FullscreenNavItem
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      index={currentIndex}
                      isOpen={open}
                      onClick={() => setOpen(false)}
                    />
                  )
                })}
              </div>
            </div>
          ))}

          {/* Action CTAs in Fullscreen Menu */}
          <div className="pt-4 space-y-3">
            <p className="px-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              04. ACCÈS DIRECT & CONTACT
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={`/${locale}/espace-etudiants`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-blue-600/40 bg-gradient-to-r from-[var(--cj-blue)] to-blue-700 p-4 text-sm font-bold text-white shadow-xl shadow-blue-950/60 transition-all duration-200 hover:shadow-blue-900/80 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-200" />
                  <span>Espace Étudiant</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-blue-200" />
              </Link>

              <Link
                href={`/${locale}/contact`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-red-600/40 bg-gradient-to-r from-[var(--cj-red)] to-red-700 p-4 text-sm font-bold text-white shadow-xl shadow-red-950/60 transition-all duration-200 hover:shadow-red-900/80 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-red-200" />
                  <span>{labels.contact}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-red-200" />
              </Link>
            </div>
          </div>
        </div>

        {/* Fullscreen Overlay Footer (Language, Socials & Credits) */}
        <div className="border-t border-slate-800/80 bg-slate-950/90 px-5 py-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Quick Language Switcher */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[var(--cj-blue)]" />
              <span className="text-xs font-semibold text-slate-400">{labels.language} :</span>
              <LanguageSwitcher
                locale={locale}
                pathname={pathname}
                search={search}
                darkVariant={true}
                onNavigate={() => setOpen(false)}
              />
            </div>

            {/* Social Network Quick Icons */}
            <div className="flex items-center gap-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn CJ DTC"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook CJ DTC"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@cj-dtc.com"
                aria-label="Email CJ DTC"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-500">
            © {new Date().getFullYear()} CJ Development Training Center — Tous droits réservés.
          </p>
        </div>
      </div>
    </header>
  )
}
