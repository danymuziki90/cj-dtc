'use client'

import { FormEvent, useEffect, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'
import PaginationControls from '@/components/admin-portal/PaginationControls'

type Student = {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string | null
  status: string
  createdAt: string
  adminSession: {
    id: string
    title: string
  } | null
  latestEnrollment: {
    id: number
    status: string
    paymentStatus: string
    paidAmount: number
    totalAmount: number
    formationTitle: string
    session: {
      id: number
      startDate: string
      location: string
    } | null
  } | null
}

type SessionItem = {
  id: string
  title: string
}

type PaginationState = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type CredentialState = {
  username: string
  password: string
  email: string
  emailSent: boolean
  emailError: string | null
}

const initialForm = {
  name: '',
  email: '',
  sessionId: '',
}

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

function statusBadgeClass(status: string) {
  if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-700'
  if (status === 'SUSPENDED') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [form, setForm] = useState(initialForm)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sessionId: '',
  })
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  const [generatedCredential, setGeneratedCredential] = useState<CredentialState | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function loadSessions() {
    const response = await fetch('/api/admin/system/sessions', { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json()
    setSessions(data.sessions || [])
  }

  async function loadStudents(options?: Partial<PaginationState & typeof filters>) {
    setLoadingList(true)
    try {
      const params = new URLSearchParams()
      const search = options?.search ?? filters.search
      const status = options?.status ?? filters.status
      const sessionId = options?.sessionId ?? filters.sessionId
      const page = options?.page ?? pagination.page
      const pageSize = options?.pageSize ?? pagination.pageSize

      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (sessionId) params.set('sessionId', sessionId)

      const response = await fetch(`/api/admin/system/students?${params.toString()}`, { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok) {
        setActionError(data?.error || 'Unable to load students.')
        setStudents([])
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }))
        return
      }

      setStudents(data.students || [])
      setPagination(data.pagination || initialPagination)
    } catch (error) {
      console.error('Unable to load students:', error)
      setStudents([])
      setActionError('Unable to load students.')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    loadStudents()
  }, [filters, pagination.page, pagination.pageSize])

  async function onCreateStudent(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setGeneratedCredential(null)
    setCopyFeedback(null)
    setActionError(null)

    const response = await fetch('/api/admin/system/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        sessionId: form.sessionId || null,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setForm(initialForm)
      setGeneratedCredential(
        data.credentials
          ? {
              username: data.credentials.username,
              password: data.credentials.password,
              email: form.email,
              emailSent: Boolean(data.notifications?.credentialsEmailSent),
              emailError: data.notifications?.credentialsEmailError || null,
            }
          : null
      )

      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }))
      } else {
        await loadStudents({ page: 1 })
      }
    } else {
      setActionError(data?.error || 'Unable to create student.')
    }

    setSubmitting(false)
  }

  async function deleteStudent(id: string) {
    const confirmed = window.confirm('Delete this student account?')
    if (!confirmed) return

    setActionError(null)
    const response = await fetch(`/api/admin/system/students/${id}`, { method: 'DELETE' })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setActionError(payload?.error || 'Unable to delete student.')
      return
    }

    await loadStudents()
  }

  async function editStudent(student: Student) {
    const currentName = `${student.firstName} ${student.lastName}`.trim()
    const name = window.prompt('Student full name', currentName)
    if (!name) return

    const email = window.prompt('Student email', student.email)
    if (!email) return

    const username = window.prompt('Student username', student.username || '')
    if (!username) return

    const sessionIdInput = window.prompt(
      'Session ID (leave empty for unassigned)',
      student.adminSession?.id || ''
    )

    setActionError(null)
    const response = await fetch(`/api/admin/system/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        username,
        sessionId: sessionIdInput || null,
        status: student.status,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setActionError(payload?.error || 'Unable to update student.')
      return
    }

    await loadStudents()
  }

  async function resetStudentCredentials(student: Student) {
    if (!student.username) {
      alert('Definissez un username avant de reinitialiser le mot de passe.')
      return
    }

    const confirmed = window.confirm(
      `Generer un nouveau mot de passe pour ${student.firstName} ${student.lastName} ?`
    )
    if (!confirmed) return

    setActionError(null)
    setCopyFeedback(null)

    const response = await fetch(`/api/admin/system/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        username: student.username,
        sessionId: student.adminSession?.id || null,
        status: student.status,
        resetPassword: true,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      alert(data?.error || 'Unable to reset credentials.')
      return
    }

    if (data.generatedPassword) {
      setGeneratedCredential({
        username: student.username,
        password: data.generatedPassword,
        email: student.email,
        emailSent: Boolean(data.notifications?.credentialsEmailSent),
        emailError: data.notifications?.credentialsEmailError || null,
      })
    }

    await loadStudents()
  }

  async function updateStudentStatus(student: Student, status: 'ACTIVE' | 'SUSPENDED') {
    setActionError(null)

    if (!student.username) {
      setActionError('Define a username before changing student status.')
      return
    }

    const response = await fetch(`/api/admin/system/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${student.firstName} ${student.lastName}`.trim(),
        email: student.email,
        username: student.username,
        sessionId: student.adminSession?.id || null,
        status,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setActionError(payload?.error || 'Unable to update student status.')
      return
    }

    await loadStudents()
  }

  async function copyCredentials() {
    if (!generatedCredential) return

    const loginUrl = `${window.location.origin}/student/login`
    const payload = [
      `Username: ${generatedCredential.username}`,
      `Password: ${generatedCredential.password}`,
      `Login: ${loginUrl}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(payload)
      setCopyFeedback('Identifiants copies dans le presse-papiers.')
    } catch {
      setCopyFeedback('Impossible de copier automatiquement les identifiants.')
    }
  }

  return (
    <AdminShell title="Students">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onCreateStudent} className="rounded-xl border border-gray-200 bg-gray-50 p-4" data-testid="student-create-form">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Create student account</h2>
          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Full name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              data-testid="student-create-name"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              data-testid="student-create-email"
              required
            />
            <select
              value={form.sessionId}
              onChange={(event) => setForm((prev) => ({ ...prev, sessionId: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              data-testid="student-create-session"
            >
              <option value="">No session assigned</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
            data-testid="student-create-submit"
          >
            {submitting ? 'Creating...' : 'Create student'}
          </button>

          {generatedCredential ? (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800" data-testid="student-credentials-panel">
              <p className="font-semibold">Credentials generated:</p>
              <p>
                Username: <span className="font-mono" data-testid="student-credentials-username">{generatedCredential.username}</span>
              </p>
              <p>
                Password: <span className="font-mono" data-testid="student-credentials-password">{generatedCredential.password}</span>
              </p>
              <p className="mt-2 text-xs text-blue-700">
                {generatedCredential.emailSent
                  ? `Email sent automatically to ${generatedCredential.email}.`
                  : generatedCredential.emailError || 'Email delivery was not confirmed.'}
              </p>
              <button
                type="button"
                onClick={copyCredentials}
                className="mt-3 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                data-testid="student-credentials-copy"
              >
                Copier identifiants
              </button>
              {copyFeedback ? <p className="mt-2 text-xs text-blue-700">{copyFeedback}</p> : null}
            </div>
          ) : null}

          {actionError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {actionError}
            </div>
          ) : null}
        </form>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Search</label>
              <input
                value={filters.search}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, search: event.target.value }))
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                placeholder="Name, email or username"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                data-testid="student-search-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={filters.status}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, status: event.target.value }))
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Session</label>
              <select
                value={filters.sessionId}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, sessionId: event.target.value }))
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">All sessions</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Username</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Session</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Paiement</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loadingList ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">Loading students...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No students found.</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} data-testid={`student-row-${student.id}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{student.username || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{student.adminSession?.title || 'Not assigned'}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {student.latestEnrollment ? (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              {student.latestEnrollment.paymentStatus}
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.latestEnrollment.paidAmount}/{student.latestEnrollment.totalAmount} USD
                            </p>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{new Date(student.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => editStudent(student)} className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
                            Edit
                          </button>
                          <button
                            onClick={() => resetStudentCredentials(student)}
                            className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            Reset password
                          </button>
                          {student.status === 'SUSPENDED' ? (
                            <button
                              onClick={() => updateStudentStatus(student, 'ACTIVE')}
                              className="rounded border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => updateStudentStatus(student, 'SUSPENDED')}
                              className="rounded border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                            >
                              Suspend
                            </button>
                          )}
                          <button onClick={() => deleteStudent(student.id)} className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
          />
        </div>
      </div>
    </AdminShell>
  )
}
