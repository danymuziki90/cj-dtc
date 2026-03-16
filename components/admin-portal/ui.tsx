import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'

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

const toneClasses = {
  primary: 'border-[var(--admin-primary-200)] bg-gradient-to-br from-[var(--admin-primary-50)] to-white text-[var(--admin-primary-800)]',
  success: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-900',
  warning: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-900',
  danger: 'border-rose-200 bg-gradient-to-br from-rose-50 to-white text-rose-900',
  neutral: 'border-slate-200 bg-gradient-to-br from-slate-50 to-white text-slate-900',
} as const

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
        'rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-[0_28px_80px_-58px_rgba(15,23,42,0.45)] backdrop-blur md:p-6',
        className
      )}
    >
      {children}
    </section>
  )
}

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
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function AdminMetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = 'primary',
}: {
  icon: LucideIcon
  label: string
  value: string
  helper: string
  tone?: keyof typeof toneClasses
}) {
  return (
    <article className={clsx('rounded-[28px] border p-5 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.35)]', toneClasses[tone])}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 ring-1 ring-black/5">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{helper}</p>
    </article>
  )
}

export function AdminBadge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: keyof typeof toneClasses
  className?: string
}) {
  const badgeMap = {
    primary: 'border-[var(--admin-primary-200)] bg-[var(--admin-primary-50)] text-[var(--admin-primary)]',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-rose-200 bg-rose-50 text-rose-700',
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  } as const

  return (
    <span className={clsx('inline-flex rounded-full border px-3 py-1 text-xs font-semibold', badgeMap[tone], className)}>
      {children}
    </span>
  )
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}
