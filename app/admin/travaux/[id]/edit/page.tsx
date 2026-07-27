'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-portal/AdminShell'
import { ArrowLeft } from 'lucide-react'
import { AssignmentForm } from '../../_components/AssignmentForm'
import type { Assignment, SessionOption, ToastState } from '../../_components/types'

export default function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [assignRes, sessionRes] = await Promise.all([
          fetch(`/api/admin/assignments/${id}`, { cache: 'no-store' }),
          fetch('/api/sessions', { cache: 'no-store' }),
        ])

        if (!assignRes.ok) throw new Error('Impossible de charger ce travail')
        const assignData = await assignRes.json()
        setAssignment(assignData.assignment)

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json()
          setSessions(Array.isArray(sessionData) ? sessionData : sessionData.sessions || [])
        }
      } catch (err: any) {
        setError(err.message || 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  return (
    <AdminShell title="Modifier le travail">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 z-50 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-xl transition-all ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/travaux"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Modifier : {assignment?.title || `Travail #${id}`}
            </h1>
            <p className="text-xs text-slate-500">
              Modifiez les informations, la date limite ou ajoutez de nouvelles pièces jointes.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 text-sm font-semibold">
            {error}
          </div>
        ) : (
          <AssignmentForm
            mode="edit"
            assignment={assignment}
            sessions={sessions}
            showToast={showToast}
          />
        )}
      </div>
    </AdminShell>
  )
}
