'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

type DashboardStats = {
  sessions: number
  news: number
  students: number
  submissions: number
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

  if (normalized.includes('valid')) return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (normalized.includes('corrig') || normalized.includes('review')) return 'bg-sky-50 text-sky-700 ring-sky-200'
  if (normalized.includes('rejet') || normalized.includes('fail')) return 'bg-rose-50 text-rose-700 ring-rose-200'

  return 'bg-amber-50 text-amber-700 ring-amber-200'
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
    news: 0,
    students: 0,
    submissions: 0,
  })
  const [latestSubmissions, setLatestSubmissions] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [sessionsRes, newsRes, studentsRes, submissionsRes] = await Promise.all([
          fetch('/api/admin/system/sessions'),
          fetch('/api/admin/system/news'),
          fetch('/api/admin/system/students'),
          fetch('/api/admin/system/submissions'),
        ])

        if ([sessionsRes, newsRes, studentsRes, submissionsRes].some((res) => !res.ok)) return

        const [sessionsData, newsData, studentsData, submissionsData] = await Promise.all([
          sessionsRes.json(),
          newsRes.json(),
          studentsRes.json(),
          submissionsRes.json(),
        ])

        setStats({
          sessions: sessionsData.sessions?.length || 0,
          news: newsData.news?.length || 0,
          students: studentsData.students?.length || 0,
          submissions: submissionsData.submissions?.length || 0,
        })

        setLatestSubmissions((submissionsData.submissions || []).slice(0, 6))
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const cards = [
    {
      label: 'Sessions actives',
      value: stats.sessions,
      tone: 'from-cyan-500/20 to-cyan-100',
      ring: 'ring-cyan-200',
      text: 'text-cyan-900',
    },
    {
      label: 'Publications',
      value: stats.news,
      tone: 'from-indigo-500/20 to-indigo-100',
      ring: 'ring-indigo-200',
      text: 'text-indigo-900',
    },
    {
      label: 'Etudiants',
      value: stats.students,
      tone: 'from-emerald-500/20 to-emerald-100',
      ring: 'ring-emerald-200',
      text: 'text-emerald-900',
    },
    {
      label: 'Travaux soumis',
      value: stats.submissions,
      tone: 'from-amber-500/20 to-amber-100',
      ring: 'ring-amber-200',
      text: 'text-amber-900',
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
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">Mise a jour en temps reel</span>
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
