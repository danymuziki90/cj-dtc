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
  ChevronDown,
  Globe,
  ArrowUpRight,
  ShieldCheck,
  Linkedin,
  Facebook,
  Youtube,
  MessageCircle,
  Mail,
  Phone,
  Headphones,
  Image as ImageIcon,
  Users,
  LogIn,
  UserPlus,
  FileText,
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
            className={`rounded-full px-3 py-1 text-xs font-bold tracking-[0.16em] transition-all duration-200 ${
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

/** Desktop navigation link with animated active underline & high-contrast dark theme */
function NavLink({ href, label }: { href: string; label: string }) {
  const isActive = useActiveLink(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`
        relative rounded-lg px-3.5 py-2 text-sm font-semibold tracking-normal transition-all duration-200
        ${isActive
          ? 'text-[var(--cj-red)]'
          : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
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

/** Desktop navigation dropdown item with arrow and smooth fade-in */
function DesktopDropdown({
  label,
  items,
}: {
  label: string
  items: { href: string; label: string; description?: string; icon: any }[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold tracking-normal text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
      >
        <span>{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl animate-fade-in">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-800/80"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-blue-400 transition-colors group-hover:bg-[var(--cj-blue)] group-hover:text-white">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 group-hover:text-white">{item.label}</div>
                  {item.description && (
                    <div className="text-[11px] text-slate-400 leading-snug">{item.description}</div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

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

/** Fullscreen Navigation Link Item Component for Mobile Overlay */
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
        transitionDelay: isOpen ? `${40 + index * 25}ms` : '0ms',
      }}
      className={`
        group relative flex items-center justify-between rounded-2xl p-3.5 transition-all duration-300 ease-out active:scale-[0.98]
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        ${
          isActive
            ? 'bg-gradient-to-r from-blue-950/90 via-slate-900 to-blue-950/60 text-white border-l-4 border-[var(--cj-red)] shadow-lg shadow-blue-950/60'
            : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
        }
      `}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`
            flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110
            ${
              isActive
                ? 'bg-gradient-to-tr from-[var(--cj-blue)] to-blue-600 text-white shadow-md shadow-blue-900/50'
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

  // Prevent background scrolling for Mobile menu
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

  // Fullscreen Navigation Structure for Mobile
  const navigationCategories = useMemo<NavCategoryConfig[]>(
    () => [
      {
        id: 'main',
        categoryNumber: '01',
        categoryName: locale === 'fr' ? 'NAVIGATION PRINCIPALE' : 'MAIN NAVIGATION',
        items: [
          {
            href: `/${locale}`,
            label: labels.home,
            description: locale === 'fr' ? 'Accueil du centre de formation' : 'Training center homepage',
            icon: Home,
          },
          {
            href: `/${locale}/about`,
            label: labels.about,
            description: locale === 'fr' ? 'Notre mission, équipe et accréditations' : 'Our mission, team & accreditations',
            icon: Info,
          },
          {
            href: `/sessions`,
            label: labels.sessions,
            description: locale === 'fr' ? 'Consultez les dates et inscrivez-vous' : 'View session dates and register',
            icon: GraduationCap,
            badge: locale === 'fr' ? 'Inscriptions' : 'Enrollment',
          },
          {
            href: `/${locale}/entreprises`,
            label: labels.entreprises,
            description: locale === 'fr' ? 'Formations sur-mesure pour vos équipes' : 'Custom corporate team training',
            icon: Building2,
          },
        ],
      },
      {
        id: 'explore',
        categoryNumber: '02',
        categoryName: locale === 'fr' ? 'DÉCOUVRIR & DÉCOUVERTES' : 'EXPLORE & MEDIA',
        items: [
          {
            href: `/${locale}/actualites`,
            label: labels.news,
            description: locale === 'fr' ? 'Articles, guides et annonces officielles' : 'Articles, guides and announcements',
            icon: Newspaper,
          },
          {
            href: `/${locale}/galerie`,
            label: labels.galerie,
            description: locale === 'fr' ? 'Photos de nos campus et événements' : 'Photos of our campus and events',
            icon: ImageIcon,
          },
          {
            href: `/${locale}/partenaires`,
            label: labels.partners,
            description: locale === 'fr' ? 'Nos entreprises et institutions partenaires' : 'Our partner companies & institutions',
            icon: Users,
          },
        ],
      },
      {
        id: 'portal',
        categoryNumber: '03',
        categoryName: locale === 'fr' ? 'PORTAIL ÉTUDIANT & ACCÈS' : 'STUDENT PORTAL & AUTH',
        items: [
          {
            href: `/${locale}/espace-etudiants`,
            label: labels.studentSpace,
            description: locale === 'fr' ? 'Accès supports et espace élève' : 'Courseware & student portal',
            icon: UserCheck,
            badge: 'Portail',
          },
          {
            href: `/${locale}/auth/student-login`,
            label: labels.login,
            description: locale === 'fr' ? 'Se connecter à votre compte étudiant' : 'Log in to your student account',
            icon: LogIn,
          },
          {
            href: `/${locale}/auth/student-register`,
            label: labels.register,
            description: locale === 'fr' ? 'Créer un nouveau compte étudiant' : 'Register a new student account',
            icon: UserPlus,
          },
        ],
      },
    ],
    [labels, locale]
  )

  let globalIndexCounter = 0

  return (
    <header className="header sticky top-0 z-50">
      {/* 1. DESKTOP TOP-BAR (VISIBLE DESKTOP ONLY lg:block) */}
      <div className="hidden lg:block border-b border-slate-800/80 bg-slate-950 text-slate-300 text-xs font-medium py-2 shadow-inner">
        <div className="container mx-auto flex items-center justify-between px-4">
          {/* Left: Email Info */}
          <div className="flex items-center gap-6">
            <a
              href="mailto:contact@cjdevelopmenttc.org"
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              <Mail className="h-3.5 w-3.5 text-[var(--cj-red)]" />
              <span className="font-semibold text-slate-200">contact@cjdevelopmenttc.org</span>
            </a>
          </div>

          {/* Center: Institutional Slogan */}
          <div className="italic text-slate-400 text-xs font-serif tracking-wide hidden xl:block">
            « Bâtir des compétences. Transformer des destins. »
          </div>

          {/* Right: Language & Social Networks (Facebook, LinkedIn, WhatsApp) */}
          <div className="flex items-center gap-5">
            <LanguageSwitcher locale={locale} pathname={pathname} search={search} darkVariant={true} />

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook CJ DTC"
                className="text-slate-400 transition-colors hover:text-blue-400"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn CJ DTC"
                className="text-slate-400 transition-colors hover:text-blue-500"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube CJ DTC"
                className="text-slate-400 transition-colors hover:text-red-500"
              >
                <Youtube className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://wa.me/243810000000"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp CJ DTC"
                className="text-slate-400 transition-colors hover:text-emerald-400"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DESKTOP & MOBILE MAIN NAVBAR HEADER */}
      <div className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md shadow-xl text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Brand Logo Pinned Left */}
          <Link href={`/${locale}`} className="flex items-center gap-3" aria-label="CJ Development Training Center — Accueil">
            <Image
              src="/logo.png"
              alt="CJ DEVELOPMENT TRAINING CENTER"
              width={80}
              height={80}
              className="h-14 w-auto sm:h-16 transition-transform duration-200 hover:scale-[1.02] filter brightness-110"
            />
          </Link>

          {/* Desktop Navigation Links (hidden on mobile lg:flex) */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Navigation principale Desktop">
            <NavLink href={`/${locale}`} label={labels.home} />
            <NavLink href={`/${locale}/about`} label={labels.about} />
            <NavLink href={`/sessions`} label={labels.sessions} />
            <NavLink href={`/${locale}/entreprises`} label={labels.entreprises} />
            <NavLink href={`/${locale}/actualites`} label={labels.news} />

            {/* Dropdown Menu for Student Space */}
            <DesktopDropdown
              label={labels.studentSpace}
              items={[
                {
                  href: `/${locale}/espace-etudiants`,
                  label: labels.studentSpace,
                  description: locale === 'fr' ? 'Accéder à votre tableau de bord LMS' : 'Access your LMS dashboard',
                  icon: UserCheck,
                },
                {
                  href: `/${locale}/espace-etudiants/supports`,
                  label: locale === 'fr' ? 'Supports de cours' : 'Course Materials',
                  description: locale === 'fr' ? 'Documents et fichiers téléchargeables' : 'Downloadable documents & resources',
                  icon: FileText,
                },
                {
                  href: `/${locale}/auth/student-login`,
                  label: labels.login,
                  description: locale === 'fr' ? 'Se connecter à votre compte' : 'Log in to your account',
                  icon: LogIn,
                },
              ]}
            />

            <NavLink href={`/${locale}/contact`} label={labels.contact} />
          </nav>

          {/* Right Action Pill Button (Desktop lg:flex) */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href={`/${locale}/espace-etudiants`}
              className="group relative inline-flex items-center gap-2 rounded-full border-2 border-white/90 bg-transparent px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-white hover:text-slate-950 hover:border-white hover:shadow-xl hover:shadow-white/20 active:scale-95"
            >
              <UserCheck className="h-4 w-4 text-[var(--cj-red)] transition-colors group-hover:text-[var(--cj-blue)]" />
              <span>{labels.studentSpace}</span>
            </Link>
          </div>

          {/* Mobile Header Quick Actions (visible on mobile lg:hidden) */}
          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher locale={locale} pathname={pathname} search={search} darkVariant={true} />

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
                    : 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:border-slate-600'
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
      </div>

      {/* FULLSCREEN MOBILE NAVIGATION OVERLAY (UNTOUCHED MOBILE CODE FOR < lg) */}
      <div
        id="fullscreen-navigation-overlay"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal de navigation"
        aria-hidden={!open}
        className={`
          fixed inset-0 z-[100] flex h-[100dvh] w-screen flex-col justify-between lg:hidden
          bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-950/60 via-slate-950 to-slate-950
          text-slate-100 backdrop-blur-2xl transition-all duration-300 ease-out
          ${open ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'}
        `}
      >
        {/* Fullscreen Overlay Top Bar Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4 backdrop-blur-xl bg-slate-950/80 shrink-0">
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
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/90 text-slate-200 transition-all duration-200 hover:border-slate-500 hover:bg-slate-800 hover:text-white active:scale-95 shadow-md"
          >
            <X className="h-6 w-6" />
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
            <p className="px-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-800/60 pb-1">
              04. ASSISTANCE & CONTACT DIRECT
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={`/${locale}/contact`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-blue-500/40 bg-gradient-to-r from-[var(--cj-blue)] to-blue-700 p-4 text-sm font-bold text-white shadow-xl shadow-blue-950/60 transition-all duration-200 hover:shadow-blue-900/80 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Headphones className="h-5 w-5 text-blue-200" />
                  <span>{labels.advisor}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-blue-200" />
              </Link>

              <Link
                href={`/${locale}/contact`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-red-500/40 bg-gradient-to-r from-[var(--cj-red)] to-red-700 p-4 text-sm font-bold text-white shadow-xl shadow-red-950/60 transition-all duration-200 hover:shadow-red-900/80 active:scale-[0.98]"
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
        <div className="border-t border-slate-800/80 bg-slate-950/95 px-5 py-4 space-y-3 shrink-0">
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


