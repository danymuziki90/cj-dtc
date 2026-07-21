'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  FileStack,
  FolderKanban,
  GraduationCap,
  RotateCw,
  Users,
  CalendarDays,
  Newspaper,
  BellRing,
  History,
  ShieldCheck,
  Building2,
  Settings2,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  AdminBadge,
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
  HeroBanner,
  DashboardKpiCard,
  ActivityTimelineItem,
  ModuleQuickCard,
  AdminActionRow,
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
    submissionsPending: number
    certificatesIssued: number
    notificationsRecent: number
  }
  summary: {
    averageFillRate: number
    attendanceRate: number
    pendingCorrections: number
    certificatesReady: number
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

export default function AdminDashboardPage() {
  const [reportingData, setReportingData] = useState<DashboardPayload | null>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [kpiData, setKpiData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDateString, setCurrentDateString] = useState('')
  const [currentTimeString, setCurrentTimeString] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const d = new Date()
      setCurrentTimeString(
        d.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
      setCurrentDateString(
        d.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError(null)
      try {
        const [repRes, statsRes, kpiRes] = await Promise.all([
          fetch('/api/admin/system/reporting?period=30d', { cache: 'no-store' }),
          fetch('/api/admin/dashboard', { cache: 'no-store' }),
          fetch('/api/admin/dashboard/kpi', { cache: 'no-store' }),
        ])

        if (!repRes.ok || !statsRes.ok || !kpiRes.ok) {
          throw new Error('Une ou plusieurs requêtes API ont échoué.')
        }

        const repPayload = await repRes.json()
        const statsPayload = await statsRes.json()
        const kpiPayload = await kpiRes.json()

        setReportingData(repPayload)
        setStatsData(statsPayload)
        setKpiData(kpiPayload)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Impossible de charger les données du cockpit.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const priorityCount = useMemo(() => {
    if (!reportingData) return 0
    return (
      reportingData.actionsNow.studentsBlockedWithoutAccount.length +
      reportingData.actionsNow.submissionsPendingReview.length +
      reportingData.actionsNow.certificatesToIssue.length
    )
  }, [reportingData])

  if (loading) {
    return (
      <AdminShell title="Pilotage">
        <div className="space-y-6">
          <div className="h-44 w-full animate-pulse rounded-[30px] bg-slate-200 dark:bg-slate-800" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-[26px] bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="h-96 animate-pulse rounded-[30px] bg-slate-200 dark:bg-slate-800" />
            <div className="h-96 animate-pulse rounded-[30px] bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </AdminShell>
    )
  }

  if (error || !reportingData || !statsData || !kpiData) {
    return (
      <AdminShell title="Pilotage">
        <AdminPanel>
          <div className="flex items-start gap-4 rounded-[26px] border border-rose-200 bg-rose-50 dark:bg-rose-950/20 px-5 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-450" />
            <div>
              <p className="font-semibold text-rose-900 dark:text-rose-200">Cockpit indisponible</p>
              <p className="mt-1 text-sm text-rose-700 dark:text-rose-350">
                {error || 'Les données de pilotage n\'ont pas pu être synchronisées avec PostgreSQL.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-rose-700 dark:text-rose-350 hover:bg-rose-50"
              >
                <RotateCw className="h-4 w-4" />
                Réessayer la synchronisation
              </button>
            </div>
          </div>
        </AdminPanel>
      </AdminShell>
    )
  }

  const pedagogicalAlerts = reportingData.alerts.filter(
    (alert) =>
      (alert.category === 'attendance' || alert.category === 'submission') &&
      (alert.severity === 'high' || alert.severity === 'critical')
  )

  const quickModuleStats = [
    { title: 'Formations', count: statsData.totalFormations, helper: 'Catalogue de formations actives', href: '/admin/formations', icon: GraduationCap },
    { title: 'Étudiants', count: statsData.totalStudents, helper: 'Comptes et profils d\'élèves', href: '/admin/students', icon: Users },
    { title: 'Travaux', count: statsData.totalAssignments, helper: 'TP, devoirs et corrections', href: '/admin/assignments', icon: FolderKanban },
    { title: 'Actualités', count: kpiData.totals.newsPublished, helper: 'Articles de blog et annonces', href: '/admin/articles', icon: Newspaper },
    { title: 'Entreprises', count: kpiData.totals.notificationsTotal, helper: 'Suivi demandes B2B & CRM', href: '/admin/b2b', icon: Building2 },
    { title: 'Paramètres', count: 'Config', helper: 'Sécurité, JWT & configuration', href: '/admin/settings', icon: Settings2 },
  ]

  return (
    <AdminShell title="Pilotage">
      <div className="space-y-6 animate-fade-in-up">
        <HeroBanner
          adminName="Administrateur"
          actionCount={priorityCount}
          currentDateString={currentDateString}
          currentTimeString={currentTimeString}
        />

        {pedagogicalAlerts.length > 0 && (
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-5 shadow-sm">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-amber-900 dark:text-amber-250 text-sm">Alerte Suivi Pédagogique & Décrochages</h3>
                <p className="text-xs text-amber-700 dark:text-amber-350 mt-1">
                  Des anomalies de présence ou des devoirs non remis nécessitent votre vigilance.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pedagogicalAlerts.slice(0, 4).map((alert) => (
                    <div key={alert.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-amber-100 dark:border-amber-900/40 flex justify-between items-center text-xs gap-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{alert.title}</p>
                        <p className="text-slate-600 dark:text-slate-350 mt-0.5">{alert.message}</p>
                      </div>
                      <Link
                        href={alert.actionHref}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all shrink-0 text-[10px]"
                      >
                        {alert.actionLabel}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <DashboardKpiCard
            icon={Users}
            label="Étudiants inscrits"
            value={kpiData.totals.studentsTotal}
            helper="Total des comptes enregistrés"
            trend={kpiData.trends.studentTrend}
            trendDirection="up"
            tone="primary"
            href="/admin/students"
          />
          <DashboardKpiCard
            icon={BadgeCheck}
            label="Étudiants actifs"
            value={kpiData.totals.studentsActive}
            helper="Élèves ayant un profil validé"
            trend="100%"
            trendDirection="neutral"
            tone="success"
            href="/admin/students"
          />
          <DashboardKpiCard
            icon={CalendarClock}
            label="Sessions ouvertes"
            value={kpiData.totals.sessionsOpen}
            helper="Cohorters de formation actives"
            tone="primary"
            href="/admin/sessions"
          />
          <DashboardKpiCard
            icon={CalendarDays}
            label="Sessions à venir"
            value={kpiData.totals.sessionsFuture}
            helper="Démarrages planifiés prochainement"
            tone="neutral"
            href="/admin/sessions"
          />
          <DashboardKpiCard
            icon={FileStack}
            label="Travaux publiés"
            value={kpiData.totals.assignmentsPublished}
            helper="Sujets de travaux mis en ligne"
            tone="neutral"
            href="/admin/assignments"
          />
          <DashboardKpiCard
            icon={FolderKanban}
            label="Travaux remis"
            value={statsData.totalInscriptions - statsData.pendingCorrections}
            helper="Total des fichiers corrigés ou rendus"
            trend={kpiData.trends.submissionTrend}
            trendDirection="up"
            tone="success"
            href="/admin/assignments"
          />
          <DashboardKpiCard
            icon={Newspaper}
            label="Actualités publiées"
            value={kpiData.totals.newsPublished}
            helper="Articles et informations visibles"
            tone="neutral"
            href="/admin/articles"
          />
          <DashboardKpiCard
            icon={BellRing}
            label="Notifications"
            value={kpiData.totals.notificationsTotal}
            helper="Alertes globales émises"
            tone="neutral"
            href="/admin/notifications"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <AdminPanel>
            <AdminPanelHeader
              eyebrow="Tendance Inscriptions"
              title="Pipeline d'inscriptions mensuel"
              description="Visualisation des nouvelles demandes enregistrées par mois au cours du dernier semestre."
            />
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.monthlyStats} margin={{ left: -16, right: 12, top: 12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', background: '#1e293b', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="inscriptions" name="Inscriptions" radius={[10, 10, 0, 0]} fill="var(--admin-primary)" />
                  <Bar dataKey="certificates" name="Certificats" radius={[10, 10, 0, 0]} fill="var(--admin-accent)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              eyebrow="Conversion"
              title="Taux d'onboarding"
              description="Inscriptions transformées en comptes étudiants actifs."
            />
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <div className="relative inline-flex items-center justify-center">
                <span className="text-4xl font-black text-slate-905">{reportingData.summary.accountConversionRate}%</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Forte conversion du funnel d'inscription</p>
              <p className="mt-2 text-xs text-slate-500 max-w-xs">
                La majorité des demandes validées créent et activent immédiatement leur compte élève sur le portail.
              </p>
              
              <div className="mt-6 w-full space-y-2 text-left">
                {reportingData.reports.conversion.stages.map((stage) => (
                  <div key={stage.stage} className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/50 flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-350">{stage.stage}</span>
                    <span className="text-slate-950 dark:text-slate-100">{stage.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </AdminPanel>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AdminPanel>
            <AdminPanelHeader
              eyebrow="Audit logs"
              title="Activités récentes"
              description="Flux en temps réel des actions des administrateurs et des élèves."
            />
            <div className="mt-6 max-h-[360px] overflow-y-auto pr-1 space-y-1">
              {statsData.recentActivity.map((activity: any, index: number) => (
                <ActivityTimelineItem
                  key={index}
                  title={activity.title}
                  description={`Par ${activity.student}`}
                  time={activity.date}
                  type={activity.type}
                />
              ))}
              {statsData.recentActivity.length === 0 && (
                <AdminEmptyState title="Aucune activité" description="Le journal d'audit est vide." icon={History} />
              )}
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              eyebrow="À corriger"
              title="Travaux soumis"
              description="File d'attente des copies d'élèves en attente de notation."
            />
            <div className="mt-6 space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {reportingData.actionsNow.submissionsPendingReview.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href="/admin/assignments"
                  className="block rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3.5 transition hover:border-[var(--admin-primary-200)] hover:bg-white dark:hover:bg-slate-800"
                >
                  <div className="flex justify-between items-start gap-3">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <AdminBadge tone="warning">Remis</AdminBadge>
                  </div>
                  <p className="text-[11px] text-slate-650 mt-1">{item.studentName}</p>
                </Link>
              ))}
              {reportingData.actionsNow.submissionsPendingReview.length === 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-250 bg-emerald-50/60 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-800">Toutes les copies sont notées !</p>
                </div>
              )}
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              eyebrow="Admissions"
              title="Dossiers en attente"
              description="Nouveaux dossiers d'élèves à valider."
            />
            <div className="mt-6 space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {reportingData.actionsNow.studentsBlockedWithoutAccount.slice(0, 5).map((item) => (
                <Link
                  key={item.enrollmentId}
                  href={`/admin/enrollments`}
                  className="block rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3.5 transition hover:border-[var(--admin-primary-200)] hover:bg-white dark:hover:bg-slate-800"
                >
                  <div className="flex justify-between items-start gap-3">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">{item.studentName}</p>
                    <AdminBadge tone="neutral">En attente</AdminBadge>
                  </div>
                  <p className="text-[11px] text-slate-650 mt-1 truncate">{item.formationTitle}</p>
                </Link>
              ))}
              {reportingData.actionsNow.studentsBlockedWithoutAccount.length === 0 && (
                <AdminEmptyState title="Rien à valider" description="Aucune inscription en suspens." icon={ShieldCheck} />
              )}
            </div>
          </AdminPanel>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-950 mb-4">Cockpit des modules opérationnels</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {quickModuleStats.map((module) => (
              <ModuleQuickCard
                key={module.title}
                title={module.title}
                count={module.count}
                helper={module.helper}
                href={module.href}
                icon={module.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
