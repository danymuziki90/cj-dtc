'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays, Clock, MapPin, Users, Trash, Edit, Plus, Copy, X,
  Image as ImageIcon, Upload, AlertCircle, Check, Archive, RefreshCw, Eye, ClipboardList,
} from 'lucide-react'
import SessionFormBuilder from './SessionFormBuilder'

type SessionItem = {
  id: number
  formationId: number
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
  imageUrl?: string | null
  adminMeta?: {
    customTitle?: string | null
    sessionType?: 'MRH' | 'IOP' | 'CONFERENCE_FORUM' | null
    durationLabel?: string | null
    paymentInfo?: string | null
    participationType?: 'en_ligne' | 'hybride' | 'presentiel' | null
    imageUrl?: string | null
    registrationDeadline?: string | null
  }
}

type Props = {
  formationId: number
  formationTitle: string
  onClose: () => void
  onSuccess?: () => void
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const initialForm = {
  customTitle: '',
  sessionType: 'MRH' as 'MRH' | 'IOP' | 'CONFERENCE_FORUM',
  participationType: 'presentiel' as 'en_ligne' | 'hybride' | 'presentiel',
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
  registrationDeadline: '',
}

function toDateInputValue(rawDate: string) {
  if (!rawDate) return ''
  const value = new Date(rawDate)
  return value.toISOString().split('T')[0]
}

export default function SessionsManagerModal({ formationId, formationTitle, onClose, onSuccess }: Props) {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // List of all formations and active formation selection state
  const [allFormations, setAllFormations] = useState<any[]>([])
  const [currentFormationId, setCurrentFormationId] = useState(formationId)
  const [currentFormationTitle, setCurrentFormationTitle] = useState(formationTitle)

  // Tab in right panel: 'general' | 'form'
  const [rightTab, setRightTab] = useState<'general' | 'form'>('general')

  // Form states
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Fetch all formations
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const res = await fetch('/api/formations')
        if (res.ok) {
          const data = await res.json()
          setAllFormations(data)
        }
      } catch (e) {
        console.error('Error loading formations list:', e)
      }
    }
    fetchFormations()
  }, [])

  // Load sessions of the current formation
  const loadSessions = async () => {
    setLoadingSessions(true)
    setError(null)
    try {
      const response = await fetch('/api/sessions', { cache: 'no-store' })
      if (!response.ok) throw new Error('Impossible de charger les sessions.')
      const data = (await response.json()) as SessionItem[]
      // Filter for this formation only
      const filtered = data.filter((s) => s.formationId === currentFormationId)
      setSessions(filtered)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [currentFormationId])

  useEffect(() => {
    // Listen for Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
    setError(null)
    setRightTab('general')
  }

  const startEdit = (session: SessionItem) => {
    setEditingId(session.id)
    setForm({
      customTitle: session.adminMeta?.customTitle || '',
      sessionType: (session.adminMeta?.sessionType as any) || 'MRH',
      participationType: (session.adminMeta?.participationType as any) || 'presentiel',
      location: session.location || '',
      startDate: toDateInputValue(session.startDate),
      endDate: toDateInputValue(session.endDate),
      startTime: session.startTime || '09:00',
      endTime: session.endTime || '17:00',
      maxParticipants: session.maxParticipants || 25,
      price: session.price || 0,
      durationLabel: session.adminMeta?.durationLabel || '',
      imageUrl: session.adminMeta?.imageUrl || session.imageUrl || '',
      description: session.description || '',
      status: session.status || 'ouverte',
      registrationDeadline: toDateInputValue(session.adminMeta?.registrationDeadline || ''),
    })
  }

  const startDuplicate = (session: SessionItem) => {
    setEditingId(null) // Clear ID to trigger creation on submit
    setForm({
      customTitle: session.adminMeta?.customTitle ? `${session.adminMeta.customTitle} (Copie)` : '',
      sessionType: (session.adminMeta?.sessionType as any) || 'MRH',
      participationType: (session.adminMeta?.participationType as any) || 'presentiel',
      location: session.location || '',
      startDate: toDateInputValue(session.startDate),
      endDate: toDateInputValue(session.endDate),
      startTime: session.startTime || '09:00',
      endTime: session.endTime || '17:00',
      maxParticipants: session.maxParticipants || 25,
      price: session.price || 0,
      durationLabel: session.adminMeta?.durationLabel || '',
      imageUrl: session.adminMeta?.imageUrl || session.imageUrl || '',
      description: session.description || '',
      status: 'ouverte', // Set status to open by default for the duplicate
      registrationDeadline: toDateInputValue(session.adminMeta?.registrationDeadline || ''),
    })
    setSuccessMsg('Session clonée ! Renseignez les nouvelles dates puis enregistrez.')
    setTimeout(() => setSuccessMsg(null), 4000)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setIsSubmitting(true)

    try {
      if (uploadingImage) {
        throw new Error("Veuillez attendre la fin de l'upload de l'image.")
      }

      const url = editingId ? `/api/sessions/${editingId}` : '/api/sessions'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formationId: currentFormationId,
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
          registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline).toISOString() : null,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Erreur lors de la sauvegarde de la session.')
      }

      setSuccessMsg(editingId ? 'Session mise à jour !' : 'Nouvelle session créée !')
      resetForm()
      await loadSessions()
      if (onSuccess) onSuccess()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploadingImage(true)

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Sélectionnez uniquement des images.')
      }
      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error('Image trop volumineuse (max 5 MB).')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'sessions')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errMsg = "Erreur pendant l'upload."
        try {
          const errData = await response.json()
          errMsg = errData.error || errMsg
        } catch (jsonErr) {
          const text = await response.text().catch(() => '')
          errMsg = `Erreur serveur R2 (${response.status}): ${response.statusText || 'Internal Server Error'}. ${text.slice(0, 150)}`
        }
        console.error("[SessionsManager] Échec du téléversement de l'image:", errMsg)
        throw new Error(errMsg)
      }
      const data = await response.json()
      setForm((prev) => ({ ...prev, imageUrl: data.url }))
      setSuccessMsg('Image téléversée avec succès !')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const togglePublish = async (session: SessionItem) => {
    const nextStatus = session.status === 'ouverte' ? 'fermee' : 'ouverte'
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!response.ok) throw new Error('Impossible de modifier le statut.')
      await loadSessions()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const archiveSession = async (session: SessionItem) => {
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'terminee' }),
      })
      if (!response.ok) throw new Error('Impossible d\'archiver la session.')
      await loadSessions()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteSession = async (id: number) => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Impossible de supprimer la session.')
      setSuccessMsg('Session supprimée avec succès.')
      await loadSessions()
      if (onSuccess) onSuccess()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getStatusBadge = (status: string) => {
    const tones: Record<string, string> = {
      ouverte: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      complete: 'bg-amber-100 text-amber-800 border-amber-200',
      fermee: 'bg-rose-100 text-rose-800 border-rose-200',
      annulee: 'bg-gray-100 text-gray-800 border-gray-200',
      terminee: 'bg-blue-100 text-blue-800 border-blue-200',
    }
    const labels: Record<string, string> = {
      ouverte: 'Ouverte',
      complete: 'Complète',
      fermee: 'Fermée',
      annulee: 'Annulée',
      terminee: 'Terminée',
    }

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tones[status] || tones.annulee}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-7xl max-h-[92vh] sm:h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-slide-up text-slate-800">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-blue-700 to-blue-800 text-white flex items-center justify-between flex-shrink-0">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-200">Gestion des sessions</span>
            <h2 className="text-lg sm:text-xl font-bold truncate max-w-2xl">{currentFormationTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white focus:outline-none shrink-0"
            aria-label="Fermer la modale"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* Modal Body Panels */}
        <div className="flex-1 overflow-hidden grid lg:grid-cols-[1.1fr_0.9fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* LEFT PANEL: Sessions list */}
          <div className="p-6 overflow-y-auto flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <span>Sessions planifiées</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {sessions.length}
                </span>
              </h3>
              <button
                onClick={loadSessions}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Actualiser
              </button>
            </div>

            {loadingSessions ? (
              <div className="flex-1 flex items-center justify-center py-20 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <CalendarDays className="w-12 h-12 text-slate-400 mb-3" />
                <p className="font-semibold text-slate-700">Aucune session planifiée</p>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Créez une session sur le formulaire de droite pour ouvrir les inscriptions de cette formation.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sessions.map((s) => {
                  const available = s.maxParticipants - (s.currentParticipants || 0)
                  const isFull = available <= 0
                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                        editingId === s.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {s.adminMeta?.customTitle || `${formationTitle}`}
                          </h4>
                          {getStatusBadge(s.status)}
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold uppercase">
                            {s.adminMeta?.sessionType || 'MRH'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">
                              {new Date(s.startDate).toLocaleDateString('fr-FR')} - {new Date(s.endDate).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.startTime} - {s.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{s.location || 'En ligne'} ({s.format})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-800">
                              {s.currentParticipants} / {s.maxParticipants} places
                            </span>
                          </div>
                        </div>

                        {/* Progress capacity bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${isFull ? 'bg-red-500' : available <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, Math.round((s.currentParticipants / s.maxParticipants) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => togglePublish(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            s.status === 'ouverte'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {s.status === 'ouverte' ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => archiveSession(s)}
                          disabled={s.status === 'terminee'}
                          className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-all hover:text-slate-800 disabled:opacity-40"
                          title="Archiver (Terminée)"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startDuplicate(s)}
                          className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-all hover:text-slate-800"
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          className="p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-all"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSession(s.id)}
                          className="p-1.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                          title="Supprimer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Form editor */}
          <div className="p-6 overflow-y-auto bg-slate-50/50 flex flex-col h-full">
            {/* Panel header + tabs */}
            <div className="border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {editingId ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                  <span>{editingId ? 'Modifier la session' : 'Créer une session'}</span>
                </h3>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Annuler la modification
                  </button>
                )}
              </div>

              {/* Tabs — uniquement visible en mode édition */}
              {editingId && (
                <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRightTab('general')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      rightTab === 'general'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Edit className="h-3 w-3" />
                    Paramètres
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightTab('form')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      rightTab === 'form'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ClipboardList className="h-3 w-3" />
                    Formulaire d'inscription
                  </button>
                </div>
              )}
            </div>

            {(!editingId || rightTab === 'general') && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {editingId === null && allFormations.length > 0 && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Formation associée *</label>
                    <select
                      value={currentFormationId}
                      onChange={(e) => {
                        const newId = Number(e.target.value)
                        setCurrentFormationId(newId)
                        const found = allFormations.find(f => f.id === newId)
                        if (found) {
                          setCurrentFormationTitle(found.title)
                        }
                      }}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                    >
                      {allFormations.map(f => (
                        <option key={f.id} value={f.id}>{f.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titre libre (facultatif)</label>
                  <input
                    type="text"
                    value={form.customTitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, customTitle: e.target.value }))}
                    placeholder="Ex: Cohorte Automne 2026"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type de session</label>
                  <select
                    value={form.sessionType}
                    onChange={(e) => setForm((prev) => ({ ...prev, sessionType: e.target.value as any }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="MRH">MRH</option>
                    <option value="IOP">IOP</option>
                    <option value="CONFERENCE_FORUM">Conférence / Forum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type participation</label>
                  <select
                    value={form.participationType}
                    onChange={(e) => setForm((prev) => ({ ...prev, participationType: e.target.value as any }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="presentiel">Présentiel</option>
                    <option value="hybride">Hybride</option>
                    <option value="en_ligne">En ligne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lieu</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Ville ou 'En ligne'"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Durée (label)</label>
                  <input
                    type="text"
                    value={form.durationLabel}
                    onChange={(e) => setForm((prev) => ({ ...prev, durationLabel: e.target.value }))}
                    placeholder="Ex: 30 heures"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date début</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date fin</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Heure début</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Heure fin</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date limite d'inscription</label>
                  <input
                    type="date"
                    value={form.registrationDeadline}
                    onChange={(e) => setForm((prev) => ({ ...prev, registrationDeadline: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prix (USD, facultatif)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max participants</label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxParticipants}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Statut initial</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="ouverte">Ouverte</option>
                    <option value="complete">Complète</option>
                    <option value="fermee">Fermée</option>
                    <option value="terminee">Terminée (Archivée)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Image de couverture</span>
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                      className="text-rose-600 hover:underline"
                    >
                      Supprimer l'image
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-slate-600">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium">
                      {uploadingImage ? 'Téléversement...' : 'Sélectionner l\'image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Ou collez l'URL d'une image"
                  className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-white focus:border-blue-600 focus:outline-none"
                />
                {form.imageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 h-28">
                    <img src={form.imageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description (facultatif)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Informations supplémentaires ou programme de la session..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-blue-600 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl font-bold text-sm hover:from-blue-800 hover:to-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : editingId ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Enregistrer les modifications</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Créer la session</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            )} {/* end rightTab === 'general' */}

            {/* Onglet Formulaire d'inscription — uniquement si session existante */}
            {editingId && rightTab === 'form' && (
              <div className="mt-0">
                <SessionFormBuilder sessionId={editingId} />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
