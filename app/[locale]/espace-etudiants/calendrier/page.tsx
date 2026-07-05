'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, GraduationCap, MapPin, MonitorSmartphone, TimerReset } from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentInputClassName,
  studentMutedButtonClassName,
  type StudentMetric,
} from '@/components/ui/student-space'

interface Session {
  id: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  format: string
  status: string
  formation: {
    id: number
    title: string
    slug: string
  }
}

const months = [
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
]

function sessionStatusClass(status: string) {
  const map: Record<string, string> = {
    ouverte: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    fermee: 'border-slate-200 bg-slate-100 text-slate-700',
    complete: 'border-blue-200 bg-blue-50 text-[var(--cj-blue)]',
    annulee: 'border-red-200 bg-red-50 text-red-700',
    terminee: 'border-slate-200 bg-slate-100 text-slate-700',
  }
  return map[String(status || '').toLowerCase()] || 'border-slate-200 bg-slate-100 text-slate-700'
}

function sessionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ouverte: 'Ouverte',
    fermee: 'Fermee',
    complete: 'Complete',
    annulee: 'Annulee',
    terminee: 'Terminee',
  }
  return labels[String(status || '').toLowerCase()] || status
}

function formatLabel(format: string) {
  const labels: Record<string, string> = {
    presentiel: 'Presentiel',
    distanciel: 'Distanciel',
    hybride: 'Hybride',
  }
  return labels[String(format || '').toLowerCase()] || format
}

export default function CalendrierPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchSessions()
  }, [selectedMonth, selectedYear])

  const metrics = useMemo<StudentMetric[]>(() => {
    const presentielCount = sessions.filter((session) => session.format === 'presentiel').length
    const distancielCount = sessions.filter((session) => session.format === 'distanciel').length
    const ouvertesCount = sessions.filter((session) => session.status === 'ouverte').length

    return [
      {
        label: 'Sessions',
        value: sessions.length,
        helper: `Agenda de ${months[selectedMonth]} ${selectedYear}.`,
        icon: CalendarDays,
        accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
      },
      {
        label: 'Ouvertes',
        value: ouvertesCount,
        helper: 'Sessions actuellement ouvertes ou actives.',
        icon: TimerReset,
        accent: 'from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]',
      },
      {
        label: 'Presentiel',
        value: presentielCount,
        helper: 'Sessions programmees sur site.',
        icon: MapPin,
        accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
      },
      {
        label: 'Distanciel',
        value: distancielCount,
        helper: 'Sessions accessibles a distance.',
        icon: MonitorSmartphone,
        accent: 'from-[#1d4ed8] via-[#1e3a8a] to-[#020617]',
      },
    ]
  }, [selectedMonth, selectedYear, sessions])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sessions')
      const data = await response.json()
      const filtered = data.filter((session: Session) => {
        const sessionDate = new Date(session.startDate)
        return sessionDate.getMonth() === selectedMonth && sessionDate.getFullYear() === selectedYear
      })
      setSessions(filtered)
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Calendrier academique"
        description="Chargement des sessions planifiees, des formats de cours et des dates importantes de votre agenda."
        icon={CalendarDays}
      >
        <StudentSectionCard
          eyebrow="Agenda"
          title="Preparation du calendrier"
          description="Nous recuperons les sessions et les filtrons selon la periode choisie."
          icon={Clock3}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Chargement du calendrier...
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace etudiant"
      title="Calendrier academique"
      description="Consultez les dates importantes, filtrez les sessions par mois et gardez une vue claire sur les prochaines echeances de formation."
      icon={CalendarDays}
      metrics={metrics}
    >
      <StudentSectionCard
        eyebrow="Periode"
        title={`Agenda de ${months[selectedMonth]} ${selectedYear}`}
        description="Ajustez le mois et l'annee pour explorer les sessions programmees sur la periode qui vous interesse."
        icon={Clock3}
      >
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Mois</label>
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(Number.parseInt(event.target.value, 10))}
                  className={studentInputClassName}
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Annee</label>
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number.parseInt(event.target.value, 10))}
                  className={studentInputClassName}
                >
                  {Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - 1 + index).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cj-red)]">Repere rapide</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Utilisez ce calendrier pour anticiper vos depots, vos presences et les temps forts de vos sessions en cours ou a venir.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/${locale}/espace-etudiants/mes-formations`} className={studentMutedButtonClassName}>
                Mes formations
              </Link>
              <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
                Retour au dashboard
              </Link>
            </div>
          </div>
        </div>
      </StudentSectionCard>

      <StudentSectionCard
        eyebrow="Agenda"
        title="Sessions planifiees"
        description="Chaque carte affiche la fenetre temporelle, les horaires, le lieu et le format de la session."
        icon={GraduationCap}
      >
        {sessions.length === 0 ? (
          <StudentEmptyState
            title={`Aucune session prevue pour ${months[selectedMonth]} ${selectedYear}`}
            description="Ajustez la periode ou revenez plus tard pour consulter les prochains plannings disponibles."
            action={
              <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
                Retour a l'espace etudiant
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(0,45,114,0.35)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">{session.formation.title}</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Debut</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {new Date(session.startDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fin</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {new Date(session.endDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Horaires</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{session.startTime} - {session.endTime}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lieu</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{session.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${sessionStatusClass(session.status)}`}>
                      {sessionStatusLabel(session.status)}
                    </span>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-[var(--cj-blue)]">
                      {formatLabel(session.format)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                  <Link href={`/${locale}/formations/${session.formation.slug}`} className={studentMutedButtonClassName}>
                    Voir la formation
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </StudentSectionCard>
    </StudentPageShell>
  )
}
