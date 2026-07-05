import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type StudentMetric = {
  label: string
  value: string | number
  helper?: string
  icon: LucideIcon
  accent: string
}

type StudentPageShellProps = {
  locale: string
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  metrics?: StudentMetric[]
  actions?: ReactNode
  children: ReactNode
  backHref?: string
  backLabel?: string
}

type StudentSectionCardProps = {
  eyebrow?: string
  title: string
  description?: string
  icon: LucideIcon
  className?: string
  children: ReactNode
}

export const studentInputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--cj-blue)] focus:ring-4 focus:ring-blue-100'

export const studentPrimaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--cj-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--cj-blue-700)]'

export const studentSecondaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15'

export const studentMutedButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-[var(--cj-blue)]'

export const studentSurfaceButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-white hover:text-[var(--cj-blue)]'

function hasStatusToken(value: string, token: string) {
  const normalized = String(value || '').toLowerCase().trim()
  if (!normalized) return false
  if (normalized === token) return true
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean)
  return tokens.includes(token)
}

export function studentStatusClass(value: string) {
  if (
    ['success', 'approved', 'verified', 'active', 'complete', 'completed', 'confirmed', 'accepted', 'paid', 'validated'].some((token) =>
      hasStatusToken(value, token),
    )
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (
    ['pending', 'review', 'submitted', 'processing', 'partial', 'upcoming', 'scheduled', 'waiting'].some((token) =>
      hasStatusToken(value, token),
    )
  ) {
    return 'border-blue-200 bg-blue-50 text-[var(--cj-blue)]'
  }

  if (
    ['failed', 'rejected', 'error', 'cancelled', 'canceled', 'expired', 'closed', 'suspended'].some((token) =>
      hasStatusToken(value, token),
    )
  ) {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-slate-200 bg-slate-100 text-slate-700'
}

export function StudentMetricCard({ label, value, helper, icon: Icon, accent }: StudentMetric) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(0,45,114,0.45)]">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{value}</p>
          {helper ? <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p> : null}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-blue-900/20`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function StudentSectionCard({ eyebrow, title, description, icon: Icon, className = '', children }: StudentSectionCardProps) {
  return (
    <article
      className={`rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_-32px_rgba(0,45,114,0.35)] backdrop-blur sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cj-red)]">{eyebrow}</p>
          ) : null}
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-[1.35rem]">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)] ring-1 ring-blue-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  )
}

export function StudentEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function StudentPageShell({
  locale,
  eyebrow,
  title,
  description,
  icon: Icon,
  metrics = [],
  actions,
  children,
  backHref,
  backLabel = "Retour a l'espace etudiant",
}: StudentPageShellProps) {
  const resolvedBackHref = backHref || `/${locale}/espace-etudiants`

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#020617_0%,#001737_18%,#eef5ff_58%,#f8fbff_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,rgba(12,77,162,0.42),transparent_34%),radial-gradient(circle_at_top_right,rgba(227,6,19,0.28),transparent_18%),radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_42%)]" />
      <div className="pointer-events-none absolute right-[-8rem] top-24 h-72 w-72 rounded-full bg-[rgba(227,6,19,0.10)] blur-3xl" />
      <div className="pointer-events-none absolute left-[-6rem] top-32 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

      <main className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={resolvedBackHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur transition hover:bg-slate-950/80"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#02142f_0%,#002d72_42%,#0c4da2_100%)] p-6 text-white shadow-[0_38px_110px_-45px_rgba(0,0,0,0.75)] sm:p-8">
          <div className="pointer-events-none absolute -left-10 top-20 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 top-0 h-52 w-52 rounded-full bg-[rgba(227,6,19,0.20)] blur-3xl" />
          <div className="relative space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                  <Sparkles className="h-4 w-4" />
                  {eyebrow}
                </div>
                <div className="mt-5 flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight leading-tight sm:text-4xl">{title}</h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">{description}</p>
                  </div>
                </div>
              </div>
            </div>

            {metrics.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <StudentMetricCard key={metric.label} {...metric} />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <div className="space-y-6">{children}</div>
      </main>
    </div>
  )
}
