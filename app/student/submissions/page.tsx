'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Submission = {
  id: string
  title: string
  status: string
  statusLabel: 'en_attente_de_correction' | 'corrige' | 'valide'
  fileUrl: string
  createdAt: string
  updatedAt: string
  feedback: string | null
  reviewedAt: string | null
}

function statusBadge(statusLabel: Submission['statusLabel']) {
  if (statusLabel === 'valide') return 'bg-emerald-100 text-emerald-700'
  if (statusLabel === 'corrige') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-700'
}

function statusText(statusLabel: Submission['statusLabel']) {
  if (statusLabel === 'valide') return 'Valide'
  if (statusLabel === 'corrige') return 'Corrige'
  return 'En attente de correction'
}

export default function StudentSubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadSubmissions() {
    const response = await fetch('/api/student/system/submissions', { cache: 'no-store' })
    if (response.status === 401 || response.status === 403) {
      router.push('/student/login')
      return
    }
    if (!response.ok) return

    const data = await response.json()
    setSubmissions(data.submissions || [])
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!file) {
      setError('Veuillez selectionner un fichier PDF ou image.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('file', file)

    setLoading(true)
    const response = await fetch('/api/student/system/submissions', {
      method: 'POST',
      body: formData,
    })
    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Echec du televersement.')
      setLoading(false)
      return
    }

    setTitle('')
    setFile(null)
    setLoading(false)
    await loadSubmissions()
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Travaux et projets</h1>
            <p className="text-sm text-slate-500">Historique des soumissions et retours de correction.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/student/profile"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Mon compte
            </Link>
            <Link
              href="/student/dashboard"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Remettre un travail</h2>

          {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

          <div className="space-y-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Titre du projet"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
            <p className="text-xs text-slate-500">Formats autorises: PDF, JPG, PNG, WEBP (max 10MB).</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Televersement...' : 'Soumettre'}
          </button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Titre</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Date soumission</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Statut</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Feedback</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Fichier</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-900">{submission.title}</td>
                  <td className="px-4 py-3 text-slate-700">{new Date(submission.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge(submission.statusLabel)}`}>
                      {statusText(submission.statusLabel)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {submission.feedback ? (
                      <>
                        <p>{submission.feedback}</p>
                        {submission.reviewedAt ? (
                          <p className="text-xs text-slate-500">Mis a jour le {new Date(submission.reviewedAt).toLocaleString('fr-FR')}</p>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-slate-400">Aucun feedback pour le moment</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Ouvrir
                    </a>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    Aucun travail soumis pour le moment.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
