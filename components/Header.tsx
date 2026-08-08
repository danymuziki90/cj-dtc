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
  Briefcase,
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

/** Desktop navigation link for ARSP-style capsule navbar */
function NavLink({ href, label }: { href: string; label: string }) {
  const isActive = useActiveLink(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`
        relative rounded-full px-4 py-1.5 text-[13px] font-bold tracking-wide transition-all duration-200 whitespace-nowrap
        ${
          isActive
            ? 'text-white bg-[var(--cj-blue-700)] shadow-md shadow-[var(--cj-blue)]/30 border border-white/20'
            : 'text-white/80 hover:text-white hover:bg-[var(--cj-blue-700)] active:scale-95'
        }
      `}
    >
      {label}
    </Link>
  )
}

/** Desktop navigation dropdown component (ARSP style with fade & slide transition) */
function DesktopDropdown({
  label,
  items,
}: {
  label: string
  items: { href: string; label: string; description?: string; icon: any }[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 250)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        setIsOpen(true)
        e.preventDefault()
      }
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      ref={dropdownRef}
      className="relative group/dropdown py-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onFocus={handleMouseEnter}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`
          flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold tracking-wide transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white/30
          ${isOpen ? 'text-white bg-[var(--cj-blue-700)] shadow-sm' : 'text-white/80 hover:text-white hover:bg-[var(--cj-blue-700)]'}
          group-hover/dropdown:text-white group-hover/dropdown:bg-[var(--cj-blue-700)]
        `}
      >
        <span>{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : 'text-white/50 group-hover/dropdown:text-white'
          } group-hover/dropdown:rotate-180`}
        />
      </button>

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          absolute left-1/2 -translate-x-1/2 top-full z-50 pt-2 w-68 transition-all duration-200 ease-out
          before:absolute before:-top-5 before:-left-6 before:-right-6 before:h-8 before:content-['']
          group-hover/dropdown:opacity-100 group-hover/dropdown:translate-y-0 group-hover/dropdown:pointer-events-auto group-hover/dropdown:visible
          ${
            isOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto visible'
              : 'opacity-0 translate-y-1 pointer-events-none invisible'
          }
        `}
      >
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group/item flex items-start gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-slate-50 hover:translate-x-1 focus:bg-slate-50 focus:outline-none"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--cj-blue)]/5 text-[var(--cj-blue)] border border-[var(--cj-blue)]/10 transition-colors group-hover/item:bg-[var(--cj-blue)] group-hover/item:text-white group-hover/item:border-[var(--cj-blue)]/30 shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover/item:text-[var(--cj-blue)] transition-colors">
                    {item.label}
                  </div>
                  {item.description && (
                    <div className="text-[11px] text-slate-500 group-hover/item:text-slate-600 leading-snug mt-0.5">{item.description}</div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
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
            ? 'bg-gradient-to-r from-[var(--cj-blue)]/90 via-blue-900/80 to-[var(--cj-blue)]/90 text-white border-l-4 border-[var(--cj-red)] shadow-xl shadow-blue-950/70 border border-white/20 backdrop-blur-md'
            : 'text-slate-200 bg-slate-900/50 border border-white/10 hover:bg-slate-900/80 hover:text-white backdrop-blur-md hover:border-white/25'
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
                : 'bg-slate-900/80 text-slate-300 border border-white/10 group-hover:bg-slate-800 group-hover:text-white'
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
  const [scrolled, setScrolled] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const search = searchParams.toString()
  const labels = navigationLabels[locale]

  // Detect scroll state for sticky header animation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            href: `/${locale}/sessions`,
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
    <header className="header fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* 1. DESKTOP TOP-BAR (VISIBLE DESKTOP ONLY lg:block) */}
      {/* Seamlessly integrated over Hero section when at top, opaque dark backdrop when scrolled */}
      <div
        className={`hidden lg:block text-xs font-medium py-2 transition-all duration-500 ease-in-out ${
          scrolled
            ? 'border-b border-white/10 bg-[var(--cj-blue)] text-slate-100 shadow-sm backdrop-blur-3xl'
            : 'border-b border-white/15 bg-[var(--cj-blue)] text-white backdrop-blur-2xl'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
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
          <div className="italic text-slate-200 text-xs font-serif tracking-wide hidden xl:block drop-shadow-sm">
            « Bâtir des compétences. Transformer des destins. »
          </div>

          {/* Right: Language & Social Networks */}
          <div className="flex items-center gap-5">
            <LanguageSwitcher locale={locale} pathname={pathname} search={search} darkVariant={true} />

            <div className="h-4 w-px bg-white/20" />

            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/CJDevelopmentCenter"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook CJ DTC"
                className="text-slate-200 transition-colors hover:text-blue-400"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.linkedin.com/company/CJDevelopmentCenter"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn CJ DTC"
                className="text-slate-200 transition-colors hover:text-blue-500"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.youtube.com/@CJDevelopmentCenter"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube CJ DTC"
                className="text-slate-200 transition-colors hover:text-red-500"
              >
                <Youtube className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://wa.me/243995136626"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp CJ DTC"
                className="text-slate-200 transition-colors hover:text-emerald-400"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (HERO GLASSMORPHISM OVERLAY WITH ARSP 3-ISLAND LAYOUT) */}
      {/* Desktop & Mobile: Fully integrated glassmorphic background over Hero when at top, opaque dark backdrop on scroll */}
      <div
        className={`w-full transition-all duration-500 ease-in-out ${
          scrolled
            ? 'lg:border-b lg:border-white/10 lg:bg-[var(--cj-blue)] lg:backdrop-blur-3xl lg:shadow-[0_10px_40px_-10px_rgba(0,45,114,0.5)] border-b border-[#0a2e54]/50 bg-[#061b36]/95 backdrop-blur-2xl shadow-2xl shadow-[#061b36]/60 py-2.5'
            : 'lg:border-b lg:border-white/15 lg:bg-[var(--cj-blue)] lg:backdrop-blur-2xl lg:shadow-[0_8px_32px_rgba(0,0,0,0.15)] border-b border-white/10 bg-[#061b36]/40 backdrop-blur-md shadow-lg shadow-[#061b36]/20 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          {/* ÎLOT 1 (GAUCHE) : LOGO CJ DTC */}
          <Link href={`/${locale}`} className="flex items-center gap-3 shrink-0" aria-label="CJ Development Training Center — Accueil">
            <Image
              src="/logo.png"
              alt="CJ DEVELOPMENT TRAINING CENTER"
              width={80}
              height={80}
              className={`h-10 w-auto sm:h-12 transition-all duration-300 hover:scale-[1.02] filter ${scrolled ? 'brightness-110' : 'brightness-125 drop-shadow-xl'}`}
            />
          </Link>

          {/* ÎLOT 2 (CENTRE) : CAPSULE NAVIGATION DESKTOP */}
          <nav
            className={`hidden lg:flex items-center gap-0.5 rounded-full px-3 py-1.5 transition-all duration-500 ${
              scrolled
                ? 'border border-white/[0.12] bg-white/[0.07] shadow-lg shadow-black/10 backdrop-blur-2xl hover:border-white/[0.18] hover:bg-white/[0.10] hover:shadow-xl'
                : 'border border-white/[0.15] bg-white/[0.08] shadow-xl shadow-black/5 backdrop-blur-xl hover:border-white/[0.22] hover:bg-white/[0.12]'
            }`}
            aria-label="Navigation principale Desktop"
          >
            <NavLink href={`/${locale}`} label={labels.home} />
            <NavLink href={`/${locale}/about`} label={labels.about} />

            {/* Lien simple pour Sessions */}
            <NavLink href={`/${locale}/sessions`} label={labels.sessions} />

            {/* Lien simple pour Entreprises */}
            <NavLink href={`/${locale}/entreprises`} label={labels.entreprises} />

            {/* Dropdown Menu for Actualités + Offres d'emploi */}
            <DesktopDropdown
              label={labels.news}
              items={[
                {
                  href: `/${locale}/actualites`,
                  label: locale === 'fr' ? 'Articles & annonces' : 'Articles & News',
                  description: locale === 'fr' ? 'Actualités et annonces officielles' : 'Official news and updates',
                  icon: Newspaper,
                },
                {
                  href: `/${locale}/actualites?categorie=emplois`,
                  label: locale === 'fr' ? 'Offres d\'emploi' : 'Job Openings',
                  description: locale === 'fr' ? 'Opportunités de carrière et stages' : 'Career opportunities & internships',
                  icon: Briefcase,
                },
              ]}
            />

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
                  href: `/${locale}/espace-etudiants/temoignages`,
                  label: locale === 'fr' ? 'Témoignages' : 'Testimonials',
                  description: locale === 'fr' ? 'Avis et retours des diplômés' : 'Feedback and reviews from graduates',
                  icon: MessageCircle,
                },
                {
                  href: `/${locale}/auth/student-login`,
                  label: labels.login,
                  description: locale === 'fr' ? 'Se connecter à votre compte' : 'Log in to your account',
                  icon: LogIn,
                },
              ]}
            />
          </nav>

          {/* ÎLOT 3 (DROIT) : BOUTON CTA CONTACT CAPSULE ARSP */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href={`/${locale}/contact`}
              className="group bg-[var(--cj-red)] hover:bg-[var(--cj-red-700)] border border-red-400/30 text-white rounded-full px-5 py-2 text-xs font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(200,16,46,0.25)] hover:shadow-[0_0_30px_rgba(200,16,46,0.4)] transform hover:-translate-y-0.5 active:scale-95 inline-flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              <span>Contact</span>
            </Link>
          </div>

            <p className="text-center text-[10px] text-slate-400">
              © {new Date().getFullYear()} CJ Development Training Center — Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}


