'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import AdminGlobalSearch from '@/components/admin-portal/AdminGlobalSearch'
import {
  BellRing,
  BookOpenCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileStack,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Plus,
  Search,
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

// Ordre métier : Pilotage → Sessions → Étudiants → Inscriptions → Travaux → Certificats → Notifications → Actualités → Paramètres
const navItems: NavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Pilotage',
    caption: 'KPI, alertes et priorités',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/sessions',
    label: 'Sessions',
    caption: 'Calendrier et cohortes',
    icon: CalendarDays,
  },
  {
    href: '/admin/students',
    label: 'Étudiants',
    caption: 'Comptes et accès',
    icon: Users2,
  },
  {
    href: '/admin/enrollments',
    label: 'Inscriptions',
    caption: 'Suivi et consultation',
    icon: FileStack,
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
    caption: 'Délivrance et vérification',
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
    label: 'Actualités',
    caption: 'Contenus et annonces',
    icon: Newspaper,
  },
  {
    href: '/admin/settings',
    label: 'Paramètres',
    caption: 'Sécurité et configuration',
    icon: Settings2,
  },
]

const quickActions = [
  { href: '/admin/sessions/new', label: 'Nouvelle session', icon: Plus },
  { href: '/admin/articles/new', label: 'Nouvel article', icon: Plus },
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
      title={collapsed ? `${item.label} — ${item.caption}` : undefined}
      className={[
        'group relative flex items-center gap-3 overflow-hidden rounded-[22px] border px-3 py-3 transition duration-200',
        active
          ? 'border-[var(--admin-primary-200)] bg-[linear-gradient(135deg,rgba(0,48,160,0.12),rgba(255,255,255,0.98))] text-slate-950 shadow-[0_18px_45px_-34px_rgba(0,48,160,0.5)]'
          : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950',
      ].join(' ')}
    >
      {/* Indicateur actif */}
      {active ? (
        <span
          className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[var(--admin-accent)]"
          aria-hidden="true"
        />
      ) : null}

      <span
        className={[
          'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 transition',
          active
            ? 'bg-[var(--admin-primary)] text-white ring-[var(--admin-primary-200)]'
            : 'bg-slate-100 text-slate-600 ring-slate-200 group-hover:bg-white group-hover:text-[var(--admin-primary)]',
        ].join(' ')}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className={collapsed ? 'hidden' : 'min-w-0'}>
        <p className="truncate text-sm font-semibold text-current">{item.label}</p>
        <p className="truncate text-xs text-slate-500">{item.caption}</p>
      </div>
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
    if (storedValue === 'true') setCollapsed(true)
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
      return { href: '/admin/search', label: 'Recherche', caption: 'Navigation globale', icon: Search }
    }
    return navItems[0]
  }, [pathname])

  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date()),
    [],
  )

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

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/dashboard"
          className="flex min-w-0 items-center gap-3"
          aria-label="Tableau de bord — CJ Development"
        >
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_45px_-35px_rgba(0,48,160,0.45)]">
            <img src="/logo.png" alt="CJ DTC" className="h-12 w-12 object-contain" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Administration
              </p>
              <p className="truncate text-lg font-bold tracking-tight text-slate-950">CJ Development</p>
              <p className="truncate text-xs text-slate-500">Pilotage · Opérations · Contenus</p>
            </div>
          ) : null}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="hidden shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-950 lg:inline-flex"
          aria-label={collapsed ? 'Étendre la barre latérale' : 'Réduire la barre latérale'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Statut accès sécurisé */}
      <div className="mt-6 rounded-[26px] border border-[var(--admin-primary-200)] bg-[linear-gradient(135deg,rgba(0,48,160,0.08),rgba(255,255,255,0.96))] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-primary)] text-white shadow-md shadow-blue-900/20">
            <Shield className="h-4 w-4" />
          </span>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[var(--admin-primary-800)]">
                Accès administrateur sécurisé
              </p>
              <p className="mt-0.5 truncate text-[11px] text-slate-500">Session active · JWT</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="mt-5 flex-1 space-y-1.5 overflow-y-auto" aria-label="Navigation principale">
        {navItems.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActivePath(pathname, item.href)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="mt-4 rounded-[24px] border border-slate-200 bg-white px-3 py-3">
        {!collapsed ? (
          <p className="mb-3 px-1 text-xs leading-5 text-slate-500">
            Déconnectez-vous pour sécuriser votre session lorsque vous quittez le poste de travail.
          </p>
        ) : null}
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[20px] border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-accent-700)] transition hover:bg-[var(--admin-accent-100)] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Se déconnecter de l'administration"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed ? (loggingOut ? 'Déconnexion…' : 'Se déconnecter') : null}
        </button>
      </div>
    </>
  )

  return (
    <div className="admin-theme relative min-h-screen overflow-hidden text-slate-950">
      {/* Fond décoratif */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,48,160,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(227,6,19,0.12),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_38%,#f7f9fc_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div
        className="relative min-h-screen lg:grid"
        style={{ gridTemplateColumns: collapsed ? '5.5rem minmax(0,1fr)' : '18rem minmax(0,1fr)' }}
      >
        {/* Sidebar desktop */}
        <aside className="hidden border-r border-white/70 bg-white/85 px-4 py-5 shadow-[24px_0_64px_-52px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:flex lg:h-screen lg:flex-col lg:sticky lg:top-0">
          <SidebarContent />
        </aside>

        {/* Zone principale */}
        <div className="relative min-w-0">
          {/* Header sticky */}
          <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-3 md:px-6 xl:px-8">
              {/* Burger mobile */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-950 lg:hidden"
                aria-label="Ouvrir la navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                  {currentDate}
                </p>
                <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950">
                  {currentItem.label}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    — {currentItem.caption}
                  </span>
                </h1>
              </div>

              {/* Recherche globale (xl) */}
              <div className="hidden min-w-[260px] flex-1 items-center justify-end xl:flex">
                <AdminGlobalSearch />
              </div>

              {/* Actions rapides */}
              <div className="hidden items-center gap-2 md:flex">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--admin-primary-200)] hover:bg-[var(--admin-primary-50)] hover:text-[var(--admin-primary)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          <main className="relative px-4 py-6 md:px-6 xl:px-8 xl:py-8">{children}</main>
        </div>
      </div>

      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-40 transition lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div
          className={`absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-80 flex-col border-r border-white/70 bg-white px-4 py-5 shadow-[24px_0_64px_-52px_rgba(15,23,42,0.4)] transition duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Navigation</p>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
              aria-label="Fermer la navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </aside>
      </div>
    </div>
  )
}
