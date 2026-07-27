'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  FileText,
  Loader2,
  Paperclip,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import {
  adminInputClassName,
  adminSelectClassName,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
} from '@/components/admin-portal/ui'
import type { Assignment, AssignmentFile, SessionOption } from './types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string | null | undefined) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

function fileSizeLabel(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
  return `${(bytes / 1024).toFixed(0)} Ko`
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  title: string
  description: string
  objectives: string
  instructions: string
  type: string
  difficulty: string
  status: string
  sessionId: string
  deadline: string
  publishedAt: string
  maxFileSize: number
  maxFiles: number
  allowResubmission: boolean
  allowedFileTypes: string
  published: boolean
}

interface AssignmentFormProps {
  mode: 'create' | 'edit'
  assignment?: Assignment | null
  sessions: SessionOption[]
  onSuccess?: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}

const DEFAULT_VALUES: FormValues = {
  title: '',
  description: '',
  objectives: '',
  instructions: '',
  type: 'tp',
  difficulty: 'intermediaire',
  status: 'publie',
  sessionId: '',
  deadline: '',
  publishedAt: '',
  maxFileSize: 10,
  maxFiles: 5,
  allowResubmission: true,
  allowedFileTypes: 'pdf,doc,docx,zip,rar,png,jpg,jpeg,xls,xlsx',
  published: true,
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AssignmentForm({
  mode,
  assignment,
  sessions,
  onSuccess,
  showToast,
}: AssignmentFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES)
  const [existingFiles, setExistingFiles] = useState<AssignmentFile[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Populate when editing
  useEffect(() => {
    if (mode === 'edit' && assignment) {
      setValues({
        title: assignment.title ?? '',
        description: assignment.description ?? '',
        objectives: assignment.objectives ?? '',
        instructions: assignment.instructions ?? '',
        type: assignment.type ?? 'tp',
        difficulty: assignment.difficulty ?? 'intermediaire',
        status: assignment.status ?? 'publie',
        sessionId: assignment.sessionId ? String(assignment.sessionId) : '',
        deadline: toDatetimeLocal(assignment.deadline),
        publishedAt: toDatetimeLocal(assignment.publishedAt),
        maxFileSize: assignment.maxFileSize ?? 10,
        maxFiles: assignment.maxFiles ?? 5,
        allowResubmission: assignment.allowResubmission ?? true,
        allowedFileTypes: assignment.allowedFileTypes ?? DEFAULT_VALUES.allowedFileTypes,
        published: assignment.published ?? true,
      })
      setExistingFiles(assignment.files ?? [])
    }
  }, [mode, assignment])

  function set(key: keyof FormValues, value: any) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setNewFiles((prev) => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeNewFile(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  async function deleteExistingFile(fileId: number) {
    if (!assignment) return
    setDeletingFileId(fileId)
    try {
      const res = await fetch(`/api/admin/assignments/${assignment.id}/files/${fileId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Impossible de supprimer le fichier')
      setExistingFiles((prev) => prev.filter((f) => f.id !== fileId))
      showToast('Fichier supprimé', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error')
    } finally {
      setDeletingFileId(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values.title.trim()) return showToast('Le titre est obligatoire', 'error')
    if (!values.sessionId) return showToast('Veuillez sélectionner une session', 'error')
    if (!values.deadline) return showToast('La date limite est obligatoire', 'error')

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', values.title.trim())
      fd.append('description', values.description.trim())
      fd.append('objectives', values.objectives.trim())
      fd.append('instructions', values.instructions.trim())
      fd.append('type', values.type)
      fd.append('difficulty', values.difficulty)
      fd.append('status', values.status)
      fd.append('sessionId', values.sessionId)
      fd.append('deadline', values.deadline)
      if (values.publishedAt) fd.append('publishedAt', values.publishedAt)
      fd.append('maxFileSize', String(values.maxFileSize))
      fd.append('maxFiles', String(values.maxFiles))
      fd.append('allowResubmission', String(values.allowResubmission))
      fd.append('allowedFileTypes', values.allowedFileTypes)
      fd.append('published', String(values.status === 'publie'))

      newFiles.forEach((f, i) => fd.append(`file_${i}`, f))

      const url =
        mode === 'create'
          ? '/api/admin/assignments'
          : `/api/admin/assignments/${assignment!.id}`

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Erreur lors de l'enregistrement")

      showToast(
        mode === 'create' ? '✅ Travail créé avec succès' : '✅ Travail mis à jour',
        'success'
      )
      if (onSuccess) onSuccess()
      router.push('/admin/travaux')
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">

      {/* Section : Informations générales */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Informations générales
        </h2>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Titre <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex : TP Analyse des risques — Module 3"
            className={adminInputClassName}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Description</label>
          <textarea
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Présentation synthétique du travail…"
            className={`${adminInputClassName} resize-none`}
          />
        </div>

        {/* Type + Difficulty row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Type</label>
            <select value={values.type} onChange={(e) => set('type', e.target.value)} className={adminSelectClassName}>
              <option value="tp">TP – Travaux Pratiques</option>
              <option value="exam">Examen</option>
              <option value="project">Projet</option>
              <option value="homework">Devoir maison</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Difficulté</label>
            <select value={values.difficulty} onChange={(e) => set('difficulty', e.target.value)} className={adminSelectClassName}>
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          </div>
        </div>

        {/* Objectives */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Objectifs pédagogiques</label>
          <textarea
            value={values.objectives}
            onChange={(e) => set('objectives', e.target.value)}
            rows={3}
            placeholder="Compétences attendues à l'issue du travail…"
            className={`${adminInputClassName} resize-none`}
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Consignes détaillées</label>
          <textarea
            value={values.instructions}
            onChange={(e) => set('instructions', e.target.value)}
            rows={5}
            placeholder="Instructions étape par étape, critères d'évaluation, barème…"
            className={`${adminInputClassName} resize-none`}
          />
        </div>
      </section>

      {/* Section : Session & Dates */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Session & Dates
        </h2>

        {/* Session */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Session <span className="text-rose-500">*</span>
          </label>
          <select
            value={values.sessionId}
            onChange={(e) => set('sessionId', e.target.value)}
            className={adminSelectClassName}
            required
          >
            <option value="">— Sélectionner une session —</option>
            {sessions.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.formation?.title ?? 'Formation'} — Session du {new Date(s.startDate).toLocaleDateString('fr-FR')}
                {s.location ? ` (${s.location})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Dates row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Date limite de remise <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              type="datetime-local"
              value={values.deadline}
              onChange={(e) => set('deadline', e.target.value)}
              className={adminInputClassName}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Date de publication
              </span>
            </label>
            <input
              type="datetime-local"
              value={values.publishedAt}
              onChange={(e) => set('publishedAt', e.target.value)}
              className={adminInputClassName}
            />
          </div>
        </div>
      </section>

      {/* Section : Paramètres de remise */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Paramètres de remise
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Taille max par fichier (Mo)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={values.maxFileSize}
              onChange={(e) => set('maxFileSize', parseInt(e.target.value, 10))}
              className={adminInputClassName}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Nombre de fichiers max
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={values.maxFiles}
              onChange={(e) => set('maxFiles', parseInt(e.target.value, 10))}
              className={adminInputClassName}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Types de fichiers autorisés
          </label>
          <input
            type="text"
            value={values.allowedFileTypes}
            onChange={(e) => set('allowedFileTypes', e.target.value)}
            placeholder="pdf,doc,docx,zip,jpg,png,xls,xlsx"
            className={adminInputClassName}
          />
          <p className="mt-1 text-[11px] text-slate-400">Séparés par des virgules</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="allowResubmission"
            checked={values.allowResubmission}
            onChange={(e) => set('allowResubmission', e.target.checked)}
            className="h-4 w-4 rounded accent-blue-600"
          />
          <label htmlFor="allowResubmission" className="text-sm font-medium text-slate-700">
            Autoriser les nouvelles soumissions (remplacement)
          </label>
        </div>
      </section>

      {/* Section : Pièces jointes (consignes) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Pièces jointes – Consignes
        </h2>

        {/* Existing files (edit mode) */}
        {existingFiles.length > 0 && (
          <ul className="space-y-2">
            {existingFiles.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5"
              >
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">
                    {f.originalName || f.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{fileSizeLabel(f.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteExistingFile(f.id)}
                  disabled={deletingFileId === f.id}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                >
                  {deletingFileId === f.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* New files */}
        {newFiles.length > 0 && (
          <ul className="space-y-2">
            {newFiles.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5"
              >
                <Upload className="h-4 w-4 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-800 truncate">{f.name}</p>
                  <p className="text-[10px] text-blue-500">{fileSizeLabel(f.size)} — En attente d'upload</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileAdd}
          className="hidden"
          id="assignment-files"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-xs font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition w-full justify-center"
        >
          <Paperclip className="h-4 w-4" />
          Ajouter des fichiers de consignes
        </button>
      </section>

      {/* Section : Statut */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Statut de publication
        </h2>
        <div className="flex gap-3">
          {(['publie', 'brouillon', 'archive'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set('status', s)}
              className={`flex-1 rounded-2xl border py-3 text-xs font-bold uppercase tracking-wider transition ${
                values.status === s
                  ? s === 'publie'
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : s === 'brouillon'
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-slate-400 bg-slate-100 text-slate-700'
                  : 'border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              {s === 'publie' ? '✅ Publié' : s === 'brouillon' ? '📝 Brouillon' : '📦 Archivé'}
            </button>
          ))}
        </div>
        {values.status === 'publie' && (
          <p className="text-xs text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2 font-medium">
            Le travail sera immédiatement visible par tous les étudiants inscrits à la session sélectionnée.
          </p>
        )}
      </section>

      {/* Footer actions */}
      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={loading}
          className={`${adminPrimaryButtonClassName} flex items-center gap-2`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {mode === 'create' ? 'Créer le travail' : 'Enregistrer les modifications'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/travaux')}
          className={adminSecondaryButtonClassName}
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
