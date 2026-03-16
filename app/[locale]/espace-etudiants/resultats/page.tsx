'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Award, CheckCircle2, FileBarChart2, GraduationCap, MessageSquare, Star } from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  type StudentMetric,
} from '@/components/ui/student-space'

interface Evaluation {
  id: number
  overallRating: number
  overallComment: string | null
  contentRating: number | null
  instructorRating: number | null
  materialRating: number | null
  submittedAt: string
  formation: {
    id: number
    title: string
  }
  enrollment: {
    id: number
    status: string
  }
}

interface Certificate {
  id: number
  code: string
  type: string
  holderName: string
  issuedAt: string
  verified: boolean
  formation: {
    id: number
    title: string
  } | null
}

function certificateTypeLabel(type: string) {
  const labels: Record<string, string> = {
    completion: 'Certificat de completion',
    attendance: 'Certificat de presence',
    excellence: "Certificat d'excellence",
  }
  return labels[type] || type
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={`${rating}-${index}`}
      className={`h-4 w-4 ${index < rating ? 'fill-[var(--cj-red)] text-[var(--cj-red)]' : 'text-slate-300'}`}
    />
  ))
}

export default function ResultatsPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const metrics = useMemo<StudentMetric[]>(() => {
    const averageRating = evaluations.length
      ? Math.round((evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / evaluations.length) * 10) / 10
      : 0
    const verifiedCount = certificates.filter((certificate) => certificate.verified).length

    return [
      {
        label: 'Evaluations',
        value: evaluations.length,
        helper: 'Avis et notes enregistres sur vos parcours.',
        icon: FileBarChart2,
        accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
      },
      {
        label: 'Note moyenne',
        value: evaluations.length ? `${averageRating}/5` : '0/5',
        helper: 'Moyenne globale des notes visibles.',
        icon: Star,
        accent: 'from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]',
      },
      {
        label: 'Certificats',
        value: certificates.length,
        helper: 'Documents emis dans votre parcours.',
        icon: Award,
        accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
      },
      {
        label: 'Verifies',
        value: verifiedCount,
        helper: 'Certificats deja valides publiquement.',
        icon: CheckCircle2,
        accent: 'from-[#1d4ed8] via-[#1e3a8a] to-[#020617]',
      },
    ]
  }, [certificates, evaluations])

  const fetchData = async () => {
    setLoading(true)
    try {
      const evalResponse = await fetch('/api/evaluations')
      const evalData = await evalResponse.json()
      setEvaluations(evalData)

      const certResponse = await fetch('/api/certificates')
      const certData = await certResponse.json()
      setCertificates(certData)
    } catch (error) {
      console.error('Erreur lors du chargement des donnees:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Resultats et certifications"
        description="Chargement de vos evaluations, de vos notes et des certificats rattaches a votre parcours."
        icon={FileBarChart2}
      >
        <StudentSectionCard
          eyebrow="Resultats"
          title="Preparation des donnees"
          description="Nous recuperons vos evaluations et vos certificats dans une vue unique."
          icon={GraduationCap}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Chargement des resultats...
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace etudiant"
      title="Resultats et certifications"
      description="Consultez vos evaluations, retrouvez les commentaires recueillis sur vos formations et accedez a vos certificats depuis une vue centralisee."
      icon={FileBarChart2}
      metrics={metrics}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <StudentSectionCard
          eyebrow="Certificats"
          title="Documents disponibles"
          description="Accedez a vos certificats, verifiez leur statut et ouvrez rapidement leur vue publique."
          icon={Award}
        >
          {certificates.length === 0 ? (
            <StudentEmptyState
              title="Aucun certificat disponible"
              description="Vos certificats apparaitront ici des leur emission. Vous pourrez ensuite les consulter et les verifier publiquement."
              action={
                <Link href={`/${locale}/certificates`} className={studentMutedButtonClassName}>
                  Verifier un certificat
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{certificate.formation?.title || 'Certificat'}</p>
                      <p className="mt-1 text-sm text-slate-600">{certificateTypeLabel(certificate.type)}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">Code {certificate.code}</p>
                    </div>
                    {certificate.verified ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Verifie
                      </span>
                    ) : (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[var(--cj-blue)]">
                        A verifier
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                    <Link href={`/${locale}/certificates?code=${certificate.code}`} className={studentPrimaryButtonClassName}>
                      Voir le certificat
                    </Link>
                    <Link href={`/${locale}/espace-etudiants/mes-certificats`} className={studentMutedButtonClassName}>
                      Tous mes certificats
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </StudentSectionCard>

        <StudentSectionCard
          eyebrow="Analyse"
          title="Lecture rapide des retours"
          description="Un point d'entree simple pour comprendre votre niveau de satisfaction moyen et le ressenti global."
          icon={MessageSquare}
        >
          <div className="space-y-3">
            <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
              <p className="text-sm font-semibold text-slate-950">Moyenne generale</p>
              <div className="mt-3 flex items-center gap-3">
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {evaluations.length
                    ? Math.round((evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / evaluations.length) * 10) / 10
                    : 0}
                  /5
                </p>
                <div className="flex items-center gap-1">
                  {renderStars(
                    evaluations.length
                      ? Math.round(evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / evaluations.length)
                      : 0,
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]">
              <p className="text-sm font-semibold text-slate-950">Acces directs</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/${locale}/espace-etudiants/mes-certificats`} className={studentMutedButtonClassName}>
                  Mes certificats
                </Link>
                <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
                  Retour au dashboard
                </Link>
              </div>
            </div>
          </div>
        </StudentSectionCard>
      </div>

      <StudentSectionCard
        eyebrow="Evaluations"
        title="Detail des evaluations"
        description="Consultez les notes attribuees aux differentes dimensions de vos formations et les commentaires associes."
        icon={GraduationCap}
      >
        {evaluations.length === 0 ? (
          <StudentEmptyState
            title="Aucune evaluation disponible"
            description="Vos evaluations apparaitront ici des qu'elles seront enregistrees pour vos formations."
          />
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(0,45,114,0.35)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">{evaluation.formation.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Evalue le {new Date(evaluation.submittedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-blue-100 bg-blue-50 px-4 py-3 text-center">
                    <p className="text-2xl font-semibold tracking-tight text-slate-950">{evaluation.overallRating}/5</p>
                    <div className="mt-2 flex items-center gap-1">{renderStars(evaluation.overallRating)}</div>
                  </div>
                </div>

                {evaluation.overallComment ? (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm leading-6 text-slate-700">
                    {evaluation.overallComment}
                  </div>
                ) : null}

                {(evaluation.contentRating || evaluation.instructorRating || evaluation.materialRating) ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-3 border-t border-slate-200 pt-4">
                    {evaluation.contentRating ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contenu</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{evaluation.contentRating}/5</p>
                      </div>
                    ) : null}
                    {evaluation.instructorRating ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Formateur</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{evaluation.instructorRating}/5</p>
                      </div>
                    ) : null}
                    {evaluation.materialRating ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Supports</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{evaluation.materialRating}/5</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </StudentSectionCard>
    </StudentPageShell>
  )
}
