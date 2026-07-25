'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import AdminGlobalSearch from '@/components/admin-portal/AdminGlobalSearch'
import {
  Award,
  BellRing,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  FileStack,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Newspaper,
  PlusIcon,
  Settings2,
  ShieldCheck,
  Star,
  Sun,
  TrendingUp,
  UserCheck,
  Users,
  XIcon,
  Sparkles,
} from 'lucide-react'

type AdminWorkspaceProps = {
  children: React.ReactNode
}

type NavItem = {
  href: string
  label: string
  caption: string
  icon: LucideIcon
  badge?: string
}

type NavCategory = {
  key: string
  label: string
  icon: LucideIcon
  items: NavItem[]
}

// ─── Direct Primary Navigation Items (Top level bar) ─────────────────────────

const primaryNavItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', caption: 'Vue synthétique & KPI', icon: LayoutDashboard },
  { href: '/admin/enrollments', label: 'Inscriptions', caption: 'Suivi et demandes', icon: FileStack },
  { href: '/admin/sessions', label: 'Sessions', caption: 'Planification et cohortes', icon: CalendarDays },
  { href: '/admin/formations', label: 'Formations', caption: 'Catalogue & programmes', icon: GraduationCap },
  { href: '/admin/students', label: 'Étudiants', caption: 'Comptes et accès', icon: Users },
  { href: '/admin/travaux', label: 'Travaux', caption: 'Devoirs & TP', icon: BookOpenCheck },
]

// ─── Categorized Full Navigation Structure ────────────────────────────────────

const navCategories: NavCategory[] = [
  {
    key: 'pedagogie',
    label: 'Pédagogie & Cohortes',
    icon: GraduationCap,
    items: [
      { href: '/admin/sessions', label: 'Sessions & Cohortes', caption: 'Calendrier et planification', icon: CalendarDays },
      { href: '/admin/formations', label: 'Formations', caption: 'Catalogue et programmes', icon: GraduationCap },
      { href: '/admin/students', label: 'Étudiants', caption: 'Comptes, accès et statuts', icon: Users },
      { href: '/admin/travaux', label: 'Travaux & Devoirs', caption: 'Exercices et remises de TP', icon: BookOpenCheck },
      { href: '/admin/documents', label: 'Supports pédagogiques', caption: 'Ressources et documents PDF', icon: FileText },
    ],
  },
  {
    key: 'qualite',
    label: 'Qualité & Preuves',
    icon: Award,
    items: [
      { href: '/admin/certificates', label: 'Certificats', caption: 'Délivrance et vérification', icon: ShieldCheck },
      { href: '/admin/evaluations', label: 'Évaluations & Avis', caption: 'Retours formation et témoignages', icon: Star },
      { href: '/admin/instructors', label: 'Formateurs', caption: 'Intervenants et experts', icon: UserCheck },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing, Com & B2B',
    icon: Newspaper,
    items: [
      { href: '/admin/articles', label: 'Actualités & Blog', caption: 'Articles et annonces publiées', icon: Newspaper },
      { href: '/admin/b2b', label: 'Demandes Entreprises', caption: 'Formations B2B et intra', icon: Building2 },
      { href: '/admin/contacts', label: 'Messages Contact', caption: 'Demandes d\'informations visiteurs', icon: Mail },
      { href: '/admin/analytics', label: 'Analytics & KPIs', caption: 'Performances et statistiques', icon: TrendingUp },
    ],
  },
  {
    key: 'systeme',
    label: 'Système',
    icon: Settings2,
    items: [
      { href: '/admin/notifications', label: 'Notifications', caption: 'Centre de messages et relances', icon: BellRing },
      { href: '/admin/settings', label: 'Paramètres Admin', caption: 'Configuration et sécurité', icon: Settings2 },
    ],
  },
]

const quickActions = [
  { href: '/admin/articles/new', label: '+ Article', icon: Newspaper },
  { href: '/admin/sessions/new', label: '+ Session', icon: CalendarDays },
  { href: '/admin/enrollments', label: 'Inscriptions', icon: FileStack },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/admin/dashboard') return pathname === '/admin/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AdminWorkspace({ children }: AdminWorkspaceProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeCategoryMenu, setActiveCategoryMenu] = useState<string | null>(null)

  const profileRef = useRef<HTMLDivElement>(null)
  const categoryMenuRef = useRef<HTMLDivElement>(null)

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

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
    setActiveCategoryMenu(null)
  }, [pathname])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setActiveCategoryMenu(null)
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

  // Login page — render minimal background only
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,48,160,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(227,6,19,0.06),transparent_38%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_38%,#f7f9fc_100%)] dark:bg-none dark:bg-slate-950" />
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* ── HEADER PRINCIPAL ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/92 dark:bg-slate-900/95 dark:border-slate-800 backdrop-blur-xl shadow-sm transition-colors">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-4 md:px-6">

          {/* Logo */}
          <Link href="/admin/dashboard" className="flex shrink-0 items-center gap-2.5 mr-2 group">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-800 transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="CJ DTC" className="h-6 w-6 object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black tracking-tight text-slate-950 dark:text-white leading-none">CJ Development</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Administration</p>
            </div>
          </Link>

          {/* Separator */}
          <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 md:block" />

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
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[var(--admin-primary-200)] hover:bg-[var(--admin-primary-50)] hover:text-[var(--admin-primary)] dark:hover:bg-slate-700"
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
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition hover:border-[var(--admin-primary-200)] hover:text-[var(--admin-primary)]"
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
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition hover:border-slate-300"
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
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 px-2.5 py-1.5 shadow-sm transition hover:border-slate-300"
              aria-expanded={profileOpen}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-primary-700)] text-[10px] font-black text-white shadow-sm">
                A
              </span>
              <span className="hidden text-xs font-bold text-slate-900 dark:text-slate-100 sm:block">Admin</span>
              <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-2 shadow-2xl ring-1 ring-slate-900/5 animate-fade-in-up z-50">
                <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-primary-700)] text-xs font-black text-white shadow">
                      AD
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-950 dark:text-white">Administrateur</p>
                      <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">contact@cjdevelopmenttc.org</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Session sécurisée · Admin</span>
                  </div>
                </div>
                <div className="mt-1 space-y-0.5 px-1">
                  <Link
                    href="/admin/settings"
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-750 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Settings2 className="h-3.5 w-3.5 text-slate-500" />
                    Paramètres Admin
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-rose-650 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/50 disabled:opacity-50"
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
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-750 dark:text-slate-200 shadow-sm md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── NAVIGATION STRATÉGIQUE DESKTOP ──────────────────────────────────── */}
      <nav
        className="sticky top-14 z-30 border-b border-slate-200/70 bg-white/92 backdrop-blur-xl hidden md:block dark:bg-slate-900/95 dark:border-slate-800 shadow-sm"
        aria-label="Navigation principale"
        ref={categoryMenuRef}
      >
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-1.5 flex items-center justify-between gap-3">

          {/* Liens principaux d'accès direct */}
          <div className="flex flex-wrap items-center gap-1">
            {primaryNavItems.map((item) => {
              const active = isActivePath(pathname, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'group relative flex min-h-[36px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs lg:text-[13px] font-semibold transition-all duration-200 whitespace-nowrap',
                    active
                      ? 'bg-[var(--admin-primary-50)] text-[var(--admin-primary)] shadow-sm ring-1 ring-[var(--admin-primary-200)]/60 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                  ].join(' ')}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--admin-primary)] transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-[var(--admin-primary)] shadow" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Dropdowns par catégories fonctionnelles (Accès complet à 100% des modules) */}
          <div className="flex items-center gap-1">
            {navCategories.map((cat) => {
              const CategoryIcon = cat.icon
              const isOpen = activeCategoryMenu === cat.key
              const hasActiveChild = cat.items.some((item) => isActivePath(pathname, item.href))

              return (
                <div key={cat.key} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveCategoryMenu(isOpen ? null : cat.key)}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all duration-200 whitespace-nowrap border',
                      hasActiveChild
                        ? 'border-[var(--admin-primary-200)] bg-[var(--admin-primary-50)] text-[var(--admin-primary)] shadow-sm dark:bg-blue-950/50 dark:text-blue-300'
                        : 'border-transparent text-slate-650 hover:border-slate-200 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                    ].join(' ')}
                  >
                    <CategoryIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span>{cat.label}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-2 shadow-2xl ring-1 ring-slate-900/5 animate-fade-in-up z-50">
                      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          {cat.label}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {cat.items.map((subItem) => {
                          const SubIcon = subItem.icon
                          const subActive = isActivePath(pathname, subItem.href)
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setActiveCategoryMenu(null)}
                              className={[
                                'flex items-start gap-3 rounded-xl p-2 text-xs transition',
                                subActive
                                  ? 'bg-[var(--admin-primary-50)] text-[var(--admin-primary)] font-bold dark:bg-blue-950/60 dark:text-blue-300'
                                  : 'text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800',
                              ].join(' ')}
                            >
                              <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--admin-primary)]">
                                <SubIcon className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <p className="font-bold leading-tight">{subItem.label}</p>
                                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{subItem.caption}</p>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Date courante à droite */}
          <div className="hidden xl:block pl-3 border-l border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-semibold capitalize text-slate-500 dark:text-slate-400">{currentDate}</p>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="relative mx-auto w-full max-w-screen-2xl flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:px-8 xl:py-8">
        {children}
      </main>

      {/* ── MOBILE OVERLAY DRAWER ─────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-14 z-50 max-h-[calc(100svh-56px)] overflow-y-auto border-b border-slate-200 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl shadow-2xl md:hidden animate-fade-in-up">
            <div className="p-4 space-y-5">
              {/* Recherche globale sur Mobile */}
              <div>
                <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Recherche rapide</p>
                <AdminGlobalSearch />
              </div>

              {/* Accès rapide principal */}
              <div>
                <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Accès Principal
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {primaryNavItems.map((item) => {
                    const active = isActivePath(pathname, item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={[
                          'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition active:scale-[0.98]',
                          active
                            ? 'bg-[var(--admin-primary-50)] text-[var(--admin-primary)] border border-[var(--admin-primary-200)] dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-slate-50 border border-slate-200/80 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200',
                        ].join(' ')}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Catégories structurées */}
              {navCategories.map((cat) => (
                <div key={cat.key} className="space-y-1">
                  <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {cat.label}
                  </p>
                  <div className="space-y-1">
                    {cat.items.map((item) => {
                      const active = isActivePath(pathname, item.href)
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={[
                            'flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition active:scale-[0.99]',
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
              ))}

              {/* Actions & Déconnexion */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions rapides</p>
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
          </div>
        </>
      )}
    </div>
  )
}
