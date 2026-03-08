'use client'

import { FormEvent, useEffect, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

type AdminSession = {
  id: string
  title: string
  description?: string | null
  startDate: string
  endDate: string
  _count?: {
    students: number
    submissions: number
  }
}

const initialForm = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<AdminSession[]>([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadSessions() {
    const response = await fetch('/api/admin/system/sessions')
    if (!response.ok) return

    const data = await response.json()
    setSessions(data.sessions || [])
  }

  useEffect(() => {
    loadSessions()
  }, [])

  function startEdit(session: AdminSession) {
    setEditingId(session.id)
    setForm({
      title: session.title,
      description: session.description || '',
      startDate: session.startDate.slice(0, 16),
      endDate: session.endDate.slice(0, 16),
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(initialForm)
    setError('')
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? `/api/admin/system/sessions/${editingId}` : '/api/admin/system/sessions'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      setError(data.error || 'Unable to save session')
      setLoading(false)
      return
    }

    resetForm()
    setLoading(false)
    await loadSessions()
  }

  async function removeSession(id: string) {
    const confirmed = window.confirm('Delete this session?')
    if (!confirmed) return

    await fetch(`/api/admin/system/sessions/${id}`, { method: 'DELETE' })
    await loadSessions()
  }

  return (
    <AdminShell title="Sessions">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{editingId ? 'Edit session' : 'Create session'}</h2>
          {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

          <div className="space-y-3">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Session title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Description"
              className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
              {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Start</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">End</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Students</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{session.title}</p>
                    <p className="text-xs text-gray-500">{session.description || 'No description'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{new Date(session.startDate).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-700">{new Date(session.endDate).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-700">{session._count?.students || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(session)} className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
                        Edit
                      </button>
                      <button onClick={() => removeSession(session.id)} className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No sessions yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
