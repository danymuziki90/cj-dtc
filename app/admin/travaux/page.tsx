'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  Search, RefreshCw, Eye, Download, Award, CheckCircle2,
  Clock, AlertTriangle, FileText, ChevronLeft, ChevronRight,
  Loader2, Filter,
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
  SubmissionFile: { id: number; name: string; url: string; size: number; mimeType: string }[]
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
        <span className="text-xs text-slate-400 self-center ml-auto">{pagination.total} remise{pagination.total !== 1 ? 's' : ''}</span>
      </div>

      {/* Diagnostic panel */}
      {diagnostics && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm text-sm space-y-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-amber-800">🔍 Résultat du diagnostic</h4>
            <button onClick={() => setDiagnostics(null)} className="text-amber-400 hover:text-amber-700 text-xs">Fermer</button>
          </div>
          <p><strong>Total Submissions en base :</strong> {diagnostics.totalSubmissionsInDb}</p>
          <p><strong>Total Assignments en base :</strong> {diagnostics.totalAssignmentsInDb}</p>
          <p><strong>Total Étudiants en base :</strong> {diagnostics.totalStudentsInDb}</p>
          <p><strong>Submissions sans session :</strong> {diagnostics.submissionsWithoutSession}</p>
          <p><strong>Résultat filtré :</strong> {diagnostics.filteredCount}</p>
          {diagnostics.totalSubmissionsInDb === 0 && (
            <p className="mt-2 rounded-lg bg-red-100 border border-red-200 px-3 py-2 text-red-700 font-semibold">
              ⚠️ Aucune soumission n'existe en base de données. Les dépôts étudiants n'ont probablement pas été enregistrés correctement.
            </p>
          )}
          {diagnostics.totalSubmissionsInDb > 0 && diagnostics.filteredCount === 0 && (
            <p className="mt-2 rounded-lg bg-amber-100 border border-amber-300 px-3 py-2 text-amber-800 font-semibold">
              ⚠️ Des soumissions existent en base mais les filtres actuels n'en retournent aucune. Essayez de réinitialiser les filtres.
            </p>
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
                            <span className="truncate max-w-[140px]">{f.name}</span>
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
