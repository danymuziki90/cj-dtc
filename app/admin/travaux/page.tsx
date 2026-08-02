'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-portal/AdminShell'
import { supabase } from '@/lib/supabase'
import {
  Search, RefreshCw, Eye, Download, Award, CheckCircle2,
  Clock, AlertTriangle, FileText, ChevronLeft, ChevronRight,
  Loader2, Filter, Activity,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type AssignmentItem = {
  id: number; title: string; type: string; deadline: string
  status: string; published: boolean; maxGrade: number
  Formation?: { title: string }
  TrainingSession?: { id: number; startDate: string }
  createdAt: string
}

type SubmissionItem = {
  id: number; status: string; correctionStatus: string
  grade: number | null; maxGrade: number; percentage: number | null
  feedback: string | null; submittedAt: string; gradedAt: string | null; gradedBy: string | null
  Student: { id: string; firstName: string; lastName: string; email: string }
  SubmissionFile: { id: number; name: string; originalName: string; url: string; size: number; mimeType: string }[]
  Assignment: { id: number; title: string; maxGrade: number; type: string; Formation?: { title: string }; TrainingSession?: { id: number; startDate: string } }
}

type Pagination = { page: number; pageSize: number; total: number; pageCount: number }

// ─── Status config ─────────────────────────────────────────────────────────
const CS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: 'bg-amber-100 text-amber-800 border-amber-200'       },
  in_review: { label: 'En revue',    color: 'bg-blue-100 text-blue-800 border-blue-200'           },
  graded:    { label: 'Noté',        color: 'bg-emerald-100 text-emerald-800 border-emerald-200'  },
  returned:  { label: 'À reprendre', color: 'bg-orange-100 text-orange-800 border-orange-200'     },
  validated: { label: 'Validé',      color: 'bg-purple-100 text-purple-800 border-purple-200'     },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = CS[status] || CS.pending
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
}

function fmtDate(iso: string) { return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) }
function fmtSize(b: number) { return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} Ko` : `${(b / (1024 * 1024)).toFixed(1)} Mo` }

// ─── Manual Submission Modal ────────────────────────────────────────────────
function ManualSubmissionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [students,    setStudents]    = useState<{id:string;firstName:string;lastName:string;email:string}[]>([])
  const [assignments, setAssignments] = useState<{id:number;title:string;maxGrade:number}[]>([])
  const [studentId,   setStudentId]   = useState('')
  const [assignmentId,setAssignmentId]= useState('')
  const [fileUrl,     setFileUrl]     = useState('')
  const [fileName,    setFileName]    = useState('')
  const [note,        setNote]        = useState('')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string|null>(null)
  const [success,     setSuccess]     = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/travaux/diagnostic', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([diag]) => {
      setStudents(diag.allStudents?.map((s:any) => ({
        id: s.id, firstName: s.name?.split(' ')[0] || '', lastName: s.name?.split(' ').slice(1).join(' ') || '', email: s.email
      })) || [])
    }).catch(() => {})

    fetch('/api/admin/travaux?pageSize=50', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setAssignments(d.assignments?.map((a:any) => ({ id: a.id, title: a.title, maxGrade: a.maxGrade })) || []))
      .catch(() => {})
  }, [])

  async function handleSave() {
    if (!studentId || !assignmentId) { setError('Sélectionnez un étudiant et un travail.'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/admin/travaux/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: Number(assignmentId), studentId, fileUrl: fileUrl || undefined, fileName: fileName || undefined, note: note || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`)
      setSuccess(true)
      setTimeout(() => { onSuccess(); onClose() }, 1200)
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const selectedAssignment = assignments.find(a => String(a.id) === assignmentId)
  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--cj-blue)]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[var(--cj-blue)] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Administration</p>
            <h3 className="text-sm font-bold text-white mt-0.5">Enregistrer une soumission manuellement</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-lg font-bold">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {success && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-800 text-sm font-bold">
              ✅ Soumission enregistrée avec succès !
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Étudiant *</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} className={inputCls}>
              <option value="">— Sélectionner un étudiant —</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Travail *</label>
            <select value={assignmentId} onChange={e => setAssignmentId(e.target.value)} className={inputCls}>
              <option value="">— Sélectionner un travail —</option>
              {assignments.map(a => (
                <option key={a.id} value={String(a.id)}>{a.title} (sur {a.maxGrade} pts)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">URL du fichier (optionnel)</label>
            <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://..." className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom du fichier (optionnel)</label>
            <input value={fileName} onChange={e => setFileName(e.target.value)} placeholder="rapport_final.pdf" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note {selectedAssignment ? `(sur ${selectedAssignment.maxGrade} pts, optionnel)` : '(optionnel)'}
            </label>
            <input type="number" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Ex: 75" min={0} max={selectedAssignment?.maxGrade || 100} className={inputCls} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving || success}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer la soumission
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Pipeline Diagnostic Panel ────────────────────────────────────────────
function PipelineDiagnostic() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function runDiagnostic() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/travaux/diagnostic', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `Erreur ${res.status}`)
      setData(json)
      setOpen(true)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <button onClick={runDiagnostic} disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
          Diagnostic pipeline complet
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {open && data && (
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-blue-900 text-base">🔬 Diagnostic pipeline soumissions</h4>
            <button onClick={() => setOpen(false)} className="text-blue-400 hover:text-blue-700 text-xs font-bold">Fermer</button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: 'Étudiants', value: data.summary.totalStudents },
              { label: 'Travaux', value: data.summary.totalAssignments },
              { label: 'Soumissions', value: data.summary.totalSubmissions, alert: data.summary.totalSubmissions === 0 },
              { label: 'Inscriptions actives', value: data.summary.totalActiveEnrollments, alert: data.summary.totalActiveEnrollments === 0 },
              { label: 'Sans inscription', value: data.summary.studentsWithoutActiveEnrollment, alert: data.summary.studentsWithoutActiveEnrollment > 0 },
            ].map(({ label, value, alert }) => (
              <div key={label} className={`rounded-xl border px-3 py-2 ${alert ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                <div className={`text-xl font-black ${alert ? 'text-red-600' : 'text-slate-800'}`}>{value}</div>
                <div className="text-[10px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Issues */}
          {data.issues.length > 0 && (
            <div className="space-y-1.5">
              <p className="font-bold text-red-700 text-xs uppercase tracking-wide">⚠️ Problèmes détectés ({data.issues.length})</p>
              {data.issues.map((issue: string, i: number) => (
                <div key={i} className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800 font-semibold">
                  {issue}
                </div>
              ))}
            </div>
          )}

          {data.issues.length === 0 && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800 font-bold">
              ✅ Aucun problème de configuration détecté. Le POST étudiant échoue probablement à cause d'une erreur d'authentification ou de token expiré.
            </div>
          )}

          {/* Assignment access details */}
          {data.assignmentAccess.map((a: any) => (
            <div key={a.assignmentId} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${a.published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {a.published ? 'Publié' : 'Non publié'}
                </span>
                <span className="font-bold text-slate-800">{a.assignmentTitle}</span>
                <span className="text-xs text-slate-400">formationId={a.formationId}, sessionId={a.sessionId ?? 'null'}</span>
              </div>
              <div className="text-xs text-slate-600">
                <strong>{a.eligibleStudentCount}</strong> étudiant(s) éligible(s) — <strong>{a.submissionCount}</strong> soumission(s)
              </div>
              {a.eligibleStudents.length > 0 && (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase font-bold">
                      <th className="text-left pb-1">Étudiant</th>
                      <th className="text-left pb-1">Email</th>
                      <th className="text-left pb-1">Statut compte</th>
                      <th className="text-left pb-1">A soumis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.eligibleStudents.map((s: any) => (
                      <tr key={s.id} className="border-t border-slate-100">
                        <td className="py-1 font-semibold text-slate-800">{s.name}</td>
                        <td className="py-1 text-slate-500">{s.email}</td>
                        <td className="py-1">
                          <span className={`font-bold ${['ACTIVE', 'active'].includes(s.status) ? 'text-emerald-600' : 'text-red-600'}`}>
                            {s.status || 'inconnu'}
                          </span>
                        </td>
                        <td className="py-1">
                          {s.hasSubmitted
                            ? <span className="text-emerald-600 font-bold">✓ Oui</span>
                            : <span className="text-slate-400">Non</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {a.eligibleStudentCount === 0 && (
                <p className="text-xs text-red-600 font-semibold">
                  Aucun étudiant n'est inscrit à la formation/session de ce travail.
                  Les étudiants ne voient pas ce travail dans leur espace.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Travaux list ────────────────────────────────────────────────────
function TravauxTab() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [search, setSearch]           = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/travaux?search=${encodeURIComponent(search)}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Erreur chargement')
      const data = await res.json()
      setAssignments(data.assignments)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [search])

  async function del(id: number) {
    if (!confirm('Supprimer ce travail ?')) return
    await fetch(`/api/admin/travaux/${id}`, { method: 'DELETE' })
    setAssignments(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un travail…"
            className="rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--cj-blue)] w-64" />
        </div>
        <Link href="/admin/travaux/nouveau" className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 shadow">
          + Nouveau travail
        </Link>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wide border-b border-slate-200">
            <tr>
              <th className="px-5 py-3 text-left">Titre</th>
              <th className="px-5 py-3 text-left">Formation</th>
              <th className="px-5 py-3 text-left">Date limite</th>
              <th className="px-5 py-3 text-left">Note max</th>
              <th className="px-5 py-3 text-left">Statut</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">Aucun travail trouvé.</td></tr>
            ) : assignments.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-semibold text-slate-900">
                  {a.title}
                  <span className="ml-2 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">{a.type}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="text-slate-900">{a.Formation?.title || '—'}</div>
                  {a.TrainingSession && <div className="text-slate-400 text-xs">{new Date(a.TrainingSession.startDate).toLocaleDateString('fr-FR')}</div>}
                </td>
                <td className="px-5 py-3">{new Date(a.deadline).toLocaleDateString('fr-FR')}</td>
                <td className="px-5 py-3 font-bold text-[var(--cj-blue)]">{a.maxGrade} pts</td>
                <td className="px-5 py-3">
                  {a.published
                    ? <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">Publié</span>
                    : <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">Brouillon</span>}
                </td>
                <td className="px-5 py-3 text-right space-x-3">
                  <Link href={`/admin/travaux/${a.id}`} className="text-[var(--cj-blue)] hover:underline font-semibold">Gérer</Link>
                  <button onClick={() => del(a.id)} className="text-red-600 hover:underline font-semibold">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab: Remises globales ────────────────────────────────────────────────
function RemisesTab() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [formations, setFormations]   = useState<{id:number;title:string}[]>([])
  const [assignments, setAssignments] = useState<{id:number;title:string}[]>([])
  const [pagination, setPagination]   = useState<Pagination>({ page:1, pageSize:20, total:0, pageCount:1 })
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [showManualModal, setShowManualModal] = useState(false)

  const [fFormation,  setFFormation]  = useState('')
  const [fAssignment, setFAssignment] = useState('')
  const [fStatus,     setFStatus]     = useState('')
  const [fStudent,    setFStudent]    = useState('')
  const [fStudentD,   setFStudentD]   = useState('')
  const [page,        setPage]        = useState(1)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setFStudentD(fStudent.trim()); setPage(1) }, 300)
  }, [fStudent])

  const load = useCallback(async (p: number, withDebug = false) => {
    setLoading(true); setError(null)
    const qs = new URLSearchParams({ page: String(p), pageSize: '20' })
    if (fFormation)  qs.set('formationId',      fFormation)
    if (fAssignment) qs.set('assignmentId',      fAssignment)
    if (fStatus)     qs.set('correctionStatus',  fStatus)
    if (fStudentD)   qs.set('student',           fStudentD)
    if (withDebug)   qs.set('debug',             'true')
    try {
      const res = await fetch(`/api/admin/travaux/submissions?${qs}`, { cache: 'no-store' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        if (res.status === 401) throw new Error('Authentification requise. Veuillez vous reconnecter.')
        throw new Error(errData.error || errData.details || `Erreur serveur (${res.status})`)
      }
      const data = await res.json()
      setSubmissions(data.submissions || [])
      setPagination(data.pagination)
      if (data.formations) setFormations(data.formations)
      if (data.assignments) setAssignments(data.assignments)
      if (data.diagnostics) setDiagnostics(data.diagnostics)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [fFormation, fAssignment, fStatus, fStudentD])

  useEffect(() => { load(page) }, [page, fFormation, fAssignment, fStatus, fStudentD])

  // ── Supabase realtime: refresh when a student submits ──────────────────────
  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('submissions_travaux_channel')   // doit correspondre au canal du broadcast étudiant
      .on('broadcast', { event: 'submission_created' }, () => {
        load(page)
      })
      .on('broadcast', { event: 'submission_graded' }, () => {
        load(page)
      })
    channel.subscribe()
    return () => { supabase?.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fFormation, fAssignment, fStatus, fStudentD])

  const selCls = 'rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--cj-blue)]'
  const inputCls = 'rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--cj-blue)]'

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={fStudent} onChange={e => setFStudent(e.target.value)} placeholder="Étudiant…"
            className={`${inputCls} pl-9 w-full`} />
        </div>
        <select value={fFormation} onChange={e => { setFFormation(e.target.value); setFAssignment(''); setPage(1) }} className={selCls}>
          <option value="">Toutes formations</option>
          {formations.map(f => <option key={f.id} value={String(f.id)}>{f.title}</option>)}
        </select>
        <select value={fAssignment} onChange={e => { setFAssignment(e.target.value); setPage(1) }} className={selCls}>
          <option value="">Tous travaux</option>
          {assignments.map(a => <option key={a.id} value={String(a.id)}>{a.title}</option>)}
        </select>
        <select value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(1) }} className={selCls}>
          <option value="">Tous statuts</option>
          {Object.entries(CS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => load(page)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" title="Actualiser">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={() => load(page, true)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100" title="Lancer un diagnostic">
          🔍 Diagnostic
        </button>
        <button onClick={() => setShowManualModal(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100" title="Enregistrer une soumission manuellement">
          ✏️ Saisie manuelle
        </button>
        <span className="text-xs text-slate-400 self-center ml-auto">{pagination.total} remise{pagination.total !== 1 ? 's' : ''}</span>
      </div>

      {/* Manual submission modal */}
      {showManualModal && (
        <ManualSubmissionModal
          onClose={() => setShowManualModal(false)}
          onSuccess={() => { load(1); setPage(1) }}
        />
      )}

      {/* Diagnostic panel */}
      {diagnostics && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm text-sm space-y-2">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-amber-800">🔍 Résultat du diagnostic</h4>
            <button onClick={() => setDiagnostics(null)} className="text-amber-400 hover:text-amber-700 text-xs">Fermer</button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Submissions en base', value: diagnostics.totalSubmissionsInDb, alert: diagnostics.totalSubmissionsInDb === 0 },
              { label: 'Assignments en base',  value: diagnostics.totalAssignmentsInDb,  alert: diagnostics.totalAssignmentsInDb === 0 },
              { label: 'Étudiants en base',    value: diagnostics.totalStudentsInDb,     alert: false },
              { label: 'Sans session',         value: diagnostics.submissionsWithoutSession, alert: false },
            ].map(({ label, value, alert }) => (
              <div key={label} className={`rounded-lg border px-3 py-2 ${alert ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                <div className={`text-lg font-black ${alert ? 'text-red-600' : 'text-slate-800'}`}>{value}</div>
                <div className="text-[10px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">Filtre appliqué : <code className="bg-white border border-slate-200 rounded px-1">{diagnostics.filteredCount} résultat(s)</code></p>

          {/* Status banners */}
          {diagnostics.totalSubmissionsInDb === 0 && (
            <div className="rounded-lg bg-red-100 border border-red-200 px-3 py-2 text-red-700 font-semibold text-xs">
              ⚠️ Aucune soumission en base. Les dépôts étudiants n'ont pas été enregistrés.
              Vérifiez les logs de <code>/api/student/assignments</code> (POST).
            </div>
          )}
          {diagnostics.totalSubmissionsInDb > 0 && diagnostics.filteredCount === 0 && (
            <div className="rounded-lg bg-amber-100 border border-amber-300 px-3 py-2 text-amber-800 font-semibold text-xs">
              ⚠️ Des soumissions existent ({diagnostics.totalSubmissionsInDb}) mais aucune ne correspond aux filtres.
              Réinitialisez les filtres pour voir toutes les remises.
            </div>
          )}

          {/* Recent submissions table */}
          {diagnostics.recentSubmissions && diagnostics.recentSubmissions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-bold text-amber-800 mb-1">5 dernières soumissions en base :</p>
              <div className="overflow-x-auto rounded-lg border border-amber-200">
                <table className="w-full text-xs text-slate-600 bg-white">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-2 py-1.5 text-left">ID</th>
                      <th className="px-2 py-1.5 text-left">Étudiant</th>
                      <th className="px-2 py-1.5 text-left">Travail</th>
                      <th className="px-2 py-1.5 text-left">Statut</th>
                      <th className="px-2 py-1.5 text-left">Fichiers</th>
                      <th className="px-2 py-1.5 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {diagnostics.recentSubmissions.map((s: any) => (
                      <tr key={s.id}>
                        <td className="px-2 py-1.5 font-mono text-slate-400">#{s.id}</td>
                        <td className="px-2 py-1.5">
                          <div className="font-semibold text-slate-800">{s.studentName}</div>
                          <div className="text-[10px] text-slate-400">{s.studentEmail}</div>
                        </td>
                        <td className="px-2 py-1.5 text-slate-700">{s.assignmentTitle || `#${s.assignmentId}`}</td>
                        <td className="px-2 py-1.5">
                          <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold border ${CS[s.correctionStatus]?.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {CS[s.correctionStatus]?.label || s.correctionStatus}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          {s.fileCount > 0
                            ? <span className="text-emerald-700 font-bold">✓ {s.fileCount} fichier(s)</span>
                            : <span className="text-red-500 font-bold">⚠ Aucun</span>}
                        </td>
                        <td className="px-2 py-1.5 text-slate-400 whitespace-nowrap">
                          {new Date(s.submittedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left">Étudiant</th>
                <th className="px-5 py-3 text-left">Travail</th>
                <th className="px-5 py-3 text-left">Formation</th>
                <th className="px-5 py-3 text-left">Remis le</th>
                <th className="px-5 py-3 text-left">Fichiers</th>
                <th className="px-5 py-3 text-left">Note</th>
                <th className="px-5 py-3 text-left">Statut</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && submissions.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" /></td></tr>
              ) : submissions.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400">Aucune remise trouvée.</td></tr>
              ) : submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-900">{sub.Student.firstName} {sub.Student.lastName}</div>
                    <div className="text-xs text-slate-400">{sub.Student.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-800">{sub.Assignment?.title}</div>
                    <span className="text-[10px] uppercase font-bold text-blue-600">{sub.Assignment?.type}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{sub.Assignment?.Formation?.title || '—'}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(sub.submittedAt)}</td>
                  <td className="px-5 py-3">
                    {sub.SubmissionFile.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {sub.SubmissionFile.slice(0, 2).map(f => (
                          <a key={f.id} href={f.url} target="_blank" rel="noreferrer" download
                            className="flex items-center gap-1 text-xs text-[var(--cj-blue)] hover:underline">
                            <Download className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{f.originalName || f.name}</span>
                            <span className="text-slate-400">({fmtSize(f.size)})</span>
                          </a>
                        ))}
                        {sub.SubmissionFile.length > 2 && <span className="text-xs text-slate-400">+{sub.SubmissionFile.length - 2} autre(s)</span>}
                      </div>
                    ) : <span className="text-xs text-slate-400 italic">Aucun fichier</span>}
                  </td>
                  <td className="px-5 py-3">
                    {sub.grade !== null ? (
                      <div>
                        <span className="font-bold text-slate-900">{sub.grade}</span>
                        <span className="text-slate-400 text-xs">/{sub.maxGrade}</span>
                        {sub.percentage !== null && (
                          <span className={`ml-1 text-xs font-bold ${sub.percentage >= 60 ? 'text-emerald-600' : sub.percentage >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                            ({sub.percentage}%)
                          </span>
                        )}
                      </div>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={sub.correctionStatus || 'pending'} /></td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/travaux/${sub.assignmentId}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-[var(--cj-blue)]/10 px-2.5 py-1.5 text-xs font-bold text-[var(--cj-blue)] hover:bg-[var(--cj-blue)]/20">
                      <Eye className="h-3 w-3" /> Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Précédent
            </button>
            <span className="text-xs text-slate-500">Page {page} / {pagination.pageCount}</span>
            <button disabled={page >= pagination.pageCount} onClick={() => setPage(p => p + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              Suivant <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function AdminTravauxPage() {
  const [tab, setTab] = useState<'travaux' | 'remises'>('travaux')
  const tabCls = (t: string) => `px-5 py-2.5 text-sm font-bold rounded-xl transition ${tab === t ? 'bg-[var(--cj-blue)] text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`

  return (
    <AdminShell title="Travaux">
      <PipelineDiagnostic />
      <div className="flex gap-2 mb-6">
        <button className={tabCls('travaux')} onClick={() => setTab('travaux')}>
          <FileText className="inline h-4 w-4 mr-1.5 -mt-0.5" /> Travaux publiés
        </button>
        <button className={tabCls('remises')} onClick={() => setTab('remises')}>
          <Award className="inline h-4 w-4 mr-1.5 -mt-0.5" /> Remises des étudiants
        </button>
      </div>
      {tab === 'travaux' ? <TravauxTab /> : <RemisesTab />}
    </AdminShell>
  )
}
