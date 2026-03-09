'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

type NotificationType = 'info' | 'reminder' | 'correction' | 'announcement'
type NotificationTarget = 'all' | 'student' | 'session'

type NotificationRow = {
  id: string
  title: string
  message: string
  type: NotificationType
  target: NotificationTarget
  studentEmail: string | null
  sessionId: number | null
  createdBy: string | null
  createdAt: string
}

type SessionOption = {
  id: number
  formation: {
    title: string
  }
  startDate: string
}

const initialForm = {
  title: '',
  message: '',
  type: 'info' as NotificationType,
  target: 'all' as NotificationTarget,
  studentEmail: '',
  sessionId: '',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: 'all',
    target: 'all',
    search: '',
  })

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.type !== 'all') params.set('type', filters.type)
    if (filters.target !== 'all') params.set('target', filters.target)
    if (filters.search.trim()) params.set('search', filters.search.trim())
    return params.toString()
  }, [filters])

  async function loadNotifications() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/system/notifications${queryString ? `?${queryString}` : ''}`, {
        cache: 'no-store',
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'Unable to load notifications.')
      setNotifications(payload.notifications || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  async function loadSessions() {
    const response = await fetch('/api/sessions', { cache: 'no-store' })
    if (!response.ok) return
    const payload = await response.json()
    setSessions(Array.isArray(payload) ? payload : [])
  }

  useEffect(() => {
    loadNotifications()
  }, [queryString])

  useEffect(() => {
    loadSessions()
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/system/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          message: form.message.trim(),
          type: form.type,
          target: form.target,
          studentEmail: form.target === 'student' ? form.studentEmail.trim() : null,
          sessionId: form.target === 'session' ? Number(form.sessionId) : null,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'Unable to create notification.')

      setForm(initialForm)
      await loadNotifications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setSaving(false)
    }
  }

  async function removeNotification(id: string) {
    const confirmed = window.confirm('Supprimer cette notification ?')
    if (!confirmed) return

    const response = await fetch(`/api/admin/system/notifications/${id}`, { method: 'DELETE' })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(payload?.error || 'Unable to delete notification.')
      return
    }

    await loadNotifications()
  }

  return (
    <AdminShell title="Notifications et messages">
      <div className="space-y-6">
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Envoyer une notification</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Titre</label>
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value as NotificationType }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="info">Info</option>
                <option value="reminder">Rappel</option>
                <option value="correction">Correction</option>
                <option value="announcement">Annonce</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cible</label>
              <select
                value={form.target}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, target: event.target.value as NotificationTarget }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="all">Tous les etudiants</option>
                <option value="student">Etudiant specifique</option>
                <option value="session">Session specifique</option>
              </select>
            </div>

            {form.target === 'student' ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email etudiant</label>
                <input
                  type="email"
                  value={form.studentEmail}
                  onChange={(event) => setForm((prev) => ({ ...prev, studentEmail: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>
            ) : null}

            {form.target === 'session' ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Session</label>
                <select
                  value={form.sessionId}
                  onChange={(event) => setForm((prev) => ({ ...prev, sessionId: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                >
                  <option value="">Selectionner...</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.formation.title} - {new Date(session.startDate).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
            <textarea
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              className="min-h-[100px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
          </div>

          {error ? (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-70"
          >
            {saving ? 'Envoi...' : 'Envoyer notification'}
          </button>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <select
              value={filters.type}
              onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="info">Info</option>
              <option value="reminder">Rappel</option>
              <option value="correction">Correction</option>
              <option value="announcement">Annonce</option>
            </select>
            <select
              value={filters.target}
              onChange={(event) => setFilters((prev) => ({ ...prev, target: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">Toutes les cibles</option>
              <option value="student">Etudiant</option>
              <option value="session">Session</option>
            </select>
            <input
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              placeholder="Recherche titre/message/email..."
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Titre</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Type</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Cible</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Date</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="line-clamp-2 text-xs text-slate-600">{item.message}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{item.type}</td>
                    <td className="px-3 py-3 text-slate-700">
                      {item.target === 'all'
                        ? 'Tous'
                        : item.target === 'student'
                        ? item.studentEmail || '-'
                        : `Session #${item.sessionId || '-'}`}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{formatDate(item.createdAt)}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => removeNotification(item.id)}
                        className="rounded border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && notifications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                      Aucune notification trouvee.
                    </td>
                  </tr>
                ) : null}
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                      Chargement...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
