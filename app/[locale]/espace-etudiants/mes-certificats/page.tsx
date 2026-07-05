'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Award, CalendarDays, CheckCircle2, GraduationCap, ShieldCheck } from 'lucide-react'
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
  issuedAt: string
  verified: boolean
  formation: {
    id: number
    title: string
  } | null
  session: {
    id: number
    startDate: string
    endDate: string
  } | null
}

export default function MesCertificatsPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const metrics = useMemo<StudentMetric[]>(() => {
    const verifiedCount = certificates.filter((certificate) => certificate.verified).length
    const formationsCount = new Set(certificates.map((certificate) => certificate.formation?.id).filter(Boolean)).size

    return [
      {
        label: 'Certificats',
        value: certificates.length,
        helper: 'Documents emis dans votre espace.',
        icon: Award,
        accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
      },
      {
        label: 'Verifies',
        value: verifiedCount,
        helper: 'Certificats deja confirmes.',
        icon: CheckCircle2,
        accent: 'from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]',
      },
      {
        label: 'Formations',
        value: formationsCount,
        helper: 'Parcours representes dans vos documents.',
        icon: GraduationCap,
        accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
      },
    ]
  }, [certificates])

  const fetchCertificates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/certificates')
      const data = await response.json()
      setCertificates(data)
    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      completion: 'Certificat de completion',
      attendance: 'Certificat de presence',
      excellence: "Certificat d'excellence",
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Mes certificats"
        description="Chargement de vos documents, de leurs informations d'emission et de leurs liens de verification."
        icon={Award}
      >
        <StudentSectionCard
          eyebrow="Certificats"
          title="Preparation des documents"
          description="Nous recuperons vos certificats et leurs metadonnees de verification."
          icon={ShieldCheck}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Chargement de vos certificats...
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace etudiant"
      title="Mes certificats"
      description="Consultez vos certificats disponibles, retrouvez leur code de verification et accedez rapidement aux pages publiques de controle."
      icon={Award}
      metrics={metrics}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <StudentSectionCard
          eyebrow="Verification"
          title="Documents et controle d'authenticite"
          description="Chaque certificat conserve un code unique de verification pour confirmer sa validite publique."
          icon={ShieldCheck}
        >
          <div className="grid gap-4">
            <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
              <p className="text-sm font-semibold text-slate-950">Comment utiliser votre certificat</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>Utilisez le bouton "Voir le certificat" pour ouvrir sa vue publique.</li>
                <li>Partagez le code unique pour permettre une verification rapide.</li>
                <li>Conservez le lien de verification pour vos candidatures ou dossiers administratifs.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cj-red)]">Navigation utile</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/${locale}/certificates`} className={studentMutedButtonClassName}>
                  Verifier un certificat
                </Link>
                <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
                  Retour au dashboard
                </Link>
              </div>
            </div>
          </div>
        </StudentSectionCard>

        <StudentSectionCard
          eyebrow="Synthese"
          title="Vue rapide sur vos documents"
          description="Un resume simple de vos certificats valides et des periodes de session associees."
          icon={CalendarDays}
        >
          <div className="space-y-3">
            {certificates.slice(0, 3).map((certificate) => (
              <div key={certificate.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{certificate.formation?.title || 'Certificat'}</p>
                    <p className="mt-1 text-sm text-slate-600">{getTypeLabel(certificate.type)}</p>
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
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Code {certificate.code}</p>
              </div>
            ))}
            {!certificates.length ? (
              <StudentEmptyState
                title="Aucun certificat pour le moment"
                description="Vos certificats apparaitront ici des qu'ils seront emis et lies a votre compte."
              />
            ) : null}
          </div>
        </StudentSectionCard>
      </div>

      <StudentSectionCard
        eyebrow="Documents"
        title="Collection de certificats"
        description="Chaque carte donne acces a la visualisation publique et aux informations essentielles de verification."
        icon={Award}
      >
        {certificates.length === 0 ? (
          <StudentEmptyState
            title="Aucun certificat disponible"
            description="Lorsque vos certifications seront generees, elles apparaitront ici avec leur code et leur lien public de verification."
            action={
              <Link href={`/${locale}/espace-etudiants`} className={studentPrimaryButtonClassName}>
                Retour a l'espace etudiant
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(0,45,114,0.35)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-950">{certificate.formation?.title || 'Certificat'}</p>
                    <p className="mt-2 text-sm text-slate-600">{getTypeLabel(certificate.type)}</p>
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

                <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">Titulaire:</span> {certificate.holderName}
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">Emis le:</span> <FormattedDate date={certificate.issuedAt} />
                  </p>
                  {certificate.session ? (
                    <p className="mt-2">
                      <span className="font-semibold text-slate-900">Session:</span>{' '}
                      <FormattedDate date={certificate.session.startDate} /> - <FormattedDate date={certificate.session.endDate} />
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                  <Link href={`/${locale}/certificates?code=${certificate.code}`} className={studentPrimaryButtonClassName}>
                    Voir le certificat
                  </Link>
                  <Link href={`/${locale}/certificates?code=${certificate.code}`} className={studentMutedButtonClassName}>
                    Verifier
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
