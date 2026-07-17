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
  FolderKanban,
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
  MessageSquare,
  HelpCircle,
  Sun,
  Moon,
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

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Pilotage', caption: 'KPI, alertes et priorités', icon: LayoutDashboard },
  { href: '/admin/formations', label: 'Formations', caption: 'Catalogue et programmes', icon: BookOpenCheck },
  { href: '/admin/sessions', label: 'Sessions', caption: 'Planification et cohortes', icon: CalendarDays },
  { href: '/admin/students', label: 'Étudiants', caption: 'Comptes et accès', icon: Users },
  { href: '/admin/enrollments', label: 'Inscriptions', caption: 'Suivi et consultation', icon: FileStack },
  { href: '/admin/submissions', label: 'Travaux', caption: 'Livrables et corrections', icon: FolderKanban },
  { href: '/admin/certificates', label: 'Certificats', caption: 'Délivrance et vérification', icon: GraduationCap },
  { href: '/admin/notifications', label: 'Notifications', caption: 'Messages et relances', icon: BellRing },
  { href: '/admin/articles', label: 'Actualités', caption: 'Contenus et annonces', icon: Newspaper },
  { href: '/admin/settings', label: 'Paramètres', caption: 'Sécurité et configuration', icon: Settings2 },
]

const quickActions = [
  { href: '/admin/articles/new', label: 'Article', icon: Newspaper },
]

const PRIMARY_ITEMS = 5 // items shown directly in the horizontal nav

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
  const [plusOpen, setPlusOpen] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const plusRef = useRef<HTMLDivElement>(null)

  const primaryNav = useMemo(() => navItems.slice(0, PRIMARY_ITEMS), [])
  const secondaryNav = useMemo(() => navItems.slice(PRIMARY_ITEMS), [])

  const secondaryActive = useMemo(
    () => secondaryNav.some((item) => isActivePath(pathname, item.href)),
    [pathname, secondaryNav],
  )

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
    setPlusOpen(false)
  }, [pathname])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setPlusOpen(false)
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

      {/* â”€â”€ HEADER PRINCIPAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-4 md:px-6">

          {/* Logo */}
          <Link href="/admin/dashboard" className="flex shrink-0 items-center gap-2.5 mr-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
              <img src="/logo.png" alt="CJ DTC" className="h-6 w-6 object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black tracking-tight text-slate-950 leading-none">CJ Development</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-450">Administration</p>
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
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[var(--admin-primary-200)] hover:bg-[var(--admin-primary-50)] hover:text-[var(--admin-primary)]"
                >
                  <PlusIcon className="h-3 w-3" />
                  {action.label}
                </Link>
              )
            })}
          </div>

          {/* Notifications badge */}
          <Link
            href="/admin/notifications"
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[var(--admin-primary-200)] hover:text-[var(--admin-primary)]"
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
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300"
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
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-slate-300"
              aria-expanded={profileOpen}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-primary-700)] text-[10px] font-black text-white shadow-sm">
                A
              </span>
              <span className="hidden text-xs font-bold text-slate-850 sm:block">Admin</span>
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
                      <p className="truncate text-[10px] text-slate-500">admin@cj-development.com</p>
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
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-750 shadow-sm md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* â”€â”€ NAVIGATION HORIZONTALE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <nav
        className="sticky top-14 z-30 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl hidden md:block"
        aria-label="Navigation principale"
      >
        <div className="mx-auto flex max-w-screen-2xl items-center px-4 md:px-6">
          <div className="flex items-center gap-0.5 overflow-x-auto py-1 scrollbar-none">
            {primaryNav.map((item) => {
              const active = isActivePath(pathname, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'group relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all whitespace-nowrap',
                    active
                      ? 'bg-[var(--admin-primary-50)] text-[var(--admin-primary)]'
                      : 'text-slate-650 hover:bg-slate-50 hover:text-slate-950',
                  ].join(' ')}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-[var(--admin-primary)]" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* "Plus" dropdown */}
          <div className="relative ml-2" ref={plusRef}>
            <button
              type="button"
              onClick={() => setPlusOpen((v) => !v)}
              className={[
                'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all',
                secondaryActive
                  ? 'bg-[var(--admin-primary-50)] text-[var(--admin-primary)]'
                  : 'text-slate-650 hover:bg-slate-50 hover:text-slate-950',
              ].join(' ')}
            >
              Plus
              <ChevronDown className={`h-3 w-3 transition-transform ${plusOpen ? 'rotate-180' : ''}`} />
            </button>

            {plusOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl ring-1 ring-slate-900/5 animate-fade-in-up z-50">
                {secondaryNav.map((item) => {
                  const active = isActivePath(pathname, item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setPlusOpen(false)}
                      className={[
                        'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition',
                        active
                          ? 'bg-[var(--admin-primary-50)] text-[var(--admin-primary)]'
                          : 'text-slate-750 hover:bg-slate-50 hover:text-slate-950',
                      ].join(' ')}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </span>
                      {item.label === 'Notifications' && unreadNotifications > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--admin-accent)] px-1 text-[9px] font-bold text-white">
                          {unreadNotifications}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Date courante */}
          <div className="ml-auto shrink-0 hidden xl:block">
            <p className="text-[11px] font-semibold capitalize text-slate-500">{currentDate}</p>
          </div>
        </div>
      </nav>

      {/* â”€â”€ MAIN CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <main className="relative mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6 md:px-6 xl:px-8 xl:py-8">
        {children}
      </main>

      {/* â”€â”€ MOBILE OVERLAY MENU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-14 z-50 max-h-[calc(100svh-56px)] overflow-y-auto border-b border-slate-200 bg-white shadow-2xl md:hidden animate-fade-in-up">
            <div className="p-4 space-y-1">
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Navigation</p>
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition',
                      active
                        ? 'bg-[var(--admin-primary-50)] text-[var(--admin-primary)] border border-[var(--admin-primary-100)]'
                        : 'text-slate-750 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {item.label === 'Notifications' && unreadNotifications > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--admin-accent)] px-1.5 text-[10px] font-bold text-white">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-slate-100 p-4 space-y-2">
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions rapides</p>
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-750 transition hover:bg-white"
                  >
                    <PlusIcon className="h-4 w-4 text-[var(--admin-primary)]" />
                    Créer : {action.label}
                  </Link>
                )
              })}
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 rounded-2xl border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-3 text-sm font-bold text-[var(--admin-accent-700)] transition disabled:opacity-50"
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

