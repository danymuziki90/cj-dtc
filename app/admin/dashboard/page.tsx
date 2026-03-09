'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

type DashboardStats = {
  sessions: number
  students: number
  availableSpots: number
  paymentsConfirmed: number
  paymentsPending: number
  submissions: number
  submissionsPending: number
  submissionsValidated: number
  certificates: number
  news: number
}

type SessionTypeBreakdown = {
  MRH: number
  IOP: number
  CONFERENCE_FORUM: number
}

type SubmissionRow = {
  id: string
  title: string
  status: string
  student: {
    firstName: string
    lastName: string
  }
  createdAt: string
}

function statusClassName(status: string) {
  const normalized = status.toLowerCase()

  if (normalized.includes('valid')) return 'bg-blue-50 text-blue-700 ring-blue-200'
  if (normalized.includes('corrig') || normalized.includes('review')) return 'bg-blue-50 text-blue-700 ring-blue-200'
  if (normalized.includes('rejet') || normalized.includes('fail')) return 'bg-red-50 text-red-700 ring-red-200'

  return 'bg-red-50 text-red-700 ring-red-200'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    sessions: 0,
    students: 0,
    availableSpots: 0,
    paymentsConfirmed: 0,
    paymentsPending: 0,
    submissions: 0,
    submissionsPending: 0,
    submissionsValidated: 0,
    certificates: 0,
    news: 0,
  })
  const [sessionTypes, setSessionTypes] = useState<SessionTypeBreakdown>({
    MRH: 0,
    IOP: 0,
    CONFERENCE_FORUM: 0,
  })
  const [latestSubmissions, setLatestSubmissions] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [overviewRes, submissionsRes] = await Promise.all([
          fetch('/api/admin/system/overview'),
          fetch('/api/admin/system/submissions'),
        ])

        if ([overviewRes, submissionsRes].some((res) => !res.ok)) return

        const [overviewData, submissionsData] = await Promise.all([overviewRes.json(), submissionsRes.json()])

        setStats({
          sessions: overviewData.totals?.sessions || 0,
          students: overviewData.totals?.students || 0,
          availableSpots: overviewData.totals?.availableSpots || 0,
          paymentsConfirmed: overviewData.totals?.paymentsConfirmed || 0,
          paymentsPending: overviewData.totals?.paymentsPending || 0,
          submissions: overviewData.totals?.submissions || 0,
          submissionsPending: overviewData.totals?.submissionsPending || 0,
          submissionsValidated: overviewData.totals?.submissionsValidated || 0,
          certificates: overviewData.totals?.certificates || 0,
          news: overviewData.totals?.news || 0,
        })
        setSessionTypes(overviewData.sessionTypes || { MRH: 0, IOP: 0, CONFERENCE_FORUM: 0 })

        setLatestSubmissions((submissionsData.submissions || []).slice(0, 6))
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const cards = [
    {
      label: 'Sessions',
      value: stats.sessions,
      tone: 'from-blue-500/20 to-blue-100',
      ring: 'ring-blue-200',
      text: 'text-blue-900',
    },
    {
      label: 'Etudiants',
      value: stats.students,
      tone: 'from-blue-500/20 to-blue-100',
      ring: 'ring-blue-200',
      text: 'text-blue-900',
    },
    {
      label: 'Paiements confirmes',
      value: stats.paymentsConfirmed,
      tone: 'from-blue-500/20 to-blue-100',
      ring: 'ring-blue-200',
      text: 'text-blue-900',
    },
    {
      label: 'Paiements pending',
      value: stats.paymentsPending,
      tone: 'from-red-500/20 to-red-100',
      ring: 'ring-red-200',
      text: 'text-red-900',
    },
    {
      label: 'Travaux soumis',
      value: stats.submissions,
      tone: 'from-slate-500/20 to-slate-100',
      ring: 'ring-slate-200',
      text: 'text-slate-900',
    },
    {
      label: 'Certificats',
      value: stats.certificates,
      tone: 'from-blue-500/20 to-blue-100',
      ring: 'ring-blue-200',
      text: 'text-blue-900',
    },
    {
      label: 'Actualités',
      value: stats.news,
      tone: 'from-red-500/20 to-red-100',
      ring: 'ring-red-200',
      text: 'text-red-900',
    },
    {
      label: 'Places disponibles',
      value: stats.availableSpots,
      tone: 'from-blue-500/20 to-blue-100',
      ring: 'ring-blue-200',
      text: 'text-blue-900',
    },
  ]

  return (
    <AdminShell title="Dashboard Admin">
      <section className="mb-6 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-lg shadow-slate-900/20 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Vue d'ensemble</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Pilotage global de la plateforme</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Surveillez la charge des sessions, les inscriptions et la progression des travaux depuis un tableau unique.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">Mise à jour en temps réel</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">Suivi des paiements</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">Activite recente</span>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className={`rounded-2xl bg-gradient-to-br ${card.tone} p-4 ring-1 ${card.ring} shadow-sm md:p-5`}
          >
            <p className="text-sm font-medium text-slate-600">{card.label}</p>
            <p className={`mt-3 text-4xl font-bold tracking-tight ${card.text}`}>{card.value}</p>
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Sessions par type</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            MRH {sessionTypes.MRH}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            IOP {sessionTypes.IOP}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Conference/Forum {sessionTypes.CONFERENCE_FORUM}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          Travaux: {stats.submissionsValidated} valides, {stats.submissionsPending} en attente.
        </p>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 md:px-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Derniers travaux</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 md:px-5">Etudiant</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 md:px-5">Travail</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 md:px-5">Statut</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 md:px-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {latestSubmissions.map((submission) => (
                <tr key={submission.id} className="transition hover:bg-slate-50/80">
                  <td className="px-4 py-3 text-slate-900 md:px-5">
                    {submission.student.firstName} {submission.student.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-700 md:px-5">{submission.title}</td>
                  <td className="px-4 py-3 md:px-5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClassName(submission.status)}`}
                    >
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 md:px-5">{formatDate(submission.createdAt)}</td>
                </tr>
              ))}

              {!loading && latestSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-9 text-center text-sm text-slate-500">
                    Aucune soumission recente.
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-9 text-center text-sm text-slate-500">
                    Chargement des donnees...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  )
}

