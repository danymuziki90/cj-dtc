'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Award,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Search,
  Download,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react'
import { FormattedDate } from '@/components/FormattedDate'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  type StudentMetric,
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

  const metrics = useMemo<StudentMetric[]>(() => {
    const activeCount = certificates.filter((c) => c.status === 'actif').length
    const formationsCount = new Set(certificates.map((c) => c.formationTitle).filter(Boolean)).size

    return [
      {
        label: 'Certificats',
        value: activeCount,
        helper: 'Documents actifs liés à votre compte.',
        icon: Award,
        accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
      },
      {
        label: 'Formations',
        value: formationsCount,
        helper: 'Parcours certifiés représentés.',
        icon: GraduationCap,
        accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
      },
    ]
  }, [certificates])

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
    const labels: Record<string, string> = {
      completion: 'Certificat de réussite',
      attendance: 'Certificat de présence',
      excellence: "Certificat d'excellence",
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace étudiant"
        title="Mes certificats"
        description="Chargement de vos documents et de vos informations d'émission..."
        icon={Award}
      >
        <StudentSectionCard
          eyebrow="Certificats"
          title="Préparation des documents"
          description="Nous récupérons vos certificats et leurs métadonnées de vérification."
          icon={ShieldCheck}
        >
          <div className="flex justify-center items-center py-20 text-slate-500 text-sm">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span>Récupération de vos certificats...</span>
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace étudiant"
      title="Mes certificats"
      description="Consultez vos certificats officiels disponibles, téléchargez-les au format PDF de manière sécurisée et retrouvez un certificat spécifique grâce à son numéro d'identification."
      icon={Award}
      metrics={metrics}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Search by ID form (Section 3 & 6) */}
        <StudentSectionCard
          eyebrow="Recherche"
          title="Retrouver un certificat par ID"
          description="Saisissez l'ID Number unique fourni par l'administration pour retrouver et télécharger son document PDF."
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
                className={`${studentPrimaryButtonClassName} min-w-[120px]`}
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
                  onClick={() => setSearchResult(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Certificat Retrouvé !</p>
                
                <h4 className="font-bold text-slate-900 text-lg mt-2">{searchResult.formationTitle}</h4>
                <p className="text-xs text-slate-500 mt-1">{getTypeLabel(searchResult.type)}</p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <p><strong className="text-slate-800">Titulaire:</strong> {searchResult.holderName}</p>
                  <p><strong className="text-slate-800">Date de délivrance:</strong> <FormattedDate date={searchResult.issuedAt} /></p>
                  <p><strong className="text-slate-800">ID Number:</strong> {searchResult.code}</p>
                </div>

                <div className="mt-4 flex gap-3">
                  <a
                    href={`/api/certificates/download/${searchResult.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className={studentPrimaryButtonClassName}
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le PDF
                  </a>
                </div>
              </div>
            )}
          </form>
        </StudentSectionCard>

        {/* Verification explanation and dashboard navigation */}
        <StudentSectionCard
          eyebrow="Vérification"
          title="Authenticité & Sécurité"
          description="Chaque document officiel dispose d'un identifiant crypté unique qui garantit son authenticité publique."
          icon={ShieldCheck}
        >
          <div className="space-y-4">
            <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
              <p className="text-sm font-semibold text-slate-950">Accès Sécurisé</p>
              <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-600 list-disc pl-4">
                <li>Vos certificats sont stockés de manière sécurisée hors du répertoire public.</li>
                <li>Seul votre compte connecté ou les administrateurs peuvent y accéder.</li>
                <li>Toute modification par l'admin est instantanément répercutée ici.</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
                Dashboard Principal
              </Link>
            </div>
          </div>
        </StudentSectionCard>
      </div>

      {/* Certificates Collection Section */}
      <StudentSectionCard
        eyebrow="Liste des certificats"
        title="Mes Documents Académiques"
        description="Retrouvez ci-dessous la liste de tous vos certificats émis pour vos formations validées."
        icon={Award}
      >
        {certificates.length === 0 ? (
          <StudentEmptyState
            title="Aucun certificat disponible pour le moment"
            description="Dès qu'un certificat aura été délivré par l'administration, il apparaîtra ici avec son numéro unique de vérification et son option de téléchargement sécurisé."
            action={
              <Link href={`/${locale}/espace-etudiants`} className={studentPrimaryButtonClassName}>
                Retour au dashboard
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                      {getTypeLabel(certificate.type)}
                    </span>
                    <h3 className="text-lg font-bold text-slate-950 mt-1 leading-snug">
                      {certificate.formationTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 font-mono uppercase">
                      ID: {certificate.code}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 shrink-0">
                    Actif
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
                  <p>
                    <span className="font-semibold text-slate-800">Titulaire:</span> {certificate.holderName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Délivré le:</span> <FormattedDate date={certificate.issuedAt} />
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {certificate.fileUrl ? (
                    <a
                      href={`/api/certificates/download/${certificate.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className={studentPrimaryButtonClassName}
                    >
                      <Download className="h-4 w-4" />
                      Télécharger (PDF)
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Aucun PDF attaché</span>
                  )}
                  <Link
                    href={`/${locale}/certificates?code=${certificate.code}`}
                    target="_blank"
                    className={studentMutedButtonClassName}
                  >
                    Vérifier
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
