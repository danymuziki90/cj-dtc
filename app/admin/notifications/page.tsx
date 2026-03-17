'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BellRing, Megaphone, RefreshCcw, SendHorizonal } from 'lucide-react'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  AdminBadge,
  AdminEmptyState,
  AdminMetricCard,
  AdminPanel,
  AdminPanelHeader,
  adminInputClassName,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
  adminSelectClassName,
  adminTextareaClassName,
} from '@/components/admin-portal/ui'

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

type AlertRow = {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  title: string
  message: string
  actionLabel: string
  actionHref: string
}

const FILTERS_KEY = 'cj-admin-notification-filters'

const initialForm = {
  title: '',
  message: '',
  type: 'info' as NotificationType,
  target: 'all' as NotificationTarget,
  studentEmail: '',
  sessionId: '',
}

const initialFilters = {
  type: 'all',
  target: 'all',
  search: '',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function severityTone(severity: AlertRow['severity']) {
  if (severity === 'critical') return 'danger' as const
  if (severity === 'high') return 'warning' as const
  if (severity === 'medium') return 'primary' as const
  return 'neutral' as const
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [systemAlerts, setSystemAlerts] = useState<AlertRow[]>([])
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    try {
      const savedFilters = JSON.parse(window.localStorage.getItem(FILTERS_KEY) || 'null')
      if (savedFilters && typeof savedFilters === 'object') {
        setFilters({
          type: typeof savedFilters.type === 'string' ? savedFilters.type : 'all',
          target: typeof savedFilters.target === 'string' ? savedFilters.target : 'all',
          search: typeof savedFilters.search === 'string' ? savedFilters.search : '',
        })
      }
    } catch {
      setFilters(initialFilters)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(FILTERS_KEY, JSON.stringify(filters))
  }, [filters])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.type !== 'all') params.set('type', filters.type)
    if (filters.target !== 'all') params.set('target', filters.target)
    if (filters.search.trim()) params.set('search', filters.search.trim())
    return params.toString()
  }, [filters])

  async function loadPage() {
    setLoading(true)
    setError(null)

    try {
      const [notificationsResponse, sessionsResponse, reportingResponse] = await Promise.all([
        fetch(`/api/admin/system/notifications${queryString ? `?${queryString}` : ''}`, { cache: 'no-store' }),
        fetch('/api/sessions', { cache: 'no-store' }),
        fetch('/api/admin/system/reporting?period=30d', { cache: 'no-store' }),
      ])

      const [notificationsPayload, sessionsPayload, reportingPayload] = await Promise.all([
        notificationsResponse.json(),
        sessionsResponse.json(),
        reportingResponse.json(),
      ])

      if (!notificationsResponse.ok) throw new Error(notificationsPayload?.error || 'Impossible de charger les notifications.')

      setNotifications(notificationsPayload.notifications || [])
      setSessions(Array.isArray(sessionsPayload) ? sessionsPayload : [])
      setSystemAlerts(Array.isArray(reportingPayload?.alerts) ? reportingPayload.alerts : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage()
  }, [queryString])

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
      if (!response.ok) throw new Error(payload?.error || 'Impossible de creer la notification.')

      setForm(initialForm)
      await loadPage()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
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
      setError(payload?.error || 'Impossible de supprimer la notification.')
      return
    }

    await loadPage()
  }

  return (
    <AdminShell title="Notifications et messages">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard icon={BellRing} label="Notifications manuelles" value={`${notifications.length}`} helper="Messages saisis et visibles dans le centre admin." tone="primary" />
        <AdminMetricCard icon={AlertTriangle} label="Alertes systeme" value={`${systemAlerts.length}`} helper="Generees automatiquement a partir des paiements, presences et sessions." tone="warning" />
        <AdminMetricCard icon={Megaphone} label="Rappels" value={`${notifications.filter((item) => item.type === 'reminder').length}`} helper="Messages de relance deja publies." tone="success" />
        <AdminMetricCard icon={RefreshCcw} label="Filtres sauvegardes" value={`${Number(Boolean(filters.type !== 'all' || filters.target !== 'all' || filters.search))}`} helper="Vos filtres de consultation sont conserves localement." tone="neutral" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Diffusion"
            title="Creer une notification"
            description="Messages manuels, rappels et communications ciblées vers un etudiant ou une session."
          />
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Titre</label>
                <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className={adminInputClassName} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
                <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as NotificationType }))} className={adminSelectClassName}>
                  <option value="info">Info</option>
                  <option value="reminder">Rappel</option>
                  <option value="correction">Correction</option>
                  <option value="announcement">Annonce</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Cible</label>
                <select value={form.target} onChange={(event) => setForm((prev) => ({ ...prev, target: event.target.value as NotificationTarget }))} className={adminSelectClassName}>
                  <option value="all">Tous les etudiants</option>
                  <option value="student">Etudiant specifique</option>
                  <option value="session">Session specifique</option>
                </select>
              </div>
              {form.target === 'student' ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email etudiant</label>
                  <input type="email" value={form.studentEmail} onChange={(event) => setForm((prev) => ({ ...prev, studentEmail: event.target.value }))} className={adminInputClassName} required />
                </div>
              ) : null}
              {form.target === 'session' ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Session</label>
                  <select value={form.sessionId} onChange={(event) => setForm((prev) => ({ ...prev, sessionId: event.target.value }))} className={adminSelectClassName} required>
                    <option value="">Selectionner...</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>{session.formation.title} - {new Date(session.startDate).toLocaleDateString('fr-FR')}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <textarea value={form.message} onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))} className={adminTextareaClassName} required />
            </div>
            {error ? <p className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            <button type="submit" disabled={saving} className={adminPrimaryButtonClassName}>
              <SendHorizonal className="h-4 w-4" />
              {saving ? 'Envoi...' : 'Envoyer la notification'}
            </button>
          </form>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Moteur d alertes"
            title="Alertes automatiques prioritaires"
            description="Paiements incomplets, absences repetees, sessions imminentes et certificats prets sont remontes ici sans saisie manuelle."
            actions={<Link href="/admin/reports" className="text-sm font-semibold text-[var(--admin-primary)]">Ouvrir le reporting</Link>}
          />
          <div className="mt-5 space-y-3">
            {systemAlerts.length ? systemAlerts.slice(0, 8).map((alert) => (
              <div key={alert.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminBadge tone={severityTone(alert.severity)}>{alert.severity}</AdminBadge>
                  <AdminBadge tone="neutral">{alert.category}</AdminBadge>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{alert.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{alert.message}</p>
                <Link href={alert.actionHref} className="mt-3 inline-flex text-sm font-semibold text-[var(--admin-primary)]">
                  {alert.actionLabel}
                </Link>
              </div>
            )) : <AdminEmptyState title="Aucune alerte systeme" description="Le moteur n a pas remonte de signal prioritaire sur cette vue." />}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel>
        <AdminPanelHeader
          eyebrow="Historique"
          title="Notifications enregistrees"
          description="Filtrez par type, cible ou texte. Les filtres restent en memoire sur ce navigateur."
          actions={
            <button type="button" onClick={() => setFilters(initialFilters)} className={adminSecondaryButtonClassName}>
              <RefreshCcw className="h-4 w-4" />
              Reinitialiser les filtres
            </button>
          }
        />

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <select value={filters.type} onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))} className={adminSelectClassName}>
            <option value="all">Tous les types</option>
            <option value="info">Info</option>
            <option value="reminder">Rappel</option>
            <option value="correction">Correction</option>
            <option value="announcement">Annonce</option>
          </select>
          <select value={filters.target} onChange={(event) => setFilters((prev) => ({ ...prev, target: event.target.value }))} className={adminSelectClassName}>
            <option value="all">Toutes les cibles</option>
            <option value="student">Etudiant</option>
            <option value="session">Session</option>
          </select>
          <input value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} placeholder="Titre, message ou email" className={adminInputClassName} />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Titre</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Cible</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {notifications.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 max-w-xl text-xs leading-6 text-slate-600">{item.message}</p>
                  </td>
                  <td className="px-4 py-4"><AdminBadge tone="neutral">{item.type}</AdminBadge></td>
                  <td className="px-4 py-4 text-slate-700">
                    {item.target === 'all' ? 'Tous' : item.target === 'student' ? item.studentEmail || '-' : `Session #${item.sessionId || '-'}`}
                  </td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => removeNotification(item.id)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && notifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10">
                    <AdminEmptyState title="Aucune notification" description="Aucun message manuel ne correspond aux filtres actuels." />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </AdminShell>
  )
}
