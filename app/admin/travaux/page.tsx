'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-portal/AdminShell'
import { Plus, RefreshCw, BookOpenCheck, Users, Trash2, AlertTriangle, X } from 'lucide-react'
import { adminPrimaryButtonClassName, adminSecondaryButtonClassName } from '@/components/admin-portal/ui'
import { supabase } from '@/lib/supabase'

import { AssignmentKpis } from './_components/AssignmentKpis'
import { AssignmentFilters } from './_components/AssignmentFilters'
import { AssignmentCard } from './_components/AssignmentCard'
import { SubmissionsTable } from './_components/SubmissionsTable'
import { GradeDrawer } from './_components/GradeDrawer'

import type {
  Assignment,
  SessionOption,
  Submission,
  StatusFilter,
  SubmissionStatusFilter,
  ToastState,
} from './_components/types'

export default function AdminAssignmentsPage() {
  // Main Data
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  // Tabs
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>('assignments')

  // Assignments Filters
  const [search, setSearch] = useState('')
  const [sessionFilter, setSessionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // Submissions Data & Filters
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [subTotal, setSubTotal] = useState(0)
  const [subTotalPages, setSubTotalPages] = useState(1)
  const [subPage, setSubPage] = useState(1)
  const [subPageSize, setSubPageSize] = useState(10)
  const [subSearch, setSubSearch] = useState('')
  const [subSessionFilter, setSubSessionFilter] = useState('all')
  const [subAssignmentFilter, setSubAssignmentFilter] = useState('all')
  const [subStatusFilter, setSubStatusFilter] = useState<SubmissionStatusFilter>('all')

  // Modals / Drawers
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Assignment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingPublishId, setTogglingPublishId] = useState<number | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Fetch Assignments & Sessions
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [assignRes, sessionRes] = await Promise.all([
        fetch('/api/admin/assignments?limit=500', { cache: 'no-store' }),
        fetch('/api/sessions', { cache: 'no-store' }),
      ])

      if (!assignRes.ok) throw new Error('Impossible de charger les travaux')
      const assignData = await assignRes.json()
      setAssignments(assignData.assignments || [])

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json()
        setSessions(Array.isArray(sessionData) ? sessionData : sessionData.sessions || [])
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch Submissions
  const fetchSubmissions = useCallback(async () => {
    setSubmissionsLoading(true)
    try {
      const params = new URLSearchParams()
      if (subStatusFilter !== 'all' && subStatusFilter !== 'overdue') {
        params.set('status', subStatusFilter)
      }
      if (subSessionFilter !== 'all') params.set('sessionId', subSessionFilter)
      if (subAssignmentFilter !== 'all') params.set('assignmentId', subAssignmentFilter)
      if (subSearch.trim()) params.set('search', subSearch.trim())
      params.set('page', String(subPage))
      params.set('limit', String(subPageSize))

      const res = await fetch(`/api/admin/submissions?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Erreur lors du chargement des remises')
      const data = await res.json()
      let subs: Submission[] = data.submissions || []

      if (subStatusFilter === 'overdue') {
        subs = subs.filter((s) => {
          const deadline = s.assignment?.deadline
          if (!deadline) return false
          return new Date(s.submittedAt).getTime() > new Date(deadline).getTime()
        })
      }

      setSubmissions(subs)
      setSubTotal(data.pagination?.total ?? subs.length)
      setSubTotalPages(data.pagination?.totalPages ?? 1)
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Impossible de charger les remises', 'error')
    } finally {
      setSubmissionsLoading(false)
    }
  }, [subStatusFilter, subSessionFilter, subAssignmentFilter, subSearch, subPage, subPageSize, showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions()
    }
  }, [activeTab, fetchSubmissions])

  // Realtime Supabase Broadcast
  useEffect(() => {
    if (!supabase) return

    const subChannel = supabase
      .channel('submissions_channel')
      .on('broadcast', { event: 'submission_created' }, () => {
        showToast('🔔 Nouvelle remise reçue !')
        fetchData()
        if (activeTab === 'submissions') fetchSubmissions()
      })
      .on('broadcast', { event: 'submission_graded' }, () => {
        fetchData()
        if (activeTab === 'submissions') fetchSubmissions()
      })
      .subscribe()

    const assignChannel = supabase
      .channel('assignments_channel')
      .on('broadcast', { event: 'assignment_created' }, () => fetchData())
      .on('broadcast', { event: 'assignment_updated' }, () => fetchData())
      .on('broadcast', { event: 'assignment_deleted' }, () => fetchData())
      .subscribe()

    return () => {
      supabase?.removeChannel(subChannel)
      supabase?.removeChannel(assignChannel)
    }
  }, [fetchData, fetchSubmissions, activeTab, showToast])

  // KPI Pending Grading count
  const pendingGradingCount = useMemo(() => {
    return assignments.reduce((acc, a) => {
      return acc + (a.submissions || []).filter((s) => s.status === 'submitted').length
    }, 0)
  }, [assignments])

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.formation?.title && a.formation.title.toLowerCase().includes(q))

      const matchSession = sessionFilter === 'all' || String(a.sessionId) === sessionFilter

      let matchStatus = true
      if (statusFilter === 'publie') matchStatus = a.published && a.status !== 'archive'
      else if (statusFilter === 'brouillon') matchStatus = !a.published || a.status === 'brouillon'
      else if (statusFilter === 'archive') matchStatus = a.status === 'archive'
      else if (statusFilter === 'pending_grading') {
        matchStatus = (a.submissions || []).some((s) => s.status === 'submitted')
      }

      return matchSearch && matchSession && matchStatus
    })
  }, [assignments, search, sessionFilter, statusFilter])

  // Actions
  async function handleTogglePublish(a: Assignment) {
    setTogglingPublishId(a.id)
    try {
      const nextPub = !(a.published && a.status !== 'brouillon')
      const res = await fetch(`/api/admin/assignments/${a.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          published: nextPub,
          status: nextPub ? 'publie' : 'brouillon',
        }),
      })
      if (!res.ok) throw new Error('Échec de la modification du statut')
      showToast(nextPub ? '✅ Travail publié' : '🔒 Travail dépublié (brouillon)')
      fetchData()
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error')
    } finally {
      setTogglingPublishId(null)
    }
  }

  async function handleDeleteAssignment() {
    if (!confirmDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/assignments/${confirmDelete.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Impossible de supprimer ce travail')
      showToast('🗑️ Travail supprimé')
      setConfirmDelete(null)
      fetchData()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  function handleViewSubmissionsForAssignment(a: Assignment) {
    setSubAssignmentFilter(String(a.id))
    setActiveTab('submissions')
  }

  return (
    <AdminShell title="Travaux & Évaluations">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Gestion des Travaux & Remises
            </h1>
            <p className="text-xs text-slate-500">
              Suivez les travaux publiés, visualisez et corrigez les remises d'étudiants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                fetchData()
                if (activeTab === 'submissions') fetchSubmissions()
              }}
              className={adminSecondaryButtonClassName}
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>

            <Link href="/admin/travaux/nouveau" className={`${adminPrimaryButtonClassName} flex items-center gap-2`}>
              <Plus className="h-4 w-4" />
              Nouveau travail
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <AssignmentKpis
          assignments={assignments}
          pendingGradingCount={pendingGradingCount}
          activeFilter={statusFilter}
          onFilter={(f) => setStatusFilter(f as StatusFilter)}
        />

        {/* Tabs Bar */}
        <div className="flex items-center border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'assignments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpenCheck className="h-4 w-4" />
            Liste des travaux ({assignments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'submissions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Remises des étudiants
            {pendingGradingCount > 0 && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">
                {pendingGradingCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1 : ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <AssignmentFilters
              search={search}
              onSearch={setSearch}
              sessionFilter={sessionFilter}
              onSessionFilter={setSessionFilter}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
              sessions={sessions}
            />

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 text-sm font-semibold">
                {error}
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
                <BookOpenCheck className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">Aucun travail trouvé</p>
                <p className="text-xs text-slate-500 mt-1">
                  Créez un nouveau travail ou modifiez vos filtres de recherche.
                </p>
                <Link href="/admin/travaux/nouveau" className={`${adminPrimaryButtonClassName} mt-4`}>
                  Créer un travail
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAssignments.map((a) => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a}
                    onViewSubmissions={handleViewSubmissionsForAssignment}
                    onDelete={(item) => setConfirmDelete(item)}
                    onTogglePublish={handleTogglePublish}
                    isTogglingPublish={togglingPublishId === a.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2 : SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <SubmissionsTable
            submissions={submissions}
            total={subTotal}
            totalPages={subTotalPages}
            loading={submissionsLoading}
            page={subPage}
            pageSize={subPageSize}
            onPageChange={setSubPage}
            onPageSizeChange={setSubPageSize}
            search={subSearch}
            onSearch={setSubSearch}
            sessionFilter={subSessionFilter}
            onSessionFilter={setSubSessionFilter}
            assignmentFilter={subAssignmentFilter}
            onAssignmentFilter={setSubAssignmentFilter}
            statusFilter={subStatusFilter}
            onStatusFilter={setSubStatusFilter}
            sessions={sessions}
            assignments={assignments.map((a) => ({ id: a.id, title: a.title }))}
            onGrade={(sub) => setSelectedSubmission(sub)}
          />
        )}

        {/* Grade Drawer */}
        {selectedSubmission && (
          <GradeDrawer
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onSaved={() => {
              fetchData()
              if (activeTab === 'submissions') fetchSubmissions()
            }}
            showToast={showToast}
          />
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-base font-bold text-slate-900">Confirmer la suppression</h3>
              </div>
              <p className="text-xs text-slate-600">
                Voulez-vous vraiment supprimer le travail <strong>"{confirmDelete.title}"</strong> ? Cette action est irréversible et supprimera également toutes les remises associées.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className={adminSecondaryButtonClassName}
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAssignment}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Suppression…' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
