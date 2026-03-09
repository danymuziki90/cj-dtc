'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

type FormationItem = {
  id: number
  title: string
  categorie?: string | null
}

type SessionItem = {
  id: number
  formationId: number
  formation: {
    id: number
    title: string
  }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  format: string
  maxParticipants: number
  currentParticipants: number
  price: number
  status: string
  description?: string | null
  objectives?: string | null
  imageUrl?: string | null
  prerequisitesText?: string | null
  adminMeta?: {
    customTitle?: string | null
    sessionType?: 'MRH' | 'IOP' | 'CONFERENCE_FORUM' | null
    durationLabel?: string | null
    paymentInfo?: string | null
    participationType?: 'en_ligne' | 'hybride' | 'presentiel' | null
  }
}

const initialForm = {
  formationId: '',
  customTitle: '',
  sessionType: 'MRH',
  participationType: 'presentiel',
  location: '',
  startDate: '',
  endDate: '',
  startTime: '09:00',
  endTime: '17:00',
  maxParticipants: 25,
  price: 0,
  durationLabel: '',
  paymentInfo: '',
  imageUrl: '',
  description: '',
  prerequisitesText: '',
  objectives: '',
  status: 'ouverte',
}

function toDateInputValue(rawDate: string) {
  const value = new Date(rawDate)
  return value.toISOString().split('T')[0]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatParticipationLabel(value: string) {
  if (value === 'en_ligne' || value === 'distanciel') return 'En ligne'
  if (value === 'hybride') return 'Hybride'
  return 'Presentiel'
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [formations, setFormations] = useState<FormationItem[]>([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [error, setError] = useState('')

  async function loadSessions() {
    const response = await fetch('/api/sessions', { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json()
    setSessions(Array.isArray(data) ? data : [])
  }

  async function loadFormations() {
    const response = await fetch('/api/formations', { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json()
    setFormations(Array.isArray(data) ? data : [])
  }

  async function bootstrap() {
    setIsBootstrapping(true)
    await Promise.all([loadSessions(), loadFormations()])
    setIsBootstrapping(false)
  }

  useEffect(() => {
    bootstrap()
  }, [])

  const selectedFormation = useMemo(
    () => formations.find((formation) => formation.id === Number(form.formationId)) || null,
    [formations, form.formationId]
  )

  function resetForm() {
    setEditingId(null)
    setForm(initialForm)
    setError('')
  }

  function startEdit(session: SessionItem) {
    setEditingId(session.id)
    setForm({
      formationId: String(session.formationId),
      customTitle: session.adminMeta?.customTitle || '',
      sessionType: session.adminMeta?.sessionType || 'MRH',
      participationType: session.adminMeta?.participationType || 'presentiel',
      location: session.location,
      startDate: toDateInputValue(session.startDate),
      endDate: toDateInputValue(session.endDate),
      startTime: session.startTime || '09:00',
      endTime: session.endTime || '17:00',
      maxParticipants: session.maxParticipants,
      price: session.price,
      durationLabel: session.adminMeta?.durationLabel || '',
      paymentInfo: session.adminMeta?.paymentInfo || '',
      imageUrl: session.imageUrl || '',
      description: session.description || '',
      prerequisitesText: session.prerequisitesText || '',
      objectives: session.objectives || '',
      status: session.status || 'ouverte',
    })
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!form.formationId) {
        throw new Error('Veuillez selectionner une formation.')
      }

      const url = editingId ? `/api/sessions/${editingId}` : '/api/sessions'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formationId: Number(form.formationId),
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          startTime: form.startTime,
          endTime: form.endTime,
          location: form.location,
          format: form.participationType === 'en_ligne' ? 'distanciel' : form.participationType,
          maxParticipants: Number(form.maxParticipants),
          price: Number(form.price),
          description: form.description,
          prerequisitesText: form.prerequisitesText,
          objectives: form.objectives,
          imageUrl: form.imageUrl,
          status: form.status,
          sessionType: form.sessionType,
          participationType: form.participationType,
          durationLabel: form.durationLabel,
          paymentInfo: form.paymentInfo,
          customTitle: form.customTitle,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Impossible de sauvegarder la session.')
      }

      resetForm()
      await loadSessions()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  async function removeSession(sessionId: number) {
    const confirmed = window.confirm('Supprimer cette session ?')
    if (!confirmed) return

    await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
    await loadSessions()
  }

  async function updateCapacity(session: SessionItem, nextMaxParticipants: number) {
    if (nextMaxParticipants < session.currentParticipants) return

    await fetch(`/api/sessions/${session.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxParticipants: nextMaxParticipants }),
    })

    await loadSessions()
  }

  return (
    <AdminShell title="Gestion des sessions">
      <div className="space-y-6">
        <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {editingId ? 'Modifier la session' : 'Creer une session'}
          </h2>

          {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Formation *</label>
              <select
                value={form.formationId}
                onChange={(event) => setForm((prev) => ({ ...prev, formationId: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Selectionner...</option>
                {formations.map((formation) => (
                  <option key={formation.id} value={formation.id}>
                    {formation.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Titre session</label>
              <input
                value={form.customTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, customTitle: event.target.value }))}
                placeholder={selectedFormation?.title || 'Titre libre'}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Type session *</label>
              <select
                value={form.sessionType}
                onChange={(event) => setForm((prev) => ({ ...prev, sessionType: event.target.value as any }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="MRH">MRH</option>
                <option value="IOP">IOP</option>
                <option value="CONFERENCE_FORUM">Conference / Forum</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Type participation *</label>
              <select
                value={form.participationType}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, participationType: event.target.value as any }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="presentiel">Presentiel</option>
                <option value="hybride">Hybride</option>
                <option value="en_ligne">En ligne</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Lieu *</label>
              <input
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Image URL</label>
              <input
                value={form.imageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Date debut *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Date fin *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Durée</label>
              <input
                value={form.durationLabel}
                onChange={(event) => setForm((prev) => ({ ...prev, durationLabel: event.target.value }))}
                placeholder="Ex: 6 semaines / 40 heures"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Heure debut *</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Heure fin *</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Prix (USD) *</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nombre de places *</label>
              <input
                type="number"
                min={1}
                value={form.maxParticipants}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, maxParticipants: Number(event.target.value) }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Statut</label>
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ouverte">Ouverte</option>
                <option value="complete">Complete</option>
                <option value="fermee">Fermee</option>
                <option value="annulee">Annulee</option>
                <option value="terminee">Terminee</option>
              </select>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description session</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="min-h-[96px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Infos paiement</label>
              <textarea
                value={form.paymentInfo}
                onChange={(event) => setForm((prev) => ({ ...prev, paymentInfo: event.target.value }))}
                placeholder="Ex: Mobile Money via PawaPay ou lien Flutterwave..."
                className="min-h-[96px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Prerequis</label>
              <textarea
                value={form.prerequisitesText}
                onChange={(event) => setForm((prev) => ({ ...prev, prerequisitesText: event.target.value }))}
                className="min-h-[96px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Objectifs</label>
              <textarea
                value={form.objectives}
                onChange={(event) => setForm((prev) => ({ ...prev, objectives: event.target.value }))}
                className="min-h-[96px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? 'Sauvegarde...' : editingId ? 'Mettre a jour' : 'Creer la session'}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Session</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Participation</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Prix</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Places</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Dates</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isBootstrapping ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Chargement des sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Aucune session configuree.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => {
                  const availableSpots = Math.max(
                    0,
                    (session.maxParticipants || 0) - (session.currentParticipants || 0)
                  )

                  return (
                    <tr key={session.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {session.adminMeta?.customTitle || session.formation.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {session.location} | {session.startTime} - {session.endTime}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {session.adminMeta?.sessionType || 'MRH'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatParticipationLabel(
                          session.adminMeta?.participationType || session.format
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-900">{formatCurrency(session.price || 0)}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="space-y-1">
                          <p>
                            {session.currentParticipants || 0}/{session.maxParticipants} (
                            {availableSpots} dispo)
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateCapacity(session, Math.max(1, session.maxParticipants - 1))}
                              className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => updateCapacity(session, session.maxParticipants + 1)}
                              className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100"
                            >
                              +1
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(session.startDate).toLocaleDateString('fr-FR')} -{' '}
                        {new Date(session.endDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(session)}
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => removeSession(session.id)}
                            className="rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
