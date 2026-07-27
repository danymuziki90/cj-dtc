'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-portal/AdminShell'
import { ArrowLeft } from 'lucide-react'
import { AssignmentForm } from '../_components/AssignmentForm'
import type { SessionOption, ToastState } from '../_components/types'

export default function NewAssignmentPage() {
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [toast, setToast] = useState<ToastState>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch('/api/sessions', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setSessions(Array.isArray(data) ? data : data.sessions || [])
        }
      } catch (err) {
        console.error('Erreur chargement sessions', err)
      } finally {
        setLoadingSessions(false)
      }
    }
    loadSessions()
  }, [])

  return (
    <AdminShell title="Nouveau travail">
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

        {/* Back Link & Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/travaux"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Créer un nouveau travail</h1>
            <p className="text-xs text-slate-500">
              Renseignez les consignes et associez le travail à une session d'étudiants.
            </p>
          </div>
        </div>

        {loadingSessions ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : (
          <AssignmentForm
            mode="create"
            sessions={sessions}
            showToast={showToast}
          />
        )}
      </div>
    </AdminShell>
  )
}
