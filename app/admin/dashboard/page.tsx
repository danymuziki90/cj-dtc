'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BadgeCheck,
  BellRing,
  BookMarked,
  CalendarClock,
  CircleDollarSign,
  FileCheck2,
  GraduationCap,
  Newspaper,
  ShieldCheck,
  Users2,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AdminShell from '@/components/admin-portal/AdminShell'

type DashboardStats = {
  sessions: number
  students: number
  availableSpots: number
  paymentsConfirmed: number
  paymentsPending: number
  submissions: number
  submissionsPending: number
  submissionsValidated: number
  certificates: number
  news: number
}

type SessionTypeBreakdown = {
  MRH: number
  IOP: number
  CONFERENCE_FORUM: number
}

type SubmissionRow = {
  id: string
  title: string
  status: string
  student: {
    firstName: string
    lastName: string
  }
  createdAt: string
}

const initialStats: DashboardStats = {
  sessions: 0,
  students: 0,
  availableSpots: 0,
  paymentsConfirmed: 0,
  paymentsPending: 0,
  submissions: 0,
  submissionsPending: 0,
  submissionsValidated: 0,
  certificates: 0,
  news: 0,
}

const initialSessionTypes: SessionTypeBreakdown = {
  MRH: 0,
  IOP: 0,
  CONFERENCE_FORUM: 0,
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function statusClassName(status: string) {
  const normalized = status.toLowerCase()

  if (normalized.includes('approv') || normalized.includes('valid')) {
    return 'border border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (normalized.includes('review') || normalized.includes('corrig')) {
    return 'border border-amber-200 bg-amber-50 text-amber-700'
  }

  if (normalized.includes('reject') || normalized.includes('fail')) {
    return 'border border-rose-200 bg-rose-50 text-rose-700'
  }

  return 'border border-slate-200 bg-slate-100 text-slate-700'
}

function formatSubmissionStatus(status: string) {
  const normalized = status.toLowerCase()

  if (normalized.includes('approv') || normalized.includes('valid')) {
    return 'Valide'
  }

  if (normalized.includes('review') || normalized.includes('corrig')) {
    return 'En correction'
  }

  if (normalized.includes('reject') || normalized.includes('fail')) {
    return 'Rejete'
  }

  return 'En attente'
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    notation: value > 999 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function ChartCard({
  title,
  eyebrow,
  helper,
  children,
}: {
  title: string
  eyebrow: string
  helper: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-[0_30px_80px_-58px_rgba(15,23,42,0.5)] backdrop-blur md:p-6">
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
        <h3 className="m-0 text-xl font-bold tracking-tight text-slate-950">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{helper}</p>
      </div>
      {children}
    </section>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [sessionTypes, setSessionTypes] = useState<SessionTypeBreakdown>(initialSessionTypes)
  const [latestSubmissions, setLatestSubmissions] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [overviewRes, submissionsRes] = await Promise.all([
          fetch('/api/admin/system/overview', { cache: 'no-store' }),
          fetch('/api/admin/system/submissions', { cache: 'no-store' }),
        ])

        if ([overviewRes, submissionsRes].some((res) => !res.ok)) return

        const [overviewData, submissionsData] = await Promise.all([overviewRes.json(), submissionsRes.json()])

        setStats({
          sessions: overviewData.totals?.sessions || 0,
          students: overviewData.totals?.students || 0,
          availableSpots: overviewData.totals?.availableSpots || 0,
          paymentsConfirmed: overviewData.totals?.paymentsConfirmed || 0,
          paymentsPending: overviewData.totals?.paymentsPending || 0,
          submissions: overviewData.totals?.submissions || 0,
          submissionsPending: overviewData.totals?.submissionsPending || 0,
          submissionsValidated: overviewData.totals?.submissionsValidated || 0,
          certificates: overviewData.totals?.certificates || 0,
          news: overviewData.totals?.news || 0,
        })
        setSessionTypes(overviewData.sessionTypes || initialSessionTypes)
        setLatestSubmissions((submissionsData.submissions || []).slice(0, 6))
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const kpis = useMemo(
    () => [
      {
        label: 'Sessions actives',
        value: stats.sessions,
        helper: `${stats.availableSpots} places encore visibles`,
        icon: CalendarClock,
        tone: 'from-[rgba(0,48,160,0.16)] to-white',
      },
      {
        label: 'Etudiants actifs',
        value: stats.students,
        helper: 'Comptes relies au portail etudiant',
        icon: Users2,
        tone: 'from-[rgba(0,48,160,0.1)] to-white',
      },
      {
        label: 'Paiements confirmes',
        value: stats.paymentsConfirmed,
        helper: `${stats.paymentsPending} paiements a surveiller`,
        icon: CircleDollarSign,
        tone: 'from-[rgba(16,185,129,0.14)] to-white',
      },
      {
        label: 'Livrables soumis',
        value: stats.submissions,
        helper: `${stats.submissionsValidated} valides / ${stats.submissionsPending} en attente`,
        icon: FileCheck2,
        tone: 'from-[rgba(227,6,19,0.1)] to-white',
      },
    ],
    [stats]
  )

  const sessionTypeData = useMemo(
    () => [
      { name: 'MRH', value: sessionTypes.MRH },
      { name: 'IOP', value: sessionTypes.IOP },
      { name: 'Conference / Forum', value: sessionTypes.CONFERENCE_FORUM },
    ],
    [sessionTypes]
  )

  const paymentBreakdown = useMemo(
    () => [
      { name: 'Confirmes', value: stats.paymentsConfirmed, fill: 'var(--admin-primary)' },
      { name: 'En attente', value: stats.paymentsPending, fill: 'var(--admin-accent)' },
    ],
    [stats.paymentsConfirmed, stats.paymentsPending]
  )

  const operationsPulse = useMemo(
    () => [
      { label: 'Sessions', value: stats.sessions },
      { label: 'Etudiants', value: stats.students },
      { label: 'Travaux', value: stats.submissions },
      { label: 'Certifs', value: stats.certificates },
      { label: 'Actualites', value: stats.news },
    ],
    [stats.sessions, stats.students, stats.submissions, stats.certificates, stats.news]
  )

  const submissionTrend = useMemo(() => {
    const grouped = latestSubmissions.reduce<Record<string, number>>((acc, submission) => {
      const key = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(submission.createdAt))
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return Object.entries(grouped).map(([label, value]) => ({ label, value }))
  }, [latestSubmissions])

  const operationalInsights = useMemo(
    () => [
      {
        label: 'Capacite disponible',
        value: `${stats.availableSpots}`,
        helper: 'Places encore mobilisables sur les sessions ouvertes',
        icon: ShieldCheck,
      },
      {
        label: 'Certificats emis',
        value: `${stats.certificates}`,
        helper: 'Sorties deja delivrees et verifiables',
        icon: GraduationCap,
      },
      {
        label: 'Actualites publiees',
        value: `${stats.news}`,
        helper: 'Contenus institutionnels disponibles au public',
        icon: Newspaper,
      },
      {
        label: 'Actions prioritaires',
        value: `${stats.paymentsPending + stats.submissionsPending}`,
        helper: 'Paiements ou travaux demandant une revue rapide',
        icon: BellRing,
      },
    ],
    [stats]
  )

  return (
    <AdminShell title="Dashboard Admin">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => {
          const Icon = card.icon
          return (
            <article
              key={card.label}
              className={`rounded-[30px] border border-white/80 bg-gradient-to-br ${card.tone} p-5 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.45)] backdrop-blur`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                  <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{formatCompactNumber(card.value)}</p>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--admin-primary)] ring-1 ring-slate-200 shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{card.helper}</p>
            </article>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard
          title="Repartition des sessions"
          eyebrow="Portefeuille"
          helper="Lecture immediate du portefeuille de programmes afin d'equilibrer les offres les plus sollicitees."
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionTypeData} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(0,48,160,0.06)' }} />
                <Bar dataKey="value" radius={[16, 16, 6, 6]} fill="var(--admin-primary)" maxBarSize={72} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Statut des paiements"
          eyebrow="Encaissements"
          helper="Visualisation claire des encaissements confirmes versus les paiements a suivre."
        >
          <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr] md:items-center">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={102}
                    paddingAngle={4}
                    stroke="transparent"
                  >
                    {paymentBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {paymentBreakdown.map((entry) => (
                <div key={entry.name} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-3.5 w-3.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
                    </div>
                    <p className="text-lg font-bold text-slate-950">{formatCompactNumber(entry.value)}</p>
                  </div>
                </div>
              ))}
              <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Lecture rapide</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Le bleu montre les paiements confirmes. Le rouge met en avant les montants a relancer ou verifier.
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard
          title="Flux operationnel"
          eyebrow="Volumes admin"
          helper="Une lecture synthetique des principaux volumes admin pour garder un equilibre visuel sur les flux critiques."
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={operationsPulse} margin={{ left: -8, right: 12, top: 16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Volumes"
                  stroke="var(--admin-primary)"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Rythme des livrables recents"
          eyebrow="Tendance recente"
          helper="Tendance courte construite a partir des derniers travaux pour voir si la charge de correction accelere."
        >
          <div className="h-80">
            {submissionTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={submissionTrend} margin={{ left: -8, right: 12, top: 16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--admin-accent)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[26px] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                Les donnees de tendance apparaitront des que des travaux seront soumis.
              </div>
            )}
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-[0_30px_80px_-58px_rgba(15,23,42,0.5)] backdrop-blur md:p-6">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">File prioritaire</p>
            <h3 className="m-0 text-xl font-bold tracking-tight text-slate-950">Derniers travaux etudiants</h3>
            <p className="text-sm leading-6 text-slate-600">
              Une table plus nette pour verifier les statuts, les noms et le rythme de soumission sans charge visuelle.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/90">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Etudiant</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Livrable</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {latestSubmissions.map((submission) => (
                  <tr key={submission.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-4 text-slate-900">
                      <div>
                        <p className="font-semibold">
                          {submission.student.firstName} {submission.student.lastName}
                        </p>
                        <p className="text-xs text-slate-500">Espace etudiant</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{submission.title}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClassName(submission.status)}`}>
                        {formatSubmissionStatus(submission.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{formatDate(submission.createdAt)}</td>
                  </tr>
                ))}

                {!loading && latestSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                      Aucune soumission recente.
                    </td>
                  </tr>
                ) : null}

                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                      Chargement du tableau de bord...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4">
          {operationalInsights.map((item) => {
            const Icon = item.icon
            return (
              <article
                key={item.label}
                className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.45)] backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{item.value}</p>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary-50)] text-[var(--admin-primary)] ring-1 ring-[var(--admin-primary-100)]">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.helper}</p>
              </article>
            )
          })}

          <article className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_26px_75px_-54px_rgba(15,23,42,0.7)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Lecture financiere</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-300">Encaissement confirme</p>
                <p className="mt-1 text-3xl font-bold text-white">{formatCurrency(stats.paymentsConfirmed * 100)}</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                <Activity className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Estimation basee sur les paiements confirmes visibles dans le tableau de bord. A raffiner ensuite avec les montants reels agreges.
            </p>
          </article>
        </section>
      </section>
    </AdminShell>
  )
}
