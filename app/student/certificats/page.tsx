'use client'

import Link from 'next/link'
import {
  Award,
  BadgeCheck,
  Download,
  ShieldCheck,
} from "lucide-react";
import {
  StudentEmptyState,
  StudentSectionCard,
  type StudentMetric,
} from '@/components/ui/student-space'
import { StudentPortalError, StudentPortalLoading, StudentPortalPageShell } from '@/components/student-portal/StudentPortalPageShell'
import { useStudentDashboardData } from '@/components/student-portal/useStudentDashboard'
import { formatPortalDate, statusToneClass } from '@/lib/student-portal/format'

export default function StudentCertificatesPage() {
  const { data, loading, error } = useStudentDashboardData()

  if (loading) {
    return <StudentPortalLoading title="Certificats" description="Consultez vos certificats emis et l'etat de vos conditions de validation." icon={Award} />
  }

  if (!data || error) {
    return <StudentPortalError title="Certificats" description="Consultez vos certificats emis et l'etat de vos conditions de validation." icon={Award} error={error} />
  }

  const eligibility = data.dashboard.certificateEligibility
  const conditionsMet = [eligibility.projectValidated, eligibility.attendanceValidated].filter(Boolean).length
  const metrics: StudentMetric[] = [
    {
      label: 'Certificats',
      value: data.dashboard.certificates.length,
      helper: 'Documents deja emis et consultables.',
      icon: Award,
      accent: 'from-[#002D72] to-[#0C4DA2]',
    },
    {
      label: 'Valides',
      value: data.dashboard.certificates.filter((item) => item.verified).length,
      helper: 'Certificats deja verifies dans le systeme.',
      icon: BadgeCheck,
      accent: 'from-[#0C4DA2] to-[#4F8FE8]',
    },
    {
      label: 'Conditions',
      value: `${conditionsMet}/2`,
      helper: 'Projet valide et presence suffisante.',
      icon: ShieldCheck,
      accent: 'from-[#E30613] to-[#F16C78]',
    },
    {
      label: 'Eligibilite',
      value: eligibility.eligible ? 'Oui' : 'Non',
      helper: 'Etat actuel avant emission du certificat.',
      icon: Award,
      accent: 'from-[#001737] to-[#002D72]',
    },
  ]

  return (
    <StudentPortalPageShell
      title="Mes certificats"
      description="Suivez les conditions de validation de votre parcours et telechargez vos certificats disponibles."
      icon={Award}
      metrics={metrics}
    >
      {/* Conditions de delivrance */}
      <StudentSectionCard
        eyebrow="Validation"
        title="Conditions de delivrance"
        description="Le certificat est delivre une fois les criteres pedagogiques valides."
        icon={ShieldCheck}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: 'Travail valide', value: eligibility.projectValidated },
            { label: 'Presence suffisante', value: eligibility.attendanceValidated },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass(item.value ? 'validated' : 'pending')}`}>
                  {item.value ? 'Valide' : 'En cours'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {eligibility.attendanceTracked && eligibility.attendanceRate !== null ? (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              Taux de presence&nbsp;: {eligibility.attendanceRate}%
            </p>
            <p className="mt-1 text-xs text-slate-500">Seuil requis&nbsp;: 80%</p>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
              <div
                className={`h-2 rounded-full transition-all ${eligibility.attendanceValidated ? 'bg-emerald-500' : 'bg-orange-400'}`}
                style={{ width: `${Math.min(eligibility.attendanceRate, 100)}%` }}
              />
            </div>
          </div>
        ) : null}
      </StudentSectionCard>

      {/* Certificats emis */}
      <StudentSectionCard
        eyebrow="Archives"
        title="Documents emis"
        description="Chaque certificat emis est reference ici avec son code et sa date d'emission."
        icon={Award}
      >
        {data.dashboard.certificates.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.dashboard.certificates.map((certificate) => (
              <article key={certificate.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cj-red)]">{certificate.type}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                      {certificate.title || certificate.formation?.title || 'Certificat'}
                    </h3>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass(certificate.verified ? 'verified' : 'pending')}`}>
                    {certificate.verified ? 'Verifie' : 'A verifier'}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p><strong className="text-slate-900">Titulaire&nbsp;:</strong> {certificate.holderName}</p>
                  <p><strong className="text-slate-900">Code&nbsp;:</strong> {certificate.code}</p>
                  <p><strong className="text-slate-900">Emission&nbsp;:</strong> {formatPortalDate(certificate.issuedAt)}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {certificate.fileUrl ? (
                    <a
                      href={certificate.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-[var(--cj-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--cj-blue-700)]"
                    >
                      <Download className="h-4 w-4" />
                      Telecharger
                    </a>
                  ) : null}
                  <Link
                    href={`/fr/certificates?code=${certificate.code}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[var(--cj-blue)]"
                  >
                    Voir la verification
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <StudentEmptyState
            title="Aucun certificat disponible"
            description="Votre certificat apparaitra ici apres validation de la session et emission par l'administration."
          />
        )}
      </StudentSectionCard>
    </StudentPortalPageShell>
  )
}
