'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

type Submission = {
  id: string
  title: string
  fileUrl: string
  status: 'pending' | 'approved' | 'rejected'
  feedback?: string | null
  reviewedAt?: string | null
  createdAt: string
  student: {
    firstName: string
    lastName: string
    email: string
    username: string | null
  }
  session: {
    id: string
    title: string
  } | null
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({})

  async function loadSubmissions() {
    const response = await fetch('/api/admin/system/submissions')
    if (!response.ok) return
    const data = await response.json()
    setSubmissions(data.submissions || [])
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function setStatus(id: string, status: Submission['status']) {
    await fetch(`/api/admin/system/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, feedback: feedbackDrafts[id] || undefined }),
    })
    await loadSubmissions()
  }

  return (
    <AdminShell title="Submissions">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Student</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Session</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">File</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">
                    {submission.student.firstName} {submission.student.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{submission.student.username || submission.student.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{submission.title}</td>
                <td className="px-4 py-3 text-gray-700">{submission.session?.title || 'N/A'}</td>
                <td className="px-4 py-3">
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      submission.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : submission.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {submission.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <textarea
                    value={feedbackDrafts[submission.id] ?? submission.feedback ?? ''}
                    onChange={(event) =>
                      setFeedbackDrafts((prev) => ({
                        ...prev,
                        [submission.id]: event.target.value,
                      }))
                    }
                    placeholder="Feedback (optionnel)"
                    className="mb-2 min-h-[66px] w-full rounded border border-gray-300 px-2 py-1 text-xs"
                  />
                  {submission.reviewedAt ? (
                    <p className="mb-2 text-xs text-gray-500">
                      Derniere mise a jour: {new Date(submission.reviewedAt).toLocaleString('fr-FR')}
                    </p>
                  ) : null}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStatus(submission.id, 'approved')}
                      className="rounded border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setStatus(submission.id, 'rejected')}
                      className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No submissions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
