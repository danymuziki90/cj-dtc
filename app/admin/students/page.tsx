'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Copy,
  Mail,
  PencilLine,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
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

const initialForm = {
  name: '',
  email: '',
  sessionId: '',
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
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--admin-primary-700)] disabled:cursor-not-allowed disabled:opacity-60'
const secondaryButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--admin-primary-200)] hover:text-[var(--admin-primary)]'
const subtleButtonClassName =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white'
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
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatDateTime(value: string) {
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
  if (status === 'ACTIVE') return 'border border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === 'SUSPENDED') return 'border border-rose-200 bg-rose-50 text-rose-700'
  return 'border border-amber-200 bg-amber-50 text-amber-700'
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

function paymentStatusLabel(status: string | null | undefined) {
  const normalized = (status || '').toLowerCase().trim()

  if (!normalized) return 'Aucun paiement'
  if (normalized.includes('fail') || normalized.includes('cancel') || normalized.includes('reject')) return 'Echoue'
  if (normalized === 'paid' || normalized.includes('success') || normalized.includes('complete')) return 'Solde'
  if (normalized === 'partial') return 'Partiel'
  if (normalized === 'unpaid') return 'Non solde'
  if (normalized.includes('pending') || normalized.includes('wait')) return 'En attente'
  return status || 'En attente'
}

function getOutstandingBalance(student: Student) {
  if (!student.latestEnrollment) return 0
  return Math.max(student.latestEnrollment.totalAmount - student.latestEnrollment.paidAmount, 0)
}

function hasPendingPayment(student: Student) {
  if (!student.latestEnrollment) return false
  const normalized = (student.latestEnrollment.paymentStatus || '').toLowerCase().trim()
  if (normalized === 'paid' || normalized.includes('success') || normalized.includes('complete')) return false
  return true
}

function getSummaryCardClasses(tone: SummaryCardTone) {
  if (tone === 'success') {
    return 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-900'
  }
  if (tone === 'warning') {
    return 'border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-900'
  }
  if (tone === 'neutral') {
    return 'border-slate-200 bg-gradient-to-br from-slate-50 to-white text-slate-900'
  }
  return 'border-[var(--admin-primary-200)] bg-gradient-to-br from-[var(--admin-primary-50)] to-white text-[var(--admin-primary-800)]'
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: typeof Users
  label: string
  value: string
  helper: string
  tone: SummaryCardTone
}) {
  return (
    <article
      className={`rounded-[28px] border p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] ${getSummaryCardClasses(
        tone
      )}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-black/5">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{helper}</p>
    </article>
  )
}

function DetailField({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900" data-testid={testId}>
        {value}
      </p>
    </div>
  )
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [form, setForm] = useState(initialForm)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sessionId: '',
  })
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  const [generatedCredential, setGeneratedCredential] = useState<CredentialState | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [credentialEmailFeedback, setCredentialEmailFeedback] = useState<string | null>(null)
  const [sendingCredentialEmail, setSendingCredentialEmail] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<StudentDetails | null>(null)
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false)
  const [studentDetailsError, setStudentDetailsError] = useState<string | null>(null)
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
    const pendingPayments = students.filter(hasPendingPayment).length
    const collectedAmount = students.reduce((sum, student) => sum + (student.latestEnrollment?.paidAmount || 0), 0)

    return [
      {
        label: 'Comptes filtres',
        value: `${pagination.totalItems}`,
        helper: `${students.length} affiches sur la page actuelle`,
        tone: 'primary' as const,
        icon: Users,
      },
      {
        label: 'Actifs',
        value: `${activeStudents}`,
        helper: `${suspendedStudents} comptes suspendus sur cette vue`,
        tone: 'success' as const,
        icon: ShieldCheck,
      },
      {
        label: 'Affectes',
        value: `${assignedStudents}`,
        helper: 'Comptes lies a une session admin',
        tone: 'neutral' as const,
        icon: BadgeCheck,
      },
      {
        label: 'Paiements a suivre',
        value: `${pendingPayments}`,
        helper: 'Inscriptions avec statut paiement non solde',
        tone: 'warning' as const,
        icon: ShieldAlert,
      },
      {
        label: 'Encaisse visible',
        value: formatCurrency(collectedAmount),
        helper: 'Montants payes sur les lignes chargees',
        tone: 'primary' as const,
        icon: CircleDollarSign,
      },
    ]
  }, [pagination.totalItems, students])

  const hasFilters = Boolean(filters.search || filters.status || filters.sessionId)

  async function loadSessions() {
    const response = await fetch('/api/admin/system/sessions', { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json()
    setSessions(data.sessions || [])
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
        setActionError(data?.error || 'Impossible de charger les etudiants.')
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
      console.error('Impossible de charger les etudiants:', error)
      setStudents([])
      setSelectedStudentId(null)
      setActionError('Impossible de charger les etudiants.')
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
        setStudentDetailsError(data?.error || 'Impossible de charger le dossier etudiant.')
        return
      }

      setSelectedStudentDetails(data as StudentDetails)
    } catch (error) {
      console.error('Impossible de charger le dossier etudiant:', error)
      setSelectedStudentDetails(null)
      setStudentDetailsError('Impossible de charger le dossier etudiant.')
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
    setSubmitting(true)
    setGeneratedCredential(null)
    setCopyFeedback(null)
    setCredentialEmailFeedback(null)
    setActionError(null)

    const submittedName = form.name.trim()
    const submittedEmail = form.email.trim().toLowerCase()
    const selectedSessionTitle = form.sessionId ? sessions.find((session) => session.id === form.sessionId)?.title || null : null

    const response = await fetch('/api/admin/system/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        sessionId: form.sessionId || null,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setForm(initialForm)
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
      setActionError(data?.error || 'Impossible de creer le compte etudiant.')
    }

    setSubmitting(false)
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
      setEditError('Nom, email et nom d utilisateur sont requis pour enregistrer les modifications.')
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
      setEditError(payload?.error || 'Impossible de mettre a jour le compte etudiant.')
      setSavingEdit(false)
      return
    }

    setEditForm(null)
    setSavingEdit(false)
    await loadStudents()
  }
  async function deleteStudent(id: string) {
    const confirmed = window.confirm('Supprimer ce compte etudiant ?')
    if (!confirmed) return

    setActionError(null)
    const response = await fetch(`/api/admin/system/students/${id}`, { method: 'DELETE' })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setActionError(payload?.error || 'Impossible de supprimer le compte etudiant.')
      return
    }

    await loadStudents()
  }

  async function resetStudentCredentials(student: Student) {
    if (!student.username) {
      alert('Definissez un nom d utilisateur avant de reinitialiser le mot de passe.')
      return
    }

    const confirmed = window.confirm(
      `Generer un nouveau mot de passe et renvoyer les identifiants a ${student.firstName} ${student.lastName} ?`
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
      alert(data?.error || 'Impossible de reinitialiser les identifiants.')
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
      setActionError('Definissez un nom d utilisateur avant de changer le statut de ce compte.')
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
      setActionError(payload?.error || 'Impossible de mettre a jour le statut du compte.')
      return
    }

    await loadStudents()
  }

  async function copyCredentials() {
    if (!generatedCredential) return

    const loginUrl = `${window.location.origin}/student/login`
    const payload = [
      `Nom d utilisateur: ${generatedCredential.username}`,
      `Mot de passe: ${generatedCredential.password}`,
      `Connexion: ${loginUrl}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(payload)
      setCopyFeedback('Identifiants copies dans le presse-papiers.')
    } catch {
      setCopyFeedback('Impossible de copier automatiquement les identifiants.')
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
        const message = data?.error || 'Impossible d envoyer l email des identifiants.'
        setGeneratedCredential((current) => (current ? { ...current, emailSent: false, emailError: message } : current))
        setCredentialEmailFeedback(message)
        return
      }

      setGeneratedCredential((current) => (current ? { ...current, emailSent: true, emailError: null } : current))
      setCredentialEmailFeedback(`Identifiants envoyes a ${generatedCredential.email}.`)
    } catch {
      const message = 'Impossible d envoyer l email des identifiants.'
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
    <AdminShell title="Etudiants">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="self-start space-y-6 xl:sticky xl:top-6">
            <section className="rounded-[30px] border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-5 shadow-[0_25px_65px_-45px_rgba(15,23,42,0.35)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Creation rapide</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Ajouter un etudiant</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Un nom d utilisateur et un mot de passe sont generes automatiquement, puis envoyables immediatement par
                    e-mail.
                  </p>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--admin-primary-50)] text-[var(--admin-primary)] ring-1 ring-[var(--admin-primary-100)]">
                  <Users className="h-5 w-5" />
                </span>
              </div>

              <form onSubmit={onCreateStudent} className="mt-6 space-y-4" data-testid="student-create-form">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-800">
                  Le compte etudiant ne peut etre cree qu&apos;apres validation complete du paiement de la session
                  souscrite.
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nom complet</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Ex. Nicole Zephonie"
                    className={inputClassName}
                    data-testid="student-create-name"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="nom@exemple.com"
                    className={inputClassName}
                    data-testid="student-create-email"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Session a associer</label>
                  <select
                    value={form.sessionId}
                    onChange={(event) => setForm((prev) => ({ ...prev, sessionId: event.target.value }))}
                    className={selectClassName}
                    data-testid="student-create-session"
                  >
                    <option value="">Aucune session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`${primaryButtonClassName} w-full`}
                  data-testid="student-create-submit"
                >
                  <ArrowRight className="h-4 w-4" />
                  {submitting ? 'Creation en cours...' : 'Creer le compte'}
                </button>
              </form>
            </section>

            {generatedCredential ? (
              <section
                className="rounded-[30px] border border-[var(--admin-primary-200)] bg-[var(--admin-primary-50)] p-5 shadow-[0_25px_65px_-45px_rgba(0,48,160,0.35)]"
                data-testid="student-credentials-panel"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
                      Identifiants generes
                    </p>
                    <h3 className="mt-2 text-lg font-bold tracking-tight text-[var(--admin-primary-800)]">
                      Compte pret pour l'espace etudiant
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--admin-primary-700)]">
                      L'envoi d'e-mail peut etre relance manuellement sans regenerer le mot de passe affiche ici.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        generatedCredential.emailSent
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {generatedCredential.emailSent ? 'Email envoye' : 'Email a relancer'}
                    </span>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--admin-primary)] ring-1 ring-[var(--admin-primary-100)]">
                      <Mail className="h-5 w-5" />
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-[var(--admin-primary-800)]">
                  <DetailField label="Nom complet" value={generatedCredential.fullName} />
                  <DetailField
                    label="Nom d utilisateur"
                    value={generatedCredential.username}
                    testId="student-credentials-username"
                  />
                  <DetailField
                    label="Mot de passe"
                    value={generatedCredential.password}
                    testId="student-credentials-password"
                  />
                  <DetailField label="Session" value={generatedCredential.sessionTitle || 'Aucune session'} />
                </div>

                <div className="mt-4 rounded-2xl border border-[var(--admin-primary-100)] bg-white/80 px-4 py-3 text-sm text-[var(--admin-primary-800)]">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-semibold text-[var(--admin-primary-800)]">Destinataire</p>
                      <p className="mt-1">{generatedCredential.email}</p>
                      <p className="mt-2 text-xs text-[var(--admin-primary-700)]">
                        {generatedCredential.emailSent
                          ? `Les identifiants ont ete envoyes automatiquement a ${generatedCredential.email}.`
                          : generatedCredential.emailError || 'Utilisez le bouton ci-dessous pour envoyer ou renvoyer les identifiants.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={sendCredentialsEmail}
                    disabled={sendingCredentialEmail}
                    className={`${primaryButtonClassName} w-full`}
                    data-testid="student-credentials-send-email"
                  >
                    <Mail className="h-4 w-4" />
                    {sendingCredentialEmail
                      ? 'Envoi en cours...'
                      : generatedCredential.emailSent
                        ? "Renvoyer l'e-mail"
                        : "Envoyer l'e-mail"}
                  </button>
                  <button
                    type="button"
                    onClick={copyCredentials}
                    className={`${secondaryButtonClassName} w-full border-[var(--admin-primary-200)] bg-white text-[var(--admin-primary)] hover:bg-[var(--admin-primary-100)]`}
                    data-testid="student-credentials-copy"
                  >
                    <Copy className="h-4 w-4" />
                    Copier les identifiants
                  </button>
                </div>
                {credentialEmailFeedback ? (
                  <p className="mt-3 text-xs font-medium text-[var(--admin-primary-700)]">{credentialEmailFeedback}</p>
                ) : null}
                {copyFeedback ? <p className="mt-2 text-xs font-medium text-[var(--admin-primary-700)]">{copyFeedback}</p> : null}
              </section>
            ) : null}

            <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_25px_65px_-45px_rgba(15,23,42,0.35)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fiche rapide</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                    {selectedStudent ? getStudentName(selectedStudent) : 'Selectionnez un etudiant'}
                  </h3>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                  {selectedStudent ? (
                    <span className="text-sm font-bold tracking-[0.18em]">{getStudentInitials(selectedStudent)}</span>
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                </span>
              </div>
              {selectedStudent ? (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(selectedStudent.status)}`}>
                      {getStatusLabel(selectedStudent.status)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(
                        selectedStudent.latestEnrollment?.paymentStatus
                      )}`}
                    >
                      {paymentStatusLabel(selectedStudent.latestEnrollment?.paymentStatus)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <DetailField label="Email" value={selectedStudent.email} />
                    <DetailField label="Nom d utilisateur" value={selectedStudent.username || 'Non defini'} />
                    <DetailField label="Session" value={selectedStudent.adminSession?.title || 'Non affectee'} />
                    <DetailField
                      label="Inscription"
                      value={selectedStudent.latestEnrollment?.formationTitle || 'Aucune inscription'}
                    />
                    <DetailField label="Cree le" value={formatDate(selectedStudent.createdAt)} />
                    <DetailField
                      label="Reste a payer"
                      value={
                        selectedStudent.latestEnrollment ? formatCurrency(getOutstandingBalance(selectedStudent)) : 'N/A'
                      }
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => openEditStudent(selectedStudent)} className={secondaryButtonClassName}>
                      <PencilLine className="h-4 w-4" />
                      Editer
                    </button>
                    <button
                      type="button"
                      onClick={() => resetStudentCredentials(selectedStudent)}
                      className={secondaryButtonClassName}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Reinit. + e-mail
                    </button>
                    {selectedStudent.status === 'SUSPENDED' ? (
                      <button
                        type="button"
                        onClick={() => updateStudentStatus(selectedStudent, 'ACTIVE')}
                        className={secondaryButtonClassName}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Reactiver
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateStudentStatus(selectedStudent, 'SUSPENDED')}
                        className={secondaryButtonClassName}
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Suspendre
                      </button>
                    )}
                    <button type="button" onClick={() => deleteStudent(selectedStudent.id)} className={dangerButtonClassName}>
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm leading-6 text-slate-600">
                  Cliquez sur une carte ou une ligne du tableau pour afficher une vue detaillee ici et acceder plus
                  vite aux actions principales.
                </div>
              )}
            </section>
          </aside>

          <div className="space-y-6">
            {actionError ? (
              <section
                className="rounded-[26px] border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-5 py-4 text-sm text-[var(--admin-accent-700)] shadow-[0_20px_60px_-45px_rgba(239,68,68,0.35)]"
                data-testid="student-create-error"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <p>{actionError}</p>
                </div>
              </section>
            ) : null}

            {selectedStudent ? (
              <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_25px_65px_-45px_rgba(15,23,42,0.35)]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dossier 360</p>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                      {selectedStudentDetails?.student.fullName || getStudentName(selectedStudent)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Vue consolidee du profil, des inscriptions, des paiements, des presences, des travaux et de
                      l'historique admin.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(selectedStudent.status)}`}>
                      {getStatusLabel(selectedStudent.status)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(
                        selectedStudent.latestEnrollment?.paymentStatus
                      )}`}
                    >
                      {paymentStatusLabel(selectedStudent.latestEnrollment?.paymentStatus)}
                    </span>
                  </div>
                </div>

                {loadingStudentDetails ? (
                  <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Chargement du dossier etudiant...
                  </div>
                ) : studentDetailsError ? (
                  <div className="mt-5 rounded-[24px] border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-4 text-sm text-[var(--admin-accent-700)]">
                    {studentDetailsError}
                  </div>
                ) : selectedStudentDetails ? (
                  <>
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <SummaryCard
                        icon={Users}
                        label="Inscriptions"
                        value={`${selectedStudentDetails.overview.totalEnrollments}`}
                        helper={`${selectedStudentDetails.overview.activeEnrollments} active(s)`}
                        tone="primary"
                      />
                      <SummaryCard
                        icon={CircleDollarSign}
                        label="Paiements a suivre"
                        value={`${selectedStudentDetails.overview.pendingPayments}`}
                        helper={`${selectedStudentDetails.overview.settledEnrollments} inscription(s) soldée(s)`}
                        tone="warning"
                      />
                      <SummaryCard
                        icon={BadgeCheck}
                        label="Travaux / certificats"
                        value={`${selectedStudentDetails.overview.submissionsCount} / ${selectedStudentDetails.overview.certificatesCount}`}
                        helper="Soumissions portail et certificats emis"
                        tone="success"
                      />
                      <SummaryCard
                        icon={Mail}
                        label="Notifications"
                        value={`${selectedStudentDetails.overview.notificationsCount}`}
                        helper={`${selectedStudentDetails.overview.attendanceCount} presence(s) enregistree(s)`}
                        tone="neutral"
                      />
                    </div>

                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      <article className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Profil</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <DetailField label="Numero etudiant" value={selectedStudentDetails.student.studentNumber} />
                          <DetailField label="Role" value={selectedStudentDetails.student.role} />
                          <DetailField label="Telephone" value={selectedStudentDetails.student.phone || 'Non renseigne'} />
                          <DetailField
                            label="Localisation"
                            value={
                              [selectedStudentDetails.student.city, selectedStudentDetails.student.country]
                                .filter(Boolean)
                                .join(', ') || 'Non renseignee'
                            }
                          />
                          <DetailField
                            label="Adresse"
                            value={selectedStudentDetails.student.address || 'Non renseignee'}
                          />
                          <DetailField label="Mis a jour le" value={formatDateTime(selectedStudentDetails.student.updatedAt)} />
                        </div>
                      </article>

                      <article className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Inscriptions</p>
                        <div className="mt-4 space-y-3">
                          {selectedStudentDetails.enrollments.length ? (
                            selectedStudentDetails.enrollments.slice(0, 4).map((enrollment) => (
                              <div key={enrollment.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <strong className="text-slate-900">{enrollment.formation.title}</strong>
                                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(enrollment.paymentStatus)}`}>
                                    {paymentStatusLabel(enrollment.paymentStatus)}
                                  </span>
                                </div>
                                <p className="mt-2 text-slate-600">
                                  {enrollment.session
                                    ? `${formatDateTime(enrollment.session.startDate)} · ${enrollment.session.location || 'En ligne'}`
                                    : 'Sans session'}
                                </p>
                                <p className="mt-1 text-slate-500">
                                  {formatCurrency(enrollment.paidAmount)} / {formatCurrency(enrollment.totalAmount)} · {enrollment.status}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                              Aucune inscription rattachee a ce compte.
                            </p>
                          )}
                        </div>
                      </article>

                      <article className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Paiements</p>
                        <div className="mt-4 space-y-3">
                          {selectedStudentDetails.payments.length ? (
                            selectedStudentDetails.payments.slice(0, 5).map((payment) => (
                              <div key={payment.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <strong className="text-slate-900">{payment.formationTitle}</strong>
                                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(payment.status)}`}>
                                    {paymentStatusLabel(payment.status)}
                                  </span>
                                </div>
                                <p className="mt-2 text-slate-600">
                                  {formatCurrency(payment.amount)} · {payment.method} · {formatDateTime(payment.createdAt)}
                                </p>
                                <p className="mt-1 text-slate-500">{payment.reference || payment.transactionId || payment.sessionLabel}</p>
                              </div>
                            ))
                          ) : (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                              Aucun paiement rattache a cet etudiant.
                            </p>
                          )}
                        </div>
                      </article>

                      <article className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Presences</p>
                        <div className="mt-4 space-y-3">
                          {selectedStudentDetails.attendance.length ? (
                            selectedStudentDetails.attendance.slice(0, 5).map((entry) => (
                              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <strong className="text-slate-900">{entry.formationTitle}</strong>
                                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(entry.status)}`}>
                                    {entry.status}
                                  </span>
                                </div>
                                <p className="mt-2 text-slate-600">{entry.sessionLabel}</p>
                                <p className="mt-1 text-slate-500">{formatDate(entry.date)}</p>
                              </div>
                            ))
                          ) : (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                              Aucune presence enregistree.
                            </p>
                          )}
                        </div>
                      </article>

                      <article className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Travaux et resultats</p>
                        <div className="mt-4 space-y-3">
                          {selectedStudentDetails.submissions.slice(0, 3).map((submission) => (
                            <div key={submission.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <strong className="text-slate-900">{submission.title}</strong>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(submission.status)}`}>
                                  {submission.status}
                                </span>
                              </div>
                              <p className="mt-2 text-slate-500">{formatDateTime(submission.createdAt)}</p>
                            </div>
                          ))}
                          {selectedStudentDetails.results.slice(0, 3).map((result) => (
                            <div key={result.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <strong className="text-slate-900">{result.formationTitle}</strong>
                                <span className="rounded-full px-3 py-1 text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700">
                                  {result.overallRating}/5
                                </span>
                              </div>
                              <p className="mt-2 text-slate-500">{result.overallComment || result.sessionLabel}</p>
                            </div>
                          ))}
                          {selectedStudentDetails.submissions.length === 0 && selectedStudentDetails.results.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                              Aucun travail ni resultat disponible.
                            </p>
                          ) : null}
                        </div>
                      </article>

                      <article className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Certificats et notifications</p>
                        <div className="mt-4 space-y-3">
                          {selectedStudentDetails.certificates.slice(0, 3).map((certificate) => (
                            <div key={certificate.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <strong className="text-slate-900">{certificate.title}</strong>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(certificate.verified ? 'paid' : 'pending')}`}>
                                  {certificate.verified ? 'Verifie' : 'En attente'}
                                </span>
                              </div>
                              <p className="mt-2 text-slate-500">{certificate.code} · {formatDate(certificate.issuedAt)}</p>
                            </div>
                          ))}
                          {selectedStudentDetails.notifications.slice(0, 3).map((notification) => (
                            <div key={notification.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                              <strong className="text-slate-900">{notification.title}</strong>
                              <p className="mt-2 text-slate-500">{notification.message}</p>
                            </div>
                          ))}
                          {selectedStudentDetails.certificates.length === 0 && selectedStudentDetails.notifications.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                              Aucun certificat ni notification recente.
                            </p>
                          ) : null}
                        </div>
                      </article>

                      <article className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notes et echanges</p>
                        <div className="mt-4 space-y-3">
                          {selectedStudentDetails.notes.length ? (
                            selectedStudentDetails.notes.slice(0, 4).map((note) => (
                              <div key={note.enrollmentId} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                                <strong className="text-slate-900">{note.formationTitle}</strong>
                                <p className="mt-2 text-slate-600">{note.adminComment || 'Aucune note admin.'}</p>
                                <p className="mt-2 text-slate-500">{note.questions.length} question(s) etudiante(s)</p>
                              </div>
                            ))
                          ) : (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                              Aucun commentaire ni question rattachee.
                            </p>
                          )}
                        </div>
                      </article>

                      <article className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Historique admin</p>
                        <div className="mt-4 space-y-3">
                          {selectedStudentDetails.auditLogs.length ? (
                            selectedStudentDetails.auditLogs.map((log) => (
                              <div key={log.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <strong className="text-slate-900">{log.action}</strong>
                                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(log.status)}`}>
                                    {log.status}
                                  </span>
                                </div>
                                <p className="mt-2 text-slate-600">{log.summary}</p>
                                <p className="mt-1 text-slate-500">{log.adminUsername} · {formatDateTime(log.createdAt)}</p>
                              </div>
                            ))
                          ) : (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                              Aucun evenement d'audit recent pour ce compte.
                            </p>
                          )}
                        </div>
                      </article>
                    </div>
                  </>
                ) : null}
              </section>
            ) : null}

            <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_25px_65px_-45px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Filtrage</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Liste des comptes etudiants</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Ajustez la liste par nom, statut ou session. La fiche rapide se met a jour depuis la selection
                    active.
                  </p>
                </div>
                {hasFilters ? (
                  <button type="button" onClick={resetFilters} className={secondaryButtonClassName}>
                    <RefreshCcw className="h-4 w-4" />
                    Reinitialiser les filtres
                  </button>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_220px_240px_180px]">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Recherche</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={filters.search}
                      onChange={(event) => {
                        setFilters((prev) => ({ ...prev, search: event.target.value }))
                        setPagination((prev) => ({ ...prev, page: 1 }))
                      }}
                      placeholder="Nom, email ou nom d utilisateur"
                      className={`${inputClassName} pl-11`}
                      data-testid="student-search-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Statut</label>
                  <select
                    value={filters.status}
                    onChange={(event) => {
                      setFilters((prev) => ({ ...prev, status: event.target.value }))
                      setPagination((prev) => ({ ...prev, page: 1 }))
                    }}
                    className={selectClassName}
                  >
                    <option value="">Tous</option>
                    <option value="ACTIVE">Actifs</option>
                    <option value="SUSPENDED">Suspendus</option>
                    <option value="PENDING">En attente</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Session</label>
                  <select
                    value={filters.sessionId}
                    onChange={(event) => {
                      setFilters((prev) => ({ ...prev, sessionId: event.target.value }))
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

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resultats</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{pagination.totalItems}</p>
                  <p className="mt-1 text-sm text-slate-600">Comptes correspondant a la vue active</p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_25px_65px_-45px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Repertoire</p>
                  <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Etudiants visibles</h3>
                </div>
                <p className="text-sm text-slate-500">Cliquez sur une ligne pour alimenter la fiche rapide.</p>
              </div>

              <div className="space-y-3 p-4 lg:hidden">
                {loadingList ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Chargement des etudiants...
                  </div>
                ) : students.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Aucun etudiant ne correspond aux filtres actuels.
                  </div>
                ) : (
                  students.map((student) => (
                    <article
                      key={student.id}
                      className={`rounded-[26px] border p-4 transition ${
                        selectedStudentId === student.id
                          ? 'border-[var(--admin-primary-200)] bg-[var(--admin-primary-50)] shadow-[0_18px_50px_-40px_rgba(0,48,160,0.4)]'
                          : 'border-slate-200 bg-white'
                      }`}
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold tracking-[0.18em] text-slate-700 ring-1 ring-slate-200">
                            {getStudentInitials(student)}
                          </span>
                          <div>
                            <p className="text-base font-semibold text-slate-900">{getStudentName(student)}</p>
                            <p className="text-sm text-slate-500">{student.email}</p>
                            <p className="mt-1 text-xs text-slate-400">{student.username || 'Nom d utilisateur non defini'}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(student.status)}`}>
                          {getStatusLabel(student.status)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <DetailField label="Session" value={student.adminSession?.title || 'Non affectee'} />
                        <DetailField
                          label="Paiement"
                          value={
                            student.latestEnrollment
                              ? `${formatCurrency(student.latestEnrollment.paidAmount)} / ${formatCurrency(student.latestEnrollment.totalAmount)}`
                              : 'Aucun paiement'
                          }
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            openEditStudent(student)
                          }}
                          className={subtleButtonClassName}
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          Editer
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            resetStudentCredentials(student)
                          }}
                          className={subtleButtonClassName}
                        >
                          <RefreshCcw className="h-3.5 w-3.5" />
                          Reinit. + e-mail
                        </button>
                        {student.status === 'SUSPENDED' ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              updateStudentStatus(student, 'ACTIVE')
                            }}
                            className={subtleButtonClassName}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Reactiver
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              updateStudentStatus(student, 'SUSPENDED')
                            }}
                            className={subtleButtonClassName}
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Suspendre
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            deleteStudent(student.id)
                          }}
                          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-3 py-2 text-xs font-semibold text-[var(--admin-accent-700)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold text-slate-600">Etudiant</th>
                      <th className="px-5 py-4 text-left font-semibold text-slate-600">Acces</th>
                      <th className="px-5 py-4 text-left font-semibold text-slate-600">Statut</th>
                      <th className="px-5 py-4 text-left font-semibold text-slate-600">Session et inscription</th>
                      <th className="px-5 py-4 text-left font-semibold text-slate-600">Paiement</th>
                      <th className="px-5 py-4 text-left font-semibold text-slate-600">Creation</th>
                      <th className="px-5 py-4 text-left font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loadingList ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                          Chargement des etudiants...
                        </td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                          Aucun etudiant ne correspond aux filtres actuels.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr
                          key={student.id}
                          data-testid={`student-row-${student.id}`}
                          onClick={() => setSelectedStudentId(student.id)}
                          className={`cursor-pointer align-top transition ${
                            selectedStudentId === student.id ? 'bg-[var(--admin-primary-50)]' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold tracking-[0.18em] text-slate-700 ring-1 ring-slate-200">
                                {getStudentInitials(student)}
                              </span>
                              <div>
                                <p className="font-semibold text-slate-900">{getStudentName(student)}</p>
                                <p className="mt-1 text-sm text-slate-500">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            <div className="space-y-2">
                              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                                {student.username || 'Nom d utilisateur non defini'}
                              </span>
                              <p className="text-xs text-slate-500">Connexion etudiant geree depuis le portail.</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(student.status)}`}>
                              {getStatusLabel(student.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            <div className="space-y-2">
                              <p className="font-semibold text-slate-900">{student.adminSession?.title || 'Non affectee'}</p>
                              <p className="text-xs text-slate-500">
                                {student.latestEnrollment?.formationTitle || 'Aucune inscription rattachee'}
                              </p>
                              {student.latestEnrollment?.session ? (
                                <p className="text-xs text-slate-500">
                                  {formatDateTime(student.latestEnrollment.session.startDate)} ·{' '}
                                  {student.latestEnrollment.session.location}
                                </p>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            {student.latestEnrollment ? (
                              <div className="space-y-2">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass(
                                    student.latestEnrollment.paymentStatus
                                  )}`}
                                >
                                  {paymentStatusLabel(student.latestEnrollment.paymentStatus)}
                                </span>
                                <p className="text-sm font-semibold text-slate-900">
                                  {formatCurrency(student.latestEnrollment.paidAmount)} /{' '}
                                  {formatCurrency(student.latestEnrollment.totalAmount)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {getOutstandingBalance(student) > 0
                                    ? `Reste ${formatCurrency(getOutstandingBalance(student))}`
                                    : 'Aucun solde restant'}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">Aucun paiement</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-600">{formatDate(student.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                              <button type="button" onClick={() => openEditStudent(student)} className={subtleButtonClassName}>
                                <PencilLine className="h-3.5 w-3.5" />
                                Editer
                              </button>
                              <button
                                type="button"
                                onClick={() => resetStudentCredentials(student)}
                                className={subtleButtonClassName}
                              >
                                <RefreshCcw className="h-3.5 w-3.5" />
                                Reinit. + e-mail
                              </button>
                              {student.status === 'SUSPENDED' ? (
                                <button
                                  type="button"
                                  onClick={() => updateStudentStatus(student, 'ACTIVE')}
                                  className={subtleButtonClassName}
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Reactiver
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateStudentStatus(student, 'SUSPENDED')}
                                  className={subtleButtonClassName}
                                >
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                  Suspendre
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => deleteStudent(student.id)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-3 py-2 text-xs font-semibold text-[var(--admin-accent-700)]"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <PaginationControls
              pagination={pagination}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
            />
          </div>
        </div>
      </div>

      {editForm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => !savingEdit && setEditForm(null)}
        >
          <div
            className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.7)] md:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Edition</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Modifier le compte etudiant</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Mettez a jour le nom, l email, le nom d utilisateur, le statut et la session rattachee.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditForm(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                disabled={savingEdit}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitEditStudent} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nom complet</label>
                  <input
                    value={editForm.name}
                    onChange={(event) => setEditForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) => setEditForm((prev) => (prev ? { ...prev, email: event.target.value } : prev))}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nom d utilisateur</label>
                  <input
                    value={editForm.username}
                    onChange={(event) =>
                      setEditForm((prev) => (prev ? { ...prev, username: event.target.value } : prev))
                    }
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Session</label>
                  <select
                    value={editForm.sessionId}
                    onChange={(event) =>
                      setEditForm((prev) => (prev ? { ...prev, sessionId: event.target.value } : prev))
                    }
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">Statut</label>
                  <select
                    value={editForm.status}
                    onChange={(event) => setEditForm((prev) => (prev ? { ...prev, status: event.target.value } : prev))}
                    className={selectClassName}
                  >
                    <option value="ACTIVE">Actif</option>
                    <option value="SUSPENDED">Suspendu</option>
                    <option value="PENDING">En attente</option>
                  </select>
                </div>
              </div>

              {editError ? (
                <div className="rounded-2xl border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-3 text-sm text-[var(--admin-accent-700)]">
                  {editError}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditForm(null)}
                  className={secondaryButtonClassName}
                  disabled={savingEdit}
                >
                  Annuler
                </button>
                <button type="submit" className={primaryButtonClassName} disabled={savingEdit}>
                  <ArrowRight className="h-4 w-4" />
                  {savingEdit ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  )
}
