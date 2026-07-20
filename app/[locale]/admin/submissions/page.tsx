'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  ClipboardList,
  Copy,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Layers,
  Loader2,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Trash2,
  X,
  XCircle,
  FileCheck2,
  FileUp,
  Clock3,
  Check,
  ChevronRight,
  Filter,
  FileArchive,
  GraduationCap
} from 'lucide-react'

interface Assignment {
  id: number
  title: string
  description: string
  type: 'tp' | 'exam' | 'project'
  formationId: number
  formation: {
    id: number
    title: string
    slug: string
  }
  sessionId: number | null
  session?: {
    id: number
    startDate: string
    endDate: string
    location: string
    format: string
  } | null
  deadline: string
  maxFileSize: number
  allowedFileTypes: string[]
  instructions: string | null
  status: 'brouillon' | 'publie' | 'archive'
  publishDate: string
  createdAt: string
  files: Array<{
    id: number
    name: string
    originalName: string
    size: number
    url: string
  }>
  submissions: any[]
}

interface Submission {
  id: number
  assignmentId: number
  studentEmail: string
  studentName?: string
  status: 'submitted' | 'graded' | 'returned'
  grade: number | null
  feedback: string | null
  submittedAt: string
  gradedAt: string | null
  gradedBy: string | null
  files: Array<{
    id: number
    name: string
    originalName: string
    size: number
    url: string
  }>
}

interface EnrolledStudent {
  email: string
  name: string
}

interface Formation {
  id: number
  title: string
}

interface Session {
  id: number
  startDate: string
  endDate: string
  formationId: number
  format: string
  formation?: {
    id: number
    title: string
  } | null
}

const FILE_TYPE_OPTIONS = [
  { label: 'PDF (.pdf)', value: 'pdf' },
  { label: 'Word (.doc, .docx)', value: 'docx' },
  { label: 'PowerPoint (.pptx)', value: 'pptx' },
  { label: 'Excel (.xlsx)', value: 'xlsx' },
  { label: 'Zip/Tar (.zip, .rar, .7z)', value: 'zip' },
  { label: 'Images (.png, .jpg)', value: 'png' },
]

export default function AdminSubmissionsPage() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'corrections'>('assignments')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [formationFilter, setFormationFilter] = useState('all')
  const [sessionFilter, setSessionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all') // all, active, upcoming, overdue

  // Form states
  const [showForm, setShowForm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formType, setFormType] = useState<'tp' | 'exam' | 'project'>('tp')
  const [formFormationId, setFormFormationId] = useState('')
  const [formSessionId, setFormSessionId] = useState('')
  const [formDeadline, setFormDeadline] = useState('')
  const [formMaxFileSize, setFormMaxFileSize] = useState(10)
  const [formAllowedFileTypes, setFormAllowedFileTypes] = useState<string[]>(['pdf', 'docx', 'zip'])
  const [formInstructions, setFormInstructions] = useState('')
  const [formStatus, setFormStatus] = useState<'brouillon' | 'publie' | 'archive'>('publie')
  const [formPublishDate, setFormPublishDate] = useState('')
  const [formFiles, setFormFiles] = useState<Array<{ name: string; originalName: string; size: number; url: string }>>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)

  // Dépôts & Corrections states
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('all')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null)
  const [correctionGrade, setCorrectionGrade] = useState('')
  const [correctionFeedback, setCorrectionFeedback] = useState('')
  const [savingCorrection, setSavingCorrection] = useState(false)

  // Filters inside corrections tab
  const [corrSearch, setCorrSearch] = useState('')
  const [corrStatusFilter, setCorrStatusFilter] = useState('all') // all, remis, non-remis, note

  // Feedback Notifications
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setErrorMsg('')
      const [assignmentsRes, formationsRes, sessionsRes] = await Promise.all([
        fetch('/api/admin/assignments'),
        fetch('/api/formations'),
        fetch('/api/sessions'),
      ])

      if (!assignmentsRes.ok || !formationsRes.ok || !sessionsRes.ok) {
        throw new Error('Erreur lors du chargement des APIs.')
      }

      const assignmentsData = await assignmentsRes.json()
      const formationsData = await formationsRes.json()
      const sessionsData = await sessionsRes.json()

      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      setFormations(
        formationsData && Array.isArray(formationsData.formations)
          ? formationsData.formations
          : Array.isArray(formationsData)
          ? formationsData
          : []
      )
      setSessions(Array.isArray(sessionsData) ? sessionsData : [])
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Impossible de charger les données. Veuillez actualiser la page.')
      showNotification('Erreur de chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  // Load submissions and cohort participants
  const loadSubmissionsForAssignment = async (assignId: number) => {
    try {
      setLoadingSubmissions(true)
      const res = await fetch(`/api/admin/assignments/${assignId}/submissions`)
      if (!res.ok) throw new Error('Impossible de récupérer la liste des dépôts')
      
      const data = await res.json()
      setSubmissions(data.submissions || [])
      setEnrolledStudents(data.enrollments || [])
    } catch (err) {
      console.error(err)
      showNotification('Erreur de chargement des copies', 'error')
    } finally {
      setLoadingSubmissions(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'corrections' && selectedAssignmentId !== 'all') {
      loadSubmissionsForAssignment(parseInt(selectedAssignmentId))
      setSelectedSubmission(null)
      setSelectedStudentEmail(null)
    } else {
      setSubmissions([])
      setEnrolledStudents([])
      setSelectedSubmission(null)
      setSelectedStudentEmail(null)
    }
  }, [selectedAssignmentId, activeTab])

  // Handle resource upload
  const handleUploadResource = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files
    if (!filesList || filesList.length === 0) return

    setUploadingFiles(true)
    try {
      for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i]
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/admin/assignments/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `Erreur lors de l'envoi de ${file.name}`)
        }

        const fileData = await res.json()
        setFormFiles((prev) => [...prev, fileData])
      }
      showNotification(`${filesList.length} document(s) téléversé(s) !`)
    } catch (err: any) {
      console.error(err)
      showNotification(err.message || 'Erreur lors du téléversement', 'error')
    } finally {
      setUploadingFiles(false)
      e.target.value = '' // Reset input
    }
  }

  // Create / Update Devoir
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formSessionId || !formDeadline) {
      showNotification('Veuillez sélectionner une session et remplir tous les champs obligatoires (*)', 'error')
      return
    }

    try {
      const deadlineDate = new Date(formDeadline)
      if (isNaN(deadlineDate.getTime())) {
        throw new Error('La date limite de dépôt spécifiée est invalide.')
      }

      let publishDateStr = new Date().toISOString()
      if (formPublishDate && formPublishDate.trim()) {
        const publishDateObj = new Date(formPublishDate)
        if (isNaN(publishDateObj.getTime())) {
          throw new Error("La date d'affichage aux étudiants spécifiée est invalide.")
        }
        publishDateStr = publishDateObj.toISOString()
      }

      const payload = {
        title: formTitle.trim(),
        description: formDescription,
        type: formType,
        formationId: parseInt(formFormationId),
        sessionId: parseInt(formSessionId),
        deadline: deadlineDate.toISOString(),
        maxFileSize: formMaxFileSize,
        allowedFileTypes: formAllowedFileTypes,
        instructions: formInstructions || null,
        status: formStatus,
        publishDate: publishDateStr,
        files: formFiles,
      }

      let res
      if (editingAssignment) {
        res = await fetch(`/api/admin/assignments/${editingAssignment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Erreur lors de la sauvegarde du travail')
      }

      showNotification(
        editingAssignment 
          ? 'Le devoir a été mis à jour avec succès.' 
          : 'Le devoir a été créé et publié avec succès.'
      )
      setShowForm(false)
      loadInitialData()
    } catch (err: any) {
      console.error(err)
      showNotification(err.message || 'Erreur lors de l’enregistrement', 'error')
    }
  }

  // Duplicate Devoir
  const handleDuplicate = async (assignment: Assignment) => {
    try {
      const payload = {
        title: `${assignment.title} (Copie)`,
        description: assignment.description,
        type: assignment.type,
        formationId: assignment.formationId,
        sessionId: assignment.sessionId,
        deadline: assignment.deadline,
        maxFileSize: assignment.maxFileSize,
        allowedFileTypes: assignment.allowedFileTypes,
        instructions: assignment.instructions,
        status: 'brouillon', // Save as draft by default when duplicating
        publishDate: new Date().toISOString(),
        files: assignment.files.map((f) => ({
          name: f.name,
          originalName: f.originalName,
          size: f.size,
          url: f.url,
        })),
      }

      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Erreur réseau lors de la duplication')
      showNotification('Devoir dupliqué en tant que Brouillon !')
      loadInitialData()
    } catch (err) {
      console.error(err)
      showNotification('Échec de la duplication du devoir', 'error')
    }
  }

  // Delete Devoir
  const handleDelete = async (id: number, title: string) => {
    if (
      !confirm(
        `Êtes-vous absolument sûr de vouloir supprimer le devoir "${title}" ?\n\nCette action supprimera également tous les fichiers et dépôts d'étudiants associés. Cette action est irréversible.`
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/admin/assignments/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      showNotification('Devoir supprimé avec succès.')
      loadInitialData()
    } catch (err) {
      console.error(err)
      showNotification('Échec de la suppression', 'error')
    }
  }

  // Toggle status directly
  const handleToggleStatus = async (assignment: Assignment, nextStatus: 'publie' | 'brouillon' | 'archive') => {
    try {
      const res = await fetch(`/api/admin/assignments/${assignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error('Erreur de changement de statut')
      showNotification(`Devoir passé en statut : ${nextStatus}`)
      loadInitialData()
    } catch (err) {
      console.error(err)
      showNotification('Impossible de modifier le statut', 'error')
    }
  }

  const openCreate = () => {
    setEditingAssignment(null)
    setFormTitle('')
    setFormDescription('')
    setFormType('tp')
    setFormFormationId('')
    setFormSessionId('')
    setFormDeadline('')
    setFormMaxFileSize(10)
    setFormAllowedFileTypes(['pdf', 'docx', 'zip'])
    setFormInstructions('')
    setFormStatus('publie')
    setFormPublishDate(new Date().toISOString().slice(0, 16))
    setFormFiles([])
    setShowForm(true)
  }

  const openEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setFormTitle(assignment.title)
    setFormDescription(assignment.description)
    setFormType(assignment.type)
    setFormFormationId(String(assignment.formationId))
    setFormSessionId(assignment.sessionId ? String(assignment.sessionId) : '')
    setFormDeadline(new Date(assignment.deadline).toISOString().slice(0, 16))
    setFormMaxFileSize(assignment.maxFileSize)
    setFormAllowedFileTypes(assignment.allowedFileTypes)
    setFormInstructions(assignment.instructions || '')
    setFormStatus(assignment.status)
    setFormPublishDate(new Date(assignment.publishDate).toISOString().slice(0, 16))
    setFormFiles(assignment.files.map((f) => ({ name: f.name, originalName: f.originalName, size: f.size, url: f.url })))
    setShowForm(true)
  }

  // Saisir note & feedback
  const handleSaveCorrection = async () => {
    if (!selectedAssignmentId) return

    setSavingCorrection(true)
    try {
      const isGraded = correctionGrade.trim() !== ''
      const payload = {
        submissionId: selectedSubmission?.id || null,
        studentEmail: selectedStudentEmail,
        status: isGraded ? 'graded' : 'submitted',
        grade: isGraded ? parseFloat(correctionGrade) : null,
        feedback: correctionFeedback.trim() || null,
      }

      // Check if submission exists, if not create one or submit correction
      const res = await fetch(`/api/admin/assignments/${selectedAssignmentId}/submissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Erreur lors de l’enregistrement de la correction')
      const updated = await res.json()

      showNotification('Note et feedback enregistrés avec succès !')
      
      // Update locally
      if (selectedSubmission) {
        setSubmissions((prev) => prev.map((s) => (s.id === selectedSubmission.id ? { ...s, ...updated } : s)))
      } else {
        // reload copies to get correct IDs
        loadSubmissionsForAssignment(parseInt(selectedAssignmentId))
      }
      
      setSelectedSubmission(null)
      setSelectedStudentEmail(null)
    } catch (err: any) {
      console.error(err)
      showNotification(err.message || 'Erreur lors de la notation', 'error')
    } finally {
      setSavingCorrection(false)
    }
  }

  const handleSelectStudentForCorrection = (student: EnrolledStudent, sub: Submission | null) => {
    setSelectedStudentEmail(student.email)
    setSelectedSubmission(sub)
    setCorrectionGrade(sub && sub.grade !== null ? String(sub.grade) : '')
    setCorrectionFeedback(sub && sub.feedback ? sub.feedback : '')
  }

  // ── DYNAMIC KPIS ───────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = assignments.length
    const published = assignments.filter((a) => a.status === 'publie').length
    const drafts = assignments.filter((a) => a.status === 'brouillon').length
    
    // Submissions
    const submissionsCount = assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0)

    // Near deadline (next 7 days)
    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(now.getDate() + 7)
    const nearDeadline = assignments.filter((a) => {
      const d = new Date(a.deadline)
      return d > now && d <= sevenDaysFromNow && a.status === 'publie'
    }).length

    return { total, published, drafts, submissionsCount, nearDeadline }
  }, [assignments])

  // ── FILTERED ASSIGNMENTS ──────────────────────────────────────────
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFormation = formationFilter === 'all' || item.formationId === parseInt(formationFilter)
      const matchesSession = sessionFilter === 'all' || item.sessionId === parseInt(sessionFilter)
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter

      let matchesDate = true
      const now = new Date()
      const deadline = new Date(item.deadline)

      if (dateFilter === 'active') {
        matchesDate = deadline >= now && item.status === 'publie'
      } else if (dateFilter === 'upcoming') {
        const pubDate = new Date(item.publishDate)
        matchesDate = pubDate > now
      } else if (dateFilter === 'overdue') {
        matchesDate = deadline < now
      }

      return matchesSearch && matchesFormation && matchesSession && matchesStatus && matchesDate
    })
  }, [assignments, searchQuery, formationFilter, sessionFilter, statusFilter, dateFilter])

  // ── DÉPÔTS & CORRECTIONS MATRIX (Student Grid) ─────────────────────
  const studentSubmissionsMatrix = useMemo(() => {
    return enrolledStudents.map((student) => {
      const sub = submissions.find((s) => s.studentEmail.toLowerCase() === student.email.toLowerCase())
      return {
        student,
        submission: sub || null,
      }
    }).filter((item) => {
      // Search filter
      const matchesSearch =
        item.student.name.toLowerCase().includes(corrSearch.toLowerCase()) ||
        item.student.email.toLowerCase().includes(corrSearch.toLowerCase())

      // Status filter
      let matchesStatus = true
      if (corrStatusFilter === 'remis') {
        matchesStatus = !!item.submission
      } else if (corrStatusFilter === 'non-remis') {
        matchesStatus = !item.submission
      } else if (corrStatusFilter === 'note') {
        matchesStatus = !!item.submission && item.submission.status === 'graded'
      }

      return matchesSearch && matchesStatus
    })
  }, [enrolledStudents, submissions, corrSearch, corrStatusFilter])

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <AdminShell title="Pilotage des Évaluations Académiques">
      {/* ── TOAST NOTIFICATION ───────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed right-6 top-20 z-[9999] flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-xl transition-all animate-fade-in-up ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
          {toast.msg}
        </div>
      )}

      {/* ── HEADER DE PAGE & TABS ───────────────────────────────────── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pédagogie & Devoirs</p>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Espace Travaux Pratiques</h1>
        </div>

        {/* Tab Selector */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 shadow-inner self-start md:self-auto border border-slate-200/50">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === 'assignments' ? 'bg-white text-[var(--admin-primary)] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Sujets & Devoirs ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === 'corrections' ? 'bg-white text-[var(--admin-primary)] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Copies & Corrections
          </button>
        </div>
      </div>

      {/* ── INDICATEURS DE RENDEMENT (KPIS) ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mb-8">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total devoirs</p>
          <p className="mt-1 text-2xl font-black text-slate-955">{kpis.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Publiés</p>
          <p className="mt-1 text-2xl font-black text-emerald-650">{kpis.published}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brouillons</p>
          <p className="mt-1 text-2xl font-black text-slate-400">{kpis.drafts}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remises reçues</p>
          <p className="mt-1 text-2xl font-black text-blue-650">{kpis.submissionsCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-12 w-12 translate-x-3 -translate-y-3 rounded-full bg-rose-50" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Échéance &lt; 7j</p>
          <p className="mt-1 text-2xl font-black text-rose-600">{kpis.nearDeadline}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs font-bold text-red-800 mb-6">
          {errorMsg}
        </div>
      )}

      {/* ── SYSTEME DE DEVOIRS ────────────────────────────────────────── */}
      {activeTab === 'assignments' ? (
        <div className="space-y-6">
          {/* BARRE D'OUTILS ET FILTRES */}
          <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm md:flex-row md:items-center">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none transition font-semibold"
              />
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={formationFilter}
                onChange={(e) => {
                  setFormationFilter(e.target.value)
                  setSessionFilter('all') // Reset session filter when formation changes
                }}
                className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] font-bold text-slate-700"
              >
                <option value="all">Toutes les formations</option>
                {formations.map((f) => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>

              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                disabled={formationFilter === 'all'}
                className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] font-bold text-slate-755 disabled:opacity-50"
              >
                <option value="all">Toutes les cohortes</option>
                {sessions
                  .filter((s) => formationFilter === 'all' || s.formationId === parseInt(formationFilter))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      Cohorte #{s.id} ({s.format})
                    </option>
                  ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] font-bold text-slate-755"
              >
                <option value="all">Tous les statuts</option>
                <option value="publie">Publié</option>
                <option value="brouillon">Brouillon</option>
                <option value="archive">Archivé</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] font-bold text-slate-750"
              >
                <option value="all">Toutes les dates</option>
                <option value="active">Actifs (En cours)</option>
                <option value="upcoming">Planifiés (Futurs)</option>
                <option value="overdue">Échus (Date limite passée)</option>
              </select>

              <button
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-700)] text-white text-xs font-black rounded-xl shadow-sm transition"
              >
                <Plus className="h-4 w-4" />
                Nouveau sujet
              </button>
            </div>
          </div>

          {/* TABLEAU DES SUJETS */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-primary)]" />
                <span className="font-semibold text-xs uppercase tracking-wider text-slate-400">Chargement des devoirs...</span>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4 border border-slate-200/50">
                  <BookOpen className="h-8 w-8" />
                </div>
                <p className="text-sm font-bold text-slate-900">Aucun devoir trouvé</p>
                <p className="text-xs text-slate-500 mt-1">Essayez d'ajuster vos critères de recherche ou de filtres.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">Titre</th>
                      <th className="px-6 py-4">Formation & Session</th>
                      <th className="px-6 py-4">Publication</th>
                      <th className="px-6 py-4">Date limite</th>
                      <th className="px-6 py-4 text-center">Dépôts</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredAssignments.map((assign) => {
                      const overdue = new Date(assign.deadline) < new Date()
                      return (
                        <tr key={assign.id} className="hover:bg-slate-50/40 transition">
                          <td className="px-6 py-4">
                            <div className="space-y-1 max-w-[280px]">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${
                                  assign.type === 'tp' ? 'bg-blue-100 text-blue-800' :
                                  assign.type === 'exam' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {assign.type === 'tp' ? 'TP' : assign.type === 'exam' ? 'Examen' : 'Projet'}
                                </span>
                                <span className="font-extrabold text-slate-900 truncate hover:text-blue-900 transition">{assign.title}</span>
                              </div>
                              {assign.files && assign.files.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] text-blue-700 font-bold">
                                  <FileText className="h-3 w-3" />
                                  <span>{assign.files.length} document(s) de cours</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-extrabold text-slate-900 truncate max-w-[200px]">{assign.formation?.title || 'Formation'}</p>
                            <p className="text-[10px] font-semibold text-slate-400">
                              {assign.sessionId ? `Cohorte #${assign.sessionId}` : 'Toutes les cohortes'}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-semibold">
                            {new Date(assign.publishDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-bold flex items-center gap-1 ${overdue ? 'text-red-500' : 'text-slate-700'}`}>
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(assign.deadline).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-900 font-bold text-[11px]">
                              {assign.submissions?.length || 0} reçus
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={assign.status}
                                onChange={(e) => handleToggleStatus(assign, e.target.value as any)}
                                className={`rounded-lg px-2 py-1 text-[10px] font-bold border focus:outline-none transition cursor-pointer ${
                                  assign.status === 'publie' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                  assign.status === 'brouillon' ? 'bg-slate-100 border-slate-200 text-slate-800' :
                                  'bg-amber-50 border-amber-200 text-amber-800'
                                }`}
                              >
                                <option value="publie">Publié</option>
                                <option value="brouillon">Brouillon</option>
                                <option value="archive">Archivé</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedAssignmentId(String(assign.id))
                                  setActiveTab('corrections')
                                }}
                                className="p-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-800 rounded-lg transition"
                                title="Voir dépôts & copies"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(assign)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition"
                                title="Dupliquer"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => openEdit(assign)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition"
                                title="Modifier"
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(assign.id, assign.title)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition"
                                title="Supprimer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
          </div>
        </div>
      ) : (
        /* ── CORRECTIONS ET REMISES ────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau gauche : Sélecteur de devoirs et liste des dépôts */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[var(--admin-primary)]" />
                <span className="text-xs font-bold text-slate-700">Sélectionner un Devoir :</span>
              </div>
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="w-full sm:w-72 px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
              >
                <option value="all">-- Choisir un sujet --</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.formation?.title || 'Formation'})
                  </option>
                ))}
              </select>
            </div>

            {selectedAssignmentId !== 'all' && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Suivi des Copies Étudiantes</h3>
                  
                  {/* Search and Filters inside table */}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Filtrer étudiant..."
                      value={corrSearch}
                      onChange={(e) => setCorrSearch(e.target.value)}
                      className="px-3 py-1.5 text-[11px] border border-slate-200 bg-white rounded-lg focus:outline-none font-semibold"
                    />
                    <select
                      value={corrStatusFilter}
                      onChange={(e) => setCorrStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-[11px] border border-slate-200 bg-white rounded-lg focus:outline-none font-bold text-slate-700"
                    >
                      <option value="all">Tous les dépôts</option>
                      <option value="remis">Fichiers remis</option>
                      <option value="non-remis">Non remis</option>
                      <option value="note">Notés</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                  {loadingSubmissions ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-primary)]" />
                      <span className="text-xs font-bold">Chargement des copies...</span>
                    </div>
                  ) : studentSubmissionsMatrix.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <p className="text-xs font-extrabold text-slate-900">Aucun étudiant trouvé</p>
                      <p className="text-[10px] mt-1 text-slate-500">Aucun inscrit dans cette cohorte ou aucun filtre ne correspond.</p>
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/30 text-[9px] font-black uppercase tracking-wider text-slate-400">
                          <th className="px-6 py-3">Étudiant / Email</th>
                          <th className="px-6 py-3">Statut Rendu</th>
                          <th className="px-6 py-3">Fichiers Remis</th>
                          <th className="px-6 py-3 text-center">Note</th>
                          <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentSubmissionsMatrix.map(({ student, submission }) => {
                          const isSelected = selectedStudentEmail === student.email
                          return (
                            <tr
                              key={student.email}
                              onClick={() => handleSelectStudentForCorrection(student, submission)}
                              className={`hover:bg-slate-50/50 transition cursor-pointer ${
                                isSelected ? 'bg-blue-50/40 border-l-4 border-[var(--admin-primary)]' : ''
                              }`}
                            >
                              <td className="px-6 py-4">
                                <p className="font-extrabold text-slate-900">{student.name}</p>
                                <p className="text-[10px] text-slate-400">{student.email}</p>
                              </td>
                              <td className="px-6 py-4">
                                {submission ? (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                                      Remis
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400">
                                      {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}{' '}
                                      {new Date(submission.submittedAt).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                    <Clock3 className="h-3 w-3" />
                                    Non remis
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                {submission && submission.files && submission.files.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {submission.files.map((file) => (
                                      <a
                                        key={file.id}
                                        href={file.url}
                                        download={file.originalName}
                                        className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline max-w-[150px] truncate"
                                        title={file.originalName}
                                      >
                                        <Download className="h-3.5 w-3.5 shrink-0" />
                                        {file.originalName}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px] font-medium">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {submission && submission.grade !== null ? (
                                  <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded bg-emerald-100 text-emerald-950 font-black text-xs">
                                    {submission.grade}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-blue-750">
                                <div className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-wider font-extrabold">
                                  <span>Noter</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {selectedAssignmentId === 'all' && (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center text-slate-400 shadow-sm flex flex-col items-center">
                <FolderOpen className="h-12 w-12 text-slate-300 mb-3" />
                <h4 className="font-extrabold text-slate-800 text-sm">Prêt à corriger ?</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Sélectionnez un sujet de devoir dans la liste déroulante en haut pour charger la feuille de notes et suivre les remises.
                </p>
              </div>
            )}
          </div>

          {/* Panneau droit : Évaluateur & Correcteur */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex flex-col">
            {selectedStudentEmail ? (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Correcteur de copie</h3>
                    <p className="font-black text-sm text-slate-900 mt-1">{studentSubmissionsMatrix.find(x => x.student.email === selectedStudentEmail)?.student.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{selectedStudentEmail}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStudentEmail(null)
                      setSelectedSubmission(null)
                    }}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {selectedSubmission ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Informations de dépôt</p>
                    <div className="rounded-xl border border-emerald-150 bg-emerald-50/50 p-3 text-xs">
                      <p className="font-bold text-emerald-800">
                        ⏱️ Remis le {new Date(selectedSubmission.submittedAt).toLocaleString('fr-FR')}
                      </p>
                      {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Fichiers à corriger :</p>
                          {selectedSubmission.files.map((file) => (
                            <a
                              key={file.id}
                              href={file.url}
                              download={file.originalName}
                              className="flex items-center gap-1.5 font-bold text-blue-800 hover:underline pt-1 border-t border-slate-200/50 mt-1"
                            >
                              <Download className="h-3.5 w-3.5" />
                              {file.originalName} ({formatSize(file.size)})
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-150 bg-amber-50/50 p-3 text-xs text-amber-800">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                      Cette copie n'a pas encore été remise.
                    </p>
                    <p className="text-[10px] font-medium mt-1 leading-relaxed">
                      Vous pouvez tout de même saisir une note de pénalité (ex. 0/20 pour absence) ou enregistrer un feedback de relance.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="correct-grade" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Note sur 20</label>
                    <input
                      id="correct-grade"
                      type="number"
                      min={0}
                      max={20}
                      step={0.25}
                      value={correctionGrade}
                      onChange={(e) => setCorrectionGrade(e.target.value)}
                      placeholder="ex. 16.5"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label htmlFor="correct-feedback" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Commentaire & Conseils pédagogiques</label>
                    <textarea
                      id="correct-feedback"
                      rows={6}
                      value={correctionFeedback}
                      onChange={(e) => setCorrectionFeedback(e.target.value)}
                      placeholder="Indiquez les points d'amélioration et forces constatés dans ce livrable..."
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveCorrection}
                  disabled={savingCorrection}
                  className="w-full py-2.5 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-700)] text-white text-xs font-black rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingCorrection ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="h-4 w-4" />
                      Enregistrer l'évaluation
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200/50 text-slate-300 mb-3">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-xs">Aperçu copie</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
                  Sélectionnez un étudiant dans la feuille de notes pour saisir son évaluation et son retour pédagogique.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FORMULAIRE / MODAL NOUVEAU SUJET (Drapeau showForm) ────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-6">
              {editingAssignment ? '✏️ Modifier l’évaluation académique' : '📚 Créer un nouveau devoir pour les cohortes'}
            </h2>

            <form onSubmit={handleSubmitAssignment} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Colonne gauche (2/3) : Titre & Descriptions */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label htmlFor="assign-title" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Titre du Devoir *</label>
                  <input
                    id="assign-title"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="ex. TP 1 - Algorithmique et Structures de Données"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="assign-desc" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description et Consignes générales *</label>
                  <textarea
                    id="assign-desc"
                    rows={6}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Présentez les objectifs de cette évaluation et les livrables attendus..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="assign-instruct" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Consignes de formatage de rendu (Optionnel)</label>
                  <textarea
                    id="assign-instruct"
                    rows={3}
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder="Format attendu (.zip, .pdf), structure de nommage du fichier..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none"
                  />
                </div>

                {/* FICHIERS RESSOURCES JOINTS MULTIPLES */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Documents d'accompagnement joints</span>
                  
                  {/* Upload Drop Zone / List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/50 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="font-extrabold text-slate-900 truncate max-w-[160px]">{file.originalName}</span>
                          <span className="text-[9px] font-bold text-slate-400 shrink-0">({formatSize(file.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-red-50 hover:text-red-650 rounded-lg text-slate-400 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[var(--admin-primary-300)] bg-slate-50/50 hover:bg-slate-50 p-4 rounded-xl cursor-pointer transition">
                    <FileUp className="h-5 w-5 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {uploadingFiles ? 'Téléversement de ressources...' : 'Ajouter un ou plusieurs fichiers'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">pdf, doc, docx, zip, xlsx, pptx (max 20Mo/fichier)</span>
                    <input
                      type="file"
                      onChange={handleUploadResource}
                      multiple
                      className="hidden"
                      disabled={uploadingFiles}
                    />
                  </label>
                </div>
              </div>

              {/* Colonne droite (1/3) : Paramètres & Métadonnées */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="assign-type" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Type de devoir</label>
                  <select
                    id="assign-type"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] font-bold text-slate-800"
                  >
                    <option value="tp">Travail Pratique (TP)</option>
                    <option value="exam">Évaluation / Examen</option>
                    <option value="project">Projet Académique</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="assign-session" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Session concernée *</label>
                  <select
                    id="assign-session"
                    value={formSessionId}
                    onChange={(e) => {
                      const selectedSessId = e.target.value
                      setFormSessionId(selectedSessId)
                      const matchedSession = sessions.find(s => s.id === parseInt(selectedSessId))
                      if (matchedSession) {
                        setFormFormationId(String(matchedSession.formationId))
                      } else {
                        setFormFormationId('')
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] font-bold text-slate-800"
                    required
                  >
                    <option value="">-- Choisir la session --</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.formation?.title || `Session #${s.id}`} - Cohorte #{s.id} ({s.format})
                      </option>
                    ))}
                  </select>
                </div>

                {formFormationId && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Formation associée (automatique)</label>
                    <div className="w-full px-3.5 py-2 text-xs border border-slate-200 bg-slate-100 rounded-xl font-bold text-slate-655">
                      {formations.find(f => f.id === parseInt(formFormationId))?.title || 'Formation'}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="assign-deadline" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date limite de dépôt *</label>
                  <input
                    id="assign-deadline"
                    type="datetime-local"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="assign-status" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Statut de publication</label>
                  <select
                    id="assign-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] font-bold text-slate-800"
                  >
                    <option value="publie">Publié</option>
                    <option value="brouillon">Brouillon (Non visible)</option>
                    <option value="archive">Archivé</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="assign-pubdate" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date d'affichage aux étudiants</label>
                  <input
                    id="assign-pubdate"
                    type="datetime-local"
                    value={formPublishDate}
                    onChange={(e) => setFormPublishDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                  />
                </div>

                {/* TAILLE MAX ET FILTRES EXTENSION */}
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <div>
                    <label htmlFor="assign-maxsize" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Taille max livrable (Mo)</label>
                    <input
                      id="assign-maxsize"
                      type="number"
                      min={1}
                      max={100}
                      value={formMaxFileSize}
                      onChange={(e) => setFormMaxFileSize(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-slate-50/30 rounded-lg focus:outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Types de fichiers autorisés</span>
                    <div className="grid grid-cols-2 gap-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                      {FILE_TYPE_OPTIONS.map((opt) => {
                        const checked = formAllowedFileTypes.includes(opt.value)
                        return (
                          <label key={opt.value} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-655 cursor-pointer select-none py-0.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setFormAllowedFileTypes((prev) => prev.filter((x) => x !== opt.value))
                                } else {
                                  setFormAllowedFileTypes((prev) => [...prev, opt.value])
                                }
                              }}
                              className="rounded border-slate-350 text-[var(--admin-primary)] focus:ring-[var(--admin-primary)] h-3 w-3"
                            />
                            {opt.label}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Barre actions formulaire */}
              <div className="md:col-span-3 border-t border-slate-100 pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-700)] rounded-xl font-black text-xs shadow-md transition"
                >
                  Enregistrer et Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
