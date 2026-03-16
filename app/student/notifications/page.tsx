'use client'

import { Bell, BellRing, AlertCircle, MessageSquareMore, Newspaper } from 'lucide-react'
import {
  StudentEmptyState,
  StudentSectionCard,
  type StudentMetric,
} from '@/components/ui/student-space'
import { StudentPortalError, StudentPortalLoading, StudentPortalPageShell } from '@/components/student-portal/StudentPortalPageShell'
import { useStudentDashboardData } from '@/components/student-portal/useStudentDashboard'
import { formatPortalDateTime, statusToneClass } from '@/lib/student-portal/format'

function typeLabel(value: string) {
  if (value === 'reminder') return 'Rappel'
  if (value === 'correction') return 'Correction'
  return 'Information'
}

function notificationSourceIcon(notificationId: string) {
  if (notificationId.startsWith('news-')) return Newspaper
  if (notificationId.startsWith('reply-')) return MessageSquareMore
  if (notificationId.startsWith('payment-')) return AlertCircle
  return BellRing
}

export default function StudentNotificationsPage() {
  const { data, loading, error } = useStudentDashboardData()

  if (loading) {
    return <StudentPortalLoading title="Notifications" description="Toutes les informations utiles a votre parcours, en un seul flux." icon={Bell} />
  }

  if (!data || error) {
    return <StudentPortalError title="Notifications" description="Toutes les informations utiles a votre parcours, en un seul flux." icon={Bell} error={error} />
  }

  const notifications = data.dashboard.notifications
  const metrics: StudentMetric[] = [
    {
      label: 'Notifications',
      value: notifications.length,
      helper: 'Flux consolide des actualites, relances et reponses.',
      icon: Bell,
      accent: 'from-[#002D72] to-[#0C4DA2]',
    },
    {
      label: 'Rappels',
      value: notifications.filter((item) => item.type === 'reminder').length,
      helper: 'Paiement, demarrage ou actions a suivre.',
      icon: AlertCircle,
      accent: 'from-[#0C4DA2] to-[#4F8FE8]',
    },
    {
      label: 'Corrections',
      value: notifications.filter((item) => item.type === 'correction').length,
      helper: 'Retours lies a vos travaux et soumissions.',
      icon: MessageSquareMore,
      accent: 'from-[#E30613] to-[#F16C78]',
    },
    {
      label: 'Actualites',
      value: notifications.filter((item) => item.id.startsWith('news-')).length,
      helper: 'Informations publiees par le centre.',
      icon: Newspaper,
      accent: 'from-[#001737] to-[#002D72]',
    },
  ]

  return (
    <StudentPortalPageShell
      title="Notifications et alertes"
      description="Consultez vos rappels prioritaires, les nouvelles du centre et les messages utiles a votre suivi."
      icon={Bell}
      metrics={metrics}
    >
      <StudentSectionCard
        eyebrow="Flux"
        title="Historique recent"
        description="Les derniers evenements lies a vos cours, paiements, travaux et communications admin."
        icon={BellRing}
      >
        {notifications.length ? (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = notificationSourceIcon(notification.id)
              return (
                <article key={notification.id} className="flex flex-wrap items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cj-red)]">{typeLabel(notification.type)}</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-950">{notification.title}</h3>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass(notification.type)}`}>
                        {typeLabel(notification.type)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{notification.message}</p>
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{formatPortalDateTime(notification.createdAt)}</p>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <StudentEmptyState
            title="Aucune notification pour le moment"
            description="Les nouvelles du centre, vos rappels de session et les retours pedagogiques apparaitront ici."
          />
        )}
      </StudentSectionCard>
    </StudentPortalPageShell>
  )
}
