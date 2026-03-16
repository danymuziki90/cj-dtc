'use client'

import { CalendarDays, Clock3, GraduationCap, MapPin, Users } from 'lucide-react'
import {
  StudentEmptyState,
  StudentSectionCard,
  type StudentMetric,
} from '@/components/ui/student-space'
import { StudentPortalError, StudentPortalLoading, StudentPortalPageShell } from '@/components/student-portal/StudentPortalPageShell'
import { useStudentDashboardData } from '@/components/student-portal/useStudentDashboard'
import { formatPortalCurrency, formatPortalDate, formatPortalDateTime, statusToneClass } from '@/lib/student-portal/format'

function sessionTypeLabel(value: string | null | undefined) {
  if (!value) return 'Session'
  return value.replace(/_/g, ' ')
}

export default function StudentSessionsPage() {
  const { data, loading, error } = useStudentDashboardData()

  if (loading) {
    return <StudentPortalLoading title="Mes sessions" description="Suivez vos reservations, vos prochaines dates et votre historique." icon={GraduationCap} />
  }

  if (!data || error) {
    return <StudentPortalError title="Mes sessions" description="Suivez vos reservations, vos prochaines dates et votre historique." icon={GraduationCap} error={error} />
  }

  const currentSession = data.dashboard.currentSession
  const metrics: StudentMetric[] = [
    {
      label: 'Sessions',
      value: data.dashboard.metrics.totalSessions,
      helper: 'Parcours total suivis ou reserves.',
      icon: GraduationCap,
      accent: 'from-[#002D72] to-[#0C4DA2]',
    },
    {
      label: 'A venir',
      value: data.dashboard.metrics.pendingSessions,
      helper: 'Sessions encore en cours ou planifiees.',
      icon: CalendarDays,
      accent: 'from-[#0C4DA2] to-[#4F8FE8]',
    },
    {
      label: 'Terminees',
      value: data.dashboard.metrics.completedSessions,
      helper: 'Sessions cloturees dans votre parcours.',
      icon: Clock3,
      accent: 'from-[#E30613] to-[#F16C78]',
    },
    {
      label: 'Paiements confirmes',
      value: data.dashboard.metrics.successfulPayments,
      helper: 'Paiements valides sur votre espace.',
      icon: Users,
      accent: 'from-[#001737] to-[#002D72]',
    },
  ]

  return (
    <StudentPortalPageShell
      title="Mes sessions"
      description="Retrouvez votre session en cours, vos reservations confirmees et l'historique complet de votre apprentissage."
      icon={GraduationCap}
      metrics={metrics}
    >
      <StudentSectionCard
        eyebrow="En cours"
        title="Ma session actuelle"
        description="La prochaine session prioritaire et les informations de reservation associees."
        icon={CalendarDays}
      >
        {currentSession ? (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cj-red)]">{sessionTypeLabel(currentSession.sessionType)}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{currentSession.formationTitle}</h3>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass(currentSession.status)}`}>
                  {currentSession.status}
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Debut</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{formatPortalDateTime(currentSession.startDate)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fin</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{formatPortalDateTime(currentSession.endDate)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lieu / format</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{currentSession.location || 'En ligne'} · {currentSession.format || 'A confirmer'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Statut session</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{currentSession.sessionStatus || 'A confirmer'}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-950">Capacite et reservation</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span>Place reservee</span>
                  <strong className="text-slate-950">{currentSession.reservedSpot ? `#${currentSession.reservedSpot}` : 'N/A'}</strong>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span>Participants</span>
                  <strong className="text-slate-950">{currentSession.currentParticipants ?? 0} / {currentSession.maxParticipants ?? 0}</strong>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span>Places disponibles</span>
                  <strong className="text-slate-950">{currentSession.availableSpots ?? 0}</strong>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span>Cycle</span>
                  <strong className="text-slate-950">{currentSession.lifecycle}</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <StudentEmptyState
            title="Aucune session active"
            description="Vos prochaines reservations apparaitront ici des qu'une inscription sera confirmee."
          />
        )}
      </StudentSectionCard>

      <StudentSectionCard
        eyebrow="Historique"
        title="Toutes mes inscriptions"
        description="Vue chronologique de vos sessions, du suivi de paiement et du volume d'heures associe."
        icon={Clock3}
      >
        {data.dashboard.sessionsHistory.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.dashboard.sessionsHistory.map((session) => (
              <article key={session.enrollmentId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{session.formationCategory || 'Formation'}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{session.formationTitle}</h3>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass(session.paymentStatus)}`}>
                    {session.paymentStatus}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{formatPortalDate(session.startDate)}</p>
                    <p className="mt-1">{session.location || 'En ligne'} · {session.format}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p><strong className="text-slate-900">Inscription:</strong> {session.enrollmentStatus}</p>
                    <p className="mt-1"><strong className="text-slate-900">Heures:</strong> {session.hours}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass(session.sessionLifecycle)}`}>
                    {session.sessionLifecycle}
                  </span>
                  <span>{formatPortalCurrency(session.paidAmount)} / {formatPortalCurrency(session.totalAmount)}</span>
                  <span>{session.questionsCount} question(s)</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <StudentEmptyState
            title="Aucune inscription trouvee"
            description="Vos sessions confirmees, terminees ou en attente s'afficheront ici automatiquement."
          />
        )}
      </StudentSectionCard>
    </StudentPortalPageShell>
  )
}
