'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BellRing,
  BookOpenCheck,
  CalendarClock,
  CircleDollarSign,
  GraduationCap,
  ReceiptText,
  Users2,
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
} from '@/components/admin-portal/ui'

type AlertRow = {
  id: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  actionLabel: string
  actionHref: string
  createdAt: string
}

type DashboardPayload = {
  generatedAt: string
  periodLabel: string
  totals: {
    sessions: number
    students: number
    paymentsConfirmed: number
    paymentsPending: number
    submissionsPending: number
    certificatesIssued: number
    notificationsRecent: number
  }
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
      trend: Array<{
        label: string
        expected: number
        collected: number
      }>
    }
    conversion: {
      stages: Array<{
        stage: string
        value: number
      }>
    }
    submissions: {
      queue: Array<{
        id: string
        source: 'portal' | 'legacy'
        title: string
        studentName: string
        createdAt: string
      }>
    }
  }
  actionsNow: {
    paymentsToValidate: Array<{
      enrollmentId: number
      studentName: string
      email: string
      formationTitle: string
      sessionLabel: string
      balanceAmount: number
      createdAt: string
    }>
    studentsBlockedWithoutAccount: Array<{
      enrollmentId: number
      studentName: string
      email: string
      formationTitle: string
      sessionLabel: string
    }>
    submissionsPendingReview: Array<{
      id: string
      source: 'portal' | 'legacy'
      title: string
      studentName: string
      createdAt: string
    }>
    waitlistToPromote: Array<{
      sessionId: number
      formationTitle: string
      sessionLabel: string
      availableSeats: number
      waitlistCount: number
    }>
    certificatesToIssue: Array<{
      enrollmentId: number
      studentName: string
      formationTitle: string
      sessionLabel: string
    }>
    notificationsToTreat: Array<{
      id: string
      title: string
      type: string
      createdAt: string
    }>
  }
  alerts: AlertRow[]
}

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

function severityTone(severity: AlertRow['severity']) {
  if (severity === 'critical') return 'danger' as const
  if (severity === 'high') return 'warning' as const
  if (severity === 'medium') return 'primary' as const
  return 'neutral' as const
}

const fillColors = ['#002d72', '#0f4fae', '#4a78c8', '#93b2e6', '#e30613']

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      try {
        const response = await fetch('/api/admin/system/reporting?period=30d', { cache: 'no-store' })
        if (!response.ok) throw new Error('Impossible de charger le pilotage admin.')
        const payload = (await response.json()) as DashboardPayload
        setData(payload)
      } catch (error) {
        console.error(error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const priorityCount = useMemo(() => {
    if (!data) return 0
    return (
      data.actionsNow.paymentsToValidate.length +
      data.actionsNow.studentsBlockedWithoutAccount.length +
      data.actionsNow.submissionsPendingReview.length +
      data.actionsNow.certificatesToIssue.length
    )
  }, [data])

  if (loading) {
    return (
      <AdminShell title="Dashboard Admin">
        <AdminPanel>
          <AdminEmptyState title="Chargement du dashboard" description="Nous consolidons les indicateurs, alertes et actions prioritaires." />
        </AdminPanel>
      </AdminShell>
    )
  }

  if (!data) {
    return (
      <AdminShell title="Dashboard Admin">
        <AdminPanel>
          <AdminEmptyState title="Dashboard indisponible" description="Le centre de pilotage n a pas pu etre charge. Reessayez dans quelques instants." />
        </AdminPanel>
      </AdminShell>
    )
  }

  const topSessions = data.reports.fillRate.sessions.slice(0, 6)
  const actions = [
    {
      title: 'Paiements a valider',
      count: data.actionsNow.paymentsToValidate.length,
      href: '/admin/payments',
      helper: 'Relances ou validations requises avant le demarrage des sessions.',
    },
    {
      title: 'Etudiants bloques',
      count: data.actionsNow.studentsBlockedWithoutAccount.length,
      href: '/admin/students',
      helper: 'Paiement solde mais compte non cree.',
    },
    {
      title: 'Travaux en attente',
      count: data.actionsNow.submissionsPendingReview.length,
      href: '/admin/submissions',
      helper: 'Corrections et retours a traiter.',
    },
    {
      title: 'Certificats a emettre',
      count: data.actionsNow.certificatesToIssue.length,
      href: '/admin/certificates',
      helper: 'Dossiers eligibles a servir.',
    },
    {
      title: 'Sessions avec liste d attente',
      count: data.actionsNow.waitlistToPromote.length,
      href: '/admin/sessions',
      helper: 'Places a debloquer et promotions possibles.',
    },
    {
      title: 'Notifications a traiter',
      count: data.actionsNow.notificationsToTreat.length,
      href: '/admin/notifications',
      helper: 'Messages et relances recentes du back-office.',
    },
  ]

  return (
    <AdminShell title="Dashboard Admin">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          icon={CircleDollarSign}
          label="Encaisse sur la periode"
          value={formatCurrency(data.summary.collectedRevenue)}
          helper={`${data.summary.collectionRate}% du chiffre attendu sur ${data.periodLabel}.`}
          tone="primary"
        />
        <AdminMetricCard
          icon={ReceiptText}
          label="Reste a recouvrer"
          value={formatCurrency(data.summary.outstandingRevenue)}
          helper={`${data.actionsNow.paymentsToValidate.length} dossier(s) de paiement a traiter maintenant.`}
          tone="warning"
        />
        <AdminMetricCard
          icon={BookOpenCheck}
          label="Presences consolidees"
          value={`${data.summary.attendanceRate}%`}
          helper={`${data.summary.averageFillRate}% de remplissage moyen sur les sessions suivies.`}
          tone="success"
        />
        <AdminMetricCard
          icon={BellRing}
          label="A traiter maintenant"
          value={`${priorityCount}`}
          helper={`${data.alerts.length} alerte(s) systeme prioritaires detectees.`}
          tone="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Performance"
            title="Encaisse vs attendu"
            description={`Lecture financiere consolidee sur ${data.periodLabel.toLowerCase()}.`}
          />
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
          <AdminPanelHeader
            eyebrow="Operations"
            title="A traiter maintenant"
            description="Le poste de pilotage priorise les flux qui bloquent la progression administrative."
          />
          <div className="mt-5 space-y-3">
            {actions.map((item) => (
              <Link key={item.title} href={item.href} className="block rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-[var(--admin-primary-200)] hover:bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.helper}</p>
                  </div>
                  <AdminBadge tone={item.count > 0 ? 'warning' : 'neutral'}>{item.count}</AdminBadge>
                </div>
              </Link>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Capacite"
            title="Taux de remplissage par session"
            description="Les sessions les plus proches sont comparees a leur capacite pour repérer les besoins de relance ou de promotion."
          />
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSessions} margin={{ left: -16, right: 12, top: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="formationTitle" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} interval={0} angle={-14} textAnchor="end" height={70} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="fillRate" radius={[14, 14, 6, 6]}>
                  {topSessions.map((entry, index) => (
                    <Cell key={entry.sessionId} fill={fillColors[index % fillColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Alertes systeme"
            title="Signaux prioritaires"
            description={`Genere automatiquement le ${formatDate(data.generatedAt)}.`}
            actions={<Link href="/admin/notifications" className="text-sm font-semibold text-[var(--admin-primary)]">Voir tout</Link>}
          />
          <div className="mt-5 space-y-3">
            {data.alerts.slice(0, 6).map((alert) => (
              <div key={alert.id} className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminBadge tone={severityTone(alert.severity)}>{alert.severity}</AdminBadge>
                  <AdminBadge tone="neutral">{alert.category}</AdminBadge>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{alert.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{alert.message}</p>
                <Link href={alert.actionHref} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--admin-primary)]">
                  {alert.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminPanel>
          <AdminPanelHeader eyebrow="File paiement" title="Dossiers a relancer" description="Les soldes ouverts les plus urgents a regulariser." />
          <div className="mt-5 space-y-3">
            {data.actionsNow.paymentsToValidate.length ? data.actionsNow.paymentsToValidate.slice(0, 5).map((item) => (
              <Link key={item.enrollmentId} href={`/admin/payments?search=${encodeURIComponent(item.email)}`} className="block rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-[var(--admin-primary-200)] hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.studentName}</p>
                  <AdminBadge tone="warning">{formatCurrency(item.balanceAmount)}</AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.formationTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{item.sessionLabel}</p>
              </Link>
            )) : <AdminEmptyState title="Aucun paiement critique" description="Les soldes ouverts sont sous controle sur la periode." />}
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader eyebrow="Onboarding" title="Comptes a debloquer" description="Inscriptions soldées qui attendent encore la creation du compte etudiant." />
          <div className="mt-5 space-y-3">
            {data.actionsNow.studentsBlockedWithoutAccount.length ? data.actionsNow.studentsBlockedWithoutAccount.slice(0, 5).map((item) => (
              <Link key={item.enrollmentId} href={`/admin/students?search=${encodeURIComponent(item.email)}`} className="block rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-[var(--admin-primary-200)] hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.studentName}</p>
                  <AdminBadge tone="primary">Compte a creer</AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.formationTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{item.sessionLabel}</p>
              </Link>
            )) : <AdminEmptyState title="Aucun blocage d acces" description="Tous les dossiers soldes ont deja un compte ou ne sont pas encore eligibles." />}
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader eyebrow="Corrections" title="Travaux et certificats" description="Deux files operationnelles a absorber sans perdre la priorite pedagogique." />
          <div className="mt-5 space-y-3">
            {data.actionsNow.submissionsPendingReview.slice(0, 3).map((item) => (
              <Link key={item.id} href="/admin/submissions" className="block rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-[var(--admin-primary-200)] hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <AdminBadge tone={item.source === 'portal' ? 'primary' : 'neutral'}>{item.source}</AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.studentName}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
              </Link>
            ))}
            {data.actionsNow.certificatesToIssue.slice(0, 2).map((item) => (
              <Link key={item.enrollmentId} href="/admin/certificates" className="block rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-[var(--admin-primary-200)] hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.studentName}</p>
                  <AdminBadge tone="success">Certificat pret</AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.formationTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{item.sessionLabel}</p>
              </Link>
            ))}
            {data.actionsNow.submissionsPendingReview.length === 0 && data.actionsNow.certificatesToIssue.length === 0 ? (
              <AdminEmptyState title="Aucune correction urgente" description="Les travaux en attente et les certificats eligibles sont sous controle." />
            ) : null}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel>
        <AdminPanelHeader
          eyebrow="Conversion"
          title="Parcours inscription vers compte etudiant"
          description="Le funnel met en evidence les pertes entre inscription, paiement et ouverture d acces."
        />
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.reports.conversion.stages} margin={{ left: -16, right: 12, top: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[16, 16, 6, 6]} fill="var(--admin-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminMetricCard icon={Users2} label="Etudiants" value={`${data.totals.students}`} helper="Comptes actifs ou historiques relies a l admin." tone="neutral" />
            <AdminMetricCard icon={CalendarClock} label="Sessions" value={`${data.totals.sessions}`} helper="Sessions prises en compte dans le pilotage." tone="neutral" />
            <AdminMetricCard icon={BadgeCheck} label="Paiements confirmes" value={`${data.totals.paymentsConfirmed}`} helper={`${data.summary.paymentConversionRate}% des inscriptions ont solde leur paiement.`} tone="success" />
            <AdminMetricCard icon={GraduationCap} label="Certificats emis" value={`${data.totals.certificatesIssued}`} helper={`${data.summary.certificatesReady} dossier(s) supplementaires deja prets.`} tone="primary" />
          </div>
        </div>
      </AdminPanel>
    </AdminShell>
  )
}
