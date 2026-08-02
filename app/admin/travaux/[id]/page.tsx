'use client'

import { FormEvent, useCallback, useEffect, useRef, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin-portal/AdminShell'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, RefreshCw, Download, Eye, FileText, CheckCircle2,
  Clock, AlertTriangle, XCircle, Award, MessageSquare, Lock,
  ChevronDown, ChevronUp, Loader2, Search, Filter,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type SubmissionFile = { id: number; name: string; originalName: string; url: string; mimeType: string; size: number }

type Submission = {
  id: number
  status: string
  correctionStatus: string
  grade: number | null
  maxGrade: number
  percentage: number | null
  feedback: string | null
  internalNote: string | null
  submittedAt: string
  gradedAt: string | null
  gradedBy: string | null
  Student: { id: string; firstName: string; lastName: string; email: string }
  SubmissionFile: SubmissionFile[]
  Assignment?: { title: string; maxGrade: number }
}

type Assignment = {
  id: number; title: string; description: string; instructions: string
  deadline: string; status: string; maxGrade: number
  Formation?: { title: string }
  TrainingSession?: { id: number; startDate: string }
  AssignmentFile?: { id: number; name: string; url: string }[]
}

// ─── Status config ─────────────────────────────────────────────────────────
const CORRECTION_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'En attente',  color: 'bg-amber-100 text-amber-800 border-amber-200',   icon: Clock         },
  in_review: { label: 'En revue',    color: 'bg-blue-100 text-blue-800 border-blue-200',       icon: Eye           },
  graded:    { label: 'Noté',        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  returned:  { label: 'À reprendre', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
  validated: { label: 'Validé',      color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Award         },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = CORRECTION_STATUS[status] || CORRECTION_STATUS.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.color}`}>
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// ─── File preview modal ────────────────────────────────────────────────────
function FilePreviewModal({ file, onClose }: { file: SubmissionFile; onClose: () => void }) {
  const canPreview = file.mimeType?.startsWith('image/') || file.mimeType === 'application/pdf'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <p className="font-semibold text-slate-800 text-sm truncate">{file.originalName || file.name}</p>
          <div className="flex gap-2">
            <a href={file.url} target="_blank" rel="noreferrer" download
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--cj-blue)] px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-900">
              <Download className="h-3.5 w-3.5" /> Télécharger
            </a>
            <button onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="h-[70vh] bg-slate-100 flex items-center justify-center">
          {canPreview ? (
            file.mimeType?.startsWith('image/')
              ? <img src={file.url} alt={file.name} className="max-h-full max-w-full object-contain" />
              : <iframe src={file.url} className="h-full w-full border-0" title={file.name} />
          ) : (
            <div className="text-center text-slate-500 space-y-3">
              <FileText className="h-16 w-16 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">Aperçu non disponible pour ce format</p>
              <a href={file.url} download target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-900">
                <Download className="h-4 w-4" /> Télécharger le fichier
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Grading panel ────────────────────────────────────────────────────────
function GradingPanel({
  sub, onSaved, onClose,
}: {
  sub: Submission
  onSaved: (updated: Submission) => void
  onClose: () => void
}) {
  const maxG = sub.Assignment?.maxGrade ?? sub.maxGrade ?? 100
  const [grade, setGrade]             = useState(sub.grade !== null ? String(sub.grade) : '')
  const [maxGrade, setMaxGrade]       = useState(String(maxG))
  const [feedback, setFeedback]       = useState(sub.feedback || '')
  const [internalNote, setIntNote]    = useState(sub.internalNote || '')
  const [corrStatus, setCorrStatus]   = useState(sub.correctionStatus || 'pending')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  const gradeNum  = parseFloat(grade) || 0
  const maxNum    = parseFloat(maxGrade) || 100
  const pct       = grade ? Math.round((gradeNum / maxNum) * 100) : null

  async function save(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch(
        `/api/admin/travaux/${sub.assignmentId}/submissions/${sub.id}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grade: grade ? parseFloat(grade) : null, maxGrade: parseFloat(maxGrade), feedback: feedback || null, internalNote: internalNote || null, correctionStatus: corrStatus }) }
      )
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur') }
      const updated = await res.json()
      onSaved(updated)
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--cj-blue)] focus:ring-1 focus:ring-[var(--cj-blue)]'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h3 className="font-bold text-slate-800">Panneau de correction</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><XCircle className="h-5 w-5" /></button>
      </div>
      <form onSubmit={save} className="p-5 space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">{error}</p>}

        {/* Grade row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">Note obtenue</label>
            <input type="number" min="0" max={maxNum} step="0.5" className={inputCls} value={grade} onChange={e => setGrade(e.target.value)} placeholder="Ex: 15" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">Note maximale</label>
            <input type="number" min="1" step="0.5" className={inputCls} value={maxGrade} onChange={e => setMaxGrade(e.target.value)} />
          </div>
        </div>

        {pct !== null && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Pourcentage calculé</span>
            <span className={`text-lg font-black ${pct >= 60 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">Statut de correction</label>
          <select className={inputCls} value={corrStatus} onChange={e => setCorrStatus(e.target.value)}>
            {Object.entries(CORRECTION_STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Feedback */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" /> Commentaire pour l'étudiant
          </label>
          <textarea rows={3} className={`${inputCls} resize-y`} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Votre correction visible par l'étudiant…" />
        </div>

        {/* Internal note */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" /> Note interne (admin uniquement)
          </label>
          <textarea rows={2} className={`${inputCls} resize-y`} value={internalNote} onChange={e => setIntNote(e.target.value)} placeholder="Remarques internes non visibles par l'étudiant…" />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-blue)] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Enregistrer la correction
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Submission row ───────────────────────────────────────────────────────
function SubmissionRow({
  sub, onGrade, onQuickAction, onPreview,
}: {
  sub: Submission
  onGrade: (s: Submission) => void
  onQuickAction: (subId: number, action: string) => void
  onPreview: (f: SubmissionFile) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const pct = sub.percentage ?? (sub.grade != null && sub.maxGrade > 0 ? Math.round((sub.grade / sub.maxGrade) * 100) : null)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        {/* Student info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-bold text-slate-900">{sub.Student.firstName} {sub.Student.lastName}</span>
            <StatusBadge status={sub.correctionStatus || 'pending'} />
            {pct !== null && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pct >= 60 ? 'bg-emerald-50 text-emerald-700' : pct >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                {pct}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{sub.Student.email}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Remis le {fmtDate(sub.submittedAt)}</p>
        </div>

        {/* Grade display */}
        {sub.grade !== null && (
          <div className="text-center shrink-0">
            <p className="text-2xl font-black text-[var(--cj-blue)]">{sub.grade}<span className="text-sm text-slate-400 font-normal">/{sub.maxGrade}</span></p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Note</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <button onClick={() => onGrade(sub)} title="Corriger"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--cj-blue)] px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-900">
            <Award className="h-3.5 w-3.5" /> Corriger
          </button>
          {sub.correctionStatus !== 'validated' && (
            <button onClick={() => onQuickAction(sub.id, 'validate')} title="Valider définitivement"
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100">
              ✓ Valider
            </button>
          )}
          {sub.correctionStatus !== 'returned' && (
            <button onClick={() => onQuickAction(sub.id, 'return')} title="Retourner à l'étudiant"
              className="rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100">
              ↩ Retourner
            </button>
          )}
          <button onClick={() => setExpanded(v => !v)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded: files + feedback */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          {/* Files */}
          {sub.SubmissionFile.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Fichiers remis ({sub.SubmissionFile.length})</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {sub.SubmissionFile.map(f => (
                  <div key={f.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                    <FileText className="h-5 w-5 shrink-0 text-[var(--cj-blue)]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-700 truncate">{f.originalName || f.name}</p>
                      <p className="text-[10px] text-slate-400">{fmtSize(f.size)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => onPreview(f)} className="rounded-lg bg-white border border-slate-200 p-1 hover:bg-slate-100 text-slate-600">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <a href={f.url} download target="_blank" rel="noreferrer"
                        className="rounded-lg bg-white border border-slate-200 p-1 hover:bg-slate-100 text-slate-600">
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {sub.feedback && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600 mb-1 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Commentaire étudiant
              </p>
              <p className="text-xs text-slate-700 whitespace-pre-wrap">{sub.feedback}</p>
            </div>
          )}

          {/* Internal note */}
          {sub.internalNote && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600 mb-1 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Note interne (admin)
              </p>
              <p className="text-xs text-slate-700 whitespace-pre-wrap">{sub.internalNote}</p>
            </div>
          )}

          {sub.gradedBy && (
            <p className="text-[10px] text-slate-400">Corrigé par {sub.gradedBy} — {sub.gradedAt ? fmtDate(sub.gradedAt) : '—'}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function AdminGererTravailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()

  const [assignment, setAssignment]   = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading]         = useState(true)
  const [subsLoading, setSubsLoading] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [subsError, setSubsError]     = useState<string | null>(null)

  // Grading panel
  const [gradingSub, setGradingSub]   = useState<Submission | null>(null)
  // File preview
  const [previewFile, setPreviewFile] = useState<SubmissionFile | null>(null)
  // Filters
  const [filterStatus, setFilterStatus]       = useState('')
  const [filterStudent, setFilterStudent]     = useState('')
  const [filterStudentDebounced, setDebounced] = useState('')
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebounced(filterStudent.trim()), 300)
  }, [filterStudent])

  const loadSubmissions = useCallback(async () => {
    setSubsLoading(true); setSubsError(null)
    const qs = new URLSearchParams()
    if (filterStatus)           qs.set('correctionStatus', filterStatus)
    if (filterStudentDebounced) qs.set('student', filterStudentDebounced)
    try {
      const res = await fetch(`/api/admin/travaux/${resolvedParams.id}/submissions?${qs}`, { cache: 'no-store' })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Erreur ${res.status}`) }
      const data = await res.json()
      setSubmissions(Array.isArray(data) ? data : (data.submissions ?? []))
    } catch (e: any) { setSubsError(e.message) }
    finally { setSubsLoading(false) }
  }, [resolvedParams.id, filterStatus, filterStudentDebounced])

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/admin/travaux/${resolvedParams.id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Travail introuvable')
        setAssignment(await res.json())
      } catch (e: any) { setError(e.message) }
      finally { setLoading(false) }
    }
    init()
  }, [resolvedParams.id])

  useEffect(() => { loadSubmissions() }, [loadSubmissions])

  // Supabase realtime
  useEffect(() => {
    if (!supabase) return
    const ch = supabase.channel('submissions_travaux_channel')
    ch.on('broadcast', { event: 'submission_created' }, p => {
      if (p.payload?.assignmentId === Number(resolvedParams.id)) loadSubmissions()
    })
    ch.on('broadcast', { event: 'submission_graded' }, p => {
      if (p.payload?.assignmentId === Number(resolvedParams.id)) loadSubmissions()
    })
    ch.subscribe()
    return () => { supabase?.removeChannel(ch) }
  }, [resolvedParams.id, loadSubmissions])

  async function handleQuickAction(subId: number, action: string) {
    const sub = submissions.find(s => s.id === subId)
    if (!sub) return
    try {
      const res = await fetch(`/api/admin/travaux/${resolvedParams.id}/submissions/${subId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Erreur'); return }
      const updated = await res.json()
      setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, ...updated } : s))
    } catch { alert('Erreur réseau') }
  }

  function handleGradeSaved(updated: Submission) {
    setSubmissions(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s))
    setGradingSub(null)
  }

  // Stats
  const stats = {
    total:     submissions.length,
    pending:   submissions.filter(s => s.correctionStatus === 'pending').length,
    graded:    submissions.filter(s => ['graded','validated'].includes(s.correctionStatus)).length,
    returned:  submissions.filter(s => s.correctionStatus === 'returned').length,
    avgGrade:  (() => {
      const graded = submissions.filter(s => s.grade !== null)
      if (!graded.length) return null
      return (graded.reduce((a, b) => a + (b.grade ?? 0), 0) / graded.length).toFixed(1)
    })(),
  }

  if (loading) return <AdminShell title="Travaux"><div className="flex items-center justify-center py-20 text-slate-500 gap-2"><Loader2 className="h-5 w-5 animate-spin" />Chargement…</div></AdminShell>
  if (error || !assignment) return <AdminShell title="Travaux"><div className="p-8 text-center text-red-500">{error || 'Travail introuvable'}</div></AdminShell>

  return (
    <AdminShell title="Travaux">
      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <button onClick={() => router.push('/admin/travaux')} className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Retour aux travaux
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{assignment.title}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {assignment.Formation?.title}
            {assignment.TrainingSession ? ` — Session du ${new Date(assignment.TrainingSession.startDate).toLocaleDateString('fr-FR')}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSubmissions} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${subsLoading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: assignment details */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-800">Détails du travail</h2>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs text-slate-400 font-semibold uppercase mb-0.5">Date limite</dt><dd className="font-medium">{new Date(assignment.deadline).toLocaleDateString('fr-FR')}</dd></div>
              <div><dt className="text-xs text-slate-400 font-semibold uppercase mb-0.5">Statut</dt><dd>{assignment.status}</dd></div>
              <div><dt className="text-xs text-slate-400 font-semibold uppercase mb-0.5">Note max</dt><dd className="font-bold text-[var(--cj-blue)]">{assignment.maxGrade} pts</dd></div>
              {assignment.description && <div><dt className="text-xs text-slate-400 font-semibold uppercase mb-0.5">Description</dt><dd className="text-slate-700">{assignment.description}</dd></div>}
              {assignment.instructions && <div><dt className="text-xs text-slate-400 font-semibold uppercase mb-0.5">Consignes</dt><dd className="text-slate-700 whitespace-pre-wrap text-xs">{assignment.instructions}</dd></div>}
            </dl>
            {assignment.AssignmentFile && assignment.AssignmentFile.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Documents joints</p>
                {assignment.AssignmentFile.map(f => (
                  <a key={f.id} href={f.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-[var(--cj-blue)] hover:bg-slate-100 mb-1.5">
                    <FileText className="h-3.5 w-3.5 shrink-0" /> {f.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-slate-800">Statistiques</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total remises', value: stats.total,    color: 'text-slate-700' },
                { label: 'En attente',    value: stats.pending,  color: 'text-amber-600' },
                { label: 'Notés',         value: stats.graded,   color: 'text-emerald-600' },
                { label: 'À reprendre',   value: stats.returned, color: 'text-orange-600' },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {stats.avgGrade !== null && (
              <div className="mt-3 rounded-xl bg-[var(--cj-blue)]/5 border border-[var(--cj-blue)]/10 p-3 text-center">
                <p className="text-2xl font-black text-[var(--cj-blue)]">{stats.avgGrade}<span className="text-sm text-slate-400">/{assignment.maxGrade}</span></p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Moyenne de classe</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: submissions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Grading panel */}
          {gradingSub && (
            <GradingPanel sub={gradingSub} onSaved={handleGradeSaved} onClose={() => setGradingSub(null)} />
          )}

          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={filterStudent} onChange={e => setFilterStudent(e.target.value)}
                placeholder="Filtrer par étudiant…"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--cj-blue)]" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--cj-blue)]">
              <option value="">Tous les statuts</option>
              {Object.entries(CORRECTION_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <div className="text-xs text-slate-500 self-center">{submissions.length} remise{submissions.length !== 1 ? 's' : ''}</div>
          </div>

          {/* Error */}
          {subsError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{subsError}</div>
          )}

          {/* List */}
          {subsLoading && submissions.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Chargement des remises…
            </div>
          ) : submissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center text-slate-400">
              <FileText className="mx-auto h-10 w-10 mb-3 text-slate-300" />
              <p className="font-semibold text-slate-600">Aucune remise trouvée</p>
              <p className="text-sm mt-1">Les travaux déposés par les étudiants apparaîtront ici.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map(sub => (
                <SubmissionRow
                  key={sub.id}
                  sub={sub}
                  onGrade={setGradingSub}
                  onQuickAction={handleQuickAction}
                  onPreview={setPreviewFile}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
