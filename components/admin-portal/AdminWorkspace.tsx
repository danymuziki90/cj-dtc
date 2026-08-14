'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import AdminGlobalSearch from '@/components/admin-portal/AdminGlobalSearch'
import {
  BellRing,
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  FileStack,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  PlusIcon,
  Settings2,
  ShieldIcon,
  Users,
  XIcon,
  Building2,
  Mail,
  HelpCircle,
  Sun,
  Moon,
  ClipboardList,
  TrendingUp,
  FileText,
  Star,
  Image,
  Briefcase,
} from 'lucide-react'

type AdminWorkspaceProps = {
  children: React.ReactNode
}

type NavItem = {
  href: string
  label: string
  caption: string
  icon: LucideIcon
}

const navRow1: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', caption: 'Vue synthétique & KPI', icon: LayoutDashboard },
  { href: '/admin/sessions', label: 'Sessions', caption: 'Planification et cohortes', icon: CalendarDays },
  { href: '/admin/travaux', label: 'Travaux', caption: 'Devoirs & remises', icon: BookOpenCheck },
  { href: '/admin/students', label: 'Étudiants', caption: 'Comptes et accès', icon: Users },
  { href: '/admin/enrollments', label: 'Inscriptions', caption: 'Suivi et demandes', icon: FileStack },
]

const navRow2: NavItem[] = [
  { href: '/admin/documents', label: 'Supports pédagogiques', caption: 'Ressources de formation', icon: FileText },
  { href: '/admin/certificates', label: 'Certificats', caption: 'Délivrance et vérification', icon: GraduationCap },
  { href: '/admin/evaluations', label: 'Témoignages', caption: 'Retours et avis', icon: Star },
  { href: '/admin/articles', label: 'Actualités', caption: 'Contenus et annonces', icon: Newspaper },
  { href: '/admin/emplois', label: "Offres d'emploi", caption: 'Recrutement & carrières', icon: Briefcase },
  { href: '/admin/b2b', label: 'Entreprises', caption: 'Demandes B2B & intra', icon: Building2 },
  { href: '/admin/heroes', label: 'Apparence', caption: 'Bannières & Images', icon: Image },
  { href: '/admin/settings', label: 'Paramètres', caption: 'Configuration & sécurité', icon: Settings2 },
]

const navItems = [...navRow1, ...navRow2]

const quickActions = [
  { href: '/admin/articles/new', label: 'Article', icon: Newspaper },
  { href: '/admin/emplois', label: "Offre d'emploi", icon: Briefcase },
  { href: '/admin/enrollments', label: 'Inscriptions', icon: FileStack },
]



function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(`${href}/`))
}

export default function AdminWorkspace({ children }: AdminWorkspaceProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)

  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date()),
    [],
  )

  // Initialise dark mode from localStorage
  useEffect(() => {
    const isDark = window.localStorage.getItem('cj-admin-dark-mode') === 'true'
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  // Close all menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [pathname])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch unread notifications count in background
  useEffect(() => {
    if (pathname === '/admin/login') return
    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/admin/dashboard/kpi')
        if (res.ok) {
          const data = await res.json()
          setUnreadNotifications(data.totals?.notificationsTotal || 0)
        }
      } catch {}
    }
    fetchUnreadCount()
    const timer = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(timer)
  }, [pathname])

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    window.localStorage.setItem('cj-admin-dark-mode', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  // Login page â€” render minimal background only
  if (pathname === '/admin/login') {
    return (
      <div className="admin-theme relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,48,160,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(227,6,19,0.12),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative">{children}</div>
      </div>
    )
  }

  return (
    <div className="admin-theme relative flex min-h-screen flex-col text-slate-950">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,48,160,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(227,6,19,0.06),transparent_38%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_38%,#f7f9fc_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* ── HEADER PRINCIPAL ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-3 px-4 md:px-6">

          {/* Logo */}
          <Link href="/admin/dashboard" className="flex shrink-0 items-center gap-3 mr-2 group" aria-label="Accueil administration">
            <img
              src="/logo.png"
              alt="CJ Development Training Center"
              className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <p className="text-sm font-black tracking-tight text-slate-900 leading-tight">CJ Development</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-primary)]">Administration</p>
            </div>
          </Link>

          {/* Separator */}
          <div className="hidden h-6 w-px bg-slate-200 md:block" />

          {/* Search bar */}
          <div className="hidden max-w-xs flex-1 md:block lg:max-w-sm">
            <AdminGlobalSearch />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Quick action buttons */}
          <div className="hidden items-center gap-1.5 lg:flex">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[var(--admin-primary-200)] hover:bg-blue-50 hover:text-[var(--admin-primary)]"
                >
                  <PlusIcon className="h-3 w-3 text-[var(--admin-primary)]" />
                  {action.label}
                </Link>
              )
            })}
          </div>

          {/* Notifications badge */}
          <Link
            href="/admin/notifications"
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[var(--admin-primary)]"
            aria-label="Notifications"
          >
            <BellRing className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--admin-accent)] px-1 text-[9px] font-bold text-white shadow">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </Link>

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[var(--admin-primary)]"
            aria-label={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
              aria-expanded={profileOpen}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-primary-700)] text-[10px] font-black text-white shadow-sm">
                A
              </span>
              <span className="hidden text-xs font-bold text-slate-800 sm:block">Admin</span>
              <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-slate-900/5 animate-fade-in-up">
                <div className="border-b border-slate-100 px-2 pb-2 pt-1">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-primary-700)] text-xs font-black text-white shadow">
                      AD
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-950">Administrateur</p>
                      <p className="truncate text-[10px] text-slate-500">contact@cjdevelopmenttc.org</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1">
                    <ShieldIcon className="h-3 w-3 text-emerald-600" />
                    <span className="text-[10px] font-semibold text-emerald-700">Session sécurisée · JWT</span>
                  </div>
                </div>
                <div className="mt-1 space-y-0.5 px-1">
                  <Link
                    href="/admin/settings"
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-750 transition hover:bg-slate-50"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    Paramètres
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-rose-650 transition hover:bg-rose-50 disabled:opacity-50"
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
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── Navigation Horizontale Adaptative Sur Deux Lignes ────────────────────────── */}
      <nav
        className="sticky top-16 z-30 hidden border-b border-slate-200/80 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl md:block"
        aria-label="Navigation principale"
      >
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-2 space-y-1.5">
          {/* Ligne 1 : Opérations & Pilotage */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex flex-1 flex-wrap items-center gap-1 sm:gap-1.5">
              {navRow1.map((item) => {
                const active = isActivePath(pathname, item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'group relative flex min-h-[34px] items-center gap-1.5 rounded-full px-3.5 py-1 text-xs lg:text-[12.5px] font-bold transition-all duration-200 whitespace-nowrap',
                      active
                        ? 'bg-[var(--admin-primary)] text-white shadow-sm shadow-blue-900/20'
                        : 'text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 hover:text-[var(--admin-primary)] hover:-translate-y-0.5',
                    ].join(' ')}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Date courante à droite de la 1ère ligne */}
            <div className="ml-auto shrink-0 hidden border-l border-slate-200 pl-3 xl:block">
              <p className="text-[11px] font-semibold capitalize text-slate-500">{currentDate}</p>
            </div>
          </div>

          {/* Ligne 2 : Ressources & Management */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-1.5">
            <div className="flex flex-1 flex-wrap items-center gap-1 sm:gap-1.5">
              {navRow2.map((item) => {
                const active = isActivePath(pathname, item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'group relative flex min-h-[34px] items-center gap-1.5 rounded-full px-3.5 py-1 text-xs lg:text-[12.5px] font-bold transition-all duration-200 whitespace-nowrap',
                      active
                        ? 'bg-[var(--admin-primary)] text-white shadow-sm shadow-blue-900/20'
                        : 'text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 hover:text-[var(--admin-primary)] hover:-translate-y-0.5',
                    ].join(' ')}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="relative mx-auto w-full max-w-screen-2xl flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:px-8 xl:py-8">
        {children}
      </main>

      {/* ── MOBILE OVERLAY MENU (DRAWER) ─────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[calc(100vw-2rem)] overflow-y-auto border-r border-slate-200 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl shadow-2xl md:hidden animate-fade-in-right flex flex-col">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between md:hidden">
                <span className="text-[14px] font-black tracking-tight text-[var(--admin-primary)]">Admin Menu</span>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              {/* Recherche globale sur Mobile */}
              <div className="md:hidden">
                <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Recherche rapide</p>
                <AdminGlobalSearch />
              </div>

              <div>
                <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Opérations & Pilotage
                </p>
                <div className="space-y-1">
                  {navRow1.map((item) => {
                    const active = isActivePath(pathname, item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={[
                          'flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition active:scale-[0.99]',
                          active
                            ? 'bg-[var(--admin-primary-50)] text-[var(--admin-primary)] border border-[var(--admin-primary-100)] dark:bg-blue-950/60 dark:text-blue-300'
                            : 'text-slate-750 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                        ].join(' ')}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" />
                          {item.label}
                        </span>
                        <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">{item.caption}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Ressources & Management
                </p>
                <div className="space-y-1">
                  {navRow2.map((item) => {
                    const active = isActivePath(pathname, item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={[
                          'flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition active:scale-[0.99]',
                          active
                            ? 'bg-[var(--admin-primary-50)] text-[var(--admin-primary)] border border-[var(--admin-primary-100)] dark:bg-blue-950/60 dark:text-blue-300'
                            : 'text-slate-750 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                        ].join(' ')}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" />
                          {item.label}
                        </span>
                        <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">{item.caption}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-2">
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions rapides</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 px-3 py-2.5 text-xs font-bold text-slate-750 dark:text-slate-200 transition hover:bg-white active:scale-[0.98]"
                    >
                      <PlusIcon className="h-4 w-4 text-[var(--admin-primary)]" />
                      {action.label}
                    </Link>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-3 text-sm font-bold text-[var(--admin-accent-700)] transition active:scale-[0.98] disabled:opacity-50"
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

