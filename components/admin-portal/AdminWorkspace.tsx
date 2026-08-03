'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import AdminGlobalSearch from '@/components/admin-portal/AdminGlobalSearch'
import {
  BellRing,
  BookOpenCheck,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  FileStack,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Newspaper,
  Plus,
  Settings2,
  ShieldIcon,
  Star,
  Sun,
  Users,
  XIcon,
  ChevronRight,
} from 'lucide-react'

// ─── Nav items ────────────────────────────────────────────────────────────────
type NavItem = { href: string; label: string; caption: string; icon: LucideIcon }

const navItems: NavItem[] = [
  { href: '/admin/dashboard',   label: 'Dashboard',       caption: 'KPI & vue globale',         icon: LayoutDashboard },
  { href: '/admin/sessions',    label: 'Sessions',         caption: 'Planification & cohortes',  icon: CalendarDays    },
  { href: '/admin/travaux',     label: 'Travaux',          caption: 'Devoirs & remises',          icon: BookOpenCheck   },
  { href: '/admin/students',    label: 'Étudiants',        caption: 'Comptes & accès',            icon: Users           },
  { href: '/admin/enrollments', label: 'Inscriptions',     caption: 'Demandes & suivi',           icon: FileStack       },
  { href: '/admin/documents',   label: 'Supports',         caption: 'Ressources pédagogiques',    icon: FileText        },
  { href: '/admin/certificates',label: 'Certificats',      caption: 'Délivrance & vérification', icon: GraduationCap   },
  { href: '/admin/articles',    label: 'Actualités',       caption: 'Contenus & annonces',        icon: Newspaper       },
  { href: '/admin/emplois',     label: 'Emplois',          caption: 'Offres & recrutement',       icon: Briefcase       },
  { href: '/admin/evaluations', label: 'Témoignages',      caption: 'Retours & avis',             icon: Star            },
  { href: '/admin/b2b',         label: 'Entreprises',      caption: 'Demandes B2B & intra',       icon: Building2       },
  { href: '/admin/settings',    label: 'Paramètres',       caption: 'Configuration & sécurité',   icon: Settings2       },
]

const quickActions = [
  { href: '/admin/sessions/new',  label: 'Session',          icon: CalendarDays },
  { href: '/admin/emplois',       label: "Offre d'emploi",   icon: Briefcase    },
  { href: '/admin/articles/new',  label: 'Actualité',        icon: Newspaper    },
  { href: '/admin/enrollments',   label: 'Inscription',      icon: FileStack    },
]

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href + '/'))
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminWorkspace({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const router    = useRouter()

  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [loggingOut,   setLoggingOut]   = useState(false)
  const [darkMode,     setDarkMode]     = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const [quickOpen,    setQuickOpen]    = useState(false)
  const [unread,       setUnread]       = useState(0)

  const profileRef = useRef<HTMLDivElement>(null)
  const quickRef   = useRef<HTMLDivElement>(null)
  const navRef     = useRef<HTMLDivElement>(null)

  const currentDate = useMemo(() =>
    new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date()),
  [])

  // Dark mode init
  useEffect(() => {
    const isDark = localStorage.getItem('cj-admin-dark-mode') === 'true'
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on route change
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); setQuickOpen(false) }, [pathname])

  // Click outside to close dropdowns
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (quickRef.current   && !quickRef.current.contains(e.target as Node))   setQuickOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Notifications
  useEffect(() => {
    if (pathname === '/admin/login') return
    const fetch$ = async () => {
      try {
        const r = await fetch('/api/admin/dashboard/kpi')
        if (r.ok) { const d = await r.json(); setUnread(d.totals?.notificationsTotal || 0) }
      } catch {}
    }
    fetch$()
    const t = setInterval(fetch$, 60_000)
    return () => clearInterval(t)
  }, [pathname])

  // Scroll active nav item into view
  useEffect(() => {
    const el = navRef.current?.querySelector('[aria-current="page"]') as HTMLElement | null
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [pathname])

  function toggleDark() {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('cj-admin-dark-mode', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  // ── Login page ──────────────────────────────────────────────────────────────
  if (pathname === '/admin/login') {
    return (
      <div className="admin-theme relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,48,160,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(227,6,19,0.12),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative">{children}</div>
      </div>
    )
  }

  // ── Shared nav link style ────────────────────────────────────────────────────
  function navLinkCls(href: string) {
    const active = isActive(pathname, href)
    return [
      'group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap transition-all duration-150 select-none',
      active
        ? 'bg-[var(--admin-primary)] text-white shadow-sm shadow-blue-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    ].join(' ')
  }

  return (
    <div className="admin-theme relative flex min-h-screen flex-col text-slate-950 dark:text-slate-100">
      {/* Page background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,48,160,0.06),transparent_50%),linear-gradient(180deg,#f8fbff_0%,#f1f5fb_100%)] dark:bg-slate-950" />

      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <header
        className={[
          'sticky top-0 z-40 w-full transition-shadow duration-200',
          'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800',
          scrolled ? 'shadow-[0_1px_12px_rgba(15,23,42,0.08)]' : 'shadow-none',
        ].join(' ')}
      >
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-4 lg:px-6">

          {/* ── Logo ── */}
          <Link href="/admin/dashboard" className="flex shrink-0 items-center gap-2.5 pr-3 mr-1 border-r border-slate-200/80 dark:border-slate-700">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--admin-primary)] shadow-sm shadow-blue-200">
              <img src="/logo.png" alt="CJ DTC" className="h-5 w-5 object-contain brightness-0 invert" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-black tracking-tight text-slate-900 dark:text-white leading-none">CJ Development</p>
              <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400 uppercase mt-0.5">Administration</p>
            </div>
          </Link>

          {/* ── Nav bar (desktop) ── */}
          <nav
            ref={navRef}
            className="hidden md:flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none px-1"
            aria-label="Navigation principale"
          >
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(pathname, href) ? 'page' : undefined}
                title={label}
                className={navLinkCls(href)}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* ── Spacer (fills gap when nav overflows) ── */}
          <div className="flex-1 md:hidden" />

          {/* ── Right controls ── */}
          <div className="flex shrink-0 items-center gap-1.5 pl-2">

            {/* Search — desktop only */}
            <div className="hidden lg:block w-52 xl:w-64">
              <AdminGlobalSearch />
            </div>

            {/* Date chip — xl only */}
            <span className="hidden xl:flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 capitalize whitespace-nowrap">
              {currentDate}
            </span>

            {/* Quick create dropdown */}
            <div className="relative hidden sm:block" ref={quickRef}>
              <button
                type="button"
                onClick={() => setQuickOpen(v => !v)}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--admin-primary)] px-2.5 py-1.5 text-[12px] font-bold text-white shadow-sm shadow-blue-200 hover:bg-blue-800 transition-colors"
                aria-label="Créer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Créer</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${quickOpen ? 'rotate-180' : ''}`} />
              </button>

              {quickOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 p-1.5 shadow-xl ring-1 ring-slate-900/5 z-50">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Créer rapidement</p>
                  {quickActions.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setQuickOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--admin-primary-50)] dark:bg-blue-950">
                        <Icon className="h-3.5 w-3.5 text-[var(--admin-primary)]" />
                      </span>
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <Link
              href="/admin/notifications"
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <BellRing className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>

            {/* Dark mode */}
            <button
              type="button"
              onClick={toggleDark}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              aria-label={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                aria-expanded={profileOpen}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[var(--admin-primary)] to-blue-700 text-[10px] font-black text-white">
                  A
                </span>
                <span className="hidden text-[12px] font-bold text-slate-800 dark:text-slate-200 sm:block">Admin</span>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-xl ring-1 ring-slate-900/5 z-50">
                  <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 mb-1">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-primary)] to-blue-700 text-sm font-black text-white">
                      AD
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-900 dark:text-white">Administrateur</p>
                      <p className="truncate text-[10px] text-slate-500">contact@cjdevelopmenttc.org</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 mx-1 mb-1.5">
                    <ShieldIcon className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Session sécurisée · JWT</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 space-y-0.5">
                    <Link
                      href="/admin/settings"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings2 className="h-3.5 w-3.5 text-slate-400" />
                      Paramètres
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile burger */}
            <button
              type="button"
              onClick={() => setMobileOpen(v => !v)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="relative mx-auto w-full max-w-screen-2xl flex-1 px-3 py-5 sm:px-4 sm:py-6 md:px-6 xl:px-8 xl:py-8">
        {children}
      </main>

      {/* ── MOBILE MENU OVERLAY ────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-14 z-50 max-h-[calc(100svh-56px)] overflow-y-auto bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl md:hidden">
            {/* Search */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <AdminGlobalSearch />
            </div>

            {/* Nav links */}
            <div className="p-3 space-y-0.5">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Navigation</p>
              {navItems.map(({ href, label, caption, icon: Icon }) => {
                const active = isActive(pathname, href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      'flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors',
                      active
                        ? 'bg-[var(--admin-primary)] text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-[13px] font-semibold">{label}</span>
                    </span>
                    <span className={`text-[11px] ${active ? 'text-white/70' : 'text-slate-400'}`}>{caption}</span>
                  </Link>
                )
              })}
            </div>

            {/* Quick actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Créer rapidement</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-[12px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-[var(--admin-primary)] shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 transition-colors disabled:opacity-50 mt-1"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
