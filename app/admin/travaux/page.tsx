'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-portal/AdminShell'
import PaginationControls from '@/components/admin-portal/PaginationControls'
import {
  AdminBadge,
  AdminPanel,
  adminInputClassName,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
  adminSelectClassName,
} from '@/components/admin-portal/ui'
import {
  Plus,
  Search,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  Loader2,
  FileCheck,
  Award,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Send,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  FileCode,
  Sparkles,
  Layers3,
  UserCheck,
  XCircle,
  ExternalLink,
  BookOpen,
  RotateCcw,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionOption {
  id: number
  startDate: string
  endDate: string
  location?: string | null
  format: string
  status: string
  formation?: {
    id: number
    title: string
  }
}

interface AssignmentFile {
  id: number
  name: string
  originalName: string
  size: number
  mimeType: string
  url: string
}

interface StudentInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  studentNumber: string
  phone?: string
}

interface SubmissionFile {
  id: number
  name: string
  originalName: string
  size: number
  mimeType: string
  url: string
}

interface Submission {
  id: number
  assignmentId: number
  studentId: string
  student: StudentInfo
  status: 'submitted' | 'graded' | 'returned'
  grade: number | null
  feedback: string | null
  submittedAt: string
  gradedAt: string | null
  files: SubmissionFile[]
}

interface Assignment {
  id: number
  title: string
  description: string
  objectives: string | null
  instructions: string | null
  type: 'tp' | 'exam' | 'project' | 'homework' | string
  difficulty: 'debutant' | 'intermediaire' | 'avance' | string
  status: 'brouillon' | 'publie' | 'archive' | string
  published: boolean
  publishedAt: string
  deadline: string
  maxFileSize: number
  maxFiles: number
  allowResubmission: boolean
  allowedFileTypes: string
  formationId?: number
  sessionId: number
  session: {
    id: number
    startDate: string
    endDate: string
    location: string | null
    format: string
    status: string
  }
  formation: {
    id: number
    title: string
    slug: string
  }
  files: AssignmentFile[]
  submissions: Submission[]
  createdAt: string
  _count?: {
    submissions: number
  }
}

// ─── Composant KPI Card ────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  onClick,
  active,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  accent: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col gap-3 rounded-[28px] border p-5 text-left shadow-sm transition-all duration-200 ${
        active
          ? `${accent} border-transparent shadow-md scale-[1.02]`
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${active ? 'text-white' : 'text-slate-900'}`}>
          {value}
        </p>
        <p className={`mt-1 text-xs font-semibold uppercase tracking-wider ${active ? 'text-white/80' : 'text-slate-500'}`}>
          {label}
        </p>
        {sub && (
          <p className={`mt-1 text-[11px] ${active ? 'text-white/70' : 'text-slate-400'}`}>{sub}</p>
        )}
      </div>
    </button>
  )
}

// ─── Main Page Component ───────────────────────────────────────────────────────

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Search & Filters
  const [search, setSearch] = useState('')
  const [sessionFilter, setSessionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all') // all, published, draft, archived, pending_grading

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Modals & Drawers State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewDetailAssignment, setViewDetailAssignment] = useState<Assignment | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [viewSubmissionsAssignment, setViewSubmissionsAssignment] = useState<Assignment | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Assignment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingPublishId, setTogglingPublishId] = useState<number | null>(null)

  // Form State for Creation / Editing
  const [formLoading, setFormLoading] = useState(false)
  const [consigneFiles, setConsigneFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: '',
    instructions: '',
    type: 'tp' as 'tp' | 'exam' | 'project' | 'homework',
    difficulty: 'intermediaire' as 'debutant' | 'intermediaire' | 'avance',
    status: 'publie' as 'brouillon' | 'publie' | 'archive',
    sessionId: '',
    publishedAt: '',
    deadline: '',
    maxFileSize: 10,
    maxFiles: 5,
    allowResubmission: true,
    allowedFileTypes: 'pdf,doc,docx,zip,rar,png,jpg,jpeg,excel,xls,xlsx',
    published: true,
  })

  // Grading Form State
  const [gradeValue, setGradeValue] = useState<string>('')
  const [feedbackValue, setFeedbackValue] = useState<string>('')
  const [submissionStatusValue, setSubmissionStatusValue] = useState<'graded' | 'returned'>('graded')
  const [gradingLoading, setGradingLoading] = useState(false)

  const showToastMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Load Data from API
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
      const fetchedAssignments = assignData.assignments || []
      setAssignments(fetchedAssignments)

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json()
        const fetchedSessions = Array.isArray(sessionData)
          ? sessionData
          : sessionData.sessions || []
        setSessions(fetchedSessions)
      }

      // Synchroniser le tiroir de remises s'il est ouvert
      setViewSubmissionsAssignment((current) => {
        if (!current) return null
        const updated = fetchedAssignments.find((item: Assignment) => item.id === current.id)
        return updated || current
      })
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Dynamic fetch when opening student submissions drawer
  const handleOpenSubmissions = async (assignment: Assignment) => {
    setViewSubmissionsAssignment(assignment)
    setSelectedSubmission(null)
    try {
      const res = await fetch(`/api/admin/assignments/${assignment.id}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.assignment) {
          setViewSubmissionsAssignment(data.assignment)
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des remises :', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Realtime Supabase Broadcast Channels Setup (Submissions + Assignments)
  useEffect(() => {
    if (!supabase) return

    const subChannel = supabase
      .channel('submissions_channel')
      .on('broadcast', { event: 'submission_created' }, () => {
        showToastMsg('🔔 Une nouvelle remise a été déposée par un étudiant !')
        fetchData()
      })
      .on('broadcast', { event: 'submission_graded' }, () => {
        fetchData()
      })
      .subscribe()

    const assignChannel = supabase
      .channel('assignments_channel')
      .on('broadcast', { event: 'assignment_created' }, () => {
        fetchData()
      })
      .on('broadcast', { event: 'assignment_updated' }, () => {
        fetchData()
      })
      .on('broadcast', { event: 'assignment_deleted' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase?.removeChannel(subChannel)
      supabase?.removeChannel(assignChannel)
    }
  }, [fetchData])

  // KPIs calculation
  const kpis = useMemo(() => {
    const totalAssignments = assignments.length
    const publishedCount = assignments.filter((a) => a.published || a.status === 'publie').length
    const draftCount = assignments.filter((a) => !a.published || a.status === 'brouillon').length
    const archivedCount = assignments.filter((a) => a.status === 'archive').length

    const pendingGradingCount = assignments.reduce((acc, a) => {
      const pendingInAssign = (a.submissions || []).filter((s) => s.status === 'submitted').length
      return acc + pendingInAssign
    }, 0)

    const assignmentsNeedingGrading = assignments.filter((a) =>
      (a.submissions || []).some((s) => s.status === 'submitted')
    ).length

    return {
      totalAssignments,
      publishedCount,
      draftCount,
      archivedCount,
      pendingGradingCount,
      assignmentsNeedingGrading,
    }
  }, [assignments])

  // Filtered Assignments List
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const q = search.toLowerCase().trim()
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.formation?.title?.toLowerCase().includes(q)

      const matchSession = sessionFilter === 'all' || String(a.sessionId) === sessionFilter

      let matchStatus = true
      if (statusFilter === 'published') matchStatus = a.published || a.status === 'publie'
      if (statusFilter === 'draft') matchStatus = !a.published || a.status === 'brouillon'
      if (statusFilter === 'archived') matchStatus = a.status === 'archive'
      if (statusFilter === 'pending_grading') {
        matchStatus = (a.submissions || []).some((s) => s.status === 'submitted')
      }

      return matchSearch && matchSession && matchStatus
    })
  }, [assignments, search, sessionFilter, statusFilter])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize))
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAssignments.slice(start, start + pageSize)
  }, [filteredAssignments, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, sessionFilter, statusFilter])

  // Quick Toggle Publish status
  const handleTogglePublish = async (assignment: Assignment) => {
    setTogglingPublishId(assignment.id)
    try {
      const nextPublished = !assignment.published
      const nextStatus = nextPublished ? 'publie' : 'brouillon'
      const res = await fetch(`/api/admin/assignments/${assignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: nextPublished, status: nextStatus }),
      })
      if (!res.ok) throw new Error('Échec du changement de statut')
      showToastMsg(
        nextPublished
          ? `✅ Travail "${assignment.title}" publié avec succès !`
          : `⏸️ Travail "${assignment.title}" repassé en brouillon.`
      )
      await fetchData()
    } catch (err: any) {
      showToastMsg(err.message || 'Erreur lors du changement de statut', 'error')
    } finally {
      setTogglingPublishId(null)
    }
  }

  // Open Form for Creation
  const handleOpenCreate = () => {
    setEditingAssignment(null)
    const nowISO = new Date().toISOString().slice(0, 16)
    const defaultDeadline = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16)

    setFormData({
      title: '',
      description: '',
      objectives: '',
      instructions: '',
      type: 'tp',
      difficulty: 'intermediaire',
      status: 'publie',
      sessionId: sessions.length > 0 ? String(sessions[0].id) : '',
      publishedAt: nowISO,
      deadline: defaultDeadline,
      maxFileSize: 10,
      maxFiles: 5,
      allowResubmission: true,
      allowedFileTypes: 'pdf,doc,docx,zip,rar,png,jpg,jpeg,excel,xls,xlsx',
      published: true,
    })
    setConsigneFiles([])
    setShowCreateModal(true)
  }

  // Open Form for Editing
  const handleOpenEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      description: assignment.description,
      objectives: assignment.objectives || '',
      instructions: assignment.instructions || '',
      type: (assignment.type as any) || 'tp',
      difficulty: (assignment.difficulty as any) || 'intermediaire',
      status: (assignment.status as any) || (assignment.published ? 'publie' : 'brouillon'),
      sessionId: String(assignment.sessionId),
      publishedAt: assignment.publishedAt ? new Date(assignment.publishedAt).toISOString().slice(0, 16) : '',
      deadline: assignment.deadline ? new Date(assignment.deadline).toISOString().slice(0, 16) : '',
      maxFileSize: assignment.maxFileSize || 10,
      maxFiles: assignment.maxFiles || 5,
      allowResubmission: assignment.allowResubmission !== false,
      allowedFileTypes: assignment.allowedFileTypes || 'pdf,doc,docx,zip,rar,png,jpg,jpeg,excel,xls,xlsx',
      published: assignment.published,
    })
    setConsigneFiles([])
    setShowCreateModal(true)
  }

  // Handle Form Submit
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.sessionId || !formData.deadline) {
      showToastMsg('Veuillez remplir tous les champs obligatoires (Titre, Session, Description, Date limite).', 'error')
      return
    }

    setFormLoading(true)
    try {
      const payloadData = new FormData()
      payloadData.append('title', formData.title)
      payloadData.append('description', formData.description)
      payloadData.append('objectives', formData.objectives)
      payloadData.append('instructions', formData.instructions)
      payloadData.append('type', formData.type)
      payloadData.append('difficulty', formData.difficulty)
      payloadData.append('status', formData.status)
      payloadData.append('sessionId', formData.sessionId)
      payloadData.append('deadline', formData.deadline)
      payloadData.append('maxFileSize', String(formData.maxFileSize))
      payloadData.append('maxFiles', String(formData.maxFiles))
      payloadData.append('allowResubmission', String(formData.allowResubmission))
      payloadData.append('allowedFileTypes', formData.allowedFileTypes)
      payloadData.append('published', String(formData.status === 'publie'))

      consigneFiles.forEach((file, index) => {
        payloadData.append(`file_${index}`, file)
      })

      const url = editingAssignment ? `/api/admin/assignments/${editingAssignment.id}` : '/api/admin/assignments'
      const method = editingAssignment ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        body: payloadData,
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Erreur lors de l’enregistrement')
      }

      showToastMsg(editingAssignment ? 'Modifications enregistrées !' : 'Travail créé et publié !')
      setShowCreateModal(false)
      fetchData()
    } catch (err: any) {
      showToastMsg(err.message || 'Erreur lors de la soumission', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle Delete
  const handleDeleteAssignment = async () => {
    if (!confirmDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/assignments/${confirmDelete.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Échec de la suppression')
      showToastMsg('Travail supprimé avec succès.')
      setConfirmDelete(null)
      fetchData()
    } catch (err: any) {
      showToastMsg(err.message || 'Erreur de suppression', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle Submission Grading
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return

    setGradingLoading(true)
    try {
      const res = await fetch(`/api/admin/submissions/${selectedSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: gradeValue,
          feedback: feedbackValue,
          status: submissionStatusValue,
        }),
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Impossible d’enregistrer la note')
      }

      showToastMsg('Note et correction enregistrées avec succès !')
      setSelectedSubmission(null)
      if (viewSubmissionsAssignment) {
        await handleOpenSubmissions(viewSubmissionsAssignment)
      }
      await fetchData()
    } catch (err: any) {
      showToastMsg(err.message || 'Erreur lors de la notation', 'error')
    } finally {
      setGradingLoading(false)
    }
  }

  const activeFilterCount = (search ? 1 : 0) + (sessionFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  return (
    <AdminShell title="Travaux & Évaluations">
      <div className="space-y-6">

        {/* ── Toast Notification ────────────────────────────────────────────── */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 z-[999] flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl backdrop-blur-md transition-all ${
              toast.type === 'error'
                ? 'border border-rose-200 bg-rose-900/90 text-white'
                : 'border border-emerald-200 bg-emerald-900/90 text-white'
            }`}
          >
            <span>{toast.msg}</span>
            <button type="button" onClick={() => setToast(null)} className="opacity-80 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── En-tête ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Travaux & Évaluations</h1>
            <p className="mt-1 text-sm text-slate-500">
              Créez des devoirs, TP et projets rattachés aux sessions, consultez les remises et notez les étudiants.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchData}
              className={adminSecondaryButtonClassName}
              title="Actualiser les données"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className={adminPrimaryButtonClassName}
            >
              <Plus className="h-4 w-4" />
              Nouveau travail
            </button>
          </div>
        </div>

        {/* ── KPIs Cliquables ──────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={Layers3}
            label="Total Devoirs"
            value={kpis.totalAssignments}
            sub="Tous devoirs & examens"
            accent="bg-gradient-to-br from-slate-700 to-slate-900"
            onClick={() => setStatusFilter('all')}
            active={statusFilter === 'all'}
          />
          <KpiCard
            icon={CheckCircle2}
            label="Publiés"
            value={kpis.publishedCount}
            sub="Visibles sur l'Espace Étudiant"
            accent="bg-gradient-to-br from-emerald-500 to-teal-600"
            onClick={() => setStatusFilter('published')}
            active={statusFilter === 'published'}
          />
          <KpiCard
            icon={Clock}
            label="À corriger"
            value={kpis.pendingGradingCount}
            sub={`${kpis.assignmentsNeedingGrading} devoir(s) en attente de note`}
            accent="bg-gradient-to-br from-amber-500 to-orange-600"
            onClick={() => setStatusFilter('pending_grading')}
            active={statusFilter === 'pending_grading'}
          />
          <KpiCard
            icon={FileText}
            label="Brouillons"
            value={kpis.draftCount}
            sub="Devoirs non encore publiés"
            accent="bg-gradient-to-br from-slate-600 to-slate-800"
            onClick={() => setStatusFilter('draft')}
            active={statusFilter === 'draft'}
          />
        </div>

        {/* ── Zone de filtres et de recherche ─────────────────────────────────── */}
        <AdminPanel>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="search-assignments"
                type="text"
                placeholder="Rechercher par titre, description ou formation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-11 ${adminInputClassName}`}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filtre par Session */}
            <div className="w-full lg:w-72">
              <label htmlFor="filter-session" className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Session
              </label>
              <select
                id="filter-session"
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className={adminSelectClassName}
              >
                <option value="all">Toutes les sessions</option>
                {sessions.map((s) => {
                  const formationTitle = s.formation?.title || 'Formation'
                  const startDateFormatted = s.startDate
                    ? new Date(s.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                    : ''
                  return (
                    <option key={s.id} value={String(s.id)}>
                      {formationTitle} — {startDateFormatted} ({s.format})
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Bouton Réinitialiser */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setSessionFilter('all')
                  setStatusFilter('all')
                }}
                className={adminSecondaryButtonClassName}
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </button>
            )}
          </div>

          {/* Filtres rapides par pilules de statut */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <span className="self-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Statut :
            </span>
            {[
              { label: 'Tous', value: 'all' },
              { label: 'Publiés', value: 'published' },
              { label: 'À corriger', value: 'pending_grading' },
              { label: 'Brouillons', value: 'draft' },
              { label: 'Archivés', value: 'archived' },
            ].map((st) => {
              const isActive = statusFilter === st.value
              return (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setStatusFilter(st.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-[var(--admin-primary-200)] hover:bg-[var(--admin-primary-50)]'
                  }`}
                >
                  {st.label}
                </button>
              )
            })}
          </div>
        </AdminPanel>

        {/* ── Liste des Travaux (Desktop Table / Mobile Cards) ──────────────── */}
        {isLoading ? (
          <AdminPanel>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--admin-primary)]" />
              <p className="mt-4 text-sm font-medium text-slate-500">Chargement des travaux...</p>
            </div>
          </AdminPanel>
        ) : error ? (
          <AdminPanel>
            <div className="flex flex-col items-center justify-center py-12 text-center text-rose-600">
              <AlertTriangle className="h-10 w-10 mb-2" />
              <p className="text-sm font-semibold">{error}</p>
              <button type="button" onClick={fetchData} className={`mt-4 ${adminSecondaryButtonClassName}`}>
                Réessayer
              </button>
            </div>
          </AdminPanel>
        ) : paginatedAssignments.length === 0 ? (
          <AdminPanel>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Aucun travail trouvé</h3>
              <p className="mt-1 text-sm text-slate-500">
                {activeFilterCount > 0
                  ? 'Aucun devoir ne correspond à vos critères de recherche.'
                  : 'Commencez par ajouter votre premier devoir pour cette session.'}
              </p>
              <button type="button" onClick={handleOpenCreate} className={`mt-6 ${adminPrimaryButtonClassName}`}>
                <Plus className="h-4 w-4" />
                Créer un travail
              </button>
            </div>
          </AdminPanel>
        ) : (
          <div className="space-y-4">

            {/* Vue Desktop / Tablet (Tableau épuré) */}
            <div className="hidden md:block overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Travail & Type</th>
                    <th scope="col" className="px-5 py-3.5">Formation / Session</th>
                    <th scope="col" className="px-5 py-3.5">Date limite</th>
                    <th scope="col" className="px-5 py-3.5">Remises & Correction</th>
                    <th scope="col" className="px-5 py-3.5">Statut</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAssignments.map((a) => {
                    const submissionsList = a.submissions || []
                    const pendingCount = submissionsList.filter((s) => s.status === 'submitted').length
                    const gradedCount = submissionsList.filter((s) => s.status === 'graded').length
                    const isOverdue = new Date(a.deadline).getTime() < Date.now()

                    return (
                      <tr key={a.id} className="transition-colors hover:bg-slate-50/70">
                        {/* Titre & Type */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm line-clamp-1">{a.title}</span>
                              <AdminBadge
                                tone={
                                  a.type === 'exam'
                                    ? 'danger'
                                    : a.type === 'project'
                                    ? 'primary'
                                    : 'neutral'
                                }
                              >
                                {a.type?.toUpperCase() || 'TP'}
                              </AdminBadge>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{a.description}</p>
                            {a.files && a.files.length > 0 && (
                              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                <FileArchive className="h-3.5 w-3.5 text-slate-400" />
                                {a.files.length} document(s) joint(s)
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Formation / Session */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold text-slate-800 line-clamp-1">
                              {a.formation?.title || 'Formation'}
                            </span>
                            <span className="text-slate-500">
                              Session #{a.sessionId}{' '}
                              {a.session?.startDate
                                ? `(${new Date(a.session.startDate).toLocaleDateString('fr-FR')})`
                                : ''}
                            </span>
                          </div>
                        </td>

                        {/* Date limite */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock className={`h-4 w-4 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                            <span className={isOverdue ? 'font-bold text-rose-600' : 'text-slate-700'}>
                              {new Date(a.deadline).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Remises & Correction */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenSubmissions(a)}
                              className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition"
                            >
                              <FileCheck className="h-4 w-4 text-[var(--admin-primary)]" />
                              <span>{submissionsList.length} remise(s)</span>
                              {pendingCount > 0 && (
                                <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                  {pendingCount} à corriger
                                </span>
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Switch Statut Publié/Brouillon */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(a)}
                            disabled={togglingPublishId === a.id}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                              a.published || a.status === 'publie'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Cliquer pour basculer le statut de publication"
                          >
                            {togglingPublishId === a.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : a.published || a.status === 'publie' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            {a.published || a.status === 'publie' ? 'Publié' : 'Brouillon'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setViewDetailAssignment(a)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(a)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(a)}
                              className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Vue Mobile (Cartes interactives adaptées) */}
            <div className="grid gap-4 md:hidden">
              {paginatedAssignments.map((a) => {
                const submissionsList = a.submissions || []
                const pendingCount = submissionsList.filter((s) => s.status === 'submitted').length
                const isOverdue = new Date(a.deadline).getTime() < Date.now()

                return (
                  <div key={a.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {a.type?.toUpperCase() || 'TP'}
                        </span>
                        <h3 className="mt-1 text-base font-bold text-slate-900">{a.title}</h3>
                        <p className="text-xs text-slate-500">{a.formation?.title || 'Formation'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(a)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          a.published || a.status === 'publie'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {a.published || a.status === 'publie' ? 'Publié' : 'Brouillon'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{a.description}</p>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className={`font-semibold flex items-center gap-1 ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(a.deadline).toLocaleDateString('fr-FR')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenSubmissions(a)}
                        className="font-bold text-[var(--admin-primary)] flex items-center gap-1"
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        {submissionsList.length} remise(s)
                        {pendingCount > 0 && <span className="text-amber-600">({pendingCount} à corriger)</span>}
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setViewDetailAssignment(a)}
                        className={adminSecondaryButtonClassName}
                      >
                        <Eye className="h-3.5 w-3.5" /> Détails
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(a)}
                        className={adminSecondaryButtonClassName}
                      >
                        <Edit className="h-3.5 w-3.5" /> Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(a)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            <PaginationControls
              pagination={{
                page: currentPage,
                pageSize,
                totalItems: filteredAssignments.length,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1,
              }}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz)
                setCurrentPage(1)
              }}
            />
          </div>
        )}

        {/* ── Modal Créer / Modifier Devoir ─────────────────────────────────── */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--admin-primary-50)] text-[var(--admin-primary)]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {editingAssignment ? 'Modifier le travail' : 'Créer un nouveau travail'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Définissez les consignes, la session associée et la date limite.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                {/* Titre */}
                <div>
                  <label htmlFor="form-title" className="mb-1 block text-xs font-semibold text-slate-700">
                    Titre du travail <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-title"
                    type="text"
                    required
                    placeholder="Ex: TP1 — Conception de base de données PostgreSQL"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className={adminInputClassName}
                  />
                </div>

                {/* Session */}
                <div>
                  <label htmlFor="form-session" className="mb-1 block text-xs font-semibold text-slate-700">
                    Session associée <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="form-session"
                    required
                    value={formData.sessionId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sessionId: e.target.value }))}
                    className={adminSelectClassName}
                  >
                    <option value="">Sélectionnez une session</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.formation?.title || 'Formation'} — Session du{' '}
                        {new Date(s.startDate).toLocaleDateString('fr-FR')} ({s.format})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid Type & Difficulty */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="form-type" className="mb-1 block text-xs font-semibold text-slate-700">
                      Type d'évaluation
                    </label>
                    <select
                      id="form-type"
                      value={formData.type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as any }))}
                      className={adminSelectClassName}
                    >
                      <option value="tp">Travaux Pratiques (TP)</option>
                      <option value="exam">Examen / Contrôle</option>
                      <option value="project">Projet de fin de module</option>
                      <option value="homework">Devoir à la maison</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="form-difficulty" className="mb-1 block text-xs font-semibold text-slate-700">
                      Niveau de difficulté
                    </label>
                    <select
                      id="form-difficulty"
                      value={formData.difficulty}
                      onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value as any }))}
                      className={adminSelectClassName}
                    >
                      <option value="debutant">Débutant</option>
                      <option value="intermediaire">Intermédiaire</option>
                      <option value="avance">Avancé</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="form-description" className="mb-1 block text-xs font-semibold text-slate-700">
                    Description & Consignes générales <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="form-description"
                    required
                    rows={3}
                    placeholder="Présentation générale des attentes pour ce devoir..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className={adminInputClassName}
                  />
                </div>

                {/* Objectifs & Instructions */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="form-objectives" className="mb-1 block text-xs font-semibold text-slate-700">
                      Objectifs pédagogiques
                    </label>
                    <textarea
                      id="form-objectives"
                      rows={2}
                      placeholder="Quelles compétences seront évaluées ?"
                      value={formData.objectives}
                      onChange={(e) => setFormData((prev) => ({ ...prev, objectives: e.target.value }))}
                      className={adminInputClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="form-instructions" className="mb-1 block text-xs font-semibold text-slate-700">
                      Instructions de rendu
                    </label>
                    <textarea
                      id="form-instructions"
                      rows={2}
                      placeholder="Format du fichier attendu, structure..."
                      value={formData.instructions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                      className={adminInputClassName}
                    />
                  </div>
                </div>

                {/* Date limite & Statut */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="form-deadline" className="mb-1 block text-xs font-semibold text-slate-700">
                      Date et heure limite <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="form-deadline"
                      type="datetime-local"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                      className={adminInputClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="form-status" className="mb-1 block text-xs font-semibold text-slate-700">
                      Statut de publication
                    </label>
                    <select
                      id="form-status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as any,
                          published: e.target.value === 'publie',
                        }))
                      }
                      className={adminSelectClassName}
                    >
                      <option value="publie">Publié (visible par les étudiants)</option>
                      <option value="brouillon">Brouillon (non visible)</option>
                      <option value="archive">Archivé</option>
                    </select>
                  </div>
                </div>

                {/* Paramètres avancés du rendu */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Paramètres de rendu des étudiants
                  </span>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="form-maxFileSize" className="mb-1 block text-[11px] font-semibold text-slate-600">
                        Taille max par fichier (Mo)
                      </label>
                      <input
                        id="form-maxFileSize"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.maxFileSize}
                        onChange={(e) => setFormData((prev) => ({ ...prev, maxFileSize: Number(e.target.value) || 10 }))}
                        className={adminInputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="form-maxFiles" className="mb-1 block text-[11px] font-semibold text-slate-600">
                        Nombre max de fichiers
                      </label>
                      <input
                        id="form-maxFiles"
                        type="number"
                        min="1"
                        max="20"
                        value={formData.maxFiles}
                        onChange={(e) => setFormData((prev) => ({ ...prev, maxFiles: Number(e.target.value) || 5 }))}
                        className={adminInputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="form-allowedFileTypes" className="mb-1 block text-[11px] font-semibold text-slate-600">
                        Extensions autorisées
                      </label>
                      <input
                        id="form-allowedFileTypes"
                        type="text"
                        placeholder="pdf,doc,docx,zip..."
                        value={formData.allowedFileTypes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, allowedFileTypes: e.target.value }))}
                        className={adminInputClassName}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="form-allowResubmission"
                      type="checkbox"
                      checked={formData.allowResubmission}
                      onChange={(e) => setFormData((prev) => ({ ...prev, allowResubmission: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-[var(--admin-primary)] focus:ring-[var(--admin-primary-200)]"
                    />
                    <label htmlFor="form-allowResubmission" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Autoriser les étudiants à remplacer/re-déposer leur travail avant ou après correction
                    </label>
                  </div>
                </div>

                {/* Consignes Fichiers R2 */}
                <div>
                  <label htmlFor="consigne-files-input" className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Joindre des documents de consigne (PDF, ZIP, DOCX...)
                  </label>
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center">
                    <Upload className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-1 text-xs text-slate-600">
                      Glissez des fichiers ou{' '}
                      <label htmlFor="consigne-files-input" className="cursor-pointer font-bold text-[var(--admin-primary)] hover:underline">
                        parcourez votre ordinateur
                      </label>
                    </p>
                    <input
                      id="consigne-files-input"
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setConsigneFiles(Array.from(e.target.files))
                        }
                      }}
                      className="hidden"
                    />
                    {consigneFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        {consigneFiles.map((f, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700 shadow-sm">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            {f.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={adminSecondaryButtonClassName}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={adminPrimaryButtonClassName}
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {editingAssignment ? 'Enregistrer les modifications' : 'Créer le travail'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal / Drawer Remises & Correction ───────────────────────────── */}
        {viewSubmissionsAssignment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-primary)] bg-[var(--admin-primary-50)] px-2 py-0.5 rounded">
                    Remises des Étudiants
                  </span>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{viewSubmissionsAssignment.title}</h2>
                  <p className="text-xs text-slate-500">
                    Session #{viewSubmissionsAssignment.sessionId} · Date limite :{' '}
                    {new Date(viewSubmissionsAssignment.deadline).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewSubmissionsAssignment(null)
                    setSelectedSubmission(null)
                  }}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Submissions List & Grading Pane */}
              <div className="grid gap-6 md:grid-cols-12 flex-1 overflow-y-auto pr-1">
                {/* Left: List of Submissions */}
                <div className={`${selectedSubmission ? 'md:col-span-6' : 'md:col-span-12'} space-y-3`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Liste des remises ({viewSubmissionsAssignment.submissions?.length || 0})
                  </h3>

                  {(!viewSubmissionsAssignment.submissions || viewSubmissionsAssignment.submissions.length === 0) ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-500">
                      <FileCheck className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      Aucune remise n'a encore été effectuée par les étudiants pour ce travail.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {viewSubmissionsAssignment.submissions.map((sub) => {
                        const isSelected = selectedSubmission?.id === sub.id
                        const studentName = sub.student
                          ? `${sub.student.firstName} ${sub.student.lastName}`
                          : 'Étudiant anonyme'

                        return (
                          <div
                            key={sub.id}
                            onClick={() => {
                              setSelectedSubmission(sub)
                              setGradeValue(sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : '')
                              setFeedbackValue(sub.feedback || '')
                              setSubmissionStatusValue(sub.status === 'returned' ? 'returned' : 'graded')
                            }}
                            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                              isSelected
                                ? 'border-[var(--admin-primary)] bg-[var(--admin-primary-50)]/50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{studentName}</h4>
                                <p className="text-xs text-slate-500">
                                  {sub.student?.email || ''} · Mat. #{sub.student?.studentNumber || sub.studentId}
                                </p>
                              </div>
                              <AdminBadge
                                tone={
                                  sub.status === 'graded'
                                    ? 'success'
                                    : sub.status === 'returned'
                                    ? 'warning'
                                    : 'primary'
                                }
                              >
                                {sub.status === 'graded'
                                  ? `Noté : ${sub.grade}/20`
                                  : sub.status === 'returned'
                                  ? 'A réviser'
                                  : 'En attente'}
                              </AdminBadge>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                              <span>Déposé le {new Date(sub.submittedAt).toLocaleDateString('fr-FR')}</span>
                              <span className="font-semibold text-slate-700">
                                {sub.files?.length || 0} fichier(s) joint(s)
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Right: Grading Pane */}
                {selectedSubmission && (
                  <div className="md:col-span-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Correction : {selectedSubmission.student?.firstName} {selectedSubmission.student?.lastName}
                        </h4>
                        <p className="text-xs text-slate-500">Formulaire d'évaluation & feedback</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSubmission(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Fichiers remis par l'étudiant */}
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Fichiers déposés sur Cloudflare R2 :
                      </span>
                      {selectedSubmission.files && selectedSubmission.files.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedSubmission.files.map((sf) => (
                            <a
                              key={sf.id}
                              href={sf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:border-blue-300 hover:text-blue-600 transition"
                            >
                              <span className="truncate max-w-[200px]">{sf.originalName || sf.name}</span>
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Aucun fichier joint.</p>
                      )}
                    </div>

                    {/* Formulaire de notation */}
                    <form onSubmit={handleGradeSubmission} className="space-y-3 pt-2">
                      <div>
                        <label htmlFor="submission-grade" className="block text-xs font-semibold text-slate-700 mb-1">
                          Note attribuée (/20)
                        </label>
                        <input
                          id="submission-grade"
                          type="number"
                          step="0.5"
                          min="0"
                          max="20"
                          placeholder="Ex: 16.5"
                          value={gradeValue}
                          onChange={(e) => setGradeValue(e.target.value)}
                          className={adminInputClassName}
                        />
                      </div>

                      <div>
                        <label htmlFor="submission-feedback" className="block text-xs font-semibold text-slate-700 mb-1">
                          Commentaire & Feedback pédagogique
                        </label>
                        <textarea
                          id="submission-feedback"
                          rows={3}
                          placeholder="Remarques sur le travail, points forts et axes d'amélioration..."
                          value={feedbackValue}
                          onChange={(e) => setFeedbackValue(e.target.value)}
                          className={adminInputClassName}
                        />
                      </div>

                      <div>
                        <label htmlFor="submission-status" className="block text-xs font-semibold text-slate-700 mb-1">
                          Action après correction
                        </label>
                        <select
                          id="submission-status"
                          value={submissionStatusValue}
                          onChange={(e) => setSubmissionStatusValue(e.target.value as any)}
                          className={adminSelectClassName}
                        >
                          <option value="graded">Valider la note & Notifier l'étudiant</option>
                          <option value="returned">Demander une révision / nouvelle remise</option>
                        </select>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={gradingLoading}
                          className={adminPrimaryButtonClassName}
                        >
                          {gradingLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" /> Enregistrer l'évaluation
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Modal Détails d'un Travail ────────────────────────────────────── */}
        {viewDetailAssignment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-primary)] bg-[var(--admin-primary-50)] px-2 py-0.5 rounded">
                    Détails du travail
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{viewDetailAssignment.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewDetailAssignment(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Description :</span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                    {viewDetailAssignment.description}
                  </p>
                </div>

                {viewDetailAssignment.objectives && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Objectifs pédagogiques :</span>
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                      {viewDetailAssignment.objectives}
                    </p>
                  </div>
                )}

                {viewDetailAssignment.instructions && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Instructions de rendu :</span>
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                      {viewDetailAssignment.instructions}
                    </p>
                  </div>
                )}

                {viewDetailAssignment.files && viewDetailAssignment.files.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Documents de consigne rattachés (Cloudflare R2) :</span>
                    <div className="space-y-1.5">
                      {viewDetailAssignment.files.map((f) => (
                        <a
                          key={f.id}
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition text-blue-600 font-semibold"
                        >
                          <span className="truncate">{f.originalName || f.name}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setViewDetailAssignment(null)}
                  className={adminSecondaryButtonClassName}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal Confirmation Supression ─────────────────────────────────── */}
        {confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Confirmer la suppression</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                Êtes-vous sûr de vouloir supprimer le travail <span className="font-bold">"{confirmDelete.title}"</span> ? Cette action supprimera définitivement le devoir, ses fichiers consignes sur Cloudflare R2 ainsi que toutes les remises des étudiants.
              </p>
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className={adminSecondaryButtonClassName}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAssignment}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminShell>
  )
}
