'use client'

import { useState } from 'react'
import { Award, Check, Loader2, MessageSquare, X } from 'lucide-react'
import {
  adminInputClassName,
  adminSelectClassName,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
} from '@/components/admin-portal/ui'
import type { Submission } from './types'

interface GradeDrawerProps {
  submission: Submission | null
  onClose: () => void
  onSaved: (updated: Submission) => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}

export function GradeDrawer({ submission, onClose, onSaved, showToast }: GradeDrawerProps) {
  const [grade, setGrade] = useState<string>(String(submission?.grade ?? ''))
  const [feedback, setFeedback] = useState<string>(submission?.feedback ?? '')
  const [status, setStatus] = useState<'graded' | 'returned'>(
    submission?.status === 'returned' ? 'returned' : 'graded'
  )
  const [loading, setLoading] = useState(false)

  if (!submission) return null

  const student = submission.student
  const assignment = submission.assignment

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!submission) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: grade !== '' ? parseFloat(grade) : null, feedback, status }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Erreur lors de la correction')
      showToast('✅ Correction enregistrée avec succès', 'success')
      onSaved(data.submission)
      onClose()
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Correction & Notation</h2>
            <p className="text-xs text-slate-500">
              {student.firstName} {student.lastName} — {assignment?.title ?? ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Student info */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Étudiant</p>
            <p className="text-sm font-bold text-slate-900">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-xs text-slate-500">{student.email} · #{student.studentNumber}</p>
            <p className="text-xs text-slate-400">
              Remis le {new Date(submission.submittedAt).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>

          {/* Files submitted */}
          {submission.files?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fichiers remis</p>
              {submission.files.map((f) => (
                <a
                  key={f.id}
                  href={`/api/r2/file/${f.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"
                >
                  <Award className="h-4 w-4 shrink-0" />
                  <span className="truncate">{f.originalName || f.name}</span>
                  <span className="ml-auto text-slate-400 font-normal">
                    {(f.size / 1024).toFixed(0)} Ko
                  </span>
                </a>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" id="grade-form">
            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Décision
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'graded' | 'returned')}
                className={adminSelectClassName}
              >
                <option value="graded">✅ Corrigé & Noté</option>
                <option value="returned">🔁 Retourné (à refaire)</option>
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Note <span className="text-slate-400 font-normal">(sur 20, optionnel)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="ex : 16"
                  className={adminInputClassName}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">/ 20</span>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Commentaire
                </span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                placeholder="Feedback constructif à l'attention de l'étudiant…"
                className={`${adminInputClassName} resize-none`}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="submit"
            form="grade-form"
            disabled={loading}
            className={`${adminPrimaryButtonClassName} flex items-center gap-2`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Enregistrer la correction
          </button>
          <button
            type="button"
            onClick={onClose}
            className={adminSecondaryButtonClassName}
          >
            Annuler
          </button>
        </div>
      </aside>
    </>
  )
}
