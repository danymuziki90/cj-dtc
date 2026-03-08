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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    sessions: 0,
    news: 0,
    students: 0,
    submissions: 0,
  })
  const [latestSubmissions, setLatestSubmissions] = useState<SubmissionRow[]>([])

  useEffect(() => {
    async function loadStats() {
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

      setLatestSubmissions((submissionsData.submissions || []).slice(0, 5))
    }

    loadStats()
  }, [])

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Sessions</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.sessions}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">News</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.news}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Students</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.students}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Submissions</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.submissions}</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Student</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Submission</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {latestSubmissions.map((submission) => (
              <tr key={submission.id}>
                <td className="px-4 py-3 text-gray-900">
                  {submission.student.firstName} {submission.student.lastName}
                </td>
                <td className="px-4 py-3 text-gray-700">{submission.title}</td>
                <td className="px-4 py-3 text-gray-700">{submission.status}</td>
                <td className="px-4 py-3 text-gray-700">{new Date(submission.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {latestSubmissions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                  No recent submissions.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
