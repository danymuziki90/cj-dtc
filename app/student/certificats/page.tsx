'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Award,
  BadgeCheck,
  Download,
  ShieldCheck,
  Search,
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import {
  StudentEmptyState,
  StudentSectionCard,
  type StudentMetric,
} from '@/components/ui/student-space'
import { StudentPortalError, StudentPortalLoading, StudentPortalPageShell } from '@/components/student-portal/StudentPortalPageShell'
import { useStudentDashboardData } from '@/components/student-portal/useStudentDashboard'
import { formatPortalDate, statusToneClass } from '@/lib/student-portal/format'

interface SearchResult {
  id: number
  code: string
  type: string
  holderName: string
  status: string
  fileUrl: string | null
  issuedAt: string
  formationTitle: string
  completionDate?: string
}

export default function StudentCertificatesPage() {
  const { data, loading, error, refresh } = useStudentDashboardData()

  // ID Number Search state
  const [searchId, setSearchId] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)

  const handleSearchIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchId.trim()) return

    setSearching(true)
    setSearchError(null)
    setSearchResult(null)

    try {
      const response = await fetch(`/api/student/certificates/verify-id?code=${encodeURIComponent(searchId.trim())}`)
      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.error || 'Certificat introuvable.')
      }

      setSearchResult(resData)
    } catch (err: any) {
      setSearchError(err.message || 'Numéro de certificat invalide.')
    } finally {
      setSearching(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      completion: 'Certificat de réussite',
      attendance: 'Certificat de présence',
      excellence: "Certificat d'excellence",
    }
    return labels[type] || type
  }

  if (loading) {
    return <StudentPortalLoading title="Certificats" description="Consultez vos certificats émis et téléchargez-les." icon={Award} />
  }

  if (!data || error) {
    return <StudentPortalError title="Certificats" description="Consultez vos certificats émis et téléchargez-les." icon={Award} error={error} />
  }

  const eligibility = data.dashboard.certificateEligibility
  const conditionsMet = [eligibility.projectValidated, eligibility.attendanceValidated].filter(Boolean).length
  const activeCertificates = data.dashboard.certificates || []

  const metrics: StudentMetric[] = [
    {
      label: 'Certificats',
      value: activeCertificates.length,
      helper: 'Documents émis et consultables.',
      icon: Award,
      accent: 'from-[#002D72] to-[#0C4DA2]',
    },
    {
      label: 'Validés',
      value: activeCertificates.filter((item) => item.verified).length,
      helper: 'Certificats validés dans le système.',
      icon: BadgeCheck,
      accent: 'from-[#0C4DA2] to-[#4F8FE8]',
    },
    {
      label: 'Conditions',
      value: `${conditionsMet}/2`,
      helper: 'Projet validé et présence suffisante.',
      icon: ShieldCheck,
      accent: 'from-[#E30613] to-[#F16C78]',
    },
  ]

  return (
    <StudentPortalPageShell
      title="Mes certificats"
      description="Suivez vos validations de parcours, gérez vos certificats officiels et téléchargez vos documents au format PDF."
      icon={Award}
      metrics={metrics}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Conditions de delivrance */}
        <StudentSectionCard
          eyebrow="Validation"
          title="Conditions de délivrance"
          description="Votre certificat officiel est émis dès que les critères ci-dessous sont au statut validé."
          icon={ShieldCheck}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: 'Travail validé', value: eligibility.projectValidated },
              { label: 'Présence suffisante', value: eligibility.attendanceValidated },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass(item.value ? 'validated' : 'pending')}`}>
                    {item.value ? 'Validé' : 'En cours'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {eligibility.attendanceTracked && eligibility.attendanceRate !== null ? (
            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Taux de présence&nbsp;: {eligibility.attendanceRate}%
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

        {/* Retrieve by ID Number Form (Section 3 & 6) */}
        <StudentSectionCard
          eyebrow="ID Number"
          title="Récupération par numéro d'ID"
          description="Saisissez le numéro d'ID unique pour retrouver et télécharger le PDF sécurisé correspondant."
          icon={Search}
        >
          <form onSubmit={handleSearchIdSubmit} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: CERT-1-XXXX-XXXX"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={searching || !searchId.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 min-w-[120px]"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rechercher'}
              </button>
            </div>

            {searchError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {searchResult && (
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-5 relative animate-fade-in">
                <button
                  type="button"
                  onClick={() => setSearchResult(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Certificat trouvé !</p>
                <h4 className="font-bold text-slate-900 text-base mt-2">{searchResult.formationTitle}</h4>
                
                <div className="mt-4 space-y-1 text-xs text-slate-600">
                  <p><strong>Titulaire:</strong> {searchResult.holderName}</p>
                  <p><strong>Code:</strong> {searchResult.code}</p>
                  <p><strong>Émission:</strong> {formatPortalDate(searchResult.issuedAt)}</p>
                </div>

                <div className="mt-4 flex gap-3">
                  {searchResult.fileUrl && (
                    <a
                      href={`/api/certificates/download/${searchResult.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Download className="h-3 w-3" />
                      Télécharger
                    </a>
                  )}
                </div>
              </div>
            )}
          </form>
        </StudentSectionCard>
      </div>

      {/* Certificats emis */}
      <div className="mt-6">
        <StudentSectionCard
          eyebrow="Archives"
          title="Vos documents officiels"
          description="Chaque certificat émis est listé ici avec son identifiant unique de contrôle."
          icon={Award}
        >
          {activeCertificates.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {activeCertificates.map((certificate: any) => (
                <article key={certificate.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cj-red)]">{getTypeLabel(certificate.type)}</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                        {certificate.title || certificate.formation?.title || 'Certificat de formation'}
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Actif
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p><strong className="text-slate-900">Titulaire&nbsp;:</strong> {certificate.holderName}</p>
                    <p><strong className="text-slate-900">Code&nbsp;:</strong> {certificate.code}</p>
                    <p><strong className="text-slate-900">Date d'émission&nbsp;:</strong> {formatPortalDate(certificate.issuedAt)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {certificate.fileUrl ? (
                      <a
                        href={`/api/certificates/download/${certificate.id.replace('core-', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger PDF
                      </a>
                    ) : null}
                    <Link
                      href={`/fr/certificates?code=${certificate.code}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                    >
                      Vérifier
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <StudentEmptyState
              title="Aucun certificat disponible"
              description="Votre certificat officiel apparaîtra ici après validation de votre parcours par l'administration."
            />
          )}
        </StudentSectionCard>
      </div>
    </StudentPortalPageShell>
  )
}
