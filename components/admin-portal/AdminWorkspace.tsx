'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import AdminGlobalSearch from '@/components/admin-portal/AdminGlobalSearch'
import {
  BellRing,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Search,
  FileStack,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Newspaper,
  Settings2,
  Shield,
  Users2,
  X,
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
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    caption: 'Vue globale',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/reports',
    label: 'Reporting',
    caption: 'KPIs et alertes',
    icon: BarChart3,
  },
  {
    href: '/admin/sessions',
    label: 'Sessions',
    caption: 'Calendrier et cohortes',
    icon: CalendarDays,
  },
  {
    href: '/admin/students',
    label: 'Etudiants',
    caption: 'Comptes et acces',
    icon: Users2,
  },
  {
    href: '/admin/enrollments',
    label: 'Inscriptions',
    caption: 'Demandes et validations',
    icon: FileStack,
  },
  {
    href: '/admin/payments',
    label: 'Paiements',
    caption: 'Transactions et suivis',
    icon: CreditCard,
  },
  {
    href: '/admin/submissions',
    label: 'Travaux',
    caption: 'Livrables et corrections',
    icon: FolderKanban,
  },
  {
    href: '/admin/certificates',
    label: 'Certificats',
    caption: 'Delivrance et preuves',
    icon: GraduationCap,
  },
  {
    href: '/admin/notifications',
    label: 'Notifications',
    caption: 'Messages et relances',
    icon: BellRing,
  },
  {
    href: '/admin/articles',
    label: 'Actualites',
    caption: 'Contenus et annonces',
    icon: Newspaper,
  },
  {
    href: '/admin/settings',
    label: 'Parametres',
    caption: 'Securite et configuration',
    icon: Settings2,
  },
]

const quickActions = [
  { href: '/admin/sessions/new', label: 'Nouvelle session' },
  { href: '/admin/articles/new', label: 'Nouvel article' },
  { href: '/admin/settings', label: 'Reglages' },
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(`${href}/`))
}

function SidebarLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={[
        'group relative flex items-center gap-3 overflow-hidden rounded-[22px] border px-3 py-3 transition duration-200',
        active
          ? 'border-[var(--admin-primary-200)] bg-[linear-gradient(135deg,rgba(0,48,160,0.12),rgba(255,255,255,0.98))] text-slate-950 shadow-[0_18px_45px_-34px_rgba(0,48,160,0.5)]'
          : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950',
      ].join(' ')}
    >
      <span
        className={[
          'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 transition',
          active
            ? 'bg-[var(--admin-primary)] text-white ring-[var(--admin-primary-200)]'
            : 'bg-slate-100 text-slate-700 ring-slate-200 group-hover:bg-white',
        ].join(' ')}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className={collapsed ? 'hidden' : 'min-w-0'}>
        <p className="truncate text-sm font-semibold text-current">{item.label}</p>
        <p className="truncate text-xs text-slate-500">{item.caption}</p>
      </div>

      {active ? (
        <span className="absolute inset-y-3 left-0 w-1 rounded-full bg-[var(--admin-accent)]" aria-hidden="true" />
      ) : null}
    </Link>
  )
}

export default function AdminWorkspace({ children }: AdminWorkspaceProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const storedValue = window.localStorage.getItem('cj-admin-sidebar-collapsed')
    if (storedValue === 'true') {
      setCollapsed(true)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('cj-admin-sidebar-collapsed', String(collapsed))
  }, [collapsed])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const currentItem = useMemo(() => {
    const matched = navItems.find((item) => isActivePath(pathname, item.href))
    if (matched) return matched
    if (pathname.startsWith('/admin/search')) {
      return {
        href: '/admin/search',
        label: 'Recherche',
        caption: 'Navigation globale',
        icon: Search,
      }
    }
    return navItems[0]
  }, [pathname])

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date())
  }, [])

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

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
    <div className="admin-theme relative min-h-screen overflow-hidden text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,48,160,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(227,6,19,0.12),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_38%,#f7f9fc_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div
        className="relative min-h-screen lg:grid"
        style={{ gridTemplateColumns: collapsed ? '6.5rem minmax(0,1fr)' : '18.5rem minmax(0,1fr)' }}
      >
        <aside className="hidden border-r border-white/70 bg-white/82 px-4 py-5 shadow-[24px_0_64px_-52px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:flex lg:h-screen lg:flex-col">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3" aria-label="Accueil admin">
              <div className="grid h-16 w-16 place-items-center rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_45px_-35px_rgba(0,48,160,0.45)]">
                <img src="/logo.png" alt="CJ DTC" className="h-12 w-12 object-contain" />
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Panneau admin</p>
                  <p className="truncate text-lg font-bold tracking-tight text-slate-950">CJ DTC</p>
                  <p className="truncate text-xs text-slate-500">Operations, paiements, contenus</p>
                </div>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
              aria-label={collapsed ? 'Etendre la sidebar' : 'Reduire la sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(0,48,160,0.09),rgba(255,255,255,0.98))] px-4 py-4 shadow-[0_24px_55px_-48px_rgba(0,48,160,0.5)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--admin-primary)] text-white shadow-lg shadow-blue-900/20">
                <Shield className="h-4 w-4" />
              </span>
              {!collapsed ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Etat</p>
                  <p className="text-sm font-semibold text-slate-950">Acces admin securise</p>
                </div>
              ) : null}
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-2" aria-label="Navigation admin principale">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={isActivePath(pathname, item.href)}
                collapsed={collapsed}
              />
            ))}
          </nav>

          <div className="mt-6 rounded-[26px] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
            {!collapsed ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Acces rapide</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Navigation laterale, raccourcis et deconnexion centralises pour les operations du quotidien.
                </p>
              </>
            ) : null}
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-3 text-sm font-semibold text-[var(--admin-accent-700)] transition hover:bg-[var(--admin-accent-100)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? 'Deconnexion...' : 'Se deconnecter'}
            </button>
          </div>
        </aside>

        <div className="relative min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/70 bg-white/74 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-4 md:px-6 xl:px-8">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950 lg:hidden"
                aria-label="Ouvrir la navigation admin"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">{currentDate}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-950">{currentItem.label}</h1>
                </div>
              </div>

              <div className="hidden min-w-[280px] flex-1 items-center justify-end xl:flex">
                <AdminGlobalSearch />
              </div>

              <div className="hidden items-center gap-2 md:flex">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--admin-primary-200)] hover:bg-[var(--admin-primary-50)] hover:text-[var(--admin-primary)]"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          <main className="relative px-4 py-6 md:px-6 xl:px-8 xl:py-8">{children}</main>
        </div>
      </div>

      <div className={`fixed inset-0 z-40 transition lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[86vw] max-w-[320px] border-r border-white/70 bg-white px-4 py-5 shadow-[28px_0_80px_-45px_rgba(15,23,42,0.4)] transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-3" aria-label="Accueil admin">
              <div className="grid h-16 w-16 place-items-center rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_45px_-35px_rgba(0,48,160,0.45)]">
                <img src="/logo.png" alt="CJ DTC" className="h-12 w-12 object-contain" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">Panneau admin</p>
                <p className="text-lg font-bold tracking-tight text-slate-950">CJ DTC</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
              aria-label="Fermer la navigation admin"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="mt-8 space-y-2" aria-label="Navigation admin mobile">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={isActivePath(pathname, item.href)}
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-8 rounded-[26px] border border-slate-200 bg-slate-50 px-4 py-4">
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-3 text-sm font-semibold text-[var(--admin-accent-700)]"
            >
              {loggingOut ? 'Deconnexion...' : 'Se deconnecter'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}






