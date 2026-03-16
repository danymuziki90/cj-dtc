'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BadgeCheck, BookOpen, CalendarDays, GraduationCap, MapPin, MonitorSmartphone, Wallet } from 'lucide-react'
import { FormattedDate } from '@/components/FormattedDate'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  studentStatusClass,
  type StudentMetric,
} from '@/components/ui/student-space'

interface Enrollment {
  id: number
  status: string
  startDate: string
  paymentStatus: string
  totalAmount: number
  paidAmount: number
  formation: {
    id: number
    title: string
    slug: string
    description: string
  }
  session: {
    id: number
    startDate: string
    endDate: string
    location: string
    format: string
  } | null
}

function paymentStatusClass(status: string) {
  const value = String(status || '').toLowerCase()
  if (value === 'paid') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (value === 'partial') return 'border-blue-200 bg-blue-50 text-[var(--cj-blue)]'
  if (value === 'unpaid') return 'border-red-200 bg-red-50 text-red-700'
  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    unpaid: 'Non paye',
    partial: 'Partiel',
    paid: 'Paye',
  }
  return labels[status] || status
}

function enrollmentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Accepte',
    confirmed: 'Confirme',
    rejected: 'Rejete',
    cancelled: 'Annule',
    completed: 'Termine',
  }
  return labels[status] || status
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function MesFormationsPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const metrics = useMemo<StudentMetric[]>(() => {
    const completedCount = enrollments.filter((item) => item.status === 'completed').length
    const paidCount = enrollments.filter((item) => item.paymentStatus === 'paid').length
    const activeSessions = enrollments.filter((item) => item.session).length

    return [
      {
        label: 'Formations',
        value: enrollments.length,
        helper: 'Parcours actuellement visibles dans votre compte.',
        icon: GraduationCap,
        accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
      },
      {
        label: 'Sessions liees',
        value: activeSessions,
        helper: 'Inscriptions rattachees a une session planifiee.',
        icon: CalendarDays,
        accent: 'from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]',
      },
      {
        label: 'Paiements valides',
        value: paidCount,
        helper: 'Parcours avec reglement complet enregistre.',
        icon: Wallet,
        accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
      },
      {
        label: 'Formations terminees',
        value: completedCount,
        helper: 'Programmes deja finalises ou certificables.',
        icon: BadgeCheck,
        accent: 'from-[#1d4ed8] via-[#1e3a8a] to-[#020617]',
      },
    ]
  }, [enrollments])

  const fetchEnrollments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/enrollments')
      const data = await response.json()
      setEnrollments(data)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Mes formations"
        description="Chargement de vos inscriptions, de vos sessions et de vos informations de paiement."
        icon={GraduationCap}
      >
        <StudentSectionCard
          eyebrow="Parcours"
          title="Preparation des formations"
          description="Nous recuperons vos inscriptions, vos sessions liees et vos statuts de progression."
          icon={BookOpen}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Chargement de vos formations...
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace etudiant"
      title="Mes formations"
      description="Consultez vos inscriptions, suivez l'avancement de vos paiements et retrouvez les liens utiles vers vos sessions et vos supports."
      icon={GraduationCap}
      metrics={metrics}
      actions={
        <Link href={`/${locale}/programmes`} className={studentPrimaryButtonClassName}>
          Explorer les sessions
        </Link>
      }
    >
      <StudentSectionCard
        eyebrow="Parcours"
        title="Vue d'ensemble de vos formations"
        description="Chaque carte rassemble le statut d'inscription, l'etat du paiement, le calendrier et les acces utiles pour continuer votre progression."
        icon={BookOpen}
      >
        {enrollments.length === 0 ? (
          <StudentEmptyState
            title="Aucune formation active"
            description="Vous n'etes inscrit a aucune formation pour le moment. Parcourez les sessions disponibles pour demarrer un nouveau parcours."
            action={
              <Link href={`/${locale}/programmes`} className={studentPrimaryButtonClassName}>
                Decouvrir les sessions
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const paymentProgress =
                enrollment.totalAmount > 0
                  ? Math.max(0, Math.min(100, Math.round((enrollment.paidAmount / enrollment.totalAmount) * 100)))
                  : 0

              return (
                <div
                  key={enrollment.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(0,45,114,0.35)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl">
                      <h3 className="text-xl font-semibold tracking-tight text-slate-950">{enrollment.formation.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{enrollment.formation.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${studentStatusClass(enrollment.status)}`}>
                        {enrollmentStatusLabel(enrollment.status)}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${paymentStatusClass(enrollment.paymentStatus)}`}>
                        {paymentStatusLabel(enrollment.paymentStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <CalendarDays className="h-4 w-4 text-[var(--cj-blue)]" />
                        Debut de parcours
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        <FormattedDate date={enrollment.startDate} />
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <MonitorSmartphone className="h-4 w-4 text-[var(--cj-blue)]" />
                        Session / format
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {enrollment.session
                          ? `${enrollment.session.format || 'Format non renseigne'}`
                          : 'Session a confirmer'}
                      </p>
                      {enrollment.session ? (
                        <p className="mt-1 text-xs text-slate-500">
                          <FormattedDate date={enrollment.session.startDate} /> - <FormattedDate date={enrollment.session.endDate} />
                        </p>
                      ) : null}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <MapPin className="h-4 w-4 text-[var(--cj-blue)]" />
                        Lieu
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {enrollment.session?.location || 'A preciser'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <Wallet className="h-4 w-4 text-[var(--cj-blue)]" />
                        Paiement
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {formatCurrency(enrollment.paidAmount)} / {formatCurrency(enrollment.totalAmount)}
                      </p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,var(--cj-red)_0%,var(--cj-blue)_100%)]"
                          style={{ width: `${paymentProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                    <Link href={`/${locale}/formations/${enrollment.formation.slug}`} className={studentMutedButtonClassName}>
                      Voir les details
                    </Link>
                    <Link href={`/${locale}/espace-etudiants/supports?formationId=${enrollment.formation.id}`} className={studentMutedButtonClassName}>
                      Supports de cours
                    </Link>
                    {enrollment.status === 'completed' ? (
                      <Link href={`/${locale}/espace-etudiants/resultats`} className={studentPrimaryButtonClassName}>
                        Voir les resultats
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </StudentSectionCard>
    </StudentPageShell>
  )
}
