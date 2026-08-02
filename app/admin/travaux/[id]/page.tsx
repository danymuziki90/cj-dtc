'use client'

import { FormEvent, useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin-portal/AdminShell'
import { supabase } from '@/lib/supabase'

type Assignment = {
  id: number
  title: string
  description: string
  instructions: string
  deadline: string
  status: string
  Formation?: { title: string }
  TrainingSession?: { title: string }
  AssignmentFile?: { id: number, name: string, url: string }[]
}

type Submission = {
  id: number
  Student: { id: string, firstName: string, lastName: string, email: string }
  status: string
  grade: number | null
  feedback: string | null
  submittedAt: string
  SubmissionFile: { id: number, name: string, url: string }[]
}

export default function AdminGererTravailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gradingSubId, setGradingSubId] = useState<number | null>(null)
  const [gradeInput, setGradeInput] = useState('')
  const [feedbackInput, setFeedbackInput] = useState('')
  const [savingGrade, setSavingGrade] = useState(false)
  const [subsError, setSubsError] = useState<string | null>(null)

  async function loadSubmissions() {
    try {
      setSubsError(null)
      const res = await fetch(`/api/admin/travaux/${resolvedParams.id}/submissions`, { cache: 'no-store' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Erreur ${res.status}`)
      }
      const data = await res.json()
      setSubmissions(Array.isArray(data) ? data : (data.submissions ?? []))
    } catch (err) {
      setSubsError(err instanceof Error ? err.message : 'Erreur chargement dépôts')
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const res1 = await fetch(`/api/admin/travaux/${resolvedParams.id}`, { cache: 'no-store' })
        if (!res1.ok) throw new Error('Erreur chargement du travail')
        setAssignment(await res1.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      } finally {
        setLoading(false)
      }
      // Load submissions separately so an error doesn't block the page
      await loadSubmissions()
    }
    loadData()
  }, [resolvedParams.id])

  useEffect(() => {
    if (!supabase) return

    const channel = supabase.channel('submissions_travaux_channel')
    
    channel.on('broadcast', { event: 'submission_created' }, (payload) => {
      // Refresh submissions if it belongs to this assignment
      if (payload.payload?.assignmentId === Number(resolvedParams.id)) {
        fetch(`/api/admin/travaux/${resolvedParams.id}/submissions`, { cache: 'no-store' })
          .then(res => res.ok ? res.json() : Promise.reject())
          .then(data => setSubmissions(Array.isArray(data) ? data : (data.submissions ?? [])))
          .catch(err => console.error('Error refreshing submissions:', err))
      }
    })

    channel.subscribe()

    return () => {
      supabase?.removeChannel(channel)
    }
  }, [resolvedParams.id])

  async function submitGrade(e: FormEvent) {
    e.preventDefault()
    if (!gradingSubId) return
    setSavingGrade(true)
    
    try {
      const res = await fetch(`/api/admin/travaux/${resolvedParams.id}/submissions/${gradingSubId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: gradeInput,
          feedback: feedbackInput,
          status: 'graded'
        })
      })
      
      if (!res.ok) throw new Error('Erreur lors de la notation')
      
      const updatedSub = await res.json()
      setSubmissions(subs => subs.map(s => s.id === gradingSubId ? { ...s, grade: updatedSub.grade, feedback: updatedSub.feedback, status: updatedSub.status } : s))
      setGradingSubId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSavingGrade(false)
    }
  }

  if (loading) return <AdminShell title="Travaux"><div className="p-8 text-center text-slate-500">Chargement...</div></AdminShell>
  if (error || !assignment) return <AdminShell title="Travaux"><div className="p-8 text-center text-red-500">{error || 'Travail introuvable'}</div></AdminShell>

  return (
    <AdminShell title="Travaux">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button 
            onClick={() => router.push('/admin/travaux')}
            className="text-sm text-slate-500 hover:text-slate-800 mb-2 inline-flex items-center"
          >
            ← Retour aux travaux
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{assignment.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {assignment.Formation?.title} {assignment.TrainingSession ? ` - ${assignment.TrainingSession.title}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Détails du travail</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 block mb-0.5">Date limite</span>
                <span className="font-medium text-slate-900">{new Date(assignment.deadline).toLocaleDateString('fr-FR')}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Statut</span>
                <span className="font-medium text-slate-900">{assignment.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Description</span>
                <p className="text-slate-700">{assignment.description}</p>
              </div>
              {assignment.instructions && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Consignes</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{assignment.instructions}</p>
                </div>
              )}
              {assignment.AssignmentFile && assignment.AssignmentFile.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block mb-2">Fichiers joints (Admin)</span>
                  <div className="flex flex-col gap-2">
                    {assignment.AssignmentFile.map(f => (
                      <a 
                        key={f.id} 
                        href={f.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#2A52BE] hover:bg-slate-100 transition-colors w-fit"
                      >
                        📄 {f.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Dépôts des étudiants ({submissions.length})</h2>
              <button
                onClick={loadSubmissions}
                className="text-xs font-semibold text-[#2A52BE] border border-[#2A52BE]/30 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition"
              >
                ↻ Actualiser
              </button>
            </div>

            {subsError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Erreur : {subsError}
              </div>
            )}
            
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  Aucun étudiant n'a encore soumis ce travail.
                </div>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {sub.Student?.firstName || sub.Student?.lastName 
                            ? `${sub.Student.firstName || ''} ${sub.Student.lastName || ''}`.trim() 
                            : 'Étudiant inconnu'}
                        </h3>
                        <p className="text-xs text-slate-500">{sub.Student?.email}</p>
                        <p className="text-xs text-slate-400 mt-1">Déposé le {new Date(sub.submittedAt).toLocaleString('fr-FR')}</p>
                      </div>
                      <div>
                        {sub.status === 'graded' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Note: {sub.grade}/100
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            À corriger
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Fichiers joints</h4>
                      <div className="flex flex-wrap gap-2">
                        {sub.SubmissionFile && sub.SubmissionFile.length > 0 ? (
                          sub.SubmissionFile.map(f => (
                            <a 
                              key={f.id} 
                              href={f.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs inline-flex items-center px-3 py-1.5 bg-slate-100 text-[#2A52BE] rounded-md border border-slate-200 hover:bg-slate-200 transition-colors"
                            >
                              📄 {f.name}
                            </a>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400 italic">Aucun fichier</span>
                        )}
                      </div>
                    </div>

                    {gradingSubId === sub.id ? (
                      <form onSubmit={submitGrade} className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-slate-700 mb-1">Note (sur 100)</label>
                            <input
                              type="number"
                              required
                              min="0"
                              max="100"
                              value={gradeInput}
                              onChange={e => setGradeInput(e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-slate-700 mb-1">Commentaire / Feedback</label>
                            <input
                              type="text"
                              value={feedbackInput}
                              onChange={e => setFeedbackInput(e.target.value)}
                              placeholder="Très bon travail..."
                              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setGradingSubId(null)}
                            className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={savingGrade}
                            className="px-3 py-1.5 text-xs text-white bg-[#2A52BE] rounded hover:bg-[#20409A] disabled:opacity-50"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-3 flex justify-between items-center border-t border-slate-100 pt-3">
                        {sub.status === 'graded' && sub.feedback ? (
                          <p className="text-sm text-slate-600 italic">"{sub.feedback}"</p>
                        ) : (
                          <div />
                        )}
                        <button
                          onClick={() => {
                            setGradingSubId(sub.id)
                            setGradeInput(sub.grade !== null ? String(sub.grade) : '')
                            setFeedbackInput(sub.feedback || '')
                          }}
                          className="text-xs font-medium text-[#2A52BE] hover:underline"
                        >
                          {sub.status === 'graded' ? 'Modifier la note' : 'Évaluer ce dépôt'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
