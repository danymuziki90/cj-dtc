'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'
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
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
  Send,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  FileCode,
  Sparkles,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SessionOption {
  id: number
  title?: string
  startDate: string
  endDate: string
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
  type: 'tp' | 'exam' | 'project' | 'homework'
  difficulty: 'debutant' | 'intermediaire' | 'avance'
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
  const itemsPerPage = 8

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewDetailAssignment, setViewDetailAssignment] = useState<Assignment | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [viewSubmissionsAssignment, setViewSubmissionsAssignment] = useState<Assignment | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Assignment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form State
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

  // Load Data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [assignRes, sessionRes] = await Promise.all([
        fetch('/api/admin/assignments'),
        fetch('/api/sessions'),
      ])

      if (!assignRes.ok) throw new Error('Impossible de charger les travaux')
      const assignData = await assignRes.json()
      setAssignments(assignData.assignments || [])

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json()
        const rawSessions = Array.isArray(sessionData) ? sessionData : []
        setSessions(rawSessions)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Realtime Supabase Broadcast Channel Setup
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('admin_travaux_sync')
      .on('broadcast', { event: 'submission_created' }, (payload) => {
        showToastMsg('🔔 Une nouvelle remise a été déposée par un étudiant !')
        fetchData()
      })
      .on('broadcast', { event: 'submission_graded' }, () => {
        fetchData()
      })
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
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  // Advanced Dashboard KPIs
  const kpis = useMemo(() => {
    const totalAssignments = assignments.length
    const publishedCount = assignments.filter((a) => a.published || a.status === 'publie').length
    const draftCount = assignments.filter((a) => !a.published || a.status === 'brouillon').length
    const archivedCount = assignments.filter((a) => a.status === 'archive').length
    
    const totalSubmissions = assignments.reduce((acc, a) => acc + (a.submissions?.length || 0), 0)
    const gradedSubmissions = assignments.reduce(
      (acc, a) => acc + (a.submissions?.filter((s) => s.status === 'graded').length || 0),
      0
    )
    const pendingGrading = assignments.reduce(
      (acc, a) => acc + (a.submissions?.filter((s) => s.status === 'submitted').length || 0),
      0
    )

    // Taux de remise (Estimé par travaux publiés x remises)
    const submissionRate = publishedCount > 0 ? Math.min(Math.round((totalSubmissions / (publishedCount * 15)) * 100), 100) : 0
    // Taux de correction
    const correctionRate = totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 100

    return {
      totalAssignments,
      publishedCount,
      draftCount,
      archivedCount,
      totalSubmissions,
      gradedSubmissions,
      pendingGrading,
      submissionRate,
      correctionRate,
    }
  }, [assignments])

  // Filtered List
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const q = search.toLowerCase()
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
        matchStatus = a.submissions.some((s) => s.status === 'submitted')
      }

      return matchSearch && matchSession && matchStatus
    })
  }, [assignments, search, sessionFilter, statusFilter])

  // Paginated List
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage) || 1
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAssignments.slice(start, start + itemsPerPage)
  }, [filteredAssignments, currentPage, itemsPerPage])

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, sessionFilter, statusFilter])

  // Open Create Form
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

  // Open Edit Form
  const handleOpenEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      description: assignment.description,
      objectives: assignment.objectives || '',
      instructions: assignment.instructions || '',
      type: assignment.type,
      difficulty: assignment.difficulty || 'intermediaire',
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

  // Submit Assignment (Create / Edit)
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

      const resData = await res.json()
      if (!res.ok || resData.success === false) {
        throw new Error(resData.error || 'Erreur lors de la sauvegarde du travail')
      }

      showToastMsg(editingAssignment ? 'Travail mis à jour avec succès !' : 'Nouveau travail créé et synchronisé !')
      setShowCreateModal(false)
      fetchData()
    } catch (err: any) {
      console.error(err)
      showToastMsg(err.message || 'Une erreur est survenue', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // Toggle Publish
  const handleTogglePublish = async (assignment: Assignment) => {
    try {
      const nextPublished = !assignment.published
      const nextStatus = nextPublished ? 'publie' : 'brouillon'
      const res = await fetch(`/api/admin/assignments/${assignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: nextPublished, status: nextStatus }),
      })
      if (!res.ok) throw new Error('Échec du changement de statut')
      showToastMsg(nextPublished ? 'Travail publié aux étudiants !' : 'Travail dépublié (Brouillon)')
      fetchData()
    } catch (err: any) {
      showToastMsg(err.message, 'error')
    }
  }

  // Delete Assignment
  const handleDeleteAssignment = async (assignment: Assignment) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/assignments/${assignment.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Échec de la suppression')
      showToastMsg('Travail et fichiers R2 associés supprimés avec succès')
      setConfirmDelete(null)
      fetchData()
    } catch (err: any) {
      showToastMsg(err.message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Select Submission for Grading
  const handleSelectSubmissionForGrading = (sub: Submission) => {
    setSelectedSubmission(sub)
    setGradeValue(sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : '')
    setFeedbackValue(sub.feedback || '')
    setSubmissionStatusValue(sub.status === 'returned' ? 'returned' : 'graded')
  }

  // Save Grade and Feedback
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return

    setGradingLoading(true)
    try {
      const res = await fetch(`/api/admin/submissions/${selectedSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: gradeValue !== '' ? parseFloat(gradeValue) : null,
          feedback: feedbackValue,
          status: submissionStatusValue,
        }),
      })

      const resData = await res.json()
      if (!res.ok || resData.success === false) {
        throw new Error(resData.error || 'Erreur lors de l’enregistrement de la note')
      }

      showToastMsg('Correction enregistrée et étudiant notifié !')

      // Update local state in viewSubmissionsAssignment
      if (viewSubmissionsAssignment) {
        const updatedSubs = viewSubmissionsAssignment.submissions.map((s) =>
          s.id === selectedSubmission.id ? resData.submission : s
        )
        setViewSubmissionsAssignment({
          ...viewSubmissionsAssignment,
          submissions: updatedSubs,
        })
      }

      setSelectedSubmission(null)
      fetchData()
    } catch (err: any) {
      showToastMsg(err.message, 'error')
    } finally {
      setGradingLoading(false)
    }
  }

  const getFileIcon = (mimeType: string, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    if (mimeType.includes('pdf') || ext === 'pdf') return <FileText className="w-4 h-4 text-red-500" />
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-4 h-4 text-blue-600" />
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
    if (ext === 'zip' || ext === 'rar' || ext === '7z') return <FileArchive className="w-4 h-4 text-amber-600" />
    if (mimeType.includes('image') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return <FileImage className="w-4 h-4 text-purple-600" />
    return <FileCode className="w-4 h-4 text-slate-500" />
  }

  return (
    <AdminShell title="Gestion des Travaux & Devoirs">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-2xl animate-fade-in-up ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Administration · Module Travaux & Évaluations
          </p>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            Centre de Gestion des Travaux
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Créez, filtrez, publiez et corrigez les sujets d'évaluations synchronisés avec Cloudflare R2 et Supabase.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-700)] text-white text-xs font-black rounded-xl shadow-lg transition shrink-0 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Nouveau Travail
        </button>
      </div>

      {/* KPI & Analytics Dashboard Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Travaux', value: kpis.totalAssignments, icon: FileText, color: 'text-slate-800', bg: 'bg-slate-50' },
          { label: 'Publiés', value: kpis.publishedCount, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50/60' },
          { label: 'Brouillons', value: kpis.draftCount, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50/60' },
          { label: 'Total Remises', value: kpis.totalSubmissions, icon: Layers, color: 'text-blue-700', bg: 'bg-blue-50/60' },
          { label: 'À Corriger', value: kpis.pendingGrading, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50/60' },
          { label: 'Corrigés', value: kpis.gradedSubmissions, icon: Award, color: 'text-violet-700', bg: 'bg-violet-50/60' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border border-slate-200/70 p-4 shadow-sm ${bg}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Progress Metric Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Taux Global de Remise des Étudiants
            </span>
            <span className="text-blue-700 font-black">{kpis.submissionRate}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${kpis.submissionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Taux de Correction par l'Administration
            </span>
            <span className="text-emerald-700 font-black">{kpis.correctionRate}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
              style={{ width: `${kpis.correctionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, description ou formation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-semibold text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Session filter */}
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
            >
              <option value="all">Toutes les sessions</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.formation?.title ? `${s.formation.title} (Session #${s.id})` : `Session #${s.id}`}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés uniquement</option>
              <option value="draft">Brouillons uniquement</option>
              <option value="archived">Archivés uniquement</option>
              <option value="pending_grading">Remises à corriger</option>
            </select>

            <button
              type="button"
              onClick={fetchData}
              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Main Table / List Section */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-primary)]" />
            <span className="text-xs font-semibold uppercase tracking-wider">Chargement des travaux...</span>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4 border border-slate-200/50">
              <FileText className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-slate-900">Aucun travail trouvé</p>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              {assignments.length === 0
                ? 'Créez votre premier travail pour le diffuser auprès des étudiants.'
                : 'Ajustez vos filtres de recherche.'}
            </p>
            {assignments.length === 0 && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-primary)] text-white text-xs font-black rounded-xl shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Créer un travail
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Titre du Travail</th>
                  <th className="py-3.5 px-4">Session Concernée</th>
                  <th className="py-3.5 px-4">Date Limite</th>
                  <th className="py-3.5 px-4 text-center">Remises</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Date de Création</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedAssignments.map((assignment) => {
                  const pendingCount = assignment.submissions?.filter((s) => s.status === 'submitted').length || 0
                  const statusLabel = assignment.status === 'archive'
                    ? 'Archivé'
                    : assignment.published || assignment.status === 'publie'
                    ? 'Publié'
                    : 'Brouillon'

                  return (
                    <tr key={assignment.id} className="hover:bg-slate-50/50 transition">
                      {/* Titre & Type */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 max-w-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-[var(--cj-blue)] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {assignment.type === 'tp'
                                ? 'TP'
                                : assignment.type === 'exam'
                                ? 'Examen'
                                : assignment.type === 'project'
                                ? 'Projet'
                                : 'Devoir'}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Max : {assignment.maxFileSize} MB
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 text-xs truncate" title={assignment.title}>
                            {assignment.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{assignment.description}</p>
                        </div>
                      </td>

                      {/* Session */}
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        <div>
                          <p className="font-bold text-slate-800">
                            {assignment.formation?.title || (assignment.formationId ? `Formation #${assignment.formationId}` : `Session #${assignment.sessionId}`)}
                          </p>
                          <p className="text-[11px] text-slate-400">Session #{assignment.sessionId}</p>
                        </div>
                      </td>

                      {/* Date limite */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(assignment.deadline).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Remises */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewSubmissionsAssignment(assignment)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-[var(--cj-blue)] hover:bg-blue-100 font-bold transition shadow-sm"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>{assignment.submissions?.length || 0}</span>
                          {pendingCount > 0 && (
                            <span className="ml-1 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                              {pendingCount}
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Statut */}
                      <td className="py-4 px-4">
                        {statusLabel === 'Publié' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Publié
                          </span>
                        ) : statusLabel === 'Archivé' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                            <FileArchive className="w-3 h-3" /> Archivé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3" /> Brouillon
                          </span>
                        )}
                      </td>

                      {/* Date de création */}
                      <td className="py-4 px-4 text-slate-500 font-medium whitespace-nowrap">
                        {new Date(assignment.createdAt).toLocaleDateString('fr-FR')}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewDetailAssignment(assignment)}
                            title="Aperçu rapide"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePublish(assignment)}
                            title={assignment.published ? 'Dépublier' : 'Publier'}
                            className={`px-2 py-1 rounded-lg border transition text-[11px] font-bold ${
                              assignment.published
                                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {assignment.published ? 'Dépublier' : 'Publier'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(assignment)}
                            title="Modifier"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmDelete(assignment)}
                            title="Supprimer"
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-500">
              Page <strong className="text-slate-900">{currentPage}</strong> sur{' '}
              <strong className="text-slate-900">{totalPages}</strong> ({filteredAssignments.length} travaux)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Création / Édition Travail */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingAssignment ? 'Modifier le Travail' : 'Créer un nouveau Travail'}
                </h2>
                <p className="text-xs text-slate-500">
                  Configurez le sujet, les consignes et la session de destination.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="p-6 space-y-4">
              {/* Session Concernée */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Session de Formation Concernée *
                </label>
                <select
                  value={formData.sessionId}
                  onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
                  required
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[var(--admin-primary)] outline-none text-slate-900"
                >
                  <option value="">Sélectionnez une session active</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.formation?.title ? `${s.formation.title} (Session #${s.id})` : `Session #${s.id}`} (
                      {s.format})
                    </option>
                  ))}
                </select>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre du Travail *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ex: TP n°1 - Audit Sécurité et Architecture Cloud"
                  required
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[var(--admin-primary)] outline-none text-slate-900"
                />
              </div>

              {/* Type, Niveau & Statut */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type de Travail</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none"
                  >
                    <option value="tp">Travail Pratique (TP)</option>
                    <option value="project">Projet de fin de module</option>
                    <option value="exam">Examen / Évaluation</option>
                    <option value="homework">Devoir à la maison</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulté</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none"
                  >
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Statut Initial</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none"
                  >
                    <option value="publie">Publié (Immédiat)</option>
                    <option value="brouillon">Brouillon</option>
                    <option value="archive">Archivé</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description Générale *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Présentation générale du sujet..."
                  required
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[var(--admin-primary)] outline-none text-slate-900"
                />
              </div>

              {/* Objectifs & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Objectifs Pédagogiques</label>
                  <textarea
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    rows={2}
                    placeholder="Compétences visées..."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instructions de Remise</label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={2}
                    placeholder="Format de nommage du fichier, consignes de rendu..."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Dates & Paramètres Fichiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date Limite de Remise *</label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Taille Max Fichier (MB)</label>
                  <input
                    type="number"
                    value={formData.maxFileSize}
                    onChange={(e) => setFormData({ ...formData, maxFileSize: parseInt(e.target.value, 10) || 10 })}
                    min={1}
                    max={100}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Fichiers Remis</label>
                  <input
                    type="number"
                    value={formData.maxFiles}
                    onChange={(e) => setFormData({ ...formData, maxFiles: parseInt(e.target.value, 10) || 5 })}
                    min={1}
                    max={10}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none"
                  />
                </div>
              </div>

              {/* Formats autorisés */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Formats de fichiers autorisés</label>
                <input
                  type="text"
                  value={formData.allowedFileTypes}
                  onChange={(e) => setFormData({ ...formData, allowedFileTypes: e.target.value })}
                  placeholder="pdf,doc,docx,zip,rar,png,jpg,jpeg,excel,xls,xlsx"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none text-slate-900"
                />
              </div>

              {/* Checkbox Remplacement */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="allowResubmission_cb"
                  checked={formData.allowResubmission}
                  onChange={(e) => setFormData({ ...formData, allowResubmission: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--cj-blue)] border-slate-300"
                />
                <label htmlFor="allowResubmission_cb" className="text-xs font-bold text-slate-800">
                  Autoriser l'étudiant à remplacer son dépôt avant la date limite
                </label>
              </div>

              {/* Fichiers Consignes (Cloudflare R2 Upload) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  📄 Téléverser le Sujet / Consignes (Cloudflare R2)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setConsigneFiles(Array.from(e.target.files))
                    }
                  }}
                  className="w-full text-xs text-slate-700 bg-white rounded-xl border border-slate-200 p-2"
                />
                {editingAssignment && editingAssignment.files.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-500 mb-1.5">Consignes déjà enregistrées :</p>
                    <div className="flex flex-wrap gap-2">
                      {editingAssignment.files.map((f) => (
                        <a
                          key={f.id}
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-bold text-[var(--cj-blue)] hover:bg-blue-50"
                        >
                          {getFileIcon(f.mimeType, f.originalName)}
                          <span>{f.originalName}</span>
                          <Download className="w-3 h-3 ml-1 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--admin-primary)] text-white text-xs font-bold rounded-xl hover:bg-[var(--admin-primary-700)] disabled:opacity-50 shadow-md"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingAssignment ? 'Enregistrer les modifications' : 'Créer et Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aperçu Rapide */}
      {viewDetailAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-fade-in-up">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[var(--cj-blue)] bg-blue-50 px-2 py-0.5 rounded">
                  Session #{viewDetailAssignment.sessionId}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{viewDetailAssignment.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailAssignment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{viewDetailAssignment.description}</p>

            {viewDetailAssignment.objectives && (
              <div className="bg-blue-50/50 p-3 rounded-xl text-xs text-slate-700">
                <strong className="text-[var(--cj-blue)] font-bold">Objectifs :</strong> {viewDetailAssignment.objectives}
              </div>
            )}

            {viewDetailAssignment.files.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-bold text-slate-800">Sujet & consignes :</p>
                <div className="flex flex-wrap gap-2">
                  {viewDetailAssignment.files.map((f) => (
                    <a
                      key={f.id}
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--cj-blue)]"
                    >
                      <Download className="w-3.5 h-3.5" /> {f.originalName}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewDetailAssignment(null)}
                className="px-4 py-2 bg-slate-100 text-xs font-bold text-slate-700 rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer / Modal Liste des Remises d'un Travail */}
      {viewSubmissionsAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <span className="text-[10px] font-black uppercase text-[var(--cj-blue)] bg-blue-50 px-2 py-0.5 rounded">
                  Session #{viewSubmissionsAssignment.sessionId}
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  Remises : {viewSubmissionsAssignment.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {viewSubmissionsAssignment.submissions.length} travail(aux) remis au total.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewSubmissionsAssignment(null)
                  setSelectedSubmission(null)
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {viewSubmissionsAssignment.submissions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs rounded-2xl bg-slate-50 border border-slate-200">
                  Aucun étudiant n'a déposé de travail pour le moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {viewSubmissionsAssignment.submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm hover:border-blue-200 transition"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            👤 {sub.student.firstName} {sub.student.lastName}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            Matricule : {sub.student.studentNumber} | Email : {sub.student.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                              sub.status === 'graded'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : sub.status === 'returned'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {sub.status === 'graded'
                              ? `Corrigé (${sub.grade}/20)`
                              : sub.status === 'returned'
                              ? 'À refaire'
                              : 'Déposé (À corriger)'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleSelectSubmissionForGrading(sub)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--admin-primary)] text-white text-xs font-bold rounded-xl hover:bg-[var(--admin-primary-700)] transition shadow-sm"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Corriger / Noter</span>
                          </button>
                        </div>
                      </div>

                      {/* Submitted Files */}
                      {sub.files.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold text-slate-700">Fichiers remis par l'étudiant :</p>
                          <div className="flex flex-wrap gap-2">
                            {sub.files.map((f) => (
                              <a
                                key={f.id}
                                href={f.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-[var(--cj-blue)] hover:border-blue-300 transition"
                              >
                                {getFileIcon(f.mimeType, f.originalName)}
                                <span>{f.originalName} ({(f.size / 1024).toFixed(1)} KB)</span>
                                <Download className="w-3.5 h-3.5 text-slate-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback & Grade Display */}
                      {sub.grade !== null && (
                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs">
                          <p className="font-bold text-emerald-900">
                            Note attribuée : {sub.grade}/20
                          </p>
                          {sub.feedback && (
                            <p className="text-emerald-800 mt-1 italic">
                              Commentaire : "{sub.feedback}"
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-[11px] text-slate-400 font-medium pt-1">
                        Déposé le {new Date(sub.submittedAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulaire de Correction / Notation */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Correction de la remise
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSubmission.student.firstName} {selectedSubmission.student.lastName} (
                  {selectedSubmission.student.studentNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 space-y-4">
              {/* Note sur 20 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note attribuée (sur 20) *
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="20"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  placeholder="ex: 17.5"
                  required
                  className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[var(--admin-primary)] outline-none text-slate-900"
                />
              </div>

              {/* Statut de correction */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Décision / Statut</label>
                <select
                  value={submissionStatusValue}
                  onChange={(e) => setSubmissionStatusValue(e.target.value as any)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none"
                >
                  <option value="graded">Valider & Marquer comme Corrigé</option>
                  <option value="returned">Demande de modification (À refaire)</option>
                </select>
              </div>

              {/* Commentaire / Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Commentaire & Feedback Pédagogique
                </label>
                <textarea
                  value={feedbackValue}
                  onChange={(e) => setFeedbackValue(e.target.value)}
                  rows={4}
                  placeholder="Rédigez vos conseils, remarques et points d'amélioration pour l'étudiant..."
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[var(--admin-primary)] outline-none text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={gradingLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--admin-primary)] text-white text-xs font-bold rounded-xl hover:bg-[var(--admin-primary-700)] disabled:opacity-50 shadow-md"
                >
                  {gradingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Enregistrer & Notifier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center border border-slate-200 animate-fade-in-up">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Supprimer ce travail ?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Cette action supprimera également les consignes et les fichiers remis associés sur Cloudflare R2.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteAssignment(confirmDelete)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
