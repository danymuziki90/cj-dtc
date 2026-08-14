'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { publicMessages } from '@/lib/i18n/public-messages'
import {
  Award,
  ShieldCheck,
  Search,
  Download,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react'
import { FormattedDate } from '@/components/FormattedDate'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
} from '@/components/ui/student-space'

interface Certificate {
  id: number
  code: string
  type: string
  holderName: string
  status: string
  fileUrl: string | null
  issuedAt: string
  completionDate?: string
  formationTitle: string
  formationCategorie: string
}

export default function MesCertificatsPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'
  const tc = (publicMessages.espaceEtudiants.certificats as any)[locale] ?? publicMessages.espaceEtudiants.certificats.fr

  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  // ID Number Search state
  const [searchId, setSearchId] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResult, setSearchResult] = useState<Certificate | null>(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/student/certificates')
      if (!response.ok) throw new Error('Impossible de récupérer vos certificats.')
      const data = await response.json()
      setCertificates(data)
    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle searching a certificate by ID Number
  const handleSearchIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchId.trim()) return

    setSearching(true)
    setSearchError(null)
    setSearchResult(null)

    try {
      const response = await fetch(`/api/student/certificates/verify-id?code=${encodeURIComponent(searchId.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Certificat introuvable.')
      }

      setSearchResult(data)
    } catch (err: any) {
      setSearchError(err.message || 'Numéro de certificat invalide.')
    } finally {
      setSearching(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = tc.typeLabels
    return labels[type] || type
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow={tc.eyebrow}
        title={tc.title}
        description={tc.loadingDesc}
        icon={Award}
      >
        <div className="flex justify-center items-center py-20 text-slate-500 text-sm">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span>{tc.loading}</span>
        </div>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow={tc.eyebrow}
      title={tc.title}
      description={tc.description}
      icon={Award}
    >
      {/* Certificats — section principale */}
      <StudentSectionCard
        eyebrow={tc.docs}
        title={tc.certTitle}
        description={tc.certDesc}
        icon={Award}
      >
        {certificates.length === 0 ? (
          <StudentEmptyState
            title={tc.empty}
            description={tc.emptyDesc}
            action={
              <Link href={`/${locale}/espace-etudiants`} className={studentPrimaryButtonClassName}>
                {tc.backDashboard}
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                {/* En-tête certificat */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--cj-blue)]">
                      {getTypeLabel(certificate.type)}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-slate-900 leading-snug sm:text-base">
                      {certificate.formationTitle}
                    </h3>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    {tc.active}
                  </span>
                </div>

                {/* Détails */}
                <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5">
                  <p>
                    <span className="font-semibold text-slate-800">{tc.holder}</span>{' '}
                    {certificate.holderName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">{tc.issuedAt}</span>{' '}
                    <FormattedDate date={certificate.issuedAt} />
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 uppercase pt-0.5">
                    ID : {certificate.code}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {certificate.fileUrl ? (
                    <a
                      href={`/api/certificates/download/${certificate.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[var(--cj-blue)] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--cj-blue-700)] sm:flex-none sm:px-5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {tc.download}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic self-center">
                      {tc.noPdf}
                    </span>
                  )}
                  <Link
                    href={`/${locale}/certificates?code=${certificate.code}`}
                    target="_blank"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:text-[var(--cj-blue)] sm:flex-none sm:px-5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {tc.verify}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </StudentSectionCard>

      {/* Outils — recherche par ID + info sécurité */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recherche par ID */}
        <StudentSectionCard
          eyebrow={tc.searchSection}
          title={tc.searchTitle}
          description={tc.searchDesc}
          icon={Search}
        >
          <form onSubmit={handleSearchIdSubmit} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={tc.searchPlaceholder}
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={searching || !searchId.trim()}
                className={`${studentPrimaryButtonClassName} shrink-0 min-w-[100px] text-xs sm:text-sm`}
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : tc.searchBtn}
              </button>
            </div>

            {searchError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {searchResult && (
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-4 relative">
                <button
                  onClick={() => setSearchResult(null)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {tc.found}
                </p>
                <h4 className="font-bold text-slate-900 text-base mt-2 leading-snug">
                  {searchResult.formationTitle}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{getTypeLabel(searchResult.type)}</p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p><strong className="text-slate-800">{tc.holder}</strong> {searchResult.holderName}</p>
                  <p><strong className="text-slate-800">{tc.issuedAt}</strong> <FormattedDate date={searchResult.issuedAt} /></p>
                  <p className="font-mono text-[10px] text-slate-400 uppercase">ID : {searchResult.code}</p>
                </div>

                <div className="mt-4">
                  <a
                    href={`/api/certificates/download/${searchResult.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className={studentPrimaryButtonClassName}
                  >
                    <Download className="h-4 w-4" />
                    {tc.downloadPdf}
                  </a>
                </div>
              </div>
            )}
          </form>
        </StudentSectionCard>

        {/* Sécurité & Navigation */}
        <StudentSectionCard
          eyebrow={tc.securitySection}
          title={tc.securityTitle}
          description={tc.securityDesc}
          icon={ShieldCheck}
        >
          <div className="space-y-4">
            <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-4">
              <ul className="space-y-2 text-xs leading-6 text-slate-600 list-disc pl-4">
                {(tc.securityPoints as readonly string[]).map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
            <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
              {tc.backMain}
            </Link>
          </div>
        </StudentSectionCard>
      </div>
    </StudentPageShell>
  )
}
