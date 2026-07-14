import clsx from 'clsx'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, ArrowRight } from 'lucide-react'

// ─── Classe CSS partagées ───────────────────────────────────────────────────

export const adminInputClassName =
  'w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--admin-primary-200)] focus:ring-4 focus:ring-[var(--admin-primary-100)]'
export const adminSelectClassName = `${adminInputClassName} appearance-none`
export const adminTextareaClassName = `${adminInputClassName} min-h-[120px] resize-y`
export const adminPrimaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-[22px] bg-[var(--admin-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--admin-primary-700)] disabled:cursor-not-allowed disabled:opacity-60'
export const adminSecondaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--admin-primary-200)] hover:bg-[var(--admin-primary-50)] hover:text-[var(--admin-primary)] disabled:cursor-not-allowed disabled:opacity-60'
export const adminDangerButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-[22px] border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-3 text-sm font-semibold text-[var(--admin-accent-700)] transition hover:bg-[var(--admin-accent-100)] disabled:cursor-not-allowed disabled:opacity-60'

// ─── Tons visuels ────────────────────────────────────────────────────────────

const toneClasses = {
  primary:
    'border-[var(--admin-primary-200)] bg-gradient-to-br from-[var(--admin-primary-50)] to-white text-[var(--admin-primary-800)]',
  success: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-900',
  warning: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-900',
  danger:  'border-rose-200  bg-gradient-to-br from-rose-50  to-white text-rose-900',
  neutral: 'border-slate-200 bg-gradient-to-br from-slate-50  to-white text-slate-900',
} as const

type Tone = keyof typeof toneClasses

// ─── AdminPanel ──────────────────────────────────────────────────────────────

export function AdminPanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={clsx(
        'rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-[0_28px_80px_-58px_rgba(15,23,42,0.45)] backdrop-blur md:p-6',
        className,
      )}
    >
      {children}
    </section>
  )
}

// ─── AdminPanelHeader ────────────────────────────────────────────────────────

export function AdminPanelHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{title}</h3>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

// ─── AdminMetricCard ─────────────────────────────────────────────────────────
// Supporte un `urgentCount` pour afficher un badge d'alerte rouge quand il y a
// des éléments à traiter immédiatement.

export function AdminMetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = 'primary',
  urgentCount,
  href,
}: {
  icon: LucideIcon
  label: string
  value: string
  helper: string
  tone?: Tone
  /** Nombre d'éléments urgents — affiche un badge rouge si > 0 */
  urgentCount?: number
  /** Rend la carte cliquable vers une page */
  href?: string
}) {
  const isUrgent = typeof urgentCount === 'number' && urgentCount > 0

  const content = (
    <article
      className={clsx(
        'rounded-[28px] border p-5 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.35)] transition',
        toneClasses[tone],
        href && 'cursor-pointer hover:shadow-[0_28px_70px_-48px_rgba(15,23,42,0.45)]',
        isUrgent && tone === 'neutral' && 'border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-900',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="relative">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 ring-1 ring-black/5">
            <Icon className="h-5 w-5" />
          </span>
          {isUrgent ? (
            <span
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--admin-accent)] text-[10px] font-bold text-white ring-2 ring-white"
              aria-label={`${urgentCount} élément(s) urgent(s)`}
            >
              {urgentCount > 9 ? '9+' : urgentCount}
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600">{helper}</p>
    </article>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }
  return content
}

// ─── AdminBadge ──────────────────────────────────────────────────────────────

export function AdminBadge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  const badgeMap: Record<Tone, string> = {
    primary: 'border-[var(--admin-primary-200)] bg-[var(--admin-primary-50)] text-[var(--admin-primary)]',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200  bg-amber-50  text-amber-700',
    danger:  'border-rose-200   bg-rose-50   text-rose-700',
    neutral: 'border-slate-200  bg-slate-50  text-slate-700',
  }

  return (
    <span
      className={clsx(
        'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
        badgeMap[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─── AdminStatusDot ───────────────────────────────────────────────────────────
// Indicateur visuel circulaire pour un statut en ligne dans un tableau ou une liste.

export function AdminStatusDot({ tone = 'neutral' }: { tone?: Tone }) {
  const dotMap: Record<Tone, string> = {
    primary: 'bg-[var(--admin-primary)]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger:  'bg-rose-500',
    neutral: 'bg-slate-400',
  }
  return <span className={clsx('inline-block h-2 w-2 rounded-full', dotMap[tone])} aria-hidden="true" />
}

// ─── AdminAlertBanner ─────────────────────────────────────────────────────────
// Bandeau d'alerte contextuel pour signaler une anomalie dans n'importe quelle page.

export function AdminAlertBanner({
  title,
  message,
  tone = 'warning',
  actionLabel,
  actionHref,
  onDismiss,
}: {
  title: string
  message: string
  tone?: Extract<Tone, 'warning' | 'danger' | 'primary'>
  actionLabel?: string
  actionHref?: string
  onDismiss?: () => void
}) {
  const bannerMap = {
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger:  'border-rose-200  bg-rose-50  text-rose-900',
    primary: 'border-[var(--admin-primary-200)] bg-[var(--admin-primary-50)] text-[var(--admin-primary-800)]',
  }

  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-4 rounded-[24px] border px-5 py-4',
        bannerMap[tone],
      )}
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 opacity-90">{message}</p>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold underline-offset-2 hover:underline"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100"
          aria-label="Fermer l'alerte"
        >
          ✕
        </button>
      ) : null}
    </div>
  )
}

// ─── AdminActionRow ───────────────────────────────────────────────────────────
// Ligne d'action cliquable pour les listes de tâches prioritaires dans le dashboard.

export function AdminActionRow({
  title,
  meta,
  badge,
  badgeTone = 'warning',
  href,
  urgent = false,
}: {
  title: string
  meta?: string
  badge?: string | number
  badgeTone?: Tone
  href: string
  urgent?: boolean
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'group flex items-center justify-between gap-4 rounded-[22px] border px-4 py-4 transition',
        urgent
          ? 'border-amber-200 bg-amber-50/60 hover:border-amber-300 hover:bg-amber-50'
          : 'border-slate-200 bg-slate-50/60 hover:border-[var(--admin-primary-200)] hover:bg-white',
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        {meta ? <p className="mt-0.5 truncate text-xs text-slate-500">{meta}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {badge !== undefined ? (
          <AdminBadge tone={typeof badge === 'number' && badge > 0 ? badgeTone : 'neutral'}>
            {badge}
          </AdminBadge>
        ) : null}
        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[var(--admin-primary)]" />
      </div>
    </Link>
  )
}

// ─── AdminEmptyState ──────────────────────────────────────────────────────────

export function AdminEmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon?: LucideIcon
}) {
  return (
    <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center">
      {Icon ? (
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon className="h-6 w-6" />
        </span>
      ) : null}
      <p className={clsx('text-base font-semibold text-slate-900', Icon && 'mt-4')}>{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

// ─── HeroBanner ─────────────────────────────────────────────────────────────
export function HeroBanner({
  adminName = 'Administrateur',
  actionCount = 0,
  currentDateString,
  currentTimeString,
}: {
  adminName?: string
  actionCount?: number
  currentDateString: string
  currentTimeString: string
}) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-gradient-to-r from-[var(--admin-primary)] to-[var(--admin-primary-700)] p-6 md:p-8 text-white shadow-xl transition-all duration-300">
      {/* Decorative background shapes */}
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-0 left-1/3 -mb-12 h-32 w-32 rounded-full bg-[var(--admin-accent)]/20 blur-xl" />
      
      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-xl bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              🧑‍💻 Espace Admin
            </span>
            <span className="text-xs opacity-80 font-medium">
              {currentDateString} • {currentTimeString}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-black md:text-3xl text-white">
            Bonjour, {adminName} 👋
          </h2>
          <p className="mt-2 text-sm text-blue-100 max-w-xl">
            {actionCount > 0 
              ? `Vous avez ${actionCount} tâches prioritaires ou alertes en attente d'action aujourd'hui.` 
              : "Tout est sous contrôle ! Aucune alerte critique en attente aujourd'hui."}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/sessions"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-[var(--admin-primary)] shadow-lg shadow-blue-900/20 hover:bg-slate-50 transition"
          >
            📅 Créer une session
          </Link>
          <Link
            href="/admin/articles"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-accent)] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/20 hover:bg-[var(--admin-accent-700)] transition"
          >
            📢 Publier actualité
          </Link>
          <Link
            href="/admin/submissions"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/25 transition border border-white/10"
          >
            📋 Créer un travail
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── DashboardKpiCard ───────────────────────────────────────────────────────
export function DashboardKpiCard({
  icon: Icon,
  label,
  value,
  helper,
  trend,
  trendDirection = 'up',
  tone = 'primary',
  href,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  helper?: string
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  tone?: Tone
  href?: string
}) {
  const trendColors = {
    up: 'text-emerald-500 bg-emerald-500/10',
    down: 'text-rose-500 bg-rose-500/10',
    neutral: 'text-slate-400 bg-slate-400/10',
  }
  
  const content = (
    <article className={clsx(
      'group relative overflow-hidden rounded-[26px] border p-5 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5',
      toneClasses[tone],
    )}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3.5 text-3xl font-black tracking-tight text-slate-900 group-hover:scale-[1.02] transition-transform origin-left">{value}</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 text-slate-700 ring-1 ring-black/5 shadow-sm group-hover:bg-[var(--admin-primary)] group-hover:text-white transition-all duration-300">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100/50 pt-3">
        <p className="truncate text-xs text-slate-500">{helper}</p>
        {trend ? (
          <span className={clsx('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold', trendColors[trendDirection])}>
            {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '•'} {trend}
          </span>
        ) : null}
      </div>
    </article>
  )

  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }
  return content
}

// ─── ActivityTimelineItem ────────────────────────────────────────────────────
export function ActivityTimelineItem({
  title,
  description,
  time,
  type = 'info',
}: {
  title: string
  description: string
  time: string
  type?: 'inscription' | 'assignment' | 'exam' | 'certificate' | 'info' | 'critical'
}) {
  const typeMap = {
    inscription: 'bg-blue-500 text-white ring-blue-100',
    assignment: 'bg-amber-500 text-white ring-amber-100',
    exam: 'bg-purple-500 text-white ring-purple-100',
    certificate: 'bg-emerald-500 text-white ring-emerald-100',
    info: 'bg-slate-400 text-white ring-slate-100',
    critical: 'bg-rose-500 text-white ring-rose-100',
  }
  
  return (
    <div className="relative pl-6 pb-5 last:pb-0 group">
      {/* Timeline line */}
      <span className="absolute left-[9px] top-3 bottom-0 w-0.5 bg-slate-200 group-last:hidden" />
      
      {/* Circle dot */}
      <span className={clsx(
        'absolute left-0 top-1.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 text-[9px] transition-transform duration-300 group-hover:scale-110 shadow-sm',
        typeMap[type]
      )}>
        {type === 'inscription' ? '👤' : type === 'assignment' ? '📂' : type === 'exam' ? '📝' : type === 'certificate' ? '🎓' : '•'}
      </span>
      
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-900">{title}</p>
          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{time}</span>
        </div>
        <p className="mt-1 text-xs text-slate-650 leading-normal">{description}</p>
      </div>
    </div>
  )
}

// ─── ModuleQuickCard ─────────────────────────────────────────────────────────
export function ModuleQuickCard({
  title,
  count,
  helper,
  href,
  icon: Icon,
}: {
  title: string
  count: number | string
  helper: string
  href: string
  icon: LucideIcon
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-[var(--admin-primary-200)] hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-primary-50)] text-[var(--admin-primary)] transition-colors duration-300 group-hover:bg-[var(--admin-primary)] group-hover:text-white">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="text-2xl font-black text-slate-950 group-hover:text-[var(--admin-primary)] transition-colors">{count}</span>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-bold text-slate-950">{title}</h4>
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">{helper}</p>
      </div>
    </Link>
  )
}
