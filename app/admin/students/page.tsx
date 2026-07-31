'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  History,
  Info,
  MailIcon,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  SearchIcon,
  ShieldAlert,
  ShieldCheck,
  Trash,
  User,
  UserCheck,
  Users,
  XIcon,
} from 'lucide-react'
import AdminShell from '@/components/admin-portal/AdminShell'
import PaginationControls from '@/components/admin-portal/PaginationControls'

type Student = {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string | null
  status: string
  createdAt: string
  adminSession: {
    id: string
    title: string
  } | null
  latestEnrollment: {
    id: number
    status: string
    paymentStatus: string
    paidAmount: number
    totalAmount: number
    formationTitle: string
    session: {
      id: number
      startDate: string
      location: string
    } | null
  } | null
}

type SessionItem = {
  id: string
  title: string
}

type PaginationState = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type CredentialState = {
  studentId: string | null
  fullName: string
  username: string
  password: string
  email: string
  sessionTitle: string | null
  emailSent: boolean
  emailError: string | null
}

type EditFormState = {
  id: string
  name: string
  email: string
  username: string
  sessionId: string
  status: string
}

type StudentDetails = {
  student: {
    id: string
    fullName: string
    email: string
    username: string | null
    status: string
    role: string
    phone: string | null
    address: string | null
    city: string | null
    country: string | null
    studentNumber: string
    createdAt: string
    updatedAt: string
    adminSession: {
      id: string
      title: string
      startDate: string
      endDate: string
    } | null
  }
  overview: {
    totalEnrollments: number
    activeEnrollments: number
    settledEnrollments: number
    pendingPayments: number
    submissionsCount: number
    certificatesCount: number
    notificationsCount: number
    attendanceCount: number
  }
  enrollments: Array<{
    id: number
    status: string
    paymentStatus: string
    paidAmount: number
    totalAmount: number
    createdAt: string
    startDate: string
    reminderCount: number
    lastReminderSent: string | null
    formation: {
      id: number
      title: string
      categorie: string | null
    }
    session: {
      id: number
      startDate: string
      endDate: string
      location: string | null
      format: string
      status: string
    } | null
    evaluation: {
      id: number
      overallRating: number
      overallComment: string | null
      submittedAt: string
    } | null
    certificate: {
      id: number
      code: string
      type: string
      issuedAt: string
      verified: boolean
    } | null
  }>
  payments: Array<{
    id: number
    amount: number
    method: string
    status: string
    reference: string | null
    transactionId: string | null
    paidAt: string | null
    createdAt: string
    enrollmentId: number
    formationTitle: string
    sessionLabel: string
  }>
  attendance: Array<{
    id: number
    date: string
    status: string
    notes: string | null
    recordedAt: string
    enrollmentId: number
    formationTitle: string
    sessionLabel: string
  }>
  submissions: Array<{
    id: string
    title: string
    fileUrl: string
    status: string
    createdAt: string
    updatedAt: string
    session: {
      id: string
      title: string
      startDate: string
      endDate: string
    } | null
  }>
  results: Array<{
    id: number
    enrollmentId: number
    formationTitle: string
    overallRating: number
    overallComment: string | null
    submittedAt: string
    sessionLabel: string
  }>
  notes: Array<{
    enrollmentId: number
    formationTitle: string
    sessionLabel: string
    adminComment: string | null
    questions: Array<{
      id: string
      message: string
      status: string
      createdAt: string
      adminReply?: string | null
      adminReplyAt?: string | null
    }>
  }>
  certificates: Array<{
    id: string
    title: string
    type: string
    code: string
    issuedAt: string
    verified: boolean
    fileUrl: string | null
    formationTitle: string | null
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    createdAt: string
  }>
  auditLogs: Array<{
    id: string
    action: string
    summary: string
    status: string
    adminUsername: string
    createdAt: string
  }>
}

type SummaryCardTone = 'primary' | 'success' | 'warning' | 'neutral'

const initialCreateForm = {
  name: '',
  email: '',
  sessionId: '',
  manualCredentials: false,
  username: '',
  password: '',
}

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--admin-primary-200)] focus:ring-4 focus:ring-[var(--admin-primary-100)]'
const selectClassName = `${inputClassName} appearance-none`
const primaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--admin-primary-700)] disabled:cursor-not-allowed disabled:opacity-60'
const secondaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[var(--admin-primary-200)] hover:text-[var(--admin-primary)] hover:bg-slate-50'
const subtleButtonClassName =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white'
const dangerButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-accent-700)] transition hover:bg-[var(--admin-accent-100)]'

function getStudentName(student: Pick<Student, 'firstName' | 'lastName'>) {
  return `${student.firstName} ${student.lastName}`.trim()
}

function getStudentInitials(student: Pick<Student, 'firstName' | 'lastName'>) {
  const parts = [student.firstName, student.lastName].filter(Boolean)
  return (
    parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'ET'
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatDateTime(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getStatusLabel(status: string) {
  if (status === 'ACTIVE') return 'Actif'
  if (status === 'SUSPENDED') return 'Suspendu'
  if (status === 'PENDING') return 'En attente'
  return status || 'En attente'
}

function statusBadgeClass(status: string) {
  if (status === 'ACTIVE') return 'border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold'
  if (status === 'SUSPENDED') return 'border border-rose-200 bg-rose-50 text-rose-700 font-bold'
  return 'border border-amber-200 bg-amber-50 text-amber-700 font-bold'
}

function paymentBadgeClass(status: string | null | undefined) {
  const normalized = (status || '').toLowerCase().trim()
  if (!normalized) return 'border border-slate-200 bg-slate-50 text-slate-600'
  if (normalized.includes('fail') || normalized.includes('cancel') || normalized.includes('reject')) {
    return 'border border-rose-200 bg-rose-50 text-rose-700'
  }
  if (normalized === 'paid' || normalized.includes('success') || normalized.includes('complete')) {
    return 'border border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  return 'border border-amber-200 bg-amber-50 text-amber-700'
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = 'primary',
}: {
  icon: typeof Users
  label: string
  value: string
  helper: string
  tone?: SummaryCardTone
}) {
  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-200">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--admin-primary)] border border-blue-100">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500 font-medium">{helper}</p>
    </article>
  )
}

function DetailField({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-slate-800 break-words" data-testid={testId}>
        {value}
      </p>
    </div>
  )
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sessionId: '',
  })
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  const [loadingList, setLoadingList] = useState(true)
  const [actionError, setActionError] = useState<string | null>(null)

  // Selection & 360 View State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<StudentDetails | null>(null)
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false)
  const [studentDetailsError, setStudentDetailsError] = useState<string | null>(null)
  const [active360Tab, setActive360Tab] = useState<'overview' | 'profile' | 'enrollments' | 'work' | 'audit'>('overview')

  // Modals & Creation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [submittingCreate, setSubmittingCreate] = useState(false)

  // Credentials State after generation
  const [generatedCredential, setGeneratedCredential] = useState<CredentialState | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [credentialEmailFeedback, setCredentialEmailFeedback] = useState<string | null>(null)
  const [sendingCredentialEmail, setSendingCredentialEmail] = useState(false)

  // Edit Modal State
  const [editForm, setEditForm] = useState<EditFormState | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [selectedStudentId, students]
  )

  const metrics = useMemo(() => {
    const activeStudents = students.filter((student) => student.status === 'ACTIVE').length
    const suspendedStudents = students.filter((student) => student.status === 'SUSPENDED').length
    const assignedStudents = students.filter((student) => Boolean(student.adminSession)).length

    return [
      {
        label: 'Comptes filtrés',
        value: `${pagination.totalItems}`,
        helper: `${students.length} affichés sur la page actuelle`,
        tone: 'primary' as const,
        icon: Users,
      },
      {
        label: 'Actifs',
        value: `${activeStudents}`,
        helper: `${suspendedStudents} compte(s) suspendu(s)`,
        tone: 'success' as const,
        icon: ShieldCheck,
      },
      {
        label: 'Affectés à une session',
        value: `${assignedStudents}`,
        helper: 'Comptes rattachés à une session',
        tone: 'neutral' as const,
        icon: BadgeCheck,
      },
    ]
  }, [pagination.totalItems, students])

  const hasFilters = Boolean(filters.search || filters.status || filters.sessionId)

  async function loadSessions() {
    try {
      const response = await fetch('/api/admin/system/sessions', { cache: 'no-store' })
      if (!response.ok) return
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Erreur chargement sessions:', err)
    }
  }

  async function loadStudents(options?: Partial<PaginationState & typeof filters>) {
    setLoadingList(true)
    try {
      const params = new URLSearchParams()
      const search = options?.search ?? filters.search
      const status = options?.status ?? filters.status
      const sessionId = options?.sessionId ?? filters.sessionId
      const page = options?.page ?? pagination.page
      const pageSize = options?.pageSize ?? pagination.pageSize

      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (sessionId) params.set('sessionId', sessionId)

      const response = await fetch(`/api/admin/system/students?${params.toString()}`, { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok) {
        setActionError(data?.error || 'Impossible de charger les étudiants.')
        setStudents([])
        setSelectedStudentId(null)
        setPagination((prev) => ({
          ...prev,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }))
        return
      }

      const nextStudents = data.students || []
      setActionError(null)
      setStudents(nextStudents)
      setPagination(data.pagination || initialPagination)
      setSelectedStudentId((current) => {
        if (current && nextStudents.some((student: Student) => student.id === current)) {
          return current
        }
        return nextStudents[0]?.id ?? null
      })
    } catch (error) {
      console.error('Impossible de charger les étudiants:', error)
      setStudents([])
      setSelectedStudentId(null)
      setActionError('Impossible de charger les étudiants.')
    } finally {
      setLoadingList(false)
    }
  }

  async function loadStudentDetails(studentId: string) {
    setLoadingStudentDetails(true)
    setStudentDetailsError(null)

    try {
      const response = await fetch(`/api/admin/system/students/${studentId}`, { cache: 'no-store' })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setSelectedStudentDetails(null)
        setStudentDetailsError(data?.error || 'Impossible de charger le dossier étudiant.')
        return
      }

      setSelectedStudentDetails(data as StudentDetails)
    } catch (error) {
      console.error('Impossible de charger le dossier étudiant:', error)
      setSelectedStudentDetails(null)
      setStudentDetailsError('Impossible de charger le dossier étudiant.')
    } finally {
      setLoadingStudentDetails(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    loadStudents()
  }, [filters, pagination.page, pagination.pageSize])

  useEffect(() => {
    if (!selectedStudentId) {
      setSelectedStudentDetails(null)
      setStudentDetailsError(null)
      return
    }

    loadStudentDetails(selectedStudentId)
  }, [selectedStudentId])

  async function onCreateStudent(event: FormEvent) {
    event.preventDefault()
    setSubmittingCreate(true)
    setGeneratedCredential(null)
    setCopyFeedback(null)
    setCredentialEmailFeedback(null)
    setActionError(null)

    const submittedName = createForm.name.trim()
    const submittedEmail = createForm.email.trim().toLowerCase()
    const selectedSessionTitle = createForm.sessionId ? sessions.find((session) => session.id === createForm.sessionId)?.title || null : null

    const response = await fetch('/api/admin/system/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: createForm.name,
        email: createForm.email,
        sessionId: createForm.sessionId || null,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setCreateForm(initialCreateForm)
      setIsCreateModalOpen(false)
      setGeneratedCredential(
        data.credentials
          ? {
              studentId: data.student?.id || null,
              fullName:
                `${data.student?.firstName || ''} ${data.student?.lastName || ''}`.trim() || submittedName,
              username: data.credentials.username,
              password: data.credentials.password,
              email: submittedEmail,
              sessionTitle: selectedSessionTitle,
              emailSent: Boolean(data.notifications?.credentialsEmailSent),
              emailError: data.notifications?.credentialsEmailError || null,
            }
          : null
      )

      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }))
      } else {
        await loadStudents({ page: 1 })
      }
    } else {
      setActionError(data?.error || 'Impossible de créer le compte étudiant.')
    }

    setSubmittingCreate(false)
  }

  function openEditStudent(student: Student) {
    setEditError(null)
    setEditForm({
      id: student.id,
      name: getStudentName(student),
      email: student.email,
      username: student.username || '',
      sessionId: student.adminSession?.id || '',
      status: student.status,
    })
  }

  async function submitEditStudent(event: FormEvent) {
    event.preventDefault()
    if (!editForm) return

    const trimmedName = editForm.name.trim()
    const trimmedEmail = editForm.email.trim()
    const trimmedUsername = editForm.username.trim()

    if (!trimmedName || !trimmedEmail || !trimmedUsername) {
      setEditError('Nom, email et nom d’utilisateur sont requis.')
      return
    }

    setSavingEdit(true)
    setEditError(null)
    setActionError(null)

    const response = await fetch(`/api/admin/system/students/${editForm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: trimmedName,
        email: trimmedEmail,
        username: trimmedUsername,
        sessionId: editForm.sessionId || null,
        status: editForm.status,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setEditError(payload?.error || 'Impossible de mettre à jour le compte étudiant.')
      setSavingEdit(false)
      return
    }

    setEditForm(null)
    setSavingEdit(false)
    await loadStudents()
    if (selectedStudentId === editForm.id) {
      loadStudentDetails(editForm.id)
    }
  }

  async function deleteStudent(id: string) {
    const confirmed = window.confirm('Supprimer définitivement ce compte étudiant ?')
    if (!confirmed) return

    setActionError(null)
    const response = await fetch(`/api/admin/system/students/${id}`, { method: 'DELETE' })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setActionError(payload?.error || 'Impossible de supprimer le compte étudiant.')
      return
    }

    await loadStudents()
  }

  async function resetStudentCredentials(student: Student) {
    if (!student.username) {
      alert('Définissez un nom d’utilisateur avant de réinitialiser le mot de passe.')
      return
    }

    const confirmed = window.confirm(
      `Générer un nouveau mot de passe et renvoyer les identifiants à ${student.firstName} ${student.lastName} ?`
    )
    if (!confirmed) return

    setActionError(null)
    setCopyFeedback(null)
    setCredentialEmailFeedback(null)

    const response = await fetch(`/api/admin/system/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: getStudentName(student),
        email: student.email,
        username: student.username,
        sessionId: student.adminSession?.id || null,
        status: student.status,
        resetPassword: true,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      alert(data?.error || 'Impossible de réinitialiser les identifiants.')
      return
    }

    if (data.generatedPassword) {
      setGeneratedCredential({
        studentId: student.id,
        fullName: getStudentName(student),
        username: student.username,
        password: data.generatedPassword,
        email: student.email,
        sessionTitle: student.adminSession?.title || null,
        emailSent: Boolean(data.notifications?.credentialsEmailSent),
        emailError: data.notifications?.credentialsEmailError || null,
      })
    }

    await loadStudents()
  }

  async function updateStudentStatus(student: Student, status: 'ACTIVE' | 'SUSPENDED') {
    setActionError(null)

    if (!student.username) {
      setActionError('Définissez un nom d’utilisateur avant de changer le statut.')
      return
    }

    const response = await fetch(`/api/admin/system/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: getStudentName(student),
        email: student.email,
        username: student.username,
        sessionId: student.adminSession?.id || null,
        status,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setActionError(payload?.error || 'Impossible de mettre à jour le statut du compte.')
      return
    }

    await loadStudents()
    if (selectedStudentId === student.id) {
      loadStudentDetails(student.id)
    }
  }

  async function copyCredentials() {
    if (!generatedCredential) return
    const loginUrl = `${window.location.origin}/student/login`
    const payload = [
      `Nom d'utilisateur: ${generatedCredential.username}`,
      `Mot de passe: ${generatedCredential.password}`,
      `Connexion: ${loginUrl}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(payload)
      setCopyFeedback('Identifiants copiés dans le presse-papiers.')
    } catch {
      setCopyFeedback('Impossible de copier automatiquement.')
    }
  }

  async function sendCredentialsEmail() {
    if (!generatedCredential) return

    setSendingCredentialEmail(true)
    setCredentialEmailFeedback(null)
    setActionError(null)

    try {
      const response = await fetch('/api/admin/system/students/send-access-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: generatedCredential.studentId,
          email: generatedCredential.email,
          fullName: generatedCredential.fullName,
          username: generatedCredential.username,
          password: generatedCredential.password,
          sessionTitle: generatedCredential.sessionTitle,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const message = data?.error || 'Impossible d’envoyer l’email des identifiants.'
        setGeneratedCredential((current) => (current ? { ...current, emailSent: false, emailError: message } : current))
        setCredentialEmailFeedback(message)
        return
      }

      setGeneratedCredential((current) => (current ? { ...current, emailSent: true, emailError: null } : current))
      setCredentialEmailFeedback(`Identifiants envoyés à ${generatedCredential.email}.`)
    } catch {
      const message = 'Impossible d’envoyer l’email des identifiants.'
      setGeneratedCredential((current) => (current ? { ...current, emailSent: false, emailError: message } : current))
      setCredentialEmailFeedback(message)
    } finally {
      setSendingCredentialEmail(false)
    }
  }

  function resetFilters() {
    setFilters({ search: '', status: '', sessionId: '' })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <AdminShell title="Gestion des Étudiants">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER TOOLBAR & METRICS */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Répertoire Étudiants & Dossier 360°</h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Consultez les informations académiques, les travaux et le suivi des candidats.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className={primaryButtonClassName}
          >
            <Plus className="h-4 w-4" />
            Nouveau compte étudiant
          </button>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <SummaryCard
              key={metric.label}
              icon={metric.icon}
              label={metric.label}
              value={metric.value}
              helper={metric.helper}
              tone={metric.tone}
            />
          ))}
        </section>

        {/* NOTIFICATION FEEDBACK (CREDENTIALS) */}
        {generatedCredential ? (
          <section className="rounded-3xl border border-[var(--admin-primary-200)] bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--admin-primary)]">
                    Identifiants Générés
                  </p>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Compte créé / réinitialisé avec succès pour {generatedCredential.fullName}
                </h3>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700 pt-1">
                  <span>Nom d'utilisateur : <strong>{generatedCredential.username}</strong></span>
                  <span>Mot de passe : <strong>{generatedCredential.password}</strong></span>
                  <span>Email : <strong>{generatedCredential.email}</strong></span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={sendCredentialsEmail}
                  disabled={sendingCredentialEmail}
                  className={primaryButtonClassName}
                >
                  <MailIcon className="h-4 w-4" />
                  {sendingCredentialEmail ? 'Envoi...' : generatedCredential.emailSent ? "Renvoyer l'e-mail" : "Envoyer l'e-mail"}
                </button>
                <button
                  type="button"
                  onClick={copyCredentials}
                  className={secondaryButtonClassName}
                >
                  <Copy className="h-4 w-4" />
                  Copier
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratedCredential(null)}
                  className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-400 hover:text-slate-700"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            {credentialEmailFeedback && (
              <p className="mt-2 text-xs font-medium text-blue-700">{credentialEmailFeedback}</p>
            )}
            {copyFeedback && (
              <p className="mt-1 text-xs font-medium text-emerald-700">{copyFeedback}</p>
            )}
          </section>
        ) : null}

        {actionError ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </section>
        ) : null}

        {/* MAIN HERO COMPONENT: DOSSIER 360° */}
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl transition-all duration-300">
          {/* DOSSIER 360° HEADER */}
          <div className="bg-gradient-to-r from-slate-900 via-[var(--admin-primary)] to-blue-900 p-6 sm:p-8 text-white">
            {selectedStudent ? (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-black text-white ring-2 ring-white/20 backdrop-blur-md">
                    {getStudentInitials(selectedStudent)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
                        DOSSIER 360° ÉTUDIANT
                      </span>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusBadgeClass(selectedStudent.status)}`}>
                        {getStatusLabel(selectedStudent.status)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                      {selectedStudentDetails?.student.fullName || getStudentName(selectedStudent)}
                    </h2>
                    <p className="text-xs text-blue-100/90 font-medium">
                      {selectedStudent.email} • ID: {selectedStudent.id}
                    </p>
                  </div>
                </div>

                {/* DOSSIER 360° ACTIONS TOOLBAR */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditStudent(selectedStudent)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/25 transition ring-1 ring-white/20"
                  >
                    <Pencil className="h-4 w-4" />
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => resetStudentCredentials(selectedStudent)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/25 transition ring-1 ring-white/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Réinitialiser Identifiants
                  </button>
                  {selectedStudent.status === 'SUSPENDED' ? (
                    <button
                      type="button"
                      onClick={() => updateStudentStatus(selectedStudent, 'ACTIVE')}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-4 py-2.5 text-xs font-bold hover:bg-emerald-500/30 transition"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Réactiver
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateStudentStatus(selectedStudent, 'SUSPENDED')}
                      className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/20 text-amber-200 border border-amber-400/30 px-4 py-2.5 text-xs font-bold hover:bg-amber-500/30 transition"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Suspendre
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteStudent(selectedStudent.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-500/20 text-rose-200 border border-rose-400/30 px-4 py-2.5 text-xs font-bold hover:bg-rose-500/30 transition"
                  >
                    <Trash className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 py-2">
                <Info className="h-8 w-8 text-blue-300" />
                <div>
                  <h2 className="text-xl font-bold text-white">Aucun étudiant sélectionné</h2>
                  <p className="text-xs text-blue-100">Choisissez un compte dans la liste ci-dessous pour ouvrir son Dossier 360°.</p>
                </div>
              </div>
            )}
          </div>

          {/* DOSSIER 360° CONTENT BODY */}
          {selectedStudent ? (
            <div className="p-6 sm:p-8 space-y-6">
              {/* TABS NAVIGATION */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setActive360Tab('overview')}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                    active360Tab === 'overview'
                      ? 'bg-[var(--admin-primary)] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setActive360Tab('profile')}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                    active360Tab === 'profile'
                      ? 'bg-[var(--admin-primary)] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Profil & Contact
                </button>
                <button
                  onClick={() => setActive360Tab('enrollments')}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                    active360Tab === 'enrollments'
                      ? 'bg-[var(--admin-primary)] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Inscriptions & Sessions ({selectedStudentDetails?.overview.totalEnrollments || 0})
                </button>
                <button
                  onClick={() => setActive360Tab('work')}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                    active360Tab === 'work'
                      ? 'bg-[var(--admin-primary)] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Travaux & Certificats ({selectedStudentDetails?.overview.submissionsCount || 0})
                </button>
                <button
                  onClick={() => setActive360Tab('audit')}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
                    active360Tab === 'audit'
                      ? 'bg-[var(--admin-primary)] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <History className="h-4 w-4" />
                  Historique Admin ({selectedStudentDetails?.auditLogs.length || 0})
                </button>
              </div>

              {loadingStudentDetails ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-xs text-slate-500 font-semibold">
                  Chargement du dossier 360°...
                </div>
              ) : studentDetailsError ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700 font-bold">
                  {studentDetailsError}
                </div>
              ) : selectedStudentDetails ? (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {active360Tab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailField label="Numéro Étudiant" value={selectedStudentDetails.student.studentNumber} />
                        <DetailField label="Session Active" value={selectedStudentDetails.student.adminSession?.title || 'Non affectée'} />
                        <DetailField label="Total Inscriptions" value={`${selectedStudentDetails.overview.totalEnrollments}`} />
                        <DetailField label="Certificats Émis" value={`${selectedStudentDetails.overview.certificatesCount}`} />
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Enrollments Quick View */}
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-[var(--admin-primary)]" />
                            Dernières Inscriptions
                          </h4>
                          {selectedStudentDetails.enrollments.length > 0 ? (
                            selectedStudentDetails.enrollments.slice(0, 3).map((item) => (
                              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-1 text-xs">
                                <div className="flex items-center justify-between font-bold text-slate-900">
                                  <span>{item.formation.title}</span>
                                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] text-blue-700 border border-blue-100">
                                    {item.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  Inscrit le : {formatDate(item.createdAt)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500 font-medium">Aucune inscription active.</p>
                          )}
                        </div>

                        {/* Submissions Quick View */}
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[var(--admin-primary)]" />
                            Travaux Soumis & Retours
                          </h4>
                          {selectedStudentDetails.submissions.length > 0 ? (
                            selectedStudentDetails.submissions.slice(0, 3).map((sub) => (
                              <div key={sub.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-1 text-xs">
                                <div className="flex items-center justify-between font-bold text-slate-900">
                                  <span>{sub.title}</span>
                                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] text-emerald-700 border border-emerald-100">
                                    {sub.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  Déposé le : {formatDateTime(sub.createdAt)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500 font-medium">Aucun travail soumis pour le moment.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PROFILE & CONTACT */}
                  {active360Tab === 'profile' && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <DetailField label="Nom Complet" value={selectedStudentDetails.student.fullName} />
                      <DetailField label="Email" value={selectedStudentDetails.student.email} />
                      <DetailField label="Nom d'utilisateur" value={selectedStudentDetails.student.username || 'Non défini'} />
                      <DetailField label="Téléphone" value={selectedStudentDetails.student.phone || 'Non renseigné'} />
                      <DetailField label="Rôle System" value={selectedStudentDetails.student.role} />
                      <DetailField label="Numéro Étudiant" value={selectedStudentDetails.student.studentNumber} />
                      <DetailField label="Ville / Pays" value={[selectedStudentDetails.student.city, selectedStudentDetails.student.country].filter(Boolean).join(', ') || 'Non renseignés'} />
                      <DetailField label="Adresse" value={selectedStudentDetails.student.address || 'Non renseignée'} />
                      <DetailField label="Date de création" value={formatDateTime(selectedStudentDetails.student.createdAt)} />
                    </div>
                  )}

                  {/* TAB 3: ENROLLMENTS & SESSIONS */}
                  {active360Tab === 'enrollments' && (
                    <div className="space-y-4">
                      {selectedStudentDetails.enrollments.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-6">Aucune inscription enregistrée pour cet étudiant.</p>
                      ) : (
                        selectedStudentDetails.enrollments.map((enr) => (
                          <div key={enr.id} className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  ID Inscription #{enr.id}
                                </span>
                                <h4 className="text-base font-bold text-slate-900 mt-1">{enr.formation.title}</h4>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-bold ${paymentBadgeClass(enr.paymentStatus)}`}>
                                Statut : {enr.status}
                              </span>
                            </div>
                            {enr.session && (
                              <div className="text-xs text-slate-600 flex flex-wrap gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                                <span><strong>Début :</strong> {formatDate(enr.session.startDate)}</span>
                                <span><strong>Fin :</strong> {formatDate(enr.session.endDate)}</span>
                                <span><strong>Lieu :</strong> {enr.session.location || 'En ligne'}</span>
                                <span><strong>Format :</strong> {enr.session.format}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 4: WORK & CERTIFICATES */}
                  {active360Tab === 'work' && (
                    <div className="space-y-6">
                      {/* Submissions Section */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Travaux & Soumissions</h4>
                        {selectedStudentDetails.submissions.length === 0 ? (
                          <p className="text-xs text-slate-500 py-3">Aucune soumission enregistrée.</p>
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2">
                            {selectedStudentDetails.submissions.map((sub) => (
                              <div key={sub.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                                <div className="flex items-center justify-between font-bold text-slate-900">
                                  <span>{sub.title}</span>
                                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px]">
                                    {sub.status}
                                  </span>
                                </div>
                                <p className="text-slate-500 text-[11px]">Déposé le : {formatDateTime(sub.createdAt)}</p>
                                {sub.fileUrl && (
                                  <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-[var(--admin-primary)] hover:underline">
                                    Voir le fichier déposé <ArrowRight className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Certificates Section */}
                      <div className="space-y-3 border-t border-slate-200 pt-5">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Certificats Émis</h4>
                        {selectedStudentDetails.certificates.length === 0 ? (
                          <p className="text-xs text-slate-500 py-3">Aucun certificat émis pour cet étudiant.</p>
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2">
                            {selectedStudentDetails.certificates.map((cert) => (
                              <div key={cert.id} className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-xs space-y-2">
                                <div className="flex items-center justify-between font-bold text-slate-900">
                                  <span>{cert.title}</span>
                                  <span className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-[10px]">
                                    Code: {cert.code}
                                  </span>
                                </div>
                                <p className="text-slate-500 text-[11px]">Émis le : {formatDate(cert.issuedAt)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: AUDIT LOGS */}
                  {active360Tab === 'audit' && (
                    <div className="space-y-3">
                      {selectedStudentDetails.auditLogs.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-6">Aucun évènement d'audit pour ce compte.</p>
                      ) : (
                        selectedStudentDetails.auditLogs.map((log) => (
                          <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>Action : {log.action}</span>
                              <span className="text-slate-400 font-normal">{formatDateTime(log.createdAt)}</span>
                            </div>
                            <p className="text-slate-600">{log.summary}</p>
                            <p className="text-[10px] text-slate-400">Effectué par : {log.adminUsername}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* LIST & REPERTOIRE DES ÉTUDIANTS */}
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm space-y-4 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Répertoire des comptes étudiants</h3>
              <p className="text-xs text-slate-500 mt-0.5">Cliquez sur un étudiant dans la liste pour charger son Dossier 360° complet ci-dessus.</p>
            </div>
            {hasFilters && (
              <button type="button" onClick={resetFilters} className={secondaryButtonClassName}>
                <RotateCcw className="h-4 w-4" />
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* FILTERS BAR */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={filters.search}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                placeholder="Rechercher par nom, email ou pseudo..."
                className={`${inputClassName} pl-11`}
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, status: e.target.value }))
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className={selectClassName}
            >
              <option value="">Tous les statuts</option>
              <option value="ACTIVE">Actifs</option>
              <option value="SUSPENDED">Suspendus</option>
              <option value="PENDING">En attente</option>
            </select>

            <select
              value={filters.sessionId}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, sessionId: e.target.value }))
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className={selectClassName}
            >
              <option value="">Toutes les sessions</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
          </div>

          {/* TABLE OF STUDENTS */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 text-left">Étudiant</th>
                  <th className="px-5 py-3.5 text-left">Identifiants</th>
                  <th className="px-5 py-3.5 text-left">Statut</th>
                  <th className="px-5 py-3.5 text-left">Session Rattachée</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingList ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500 font-semibold">
                      Chargement de la liste des étudiants...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500 font-semibold">
                      Aucun étudiant ne correspond aux filtres de recherche.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const isSelected = selectedStudentId === student.id
                    return (
                      <tr
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 border border-slate-200">
                              {getStudentInitials(student)}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">{getStudentName(student)}</p>
                              <p className="text-[11px] text-slate-500">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 font-mono">
                          {student.username || 'Non défini'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusBadgeClass(student.status)}`}>
                            {getStatusLabel(student.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-700">
                          {student.adminSession?.title || 'Non affectée'}
                        </td>
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentId(student.id)}
                            className={subtleButtonClassName}
                          >
                            Ouvrir Dossier 360°
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
          />
        </section>
      </div>

      {/* CREATE STUDENT MODAL */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => !submittingCreate && setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--admin-primary)]">
                  Nouveau Compte
                </p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Ajouter un étudiant</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Les identifiants d'accès seront générés et envoyés par e-mail.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-400 hover:text-slate-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onCreateStudent} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Nom complet</label>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex. Nicole Zephonie"
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="nom@exemple.com"
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Session à associer</label>
                <select
                  value={createForm.sessionId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, sessionId: e.target.value }))}
                  className={selectClassName}
                >
                  <option value="">Aucune session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={secondaryButtonClassName}
                  disabled={submittingCreate}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className={primaryButtonClassName}
                >
                  <ArrowRight className="h-4 w-4" />
                  {submittingCreate ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => !savingEdit && setEditForm(null)}
        >
          <div
            className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--admin-primary)]">
                  Édition Compte
                </p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Modifier l'étudiant</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditForm(null)}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-400 hover:text-slate-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitEditStudent} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Nom complet</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Nom d'utilisateur</label>
                <input
                  value={editForm.username}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, username: e.target.value } : prev))}
                  className={inputClassName}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Session</label>
                  <select
                    value={editForm.sessionId}
                    onChange={(e) => setEditForm((prev) => (prev ? { ...prev, sessionId: e.target.value } : prev))}
                    className={selectClassName}
                  >
                    <option value="">Aucune session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Statut</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => (prev ? { ...prev, status: e.target.value } : prev))}
                    className={selectClassName}
                  >
                    <option value="ACTIVE">Actif</option>
                    <option value="SUSPENDED">Suspendu</option>
                    <option value="PENDING">En attente</option>
                  </select>
                </div>
              </div>

              {editError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-bold">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditForm(null)}
                  className={secondaryButtonClassName}
                  disabled={savingEdit}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className={primaryButtonClassName}
                >
                  <ArrowRight className="h-4 w-4" />
                  {savingEdit ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
