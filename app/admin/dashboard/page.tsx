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
  CheckCircle2,
  FileStack,
  FolderKanban,
  GraduationCap,
  RefreshCw,
  Users2,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  AdminActionRow,
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
    submissionsPending: number
    certificatesIssued: number
    notificationsRecent: number
  }
  summary: {
    expectedRevenue: number
    collectedRevenue: number
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
      data.actionsNow.studentsBlockedWithoutAccount.length +
      data.actionsNow.submissionsPendingReview.length +
      data.actionsNow.certificatesToIssue.length
    )
  }, [data])

  if (loading) {
    return (
      <AdminShell title="Pilotage">
        <AdminPanel>
          <div className="flex items-center gap-3 py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-[var(--admin-primary)]" />
            <div>
              <p className="font-semibold text-slate-900">Chargement du tableau de bord</p>
              <p className="text-sm text-slate-500">Consolidation des indicateurs, alertes et actions prioritaires…</p>
            </div>
          </div>
        </AdminPanel>
      </AdminShell>
    )
  }

  if (!data) {
    return (
      <AdminShell title="Pilotage">
        <AdminPanel>
          <div className="flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold text-rose-900">Tableau de bord indisponible</p>
              <p className="mt-1 text-sm text-rose-700">
                Les données de pilotage n'ont pas pu être chargées. Vérifiez la connexion à la base de données et réessayez.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </button>
            </div>
          </div>
        </AdminPanel>
      </AdminShell>
    )
  }

  const topSessions = data.reports.fillRate.sessions.slice(0, 6)
  const actions = [
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
      title: "Sessions avec liste d'attente",
      count: data.actionsNow.waitlistToPromote.length,
      href: '/admin/sessions',
      helper: 'Places à débloquer, promotions possibles.',
    },
    {
      title: 'Notifications à traiter',
      count: data.actionsNow.notificationsToTreat.length,
      href: '/admin/notifications',
      helper: 'Messages et relances récentes du back-office.',
    },
  ]

  return (
    <AdminShell title="Pilotage">
      {/* ── Ligne KPI principale ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          icon={FileStack}
          label="Inscriptions en attente"
          value={`${data.actionsNow.studentsBlockedWithoutAccount.length}`}
          helper="Dossiers sans compte étudiant actif à ce jour."
          tone={data.actionsNow.studentsBlockedWithoutAccount.length > 0 ? 'warning' : 'neutral'}
          urgentCount={data.actionsNow.studentsBlockedWithoutAccount.length}
          href="/admin/enrollments"
        />
        <AdminMetricCard
          icon={BookOpenCheck}
          label="Taux de présence"
          value={`${data.summary.attendanceRate}%`}
          helper={`Remplissage moyen : ${data.summary.averageFillRate}% sur les sessions suivies.`}
          tone="success"
        />
        <AdminMetricCard
          icon={FolderKanban}
          label="Travaux à corriger"
          value={`${data.actionsNow.submissionsPendingReview.length}`}
          helper="Livrables en attente de retour pédagogique."
          tone={data.actionsNow.submissionsPendingReview.length > 0 ? 'warning' : 'neutral'}
          urgentCount={data.actionsNow.submissionsPendingReview.length}
          href="/admin/submissions"
        />
        <AdminMetricCard
          icon={GraduationCap}
          label="Certificats à émettre"
          value={`${data.actionsNow.certificatesToIssue.length}`}
          helper={`${data.totals.certificatesIssued} certificat(s) déjà émis à ce jour.`}
          tone={data.actionsNow.certificatesToIssue.length > 0 ? 'primary' : 'neutral'}
          urgentCount={data.actionsNow.certificatesToIssue.length}
          href="/admin/certificates"
        />
      </div>

      {/* ── Rangée : actions prioritaires + alertes ── */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Opérations"
            title="À traiter maintenant"
            description="Les flux qui bloquent la progression — classés par priorité métier."
          />
          <div className="mt-5 space-y-2">
            {actions.map((item) => (
              <AdminActionRow
                key={item.title}
                href={item.href}
                title={item.title}
                meta={item.helper}
                badge={item.count}
                badgeTone="warning"
                urgent={item.count > 0}
              />
            ))}
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Alertes système"
            title="Signaux prioritaires"
            description={`Générées automatiquement le ${formatDate(data.generatedAt)}.`}
            actions={
              <Link href="/admin/notifications" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--admin-primary)]">
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="mt-5 space-y-3">
            {data.alerts.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-800">Aucune anomalie détectée</p>
              </div>
            ) : null}
            {data.alerts.slice(0, 6).map((alert) => (
              <div key={alert.id} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminBadge tone={severityTone(alert.severity)}>
                    {alert.severity === 'critical' ? 'Critique' : alert.severity === 'high' ? 'Haute' : alert.severity === 'medium' ? 'Moyenne' : 'Basse'}
                  </AdminBadge>
                  <AdminBadge tone="neutral">{alert.category}</AdminBadge>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{alert.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{alert.message}</p>
                <Link href={alert.actionHref} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--admin-primary)]">
                  {alert.actionLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      {/* ── Rangée : dossiers détaillés ── */}
      <div className="grid gap-6 xl:grid-cols-3">
        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Onboarding"
            title="Accès à débloquer"
            description="Étudiants dont le dossier est prêt mais qui n'ont pas encore de compte actif."
          />
          <div className="mt-5 space-y-3">
            {data.actionsNow.studentsBlockedWithoutAccount.length ? (
              data.actionsNow.studentsBlockedWithoutAccount.slice(0, 5).map((item) => (
                <Link
                  key={item.enrollmentId}
                  href={`/admin/students?search=${encodeURIComponent(item.email)}`}
                  className="block rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-[var(--admin-primary-200)] hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{item.studentName}</p>
                    <AdminBadge tone="warning">Compte à créer</AdminBadge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.formationTitle}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.sessionLabel}</p>
                </Link>
              ))
            ) : (
              <AdminEmptyState
                title="Aucun accès bloqué"
                description="Tous les dossiers éligibles disposent déjà d'un compte actif."
              />
            )}
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Corrections & certificats"
            title="Travaux en attente"
            description="File pédagogique à traiter — corrections et certificats prêts à émettre."
          />
          <div className="mt-5 space-y-3">
            {data.actionsNow.submissionsPendingReview.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href="/admin/submissions"
                className="block rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-[var(--admin-primary-200)] hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                  <AdminBadge tone={item.source === 'portal' ? 'primary' : 'neutral'}>
                    {item.source === 'portal' ? 'Portail' : 'Legacy'}
                  </AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.studentName}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
              </Link>
            ))}
            {data.actionsNow.certificatesToIssue.slice(0, 2).map((item) => (
              <Link
                key={item.enrollmentId}
                href="/admin/certificates"
                className="block rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-[var(--admin-primary-200)] hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.studentName}</p>
                  <AdminBadge tone="success">Certificat prêt</AdminBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.formationTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{item.sessionLabel}</p>
              </Link>
            ))}
            {data.actionsNow.submissionsPendingReview.length === 0 && data.actionsNow.certificatesToIssue.length === 0 ? (
              <AdminEmptyState
                title="File vide"
                description="Aucune correction urgente ni certificat en attente d'émission."
              />
            ) : null}
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Listes d'attente"
            title="Sessions à promouvoir"
            description="Sessions avec des places libres et des candidats en liste d'attente."
          />
          <div className="mt-5 space-y-3">
            {data.actionsNow.waitlistToPromote.length ? (
              data.actionsNow.waitlistToPromote.slice(0, 5).map((item) => (
                <Link
                  key={item.sessionId}
                  href="/admin/sessions"
                  className="block rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-[var(--admin-primary-200)] hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.formationTitle}</p>
                    <AdminBadge tone="primary">{item.waitlistCount} en attente</AdminBadge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.sessionLabel}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.availableSeats} place(s) disponible(s)</p>
                </Link>
              ))
            ) : (
              <AdminEmptyState
                title="Aucune promotion disponible"
                description="Toutes les sessions sont complètes ou sans liste d'attente active."
              />
            )}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel>
        <AdminPanelHeader
          eyebrow="Vue d'ensemble"
          title="Indicateurs consolidés"
          description="Comptes et sessions suivis sur la période de pilotage active."
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
            <AdminMetricCard icon={Users2} label="Étudiants" value={`${data.totals.students}`} helper="Comptes actifs enregistrés dans le système." tone="neutral" />
            <AdminMetricCard icon={CalendarClock} label="Sessions" value={`${data.totals.sessions}`} helper="Sessions prises en compte dans le pilotage." tone="neutral" />
            <AdminMetricCard icon={BadgeCheck} label="Taux de conversion" value={`${data.summary.accountConversionRate}%`} helper="Inscriptions ayant abouti à un compte étudiant." tone="success" />
            <AdminMetricCard icon={GraduationCap} label="Certificats émis" value={`${data.totals.certificatesIssued}`} helper={`${data.summary.certificatesReady} dossier(s) supplémentaires éligibles.`} tone="primary" />
          </div>
        </div>
      </AdminPanel>
    </AdminShell>
  )
}
