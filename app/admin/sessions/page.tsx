'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Edit3, ImagePlus, Layers3, MapPin, Plus, Trash2, Users } from 'lucide-react'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  AdminBadge,
  AdminEmptyState,
  AdminMetricCard,
  AdminPanel,
  AdminPanelHeader,
  adminDangerButtonClassName,
  adminInputClassName,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
  adminSelectClassName,
  adminTextareaClassName,
} from '@/components/admin-portal/ui'

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
    imageUrl?: string | null
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
  imageUrl: '',
  description: '',
  status: 'ouverte',
}
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type ApiPayload = {
  error?: string
  message?: string
  url?: string
}

async function readApiPayload<T extends ApiPayload = ApiPayload>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  const text = (await response.text()).trim()
  return {
    error:
      response.status === 413 || text.toLowerCase().startsWith('request entity too large')
        ? "La requete est trop volumineuse. Uploadez une image plus legere ou utilisez l'upload integre."
        : text || `Erreur HTTP ${response.status}`,
  } as T
}

function getApiErrorMessage(payload: ApiPayload, fallback: string) {
  return payload.error || payload.message || fallback
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

function sessionStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' | 'primary' {
  if (status === 'ouverte') return 'success'
  if (status === 'complete') return 'warning'
  if (status === 'terminee') return 'primary'
  if (status === 'annulee' || status === 'fermee') return 'danger'
  return 'neutral'
}

function pickFormationIdForSessionType(
  formations: FormationItem[],
  sessionType: 'MRH' | 'IOP' | 'CONFERENCE_FORUM'
) {
  const matchers: Record<'MRH' | 'IOP' | 'CONFERENCE_FORUM', string[]> = {
    MRH: ['mrh', 'ressources humaines', 'rh'],
    IOP: ['iop', 'orientation professionnelle', 'insertion'],
    CONFERENCE_FORUM: ['conference', 'forum'],
  }

  const normalized = formations.map((formation) => ({
    id: formation.id,
    haystack: `${formation.title || ''} ${formation.categorie || ''}`.toLowerCase(),
  }))

  const keywords = matchers[sessionType]
  const found = normalized.find((formation) => keywords.some((keyword) => formation.haystack.includes(keyword)))
  return found?.id ?? formations[0]?.id ?? null
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [formations, setFormations] = useState<FormationItem[]>([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
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
      imageUrl: session.adminMeta?.imageUrl || session.imageUrl || '',
      description: session.description || '',
      status: session.status || 'ouverte',
    })
  }

  useEffect(() => {
    if (editingId || formations.length === 0) return

    setForm((prev) => {
      const preferredFormationId = pickFormationIdForSessionType(
        formations,
        prev.sessionType as 'MRH' | 'IOP' | 'CONFERENCE_FORUM'
      )
      if (!preferredFormationId) return prev
      const nextFormationId = String(preferredFormationId)
      if (prev.formationId === nextFormationId) return prev
      return { ...prev, formationId: nextFormationId }
    })
  }, [editingId, formations, form.sessionType])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (uploadingImage) {
        throw new Error("Veuillez attendre la fin de l'upload de l'image.")
      }
      if (!form.formationId) {
        throw new Error('Aucune formation disponible pour creer une session.')
      }
      if (form.imageUrl.startsWith('data:')) {
        throw new Error("L'image n'a pas ete envoyee correctement. Reuploadez le fichier avant de sauvegarder.")
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
          imageUrl: form.imageUrl,
          status: form.status,
          sessionType: form.sessionType,
          participationType: form.participationType,
          durationLabel: form.durationLabel,
          customTitle: form.customTitle,
        }),
      })

      const data = await readApiPayload(response)
      if (!response.ok) {
        throw new Error(getApiErrorMessage(data, 'Impossible de sauvegarder la session.'))
      }

      resetForm()
      await loadSessions()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  async function onImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setUploadingImage(true)

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Selectionnez uniquement un fichier image.')
      }
      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error('Image trop volumineuse. Taille max: 5 MB.')
      }

      const uploadPayload = new FormData()
      uploadPayload.append('file', file)
      uploadPayload.append('folder', 'sessions')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadPayload,
      })

      const data = await readApiPayload<{ error?: string; url?: string }>(response)
      if (!response.ok || !data.url) {
        throw new Error(getApiErrorMessage(data, "Erreur lors de l'upload de l'image."))
      }

      setForm((prev) => ({ ...prev, imageUrl: data.url || '' }))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Erreur inconnue pendant upload.')
    } finally {
      setUploadingImage(false)
      event.target.value = ''
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

  const metrics = useMemo(() => {
    const total = sessions.length
    const open = sessions.filter((session) => session.status === 'ouverte').length
    const seats = sessions.reduce((sum, session) => sum + (session.currentParticipants || 0), 0)
    const averagePrice = total > 0 ? Math.round(sessions.reduce((sum, session) => sum + (session.price || 0), 0) / total) : 0
    return { total, open, seats, averagePrice }
  }, [sessions])

  return (
    <AdminShell title="Gestion des sessions">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-[26px] border border-slate-200 bg-white/92 px-5 py-4 shadow-[0_20px_55px_-44px_rgba(15,23,42,0.28)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {editingId ? (
              <button type="button" onClick={resetForm} className={adminSecondaryButtonClassName}>
                Reinitialiser le formulaire
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="primary">{metrics.total} session(s)</AdminBadge>
            <AdminBadge tone="success">{metrics.open} ouverte(s)</AdminBadge>
            <AdminBadge tone="warning">{metrics.seats} place(s) occupee(s)</AdminBadge>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard icon={Layers3} label="Sessions" value={String(metrics.total)} helper="Catalogue actuellement configure." tone="primary" />
          <AdminMetricCard icon={CalendarDays} label="Ouvertes" value={String(metrics.open)} helper="Sessions encore disponibles a l'inscription." tone="success" />
          <AdminMetricCard icon={Users} label="Places occupees" value={String(metrics.seats)} helper="Participants deja engages." tone="warning" />
          <AdminMetricCard icon={MapPin} label="Ticket moyen" value={formatCurrency(metrics.averagePrice)} helper="Prix moyen des sessions configurees." tone="neutral" />
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <AdminPanel>
            <AdminPanelHeader
              eyebrow="Edition"
              title={editingId ? 'Modifier une session' : 'Creer une session'}
              description="Les champs admin essentiels sont regroupes pour gagner du temps lors de la programmation."
            />

            {error ? (
              <div className="mt-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Titre session</label>
                  <input value={form.customTitle} onChange={(event) => setForm((prev) => ({ ...prev, customTitle: event.target.value }))} placeholder="Titre libre" className={adminInputClassName} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Type session</label>
                  <select
                    value={form.sessionType}
                    onChange={(event) => setForm((prev) => {
                      const sessionType = event.target.value as 'MRH' | 'IOP' | 'CONFERENCE_FORUM'
                      const preferredFormationId = pickFormationIdForSessionType(formations, sessionType)
                      return { ...prev, sessionType, formationId: preferredFormationId ? String(preferredFormationId) : prev.formationId }
                    })}
                    className={adminSelectClassName}
                  >
                    <option value="MRH">MRH</option>
                    <option value="IOP">IOP</option>
                    <option value="CONFERENCE_FORUM">Conference / Forum</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Type participation</label>
                  <select value={form.participationType} onChange={(event) => setForm((prev) => ({ ...prev, participationType: event.target.value as 'en_ligne' | 'hybride' | 'presentiel' }))} className={adminSelectClassName}>
                    <option value="presentiel">Presentiel</option>
                    <option value="hybride">Hybride</option>
                    <option value="en_ligne">En ligne</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Lieu</label>
                  <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} className={adminInputClassName} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Duree</label>
                  <input value={form.durationLabel} onChange={(event) => setForm((prev) => ({ ...prev, durationLabel: event.target.value }))} placeholder="Ex: 6 semaines / 40 heures" className={adminInputClassName} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Date debut</label>
                  <input type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} className={adminInputClassName} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Date fin</label>
                  <input type="date" value={form.endDate} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} className={adminInputClassName} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Heure debut</label>
                  <input type="time" value={form.startTime} onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))} className={adminInputClassName} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Heure fin</label>
                  <input type="time" value={form.endTime} onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))} className={adminInputClassName} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Prix (USD)</label>
                  <input type="number" min={0} value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))} className={adminInputClassName} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nombre de places</label>
                  <input type="number" min={1} value={form.maxParticipants} onChange={(event) => setForm((prev) => ({ ...prev, maxParticipants: Number(event.target.value) }))} className={adminInputClassName} required />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Statut</label>
                  <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className={adminSelectClassName}>
                    <option value="ouverte">Ouverte</option>
                    <option value="complete">Complete</option>
                    <option value="fermee">Fermee</option>
                    <option value="annulee">Annulee</option>
                    <option value="terminee">Terminee</option>
                  </select>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <label className={`${adminSecondaryButtonClassName} cursor-pointer`}>
                    <ImagePlus className="h-4 w-4" />
                    {uploadingImage ? 'Upload en cours...' : 'Uploader une image'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={onImageFileChange} />
                  </label>
                  <button type="button" onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))} className={adminSecondaryButtonClassName}>
                    Retirer l'image
                  </button>
                </div>
                <input value={form.imageUrl} onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))} placeholder="Ou collez une URL d'image" className={`mt-4 ${adminInputClassName}`} />
                {form.imageUrl ? <img src={form.imageUrl} alt="Apercu session" className="mt-4 h-36 w-full rounded-[24px] border border-slate-200 object-cover" /> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description session</label>
                <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} className={adminTextareaClassName} />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {editingId ? <button type="button" onClick={resetForm} className={adminSecondaryButtonClassName}>Annuler</button> : null}
                <button type="submit" disabled={loading || uploadingImage} className={adminPrimaryButtonClassName}>
                  <Plus className="h-4 w-4" />
                  {loading || uploadingImage ? 'Sauvegarde...' : editingId ? 'Mettre a jour la session' : 'Creer la session'}
                </button>
              </div>
            </form>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              eyebrow="Catalogue"
              title="Sessions configurees"
              description="Surveillez capacite, statut, participation et planning sans quitter la page de programmation."
              actions={<AdminBadge tone="primary">{sessions.length} session(s)</AdminBadge>}
            />

            {isBootstrapping ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--admin-primary)]" />
                <p className="mt-4 text-sm text-slate-600">Chargement des sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="mt-6">
                <AdminEmptyState title="Aucune session configuree" description="Creez une premiere session pour alimenter ce planning admin." />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {sessions.map((session) => {
                  const availableSpots = Math.max(0, (session.maxParticipants || 0) - (session.currentParticipants || 0))
                  return (
                    <article key={session.id} className="rounded-[26px] border border-slate-200 bg-slate-50/80 px-4 py-4 shadow-sm">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-950">{session.adminMeta?.customTitle || session.formation.title}</h3>
                            <AdminBadge tone={sessionStatusTone(session.status)}>{session.status}</AdminBadge>
                            <AdminBadge tone="neutral">{session.adminMeta?.sessionType || 'MRH'}</AdminBadge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{session.location}</span>
                            <span>{formatParticipationLabel(session.adminMeta?.participationType || session.format)}</span>
                            <span>{session.startTime} - {session.endTime}</span>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-[20px] border border-white/70 bg-white px-4 py-3 shadow-sm">
                              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Prix</p>
                              <p className="mt-2 text-sm font-semibold text-slate-950">{formatCurrency(session.price || 0)}</p>
                            </div>
                            <div className="rounded-[20px] border border-white/70 bg-white px-4 py-3 shadow-sm">
                              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Places</p>
                              <p className="mt-2 text-sm font-semibold text-slate-950">{session.currentParticipants || 0}/{session.maxParticipants}</p>
                            </div>
                            <div className="rounded-[20px] border border-white/70 bg-white px-4 py-3 shadow-sm">
                              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Disponibles</p>
                              <p className="mt-2 text-sm font-semibold text-slate-950">{availableSpots}</p>
                            </div>
                          </div>
                          <p className="mt-4 text-sm text-slate-600">{new Date(session.startDate).toLocaleDateString('fr-FR')} - {new Date(session.endDate).toLocaleDateString('fr-FR')}</p>
                        </div>

                        <div className="flex flex-col gap-2 xl:min-w-[220px]">
                          <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => updateCapacity(session, Math.max(1, session.maxParticipants - 1))} className={adminSecondaryButtonClassName}>-1 place</button>
                            <button type="button" onClick={() => updateCapacity(session, session.maxParticipants + 1)} className={adminSecondaryButtonClassName}>+1 place</button>
                          </div>
                          <button type="button" onClick={() => startEdit(session)} className={adminPrimaryButtonClassName}><Edit3 className="h-4 w-4" />Modifier</button>
                          <button type="button" onClick={() => removeSession(session.id)} className={adminDangerButtonClassName}><Trash2 className="h-4 w-4" />Supprimer</button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </AdminPanel>
        </div>
      </div>
    </AdminShell>
  )
}
