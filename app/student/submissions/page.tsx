'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Submission = {
  id: string
  title: string
  status: string
  fileUrl: string
  createdAt: string
}

export default function StudentSubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadSubmissions() {
    const response = await fetch('/api/student/system/submissions')
    if (response.status === 401) {
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
      setError('Please choose a file.')
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
      setError(data.error || 'Upload failed.')
      setLoading(false)
      return
    }

    setTitle('')
    setFile(null)
    setLoading(false)
    await loadSubmissions()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">My Submissions</h1>
          <Link href="/student/dashboard" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Upload assignment</h2>

          {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

          <div className="space-y-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Submission title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <p className="text-xs text-gray-500">Allowed formats: pdf, doc, docx, txt, zip (max 15MB)</p>
          </div>

          <button type="submit" disabled={loading} className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-4 py-3 text-gray-900">{submission.title}</td>
                  <td className="px-4 py-3 text-gray-700">{submission.status}</td>
                  <td className="px-4 py-3 text-gray-700">{new Date(submission.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Open
                    </a>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No submissions yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
