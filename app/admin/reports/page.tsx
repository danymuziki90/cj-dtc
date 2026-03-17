'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BadgeCheck,
  BookOpenCheck,
  CircleDollarSign,
  Download,
  Layers3,
  Save,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  AdminBadge,
  AdminEmptyState,
  AdminMetricCard,
  AdminPanel,
  AdminPanelHeader,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
  adminSelectClassName,
} from '@/components/admin-portal/ui'

type ReportingPeriod = '7d' | '30d' | '90d' | '365d' | 'all'

type SavedView = {
  id: string
  name: string
  period: ReportingPeriod
}

type ReportPayload = {
  generatedAt: string
  period: ReportingPeriod
  periodLabel: string
  summary: {
    expectedRevenue: number
    collectedRevenue: number
    outstandingRevenue: number
    collectionRate: number
    averageFillRate: number
    attendanceRate: number
    pendingCorrections: number
    certificatesReady: number
    paymentConversionRate: number
    accountConversionRate: number
  }
  reports: {
    fillRate: {
      averageRate: number
      fullSessions: number
      sessions: Array<{
        sessionId: number
        formationTitle: string
        startDate: string
        fillRate: number
        availableSeats: number
        waitlistCount: number
      }>
    }
    revenue: {
      expected: number
      collected: number
      outstanding: number
      collectionRate: number
      agingBuckets: Array<{
        label: string
        count: number
        amount: number
      }>
      trend: Array<{
        label: string
        expected: number
        collected: number
      }>
    }
    attendance: {
      overallRate: number
      repeatedAbsences: Array<{
        email: string
        studentName: string
        sessionLabel: string
        absentCount: number
      }>
      sessions: Array<{
        sessionId: number
        formationTitle: string
        rate: number
        records: number
        absentCount: number
      }>
    }
    submissions: {
      pendingTotal: number
      queue: Array<{
        id: string
        source: 'portal' | 'legacy'
        title: string
        studentName: string
        createdAt: string
      }>
      overdueAssignments: Array<{
        assignmentId: number
        title: string
        formationTitle: string
        deadline: string
        missingCount: number
      }>
    }
    certificates: {
      readyCount: number
      eligibleNotIssued: Array<{
        enrollmentId: number
        studentName: string
        formationTitle: string
        sessionLabel: string
        attendanceRate: number | null
      }>
    }
    conversion: {
      paymentRate: number
      accountRate: number
      stages: Array<{
        stage: string
        value: number
      }>
      blockedWithoutAccount: Array<{
        enrollmentId: number
        studentName: string
        email: string
        formationTitle: string
        sessionLabel: string
      }>
    }
  }
  alerts: Array<{
    id: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    category: string
    title: string
    message: string
    actionLabel: string
    actionHref: string
  }>
}

const SAVED_VIEWS_KEY = 'cj-admin-report-saved-views'
const colors = ['#002d72', '#0f4fae', '#4a78c8', '#93b2e6', '#e30613']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function readSavedViews() {
  if (typeof window === 'undefined') return [] as SavedView[]
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVED_VIEWS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is SavedView => Boolean(item?.id && item?.name && item?.period)) : []
  } catch {
    return []
  }
}

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<ReportingPeriod>('30d')
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [data, setData] = useState<ReportPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSavedViews(readSavedViews())
  }, [])

  useEffect(() => {
    async function loadReports() {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/system/reporting?period=${period}`, { cache: 'no-store' })
        const payload = (await response.json()) as ReportPayload
        setData(payload)
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [period])

  function saveCurrentView() {
    const label = window.prompt('Nom de la vue a enregistrer', `Vue ${period}`)?.trim()
    if (!label) return
    const next = [{ id: `${Date.now()}`, name: label, period }, ...savedViews].slice(0, 8)
    setSavedViews(next)
    window.localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(next))
  }

  const topFillRates = useMemo(() => data?.reports.fillRate.sessions.slice(0, 8) || [], [data])

  if (loading) {
    return (
      <AdminShell title="Centre de reporting">
        <AdminPanel>
          <AdminEmptyState title="Chargement des rapports" description="Les indicateurs de remplissage, encaissement, presence et conversion sont en cours d aggregation." />
        </AdminPanel>
      </AdminShell>
    )
  }

  if (!data) {
    return (
      <AdminShell title="Centre de reporting">
        <AdminPanel>
          <AdminEmptyState title="Rapports indisponibles" description="Le centre de reporting n a pas pu etre charge pour le moment." />
        </AdminPanel>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Centre de reporting">
      <AdminPanel>
        <AdminPanelHeader
          eyebrow="Vues analytiques"
          title="Reporting detaille et reutilisable"
          description="Le centre regroupe les KPIs reels, les alertes systeme et des vues sauvegardees pour relire rapidement la meme coupe d analyse."
          actions={
            <>
              <select value={period} onChange={(event) => setPeriod(event.target.value as ReportingPeriod)} className={adminSelectClassName}>
                <option value="7d">7 jours</option>
                <option value="30d">30 jours</option>
                <option value="90d">90 jours</option>
                <option value="365d">12 mois</option>
                <option value="all">Historique complet</option>
              </select>
              <button type="button" onClick={saveCurrentView} className={adminSecondaryButtonClassName}>
                <Save className="h-4 w-4" />
                Sauvegarder la vue
              </button>
              <button type="button" onClick={() => window.print()} className={adminPrimaryButtonClassName}>
                <Download className="h-4 w-4" />
                Export rapide
              </button>
            </>
          }
        />

        {savedViews.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {savedViews.map((view) => (
              <button key={view.id} type="button" onClick={() => setPeriod(view.period)} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--admin-primary-200)] hover:text-[var(--admin-primary)]">
                {view.name}
              </button>
            ))}
          </div>
        ) : null}
      </AdminPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard icon={CircleDollarSign} label="Encaisse" value={formatCurrency(data.summary.collectedRevenue)} helper={`${data.summary.collectionRate}% de conversion financiere.`} tone="primary" />
        <AdminMetricCard icon={Layers3} label="Remplissage" value={`${data.summary.averageFillRate}%`} helper={`${data.reports.fillRate.fullSessions} session(s) deja completes.`} tone="success" />
        <AdminMetricCard icon={BookOpenCheck} label="Presence" value={`${data.summary.attendanceRate}%`} helper={`${data.reports.attendance.repeatedAbsences.length} dossier(s) avec absences repetees.`} tone="warning" />
        <AdminMetricCard icon={BadgeCheck} label="Certificats prets" value={`${data.summary.certificatesReady}`} helper={`${data.summary.accountConversionRate}% des inscrits ont deja un compte.`} tone="danger" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel>
          <AdminPanelHeader eyebrow="Finance" title="Encaisse vs attendu" description={`Periode active: ${data.periodLabel.toLowerCase()}.`} />
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.reports.revenue.trend} margin={{ left: -16, right: 12, top: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="expected" stroke="#94a3b8" strokeWidth={2} name="Attendu" />
                <Line type="monotone" dataKey="collected" stroke="var(--admin-primary)" strokeWidth={3} name="Encaisse" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader eyebrow="Impayes" title="Anciennete du reste a recouvrer" description="Les buckets d anciennete montrent ou concentrer relances et validations." />
          <div className="mt-5 space-y-3">
            {data.reports.revenue.agingBuckets.map((bucket) => (
              <div key={bucket.label} className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{bucket.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{bucket.count} dossier(s)</p>
                  </div>
                  <AdminBadge tone={bucket.amount > 0 ? 'warning' : 'neutral'}>{formatCurrency(bucket.amount)}</AdminBadge>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminPanel>
          <AdminPanelHeader eyebrow="Remplissage" title="Sessions sous tension" description="Comparaison des sessions les plus visibles avec leur capacite disponible." />
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFillRates} margin={{ left: -16, right: 12, top: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="formationTitle" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} interval={0} angle={-14} textAnchor="end" height={70} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="fillRate" radius={[14, 14, 6, 6]}>
                  {topFillRates.map((item, index) => (
                    <Cell key={item.sessionId} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader eyebrow="Conversion" title="Inscription vers compte" description="Les etapes montrent la perte entre pipeline commercial et activation portail." />
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.reports.conversion.stages} margin={{ left: -16, right: 12, top: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[16, 16, 6, 6]} fill="var(--admin-accent)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminPanel>
          <AdminPanelHeader eyebrow="Presence" title="Absences repetees" description="Les etudiants a relancer avant risque d abandon ou de non-certification." />
          <div className="mt-5 space-y-3">
            {data.reports.attendance.repeatedAbsences.length ? data.reports.attendance.repeatedAbsences.slice(0, 5).map((item) => (
              <div key={`${item.email}-${item.sessionLabel}`} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.studentName}</p>
                  <AdminBadge tone="warning">{item.absentCount} abs.</AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.sessionLabel}</p>
              </div>
            )) : <AdminEmptyState title="Aucune absence critique" description="Le suivi des presences ne remonte pas de cas repete pour cette vue." />}
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader eyebrow="Travaux" title="File de correction" description="Livrables a traiter et assignments non remis dans les temps." />
          <div className="mt-5 space-y-3">
            {data.reports.submissions.queue.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <AdminBadge tone={item.source === 'portal' ? 'primary' : 'neutral'}>{item.source}</AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.studentName}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
              </div>
            ))}
            {data.reports.submissions.overdueAssignments.slice(0, 2).map((item) => (
              <div key={item.assignmentId} className="rounded-[22px] border border-amber-200 bg-amber-50/70 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <AdminBadge tone="warning">{item.missingCount} manquant(s)</AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.formationTitle}</p>
                <p className="mt-1 text-xs text-slate-500">Echeance: {formatDate(item.deadline)}</p>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader eyebrow="Alertes" title="Systeme prioritaire" description="Le moteur remonte automatiquement les paiements, absences, certificats et documents a traiter." />
          <div className="mt-5 space-y-3">
            {data.alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center gap-2">
                  <AdminBadge tone={alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : 'primary'}>{alert.severity}</AdminBadge>
                  <AdminBadge tone="neutral">{alert.category}</AdminBadge>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{alert.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{alert.message}</p>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel>
          <AdminPanelHeader eyebrow="Certificats" title="Eligibles non delivres" description="Liste des dossiers prets pour emission sans action supplementaire de l etudiant." />
          <div className="mt-5 space-y-3">
            {data.reports.certificates.eligibleNotIssued.length ? data.reports.certificates.eligibleNotIssued.slice(0, 6).map((item) => (
              <div key={item.enrollmentId} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.studentName}</p>
                  <AdminBadge tone="success">{item.attendanceRate === null ? 'Pret' : `${item.attendanceRate}%`}</AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.formationTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{item.sessionLabel}</p>
              </div>
            )) : <AdminEmptyState title="Aucun certificat en attente" description="Aucune cohorte n est actuellement prete pour emission immediate." />}
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader eyebrow="Blocages" title="Paiement solde, compte absent" description="Le dernier maillon du funnel a fermer rapidement pour ne pas bloquer l espace etudiant." />
          <div className="mt-5 space-y-3">
            {data.reports.conversion.blockedWithoutAccount.length ? data.reports.conversion.blockedWithoutAccount.slice(0, 6).map((item) => (
              <div key={item.enrollmentId} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.studentName}</p>
                  <AdminBadge tone="danger">A debloquer</AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.formationTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{item.sessionLabel}</p>
              </div>
            )) : <AdminEmptyState title="Aucun compte bloque" description="Tous les dossiers soldes ont un acces ou ne sont pas encore a creer." />}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  )
}
