'use client'

import { BarChart3, CheckCircle2, ClipboardCheck, NotebookText, ShieldCheck, Star } from 'lucide-react'
import {
  StudentEmptyState,
  StudentSectionCard,
  type StudentMetric,
} from '@/components/ui/student-space'
import { StudentPortalError, StudentPortalLoading, StudentPortalPageShell } from '@/components/student-portal/StudentPortalPageShell'
import { useStudentDashboardData } from '@/components/student-portal/useStudentDashboard'
import { formatPortalDate, statusToneClass } from '@/lib/student-portal/format'

function ratingLabel(value: number) {
  return `${value}/5`
}

export default function StudentResultsPage() {
  const { data, loading, error } = useStudentDashboardData()

  if (loading) {
    return <StudentPortalLoading title="Resultats" description="Consultez vos evaluations, votre progression et votre eligibilite au certificat." icon={NotebookText} />
  }

  if (!data || error) {
    return <StudentPortalError title="Resultats" description="Consultez vos evaluations, votre progression et votre eligibilite au certificat." icon={NotebookText} error={error} />
  }

  const eligibility = data.dashboard.certificateEligibility
  const attendanceRate = eligibility.attendanceRate ?? 0
  const metrics: StudentMetric[] = [
    {
      label: 'Evaluations',
      value: data.dashboard.results.length,
      helper: 'Retours d evaluation deja enregistrés.',
      icon: ClipboardCheck,
      accent: 'from-[#002D72] to-[#0C4DA2]',
    },
    {
      label: 'Progression',
      value: `${data.dashboard.progress.hoursCompleted}h`,
      helper: 'Volume d heures deja complete.',
      icon: BarChart3,
      accent: 'from-[#0C4DA2] to-[#4F8FE8]',
    },
    {
      label: 'Presence',
      value: `${attendanceRate}%`,
      helper: 'Taux calcule sur la session courante.',
      icon: ShieldCheck,
      accent: 'from-[#E30613] to-[#F16C78]',
    },
    {
      label: 'Certificat',
      value: eligibility.eligible ? 'Eligible' : 'En cours',
      helper: 'Etat actuel des conditions de delivrance.',
      icon: CheckCircle2,
      accent: 'from-[#001737] to-[#002D72]',
    },
  ]

  return (
    <StudentPortalPageShell
      title="Mes resultats"
      description="Suivez vos evaluations, votre taux de presence et les conditions restantes pour obtenir votre certificat."
      icon={NotebookText}
      metrics={metrics}
    >
      <StudentSectionCard
        eyebrow="Eligibilite"
        title="Avancement vers le certificat"
        description="Ces indicateurs sont mis a jour a partir de vos paiements, de vos travaux et de vos presences."
        icon={ShieldCheck}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Paiement valide', value: eligibility.paymentValidated },
            { label: 'Projet valide', value: eligibility.projectValidated },
            { label: 'Presence validee', value: eligibility.attendanceValidated },
            { label: 'Certificat possible', value: eligibility.eligible },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.value ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {item.value ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </span>
                <strong className="text-lg text-slate-950">{item.value ? 'Oui' : 'Non'}</strong>
              </div>
            </div>
          ))}
        </div>
      </StudentSectionCard>

      <StudentSectionCard
        eyebrow="Evaluations"
        title="Retours et notes pedagogiques"
        description="Les notes et appreciations validees par l'equipe pedagogique sont centralisees ici."
        icon={Star}
      >
        {data.dashboard.results.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.dashboard.results.map((result) => (
              <article key={result.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cj-red)]">{result.sessionLabel}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{result.formationTitle}</h3>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass(result.overallRating >= 4 ? 'validated' : 'pending')}`}>
                    {ratingLabel(result.overallRating)}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Commentaire global</p>
                    <p className="mt-1">{result.overallComment || 'Aucun commentaire global.'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Soumis le</p>
                    <p className="mt-1">{formatPortalDate(result.submittedAt)}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><strong className="text-slate-900">Contenu:</strong> {result.contentRating ?? '-'}/5</div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><strong className="text-slate-900">Formateur:</strong> {result.instructorRating ?? '-'}/5</div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><strong className="text-slate-900">Supports:</strong> {result.materialRating ?? '-'}/5</div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><strong className="text-slate-900">Organisation:</strong> {result.organizationRating ?? '-'}/5</div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><strong className="text-slate-900">Conditions:</strong> {result.facilityRating ?? '-'}/5</div>
                </div>
                {(result.strengths || result.improvements || result.recommendations) ? (
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    {result.strengths ? <p><strong className="text-slate-900">Points forts:</strong> {result.strengths}</p> : null}
                    {result.improvements ? <p><strong className="text-slate-900">Axes d'amelioration:</strong> {result.improvements}</p> : null}
                    {result.recommendations ? <p><strong className="text-slate-900">Recommandations:</strong> {result.recommendations}</p> : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <StudentEmptyState
            title="Aucune evaluation disponible"
            description="Les resultats apparaitront ici des qu'une evaluation sera soumise pour votre inscription."
          />
        )}
      </StudentSectionCard>

      <StudentSectionCard
        eyebrow="Presence"
        title="Historique des presences"
        description="Le suivi des presences aide a calculer votre eligibilite au certificat et l'assiduite de votre parcours."
        icon={ShieldCheck}
      >
        {data.dashboard.attendance.length ? (
          <div className="space-y-3">
            {data.dashboard.attendance.slice(0, 12).map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm shadow-sm">
                <div>
                  <p className="font-semibold text-slate-950">{entry.formationTitle}</p>
                  <p className="text-slate-500">{entry.sessionLabel} · {formatPortalDate(entry.date)}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass(entry.status)}`}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <StudentEmptyState
            title="Aucune presence enregistree"
            description="Les feuilles de presence valides par l'administration s'afficheront ici automatiquement."
          />
        )}
      </StudentSectionCard>
    </StudentPortalPageShell>
  )
}
