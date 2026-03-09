'use client'

import { FormEvent, useEffect, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

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

const initialForm = {
  name: '',
  email: '',
  sessionId: '',
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [form, setForm] = useState(initialForm)
  const [generatedCredential, setGeneratedCredential] = useState<{ username: string; password: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadData() {
    const [studentsRes, sessionsRes] = await Promise.all([
      fetch('/api/admin/system/students'),
      fetch('/api/admin/system/sessions'),
    ])

    if (studentsRes.ok) {
      const data = await studentsRes.json()
      setStudents(data.students || [])
    }

    if (sessionsRes.ok) {
      const data = await sessionsRes.json()
      setSessions(data.sessions || [])
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function onCreateStudent(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setGeneratedCredential(null)

    const response = await fetch('/api/admin/system/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        sessionId: form.sessionId || null,
      }),
    })

    const data = await response.json()
    if (response.ok) {
      setForm(initialForm)
      setGeneratedCredential(data.credentials || null)
      await loadData()
    }

    setLoading(false)
  }

  async function deleteStudent(id: string) {
    const confirmed = window.confirm('Delete this student account?')
    if (!confirmed) return

    await fetch(`/api/admin/system/students/${id}`, { method: 'DELETE' })
    await loadData()
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

    await fetch(`/api/admin/system/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        username,
        sessionId: sessionIdInput || null,
      }),
    })

    await loadData()
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

    const response = await fetch(`/api/admin/system/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        username: student.username,
        sessionId: student.adminSession?.id || null,
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
      })
    }

    await loadData()
  }

  return (
    <AdminShell title="Students">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onCreateStudent} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Create student account</h2>
          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Full name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <select
              value={form.sessionId}
              onChange={(event) => setForm((prev) => ({ ...prev, sessionId: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">No session assigned</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>{session.title}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
            {loading ? 'Creating...' : 'Create student'}
          </button>

          {generatedCredential ? (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <p className="font-semibold">Credentials generated:</p>
              <p>Username: <span className="font-mono">{generatedCredential.username}</span></p>
              <p>Password: <span className="font-mono">{generatedCredential.password}</span></p>
            </div>
          ) : null}
        </form>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Username</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Session</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Paiement</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{student.username || '-'}</td>
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
                    <div className="flex gap-2">
                      <button onClick={() => editStudent(student)} className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
                        Edit
                      </button>
                      <button
                        onClick={() => resetStudentCredentials(student)}
                        className="rounded border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                      >
                        Reset password
                      </button>
                      <button onClick={() => deleteStudent(student.id)} className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No students yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
