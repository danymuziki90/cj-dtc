'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Download, Loader2, Search, Users, ClipboardList,
  ChevronDown, ChevronUp, Eye, X, AlertCircle,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormQuestion {
  id: number
  label: string
  type: string
  required: boolean
  order: number
}

interface FormAnswer {
  id: number
  questionId: number
  enrollmentId: number
  textValue: string | null
  jsonValue: string | null
  fileUrl: string | null
  fileName: string | null
  enrollment: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
  question: FormQuestion
}

interface SessionInfo {
  id: number
  formationTitle: string
  startDate: string
  endDate: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseAnswer(ans: FormAnswer): string {
  if (ans.textValue !== null && ans.textValue !== undefined) return ans.textValue
  if (ans.jsonValue) {
    try {
      const arr = JSON.parse(ans.jsonValue)
      return Array.isArray(arr) ? arr.join(', ') : ans.jsonValue
    } catch { return ans.jsonValue }
  }
  if (ans.fileUrl) return ans.fileName || ans.fileUrl
  return '—'
}

// Groupe les réponses par enrollmentId
function groupByEnrollment(
  questions: FormQuestion[],
  answers: FormAnswer[]
): Array<{ enrollment: FormAnswer['enrollment']; answers: Map<number, string> }> {
  const map = new Map<number, { enrollment: FormAnswer['enrollment']; answers: Map<number, string> }>()
  for (const a of answers) {
    if (!map.has(a.enrollmentId)) {
      map.set(a.enrollmentId, { enrollment: a.enrollment, answers: new Map() })
    }
    map.get(a.enrollmentId)!.answers.set(a.questionId, parseAnswer(a))
  }
  return Array.from(map.values())
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SessionFormAnswersPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [questions, setQuestions] = useState<FormQuestion[]>([])
  const [answers, setAnswers] = useState<FormAnswer[]>([])
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<typeof answers[0]['enrollment'] | null>(null)
  const [exporting, setExporting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [sessionRes, answersRes] = await Promise.all([
        fetch(`/api/sessions/${sessionId}`),
        fetch(`/api/sessions/${sessionId}/form-answers`),
      ])

      if (sessionRes.ok) {
        const s = await sessionRes.json()
        setSession({
          id: s.id,
          formationTitle: s.formation?.title || `Session #${s.id}`,
          startDate: s.startDate,
          endDate: s.endDate,
        })
      }

      if (answersRes.ok) {
        const data = await answersRes.json()
        setQuestions(Array.isArray(data.questions) ? data.questions : [])
        setAnswers(Array.isArray(data.answers) ? data.answers : [])
      }
    } catch (err) {
      console.error('Erreur de chargement:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => { loadData() }, [loadData])

  const rows = groupByEnrollment(questions, answers)

  const filtered = rows.filter(({ enrollment }) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      enrollment.firstName.toLowerCase().includes(q) ||
      enrollment.lastName.toLowerCase().includes(q) ||
      enrollment.email.toLowerCase().includes(q)
    )
  })

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/form-answers/export`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reponses_session_${sessionId}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors de l\'export')
    } finally {
      setExporting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="font-semibold">Chargement des réponses…</span>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="p-8">
        <Link href="/admin/enrollments" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" /> Retour aux inscriptions
        </Link>
        <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
          <ClipboardList className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-base font-bold text-slate-600">Aucune question personnalisée pour cette session</p>
          <p className="mt-1 text-sm text-slate-400">
            Ajoutez des questions depuis la gestion des sessions.
          </p>
          <Link
            href="/admin/formations"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Gérer les sessions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/enrollments" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-3.5 w-3.5" /> Retour aux inscriptions
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            Réponses au formulaire
          </h1>
          {session && (
            <p className="mt-0.5 text-sm text-slate-500">
              {session.formationTitle} · Session #{session.id}
              <span className="mx-1.5 text-slate-300">·</span>
              {new Date(session.startDate).toLocaleDateString('fr-FR')} → {new Date(session.endDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-black text-slate-800">{rows.length}</span>
            <span className="text-xs text-slate-500">répondant{rows.length !== 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || rows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un étudiant…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400/40"
        />
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 py-16 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-bold text-slate-500">Aucun résultat trouvé</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  Étudiant
                </th>
                {questions.map((q) => (
                  <th key={q.id} className="max-w-[160px] px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="truncate">{q.label}</span>
                      {q.required && <span className="text-red-400">*</span>}
                    </div>
                  </th>
                ))}
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(({ enrollment, answers: ansMap }, idx) => (
                <tr
                  key={enrollment.id}
                  className={`transition hover:bg-blue-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-800">
                        {enrollment.firstName} {enrollment.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{enrollment.email}</p>
                    </div>
                  </td>
                  {questions.map((q) => {
                    const val = ansMap.get(q.id) || '—'
                    const empty = val === '—'
                    return (
                      <td key={q.id} className="max-w-[160px] px-4 py-3">
                        <span className={`truncate block text-xs ${empty ? 'text-slate-300 italic' : 'text-slate-700 font-medium'}`}>
                          {val}
                        </span>
                      </td>
                    )
                  })}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(enrollment)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                      title="Voir toutes les réponses"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal détail étudiant */}
      {selected && (() => {
        const row = rows.find(r => r.enrollment.id === selected.id)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-4 text-white">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Réponses</p>
                  <h2 className="text-base font-black">{selected.firstName} {selected.lastName}</h2>
                  <p className="text-xs text-blue-300">{selected.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full p-1.5 hover:bg-white/20 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Réponses */}
              <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 p-2">
                {questions.map((q) => {
                  const val = row?.answers.get(q.id) || '—'
                  const empty = val === '—'
                  return (
                    <div key={q.id} className="px-4 py-3">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {q.label}
                        {q.required && <span className="ml-1 text-red-400">*</span>}
                      </p>
                      <p className={`text-sm font-semibold ${empty ? 'text-slate-300 italic' : 'text-slate-800'}`}>
                        {val}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
