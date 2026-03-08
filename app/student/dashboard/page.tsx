'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type DashboardResponse = {
  student: {
    id: string
    name: string
    username?: string | null
    email: string
  }
  session: {
    id: string
    title: string
    description?: string | null
    startDate: string
    endDate: string
  } | null
  news: Array<{
    id: string
    title: string
    content: string
    createdAt: string
  }>
  submissions: Array<{
    id: string
    title: string
    status: string
    createdAt: string
  }>
  certificate: {
    id: string
    fileUrl: string
    title: string
  } | null
}

export default function StudentDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardResponse | null>(null)

  useEffect(() => {
    async function loadData() {
      const response = await fetch('/api/student/system/dashboard')
      if (response.status === 401) {
        router.push('/student/login')
        return
      }
      if (!response.ok) return

      const payload = await response.json()
      setData(payload)
    }

    loadData()
  }, [router])

  async function logout() {
    await fetch('/api/student/auth/logout', { method: 'POST' })
    router.push('/student/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-sm text-gray-500">{data?.student?.name || 'Loading...'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/student/submissions" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              My submissions
            </Link>
            <button onClick={logout} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Assigned session</h2>
          {data?.session ? (
            <div className="space-y-2">
              <p className="text-base font-medium text-gray-800">{data.session.title}</p>
              <p className="text-sm text-gray-600">{data.session.description || 'No description'}</p>
              <p className="text-sm text-gray-500">
                {new Date(data.session.startDate).toLocaleString()} - {new Date(data.session.endDate).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No session assigned yet.</p>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Certificate</h2>
          {data?.certificate ? (
            <a href={data.certificate.fileUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Download certificate
            </a>
          ) : (
            <p className="text-sm text-gray-500">No certificate available yet.</p>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Latest news</h2>
          <div className="space-y-3">
            {data?.news?.map((item) => (
              <article key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-700 line-clamp-3">{item.content}</p>
              </article>
            ))}
            {!data?.news?.length ? <p className="text-sm text-gray-500">No news yet.</p> : null}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Submission status</h2>
          <div className="space-y-2">
            {data?.submissions?.slice(0, 5).map((submission) => (
              <div key={submission.id} className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                <p className="text-sm font-medium text-gray-900">{submission.title}</p>
                <p className="text-xs text-gray-500">{submission.status}</p>
              </div>
            ))}
            {!data?.submissions?.length ? <p className="text-sm text-gray-500">No submissions yet.</p> : null}
          </div>
        </section>
      </main>
    </div>
  )
}
