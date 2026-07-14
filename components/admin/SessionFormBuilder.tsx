'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Save,
  BookMarked, Layers, AlertCircle, CheckCircle2, Loader2,
  Type, AlignLeft, Hash, Calendar, List, Circle, CheckSquare,
  ToggleLeft, FileUp, X, Edit2,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
export type QuestionType =
  | 'text_short' | 'text_long' | 'number' | 'date'
  | 'select' | 'radio' | 'checkbox' | 'yes_no' | 'file_upload'

export interface FormQuestion {
  id: number
  sessionId: number
  templateId: number | null
  label: string
  type: QuestionType
  helpText: string | null
  required: boolean
  order: number
  options: string[]
  fileTypes: string[]
}

interface Template {
  id: number
  name: string
  description: string | null
  questions: FormQuestion[]
}

interface Props {
  sessionId: number
}

// ── Constantes ────────────────────────────────────────────────────────────────
const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'text_short',   label: 'Texte court',      icon: Type,         desc: 'Réponse courte (une ligne)' },
  { value: 'text_long',    label: 'Texte long',        icon: AlignLeft,    desc: 'Paragraphe libre' },
  { value: 'number',       label: 'Nombre',            icon: Hash,         desc: 'Valeur numérique' },
  { value: 'date',         label: 'Date',              icon: Calendar,     desc: 'Sélecteur de date' },
  { value: 'select',       label: 'Liste déroulante',  icon: List,         desc: 'Un choix parmi plusieurs' },
  { value: 'radio',        label: 'Choix unique',      icon: Circle,       desc: 'Boutons radio' },
  { value: 'checkbox',     label: 'Choix multiples',   icon: CheckSquare,  desc: 'Cases à cocher' },
  { value: 'yes_no',       label: 'Oui / Non',         icon: ToggleLeft,   desc: 'Réponse binaire' },
  { value: 'file_upload',  label: 'Fichier',           icon: FileUp,       desc: 'Téléversement (PDF, image…)' },
]

const FILE_TYPE_OPTIONS = ['pdf', 'docx', 'doc', 'pptx', 'xlsx', 'jpg', 'png', 'zip']

const typesWithOptions: QuestionType[] = ['select', 'radio', 'checkbox']
const typesWithFileTypes: QuestionType[] = ['file_upload']

const EMPTY_FORM = {
  label: '',
  type: 'text_short' as QuestionType,
  helpText: '',
  required: false,
  options: [] as string[],
  fileTypes: ['pdf', 'docx'] as string[],
  newOption: '',
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function SessionFormBuilder({ sessionId }: Props) {
  const [questions, setQuestions]     = useState<FormQuestion[]>([])
  const [templates, setTemplates]     = useState<Template[]>([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Formulaire d'ajout / édition
  const [showForm, setShowForm]       = useState(false)
  const [editingId, setEditingId]     = useState<number | null>(null)
  const [form, setForm]               = useState(EMPTY_FORM)

  // Modèles
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateName, setTemplateName]           = useState('')
  const [savingTemplate, setSavingTemplate]       = useState(false)

  // ── helpers ─────────────────────────────────────────────────────────────────
  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/form-questions`, { cache: 'no-store' })
      const data = await res.json()
      setQuestions(Array.isArray(data) ? data : [])
    } catch {
      notify('Impossible de charger les questions', 'error')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions/form-templates', { cache: 'no-store' })
      const data = await res.json()
      setTemplates(Array.isArray(data) ? data : [])
    } catch { /* silencieux */ }
  }, [])

  useEffect(() => {
    loadQuestions()
    loadTemplates()
  }, [loadQuestions, loadTemplates])

  // ── Formulaire helpers ───────────────────────────────────────────────────────
  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (q: FormQuestion) => {
    setForm({
      label: q.label,
      type: q.type,
      helpText: q.helpText || '',
      required: q.required,
      options: [...(q.options || [])],
      fileTypes: [...(q.fileTypes || ['pdf'])],
      newOption: '',
    })
    setEditingId(q.id)
    setShowForm(true)
  }

  const addOption = () => {
    const val = form.newOption.trim()
    if (!val || form.options.includes(val)) return
    setForm((f) => ({ ...f, options: [...f.options, val], newOption: '' }))
  }

  const removeOption = (opt: string) =>
    setForm((f) => ({ ...f, options: f.options.filter((o) => o !== opt) }))

  const toggleFileType = (ft: string) =>
    setForm((f) => ({
      ...f,
      fileTypes: f.fileTypes.includes(ft)
        ? f.fileTypes.filter((t) => t !== ft)
        : [...f.fileTypes, ft],
    }))

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleSaveQuestion = async () => {
    if (!form.label.trim()) { notify('Le libellé est requis', 'error'); return }
    if (typesWithOptions.includes(form.type) && form.options.length < 2) {
      notify('Ajoutez au moins 2 options', 'error'); return
    }

    setSaving(true)
    try {
      const payload = {
        label: form.label,
        type: form.type,
        helpText: form.helpText || null,
        required: form.required,
        options: typesWithOptions.includes(form.type) ? form.options : [],
        fileTypes: typesWithFileTypes.includes(form.type) ? form.fileTypes : [],
      }

      let res: Response
      if (editingId) {
        res = await fetch(`/api/sessions/${sessionId}/form-questions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/sessions/${sessionId}/form-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur lors de la sauvegarde')
      }

      notify(editingId ? 'Question mise à jour !' : 'Question ajoutée !')
      resetForm()
      loadQuestions()
    } catch (err: any) {
      notify(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (q: FormQuestion) => {
    if (!confirm(`Supprimer la question "${q.label}" ?`)) return
    try {
      const res = await fetch(`/api/sessions/${sessionId}/form-questions/${q.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur de suppression')
      notify('Question supprimée')
      setQuestions((prev) => prev.filter((x) => x.id !== q.id))
    } catch (err: any) {
      notify(err.message, 'error')
    }
  }

  // ── Réordonnancement ──────────────────────────────────────────────────────────
  const moveQuestion = async (index: number, direction: 'up' | 'down') => {
    const newList = [...questions]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newList.length) return
    ;[newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]]
    const reordered = newList.map((q, i) => ({ ...q, order: i }))
    setQuestions(reordered)

    try {
      await fetch(`/api/sessions/${sessionId}/form-questions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered.map(({ id, order }) => ({ id, order }))),
      })
    } catch {
      notify('Erreur lors du réordonnancement', 'error')
      loadQuestions() // restaure l'ordre initial
    }
  }

  // ── Templates ─────────────────────────────────────────────────────────────────
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) { notify('Nommez le modèle', 'error'); return }
    if (questions.length === 0) { notify('Aucune question à enregistrer', 'error'); return }
    setSavingTemplate(true)
    try {
      const res = await fetch('/api/sessions/form-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: templateName, sessionId }),
      })
      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement')
      notify('Modèle enregistré !')
      setShowTemplateModal(false)
      setTemplateName('')
      loadTemplates()
    } catch (err: any) {
      notify(err.message, 'error')
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleApplyTemplate = async (templateId: number) => {
    const tmpl = templates.find((t) => t.id === templateId)
    if (!tmpl) return
    const replace = questions.length > 0
      ? confirm(`Remplacer les ${questions.length} question(s) existante(s) par le modèle "${tmpl.name}" ?`)
      : false

    try {
      const res = await fetch(`/api/sessions/form-templates/${templateId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetSessionId: sessionId, replaceExisting: replace }),
      })
      if (!res.ok) throw new Error('Erreur lors de l\'application')
      notify(`Modèle "${tmpl.name}" appliqué !`)
      loadQuestions()
    } catch (err: any) {
      notify(err.message, 'error')
    }
  }

  const handleDeleteTemplate = async (id: number, name: string) => {
    if (!confirm(`Supprimer le modèle "${name}" ?`)) return
    try {
      await fetch(`/api/sessions/form-templates/${id}`, { method: 'DELETE' })
      notify('Modèle supprimé')
      loadTemplates()
    } catch {
      notify('Erreur lors de la suppression', 'error')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  const typeIcon = (type: QuestionType) => {
    const t = QUESTION_TYPES.find((x) => x.value === type)
    if (!t) return null
    const Icon = t.icon
    return <Icon className="h-3.5 w-3.5" />
  }

  const typeLabel = (type: QuestionType) =>
    QUESTION_TYPES.find((x) => x.value === type)?.label ?? type

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-xl animate-fade-in-up ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {toast.type === 'success'
            ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            : <AlertCircle className="h-4 w-4 text-red-600" />}
          {toast.msg}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Formulaire d'inscription</p>
          <h3 className="text-lg font-black text-slate-900">
            Questions personnalisées
            {questions.length > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                {questions.length}
              </span>
            )}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Modèles */}
          {templates.length > 0 && (
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Layers className="h-3.5 w-3.5" />
                Appliquer un modèle
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              <div className="absolute right-0 top-full z-30 mt-1 hidden w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl group-hover:block">
                {templates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-50">
                    <button
                      type="button"
                      className="flex-1 text-left text-xs font-semibold text-slate-700"
                      onClick={() => handleApplyTemplate(t.id)}
                    >
                      {t.name}
                      <span className="ml-1 text-slate-400">({t.questions.length} Q)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(t.id, t.name)}
                      className="ml-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300"
            >
              <BookMarked className="h-3.5 w-3.5" />
              Enregistrer comme modèle
            </button>
          )}

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--admin-primary)] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[var(--admin-primary-700)]"
          >
            <Plus className="h-4 w-4" />
            Ajouter une question
          </button>
        </div>
      </div>

      {/* Liste des questions */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-semibold">Chargement…</span>
        </div>
      ) : questions.length === 0 && !showForm ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <List className="h-7 w-7" />
          </div>
          <p className="text-sm font-bold text-slate-700">Aucune question pour cette session</p>
          <p className="mt-1 text-xs text-slate-500">
            Ajoutez des questions ou appliquez un modèle existant.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--admin-primary)] px-4 py-2 text-xs font-black text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Première question
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              {/* Réordonnancement */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveQuestion(i, 'up')}
                  disabled={i === 0}
                  className="rounded p-0.5 text-slate-300 transition hover:text-slate-600 disabled:opacity-20"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <GripVertical className="h-4 w-4 text-slate-300" />
                <button
                  type="button"
                  onClick={() => moveQuestion(i, 'down')}
                  disabled={i === questions.length - 1}
                  className="rounded p-0.5 text-slate-300 transition hover:text-slate-600 disabled:opacity-20"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Numéro */}
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-500">
                {i + 1}
              </span>

              {/* Contenu */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {typeIcon(q.type)}
                    {typeLabel(q.type)}
                  </span>
                  {q.required && (
                    <span className="rounded-lg bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      Obligatoire
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{q.label}</p>
                {q.helpText && (
                  <p className="truncate text-xs text-slate-500">{q.helpText}</p>
                )}
                {q.options && q.options.length > 0 && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Options : {q.options.join(' · ')}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => openEdit(q)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(q)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout / édition de question */}
      {showForm && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-800">
              {editingId ? 'Modifier la question' : 'Nouvelle question'}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Type de question */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Type de réponse *</label>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {QUESTION_TYPES.map((t) => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t.value, options: [], fileTypes: ['pdf', 'docx'] }))}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition ${
                        form.type === t.value
                          ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white shadow-md'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[9px] font-bold leading-tight">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Libellé */}
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">
                Libellé de la question *
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Ex : Quel est votre niveau d'expérience ?"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30"
              />
            </div>

            {/* Texte d'aide */}
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">
                Texte d'aide <span className="font-normal text-slate-400">(optionnel)</span>
              </label>
              <input
                type="text"
                value={form.helpText}
                onChange={(e) => setForm((f) => ({ ...f, helpText: e.target.value }))}
                placeholder="Ex : Indiquez le nombre d'années d'expérience"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30"
              />
            </div>

            {/* Options pour select/radio/checkbox */}
            {typesWithOptions.includes(form.type) && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Options de réponse *
                  <span className="ml-1 font-normal text-slate-400">(min. 2)</span>
                </label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {form.options.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      {opt}
                      <button type="button" onClick={() => removeOption(opt)} className="text-slate-400 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.newOption}
                    onChange={(e) => setForm((f) => ({ ...f, newOption: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                    placeholder="Ajouter une option…"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30"
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Types de fichiers pour file_upload */}
            {typesWithFileTypes.includes(form.type) && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Types de fichiers acceptés
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FILE_TYPE_OPTIONS.map((ft) => (
                    <button
                      key={ft}
                      type="button"
                      onClick={() => toggleFileType(ft)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                        form.fileTypes.includes(ft)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      .{ft}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Obligatoire */}
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 accent-[var(--admin-primary)]"
              />
              <span className="text-sm font-semibold text-slate-700">Question obligatoire</span>
            </label>

            {/* Boutons */}
            <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--admin-primary)] px-4 py-2 text-xs font-black text-white shadow-sm disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal : Enregistrer comme modèle */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-black text-slate-800">Enregistrer comme modèle</h4>
              <button type="button" onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-xs text-slate-500">
              Ce modèle ({questions.length} question{questions.length > 1 ? 's' : ''}) sera réutilisable pour d'autres sessions.
            </p>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex : Formulaire MRH Standard"
              className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={savingTemplate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--admin-primary)] px-4 py-2 text-xs font-black text-white"
              >
                {savingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookMarked className="h-4 w-4" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


