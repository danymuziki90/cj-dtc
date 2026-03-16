'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  LogOut,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  Wallet,
} from 'lucide-react'
import {
  StudentEmptyState as EmptyState,
  StudentMetricCard as MetricCard,
  StudentSectionCard as SectionCard,
  studentInputClassName,
  studentPrimaryButtonClassName,
  studentSecondaryButtonClassName,
  studentStatusClass,
} from '@/components/ui/student-space'

type DashboardPayload = any

function statusClass(value: string) {
  return studentStatusClass(value)
}

function lifecycleLabel(value?: string | null) {
  if (value === 'upcoming') return 'A venir'
  if (value === 'active') return 'Active'
  if (value === 'completed') return 'Terminee'
  return 'Inconnu'
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '-'
}

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString('fr-FR') : '-'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export default function EspaceEtudiantsPage() {
  const router = useRouter()
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [data, setData] = useState<DashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const [question, setQuestion] = useState('')
  const [questionError, setQuestionError] = useState('')

  const [submissionTitle, setSubmissionTitle] = useState('')
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submissionError, setSubmissionError] = useState('')

  const [proofPaymentId, setProofPaymentId] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofError, setProofError] = useState('')

  async function loadDashboard() {
    setLoading(true)
    const response = await fetch('/api/student/system/dashboard', { cache: 'no-store' })
    const payload = await response.json().catch(() => ({}))

    if (response.status === 401 || response.status === 403) {
      setAuthError(payload.error || "Vous devez vous connecter pour acceder a l'espace etudiant.")
      setLoading(false)
      return
    }

    if (!response.ok) {
      setAuthError(payload.error || 'Impossible de charger le dashboard.')
      setLoading(false)
      return
    }

    setData(payload)
    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const completionRate = useMemo(() => {
    if (!data) return 0
    const completed = data.dashboard?.progress?.hoursCompleted || 0
    const remaining = data.dashboard?.progress?.hoursRemaining || 0
    const total = completed + remaining
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [data])

  async function logout() {
    await fetch('/api/student/auth/logout', { method: 'POST' })
    router.push(`/${locale}/auth/student-login`)
    router.refresh()
  }

  async function sendQuestion(event: FormEvent) {
    event.preventDefault()
    setQuestionError('')

    const message = question.trim()
    if (message.length < 5) {
      setQuestionError('Votre question doit contenir au moins 5 caracteres.')
      return
    }

    const response = await fetch('/api/student/system/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      setQuestionError(payload.error || "Echec d'envoi de la question.")
      return
    }

    setQuestion('')
    await loadDashboard()
  }

  async function submitWork(event: FormEvent) {
    event.preventDefault()
    setSubmissionError('')

    if (!submissionTitle.trim() || !submissionFile) {
      setSubmissionError('Titre et fichier obligatoires.')
      return
    }

    const formData = new FormData()
    formData.append('title', submissionTitle.trim())
    formData.append('file', submissionFile)

    const response = await fetch('/api/student/system/submissions', {
      method: 'POST',
      body: formData,
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      setSubmissionError(payload.error || 'Echec de la soumission.')
      return
    }

    setSubmissionTitle('')
    setSubmissionFile(null)
    await loadDashboard()
  }

  async function submitProof(event: FormEvent) {
    event.preventDefault()
    setProofError('')

    if (!proofFile) {
      setProofError('Selectionnez un fichier preuve (PDF/image).')
      return
    }

    const formData = new FormData()
    formData.append('file', proofFile)
    if (proofPaymentId) formData.append('paymentId', proofPaymentId)

    const response = await fetch('/api/student/system/payments/proof', {
      method: 'POST',
      body: formData,
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      setProofError(payload.error || 'Echec du televersement.')
      return
    }

    setProofFile(null)
    await loadDashboard()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#041224_0%,#002d72_45%,#eef5ff_100%)] px-4">
        <div className="w-full max-w-md rounded-[30px] border border-white/20 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Espace Etudiant</p>
          <h1 className="mt-4 text-3xl font-semibold">Chargement du tableau de bord</h1>
          <p className="mt-3 text-sm leading-6 text-white/80">
            Nous preparons vos paiements, sessions et ressources dans une vue unique.
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-1/2 rounded-full bg-[var(--cj-red)]" />
          </div>
        </div>
      </div>
    )
  }

  if (authError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_55%,#fff1f2_100%)] px-4 py-10">
        <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_30px_90px_-35px_rgba(0,45,114,0.4)]">
          <div className="bg-[linear-gradient(120deg,#001737_0%,#002d72_52%,#0c4da2_100%)] px-8 py-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Espace Etudiant</p>
            <h1 className="mt-4 text-3xl font-semibold">Connexion securisee requise</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
              Cet espace centralise vos inscriptions, vos travaux et vos justificatifs de paiement dans un environnement protege.
            </p>
          </div>
          <div className="space-y-5 px-8 py-8">
            <div className="rounded-3xl border border-red-100 bg-red-50/70 p-5 text-sm text-slate-700">
              {authError || 'Acces refuse.'}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/auth/student-login`}
                className="rounded-2xl bg-[var(--cj-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--cj-blue-700)]"
              >
                Se connecter
              </Link>
              <Link
                href={`/${locale}`}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[var(--cj-blue)]"
              >
                Retour accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const student = data.student || {}
  const dashboard = data.dashboard || {}
  const metrics = dashboard.metrics || {}
  const progress = dashboard.progress || {}
  const payments = dashboard.payments || []
  const submissions = dashboard.submissions || []
  const notifications = dashboard.notifications || []
  const questions = dashboard.questions || []
  const resources = dashboard.resources || []
  const sessionsHistory = dashboard.sessionsHistory || []
  const certificates = dashboard.certificates || []
  const eligibility = dashboard.certificateEligibility || {}
  const currentSession = dashboard.currentSession
  const firstCertificate = certificates[0]
  const basePath = `/${locale}/espace-etudiants`
  const studentInitial = (student.firstName?.[0] || student.fullName?.[0] || 'E').toUpperCase()
  const heroSummary = currentSession
    ? `Vous suivez actuellement ${currentSession.formationTitle}. Toutes vos demarches academiques et administratives sont centralisees ici.`
    : 'Votre espace rassemble vos ressources, paiements et travaux dans une interface unique et professionnelle.'
  const heroStats = [
    {
      icon: CalendarDays,
      label: 'Periode',
      value: currentSession ? `${formatDate(currentSession.startDate)} - ${formatDate(currentSession.endDate)}` : 'Aucune session active',
    },
    {
      icon: MapPin,
      label: 'Lieu / format',
      value: currentSession
        ? [currentSession.location, currentSession.format].filter(Boolean).join(' | ') || 'A confirmer'
        : 'Information a venir',
    },
    {
      icon: Phone,
      label: 'Contact rapide',
      value: student.whatsapp || 'Numero non renseigne',
    },
  ]
  const metricCards = [
    {
      label: 'Sessions',
      value: metrics.totalSessions ?? 0,
      helper: 'Inscriptions suivies depuis votre espace.',
      icon: GraduationCap,
      accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
    },
    {
      label: 'Sessions terminees',
      value: metrics.completedSessions ?? 0,
      helper: 'Parcours deja valides ou finalises.',
      icon: BadgeCheck,
      accent: 'from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]',
    },
    {
      label: 'Paiements valides',
      value: metrics.successfulPayments ?? 0,
      helper: 'Transactions confirmees et prises en compte.',
      icon: Wallet,
      accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
    },
    {
      label: 'Progression',
      value: `${completionRate}%`,
      helper: 'Avancement global sur votre session en cours.',
      icon: BarChart3,
      accent: 'from-[#1d4ed8] via-[#1e3a8a] to-[#020617]',
    },
  ]
  const quickLinks = [
    {
      title: 'Mon compte',
      description: 'Mettre a jour vos informations personnelles.',
      href: `${basePath}/mon-compte`,
      icon: User,
    },
    {
      title: 'Mes travaux',
      description: 'Gerer vos rendus et consulter vos depots.',
      href: `${basePath}/travaux`,
      icon: FolderOpen,
    },
    {
      title: 'Supports',
      description: 'Acceder a vos ressources pedagogiques.',
      href: `${basePath}/supports`,
      icon: BookOpen,
    },
    {
      title: 'Certificats',
      description: 'Verifier vos documents disponibles.',
      href: `${basePath}/mes-certificats`,
      icon: Download,
    },
  ]
  const formFieldClassName = studentInputClassName
  const subtleCardClassName =
    'rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#020617_0%,#001737_18%,#eef5ff_58%,#f8fbff_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,rgba(12,77,162,0.42),transparent_34%),radial-gradient(circle_at_top_right,rgba(227,6,19,0.28),transparent_18%),radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_42%)]" />
      <div className="pointer-events-none absolute right-[-8rem] top-24 h-72 w-72 rounded-full bg-[rgba(227,6,19,0.10)] blur-3xl" />
      <div className="pointer-events-none absolute left-[-6rem] top-32 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={student.fullName}
                className="h-12 w-12 rounded-2xl border border-white/15 object-cover shadow-lg shadow-black/20"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 font-semibold text-white ring-1 ring-white/15">
                {studentInitial}
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">Espace Etudiant</p>
              <h1 className="text-base font-semibold text-white sm:text-lg">{student.fullName}</h1>
              <p className="text-xs text-white/70">{student.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`${basePath}/mon-compte`}
              className={studentSecondaryButtonClassName}
            >
              <User className="h-4 w-4" />
              Mon compte
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--cj-red)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--cj-red-700)]"
            >
              <LogOut className="h-4 w-4" />
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#02142f_0%,#002d72_42%,#0c4da2_100%)] p-6 text-white shadow-[0_38px_110px_-45px_rgba(0,0,0,0.75)] sm:p-8">
          <div className="pointer-events-none absolute -left-10 top-20 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 top-0 h-52 w-52 rounded-full bg-[rgba(227,6,19,0.20)] blur-3xl" />
          <div className="relative grid gap-8 xl:grid-cols-[1.5fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                <Sparkles className="h-4 w-4" />
                Tableau de bord etudiant
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <h2 className="text-4xl font-semibold tracking-tight leading-tight sm:text-5xl">Pilotage complet de votre parcours</h2>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(student.status)}`}>
                  {student.status}
                </span>
              </div>

              <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">{heroSummary}</p>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {heroStats.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                      <Icon className="h-4 w-4" />
                      {label}
                    </div>
                    <p className="mt-3 text-sm font-medium leading-6 text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`${basePath}/travaux`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[var(--cj-blue)] transition hover:bg-blue-50"
                >
                  Soumettre un travail
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`${basePath}/supports`}
                  className={studentSecondaryButtonClassName}
                >
                  Voir les supports
                  <BookOpen className="h-4 w-4" />
                </Link>
                {firstCertificate ? (
                  <a
                    href={firstCertificate.fileUrl || `${basePath}/mes-certificats`}
                    className={studentSecondaryButtonClassName}
                  >
                    Telecharger certificat
                    <Download className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[30px] border border-white/12 bg-slate-950/25 p-5 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Avancement global</p>
                <div className="mt-5 flex flex-wrap items-center gap-5">
                  <div
                    className="relative flex h-28 w-28 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(var(--cj-red) 0% ${completionRate}%, rgba(255,255,255,0.14) ${completionRate}% 100%)`,
                    }}
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#041224] text-center shadow-inner shadow-black/30">
                      <div>
                        <p className="text-2xl font-semibold tracking-tight text-white">{completionRate}%</p>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Accompli</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-white/80">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/50">Heures completees</p>
                      <p className="mt-1 text-lg font-semibold text-white">{progress.hoursCompleted ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/50">Heures restantes</p>
                      <p className="mt-1 text-lg font-semibold text-white">{progress.hoursRemaining ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/12 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Eligibilite certificat</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-white">
                      {eligibility.eligible ? 'Conditions remplies' : 'En cours de validation'}
                    </p>
                  </div>
                  <ShieldCheck className="h-8 w-8 text-white/80" />
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Paiement valide', done: Boolean(eligibility.paymentValidated) },
                    { label: 'Projet valide', done: Boolean(eligibility.projectValidated) },
                    {
                      label:
                        eligibility.attendanceTracked && eligibility.attendanceRate !== null
                          ? `Presence validee (${eligibility.attendanceRate}%)`
                          : 'Presence validee',
                      done: Boolean(eligibility.attendanceValidated),
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm text-white/90">
                      <span>{item.label}</span>
                      {item.done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
          <div className="space-y-6">
            <SectionCard
              eyebrow="Profil"
              title="Identite et session active"
              description="Une lecture claire de votre profil et des informations essentielles sur votre formation en cours."
              icon={GraduationCap}
            >
              <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
                <div className={`${subtleCardClassName} bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]`}>
                  <div className="flex items-center gap-4">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.fullName}
                        className="h-20 w-20 rounded-3xl border border-blue-100 object-cover shadow-lg shadow-blue-100/50"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--cj-blue)] text-2xl font-semibold text-white shadow-lg shadow-blue-200">
                        {studentInitial}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-slate-950">{student.fullName}</h3>
                      <p className="mt-1 break-all text-sm text-slate-600">{student.email}</p>
                      <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(student.status)}`}>
                        {student.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">WhatsApp</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{student.whatsapp || '-'}</p>
                    </div>
                    <div className="rounded-2xl border border-white bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Ville / Pays</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{[student.city, student.country].filter(Boolean).join(', ') || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className={subtleCardClassName}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Session en cours</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {currentSession ? currentSession.formationTitle : 'Aucune session active'}
                      </h3>
                    </div>
                    {currentSession ? (
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(currentSession.lifecycle)}`}>
                        {lifecycleLabel(currentSession.lifecycle)}
                      </span>
                    ) : null}
                  </div>

                  {currentSession ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          <CalendarDays className="h-4 w-4 text-[var(--cj-blue)]" />
                          Dates
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {formatDate(currentSession.startDate)} - {formatDate(currentSession.endDate)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          <MapPin className="h-4 w-4 text-[var(--cj-blue)]" />
                          Lieu
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-900">{currentSession.location || '-'}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          <Clock3 className="h-4 w-4 text-[var(--cj-blue)]" />
                          Type / format
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {[currentSession.sessionType, currentSession.format].filter(Boolean).join(' | ') || '-'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          <Activity className="h-4 w-4 text-[var(--cj-blue)]" />
                          Capacite
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {currentSession.availableSpots ?? '-'} places libres | Reservation {currentSession.reservedSpot ?? '-'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5">
                      <EmptyState
                        title="Aucune session active pour le moment"
                        description="Des qu'une nouvelle session vous est attribuee, son calendrier et ses details apparaitront ici."
                      />
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Paiements"
              title="Paiements et certificat"
              description="Suivez vos transactions, envoyez un justificatif et controlez votre niveau d'eligibilite au certificat."
              icon={Wallet}
            >
              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
                <div className="space-y-3">
                  <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-[var(--cj-blue)]" />
                      Controle des conditions
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white bg-white/85 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Paiement</p>
                        <p className={`mt-2 text-sm font-semibold ${eligibility.paymentValidated ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {eligibility.paymentValidated ? 'Valide' : 'En attente'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white bg-white/85 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Projet</p>
                        <p className={`mt-2 text-sm font-semibold ${eligibility.projectValidated ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {eligibility.projectValidated ? 'Valide' : 'A finaliser'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white bg-white/85 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Presence</p>
                        <p className={`mt-2 text-sm font-semibold ${eligibility.attendanceValidated ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {eligibility.attendanceValidated ? 'Validee' : 'Non validee'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white bg-white/85 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Certificat</p>
                        <p className={`mt-2 text-sm font-semibold ${eligibility.eligible ? 'text-[var(--cj-blue)]' : 'text-[var(--cj-red)]'}`}>
                          {eligibility.eligible ? 'Eligible' : 'Non eligible'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {payments.length ? (
                    payments.slice(0, 4).map((payment: any) => (
                      <div
                        key={payment.id}
                        className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.45)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{payment.formationTitle}</p>
                            <p className="mt-1 text-sm text-slate-600">
                              {formatCurrency(payment.amount)} via {payment.method}
                            </p>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>Reference #{payment.id}</span>
                          {payment.proofUrl ? (
                            <a href={payment.proofUrl} className="font-semibold text-[var(--cj-blue)] underline-offset-4 hover:underline">
                              Telecharger la preuve
                            </a>
                          ) : (
                            <span>Pas de preuve envoyee</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="Aucun paiement enregistre"
                      description="Vos transactions et justificatifs apparaitront ici des leur creation."
                    />
                  )}
                </div>

                <form onSubmit={submitProof} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(227,6,19,0.10)] text-[var(--cj-red)]">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Envoyer un justificatif</p>
                      <p className="text-sm text-slate-500">Ajoutez votre preuve de paiement pour verification.</p>
                    </div>
                  </div>

                  {proofError ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{proofError}</p> : null}

                  <div className="mt-5 space-y-3">
                    <select
                      value={proofPaymentId}
                      onChange={(event) => setProofPaymentId(event.target.value)}
                      className={formFieldClassName}
                    >
                      <option value="">Dernier paiement (auto)</option>
                      {payments.map((payment: any) => (
                        <option key={payment.id} value={String(payment.id)}>
                          #{payment.id} - {payment.formationTitle}
                        </option>
                      ))}
                    </select>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      onChange={(event) => setProofFile(event.target.files?.[0] || null)}
                      className={formFieldClassName}
                    />
                    <button
                      type="submit"
                      className={`${studentPrimaryButtonClassName} w-full`}
                    >
                      Envoyer la preuve
                    </button>
                  </div>
                </form>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Travaux"
              title="Travaux et projets"
              description="Deposez vos fichiers rapidement et suivez les retours deja recus sur vos soumissions."
              icon={FileText}
            >
              <div className="grid gap-4 xl:grid-cols-[0.95fr_1.15fr]">
                <form onSubmit={submitWork} className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
                  <p className="text-sm font-semibold text-slate-950">Nouvelle soumission</p>
                  <p className="mt-1 text-sm text-slate-500">Chargez un livrable en PDF ou image avec un titre clair.</p>
                  {submissionError ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{submissionError}</p> : null}
                  <div className="mt-5 space-y-3">
                    <input
                      value={submissionTitle}
                      onChange={(event) => setSubmissionTitle(event.target.value)}
                      placeholder="Titre du travail"
                      className={formFieldClassName}
                    />
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      onChange={(event) => setSubmissionFile(event.target.files?.[0] || null)}
                      className={formFieldClassName}
                    />
                    <button
                      type="submit"
                      className={`${studentPrimaryButtonClassName} w-full`}
                    >
                      <Upload className="h-4 w-4" />
                      Soumettre
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {submissions.length ? (
                    submissions.slice(0, 5).map((submission: any) => (
                      <div
                        key={submission.id}
                        className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.45)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{submission.title}</p>
                            <p className="mt-1 text-xs text-slate-500">Soumis le {formatDateTime(submission.submittedAt)}</p>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(submission.status)}`}>
                            {submission.status}
                          </span>
                        </div>
                        {submission.reviewFeedback ? (
                          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-slate-700">
                            <span className="font-semibold text-[var(--cj-blue)]">Feedback admin:</span> {submission.reviewFeedback}
                          </div>
                        ) : null}
                        <a
                          href={submission.fileUrl}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--cj-blue)] underline-offset-4 hover:underline"
                        >
                          <Download className="h-4 w-4" />
                          Telecharger le fichier
                        </a>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="Aucun travail soumis"
                      description="Vos depots de projets seront visibles ici avec leur statut de validation."
                    />
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <SectionCard
              eyebrow="Navigation"
              title="Acces rapides"
              description="Retrouvez les sections les plus utiles en un clic depuis votre tableau de bord."
              icon={Sparkles}
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {quickLinks.map(({ title, description, href, icon: Icon }) => (
                  <Link
                    key={title}
                    href={href}
                    className="group rounded-3xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_-30px_rgba(0,45,114,0.35)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)] transition group-hover:bg-[var(--cj-blue)] group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Progression"
              title="Vue d'ensemble des acquis"
              description="Les principaux indicateurs pedagogiques sont regroupes dans un panneau unique."
              icon={BarChart3}
            >
              <div className="space-y-4">
                <div className="overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,var(--cj-red)_0%,var(--cj-blue)_100%)]"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Heures completees', value: progress.hoursCompleted ?? 0 },
                    { label: 'Heures restantes', value: progress.hoursRemaining ?? 0 },
                    { label: 'Exercices termines', value: progress.exercisesCompleted ?? 0 },
                    { label: 'Exercices en cours', value: progress.exercisesInProgress ?? 0 },
                    { label: 'Projets termines', value: progress.projectsCompleted ?? 0 },
                    { label: 'Evaluations', value: progress.evaluationsCompleted ?? 0 },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Actualites"
              title="Notifications recentes"
              description="Les communications importantes de l'administration et de vos formateurs."
              icon={Bell}
            >
              <div className="max-h-[26rem] space-y-3 overflow-auto pr-1">
                {notifications.length ? (
                  notifications.map((item: any) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.message}</p>
                      <p className="mt-3 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="Aucune notification"
                    description="Les messages importants apparaitront ici automatiquement."
                  />
                )}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Messages"
              title="Questions et commentaires"
              description="Envoyez une demande a l'equipe administrative et retrouvez les reponses deja recues."
              icon={MessageSquare}
            >
              <form onSubmit={sendQuestion} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                {questionError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{questionError}</p> : null}
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={4}
                  placeholder="Posez votre question..."
                  className={`${questionError ? 'mt-3' : ''} ${formFieldClassName}`}
                />
                <button
                  type="submit"
                  className={`${studentPrimaryButtonClassName} mt-3 w-full`}
                >
                  Envoyer le message
                </button>
              </form>
              <div className="mt-4 max-h-72 space-y-3 overflow-auto pr-1">
                {questions.length ? (
                  questions.map((item: any) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-950">{item.formationTitle}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.message}</p>
                      {item.adminReply ? (
                        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-slate-700">
                          <span className="font-semibold text-[var(--cj-blue)]">Reponse admin:</span> {item.adminReply}
                        </div>
                      ) : null}
                      <p className="mt-3 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="Aucune question envoyee"
                    description="Utilisez le formulaire ci-dessus pour contacter rapidement l'administration."
                  />
                )}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Bibliotheque"
              title="Ressources pedagogiques"
              description="Vos supports de cours recents restent accessibles depuis cette colonne laterale."
              icon={BookOpen}
            >
              <div className="space-y-3">
                {resources.length ? (
                  resources.slice(0, 8).map((resource: any) => (
                    <a
                      key={resource.id}
                      href={resource.filePath.startsWith('/') ? resource.filePath : `/${resource.filePath}`}
                      className="group block rounded-3xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)] transition group-hover:bg-[var(--cj-blue)] group-hover:text-white">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{resource.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{resource.category}</p>
                          <p className="mt-2 text-xs text-slate-500">Ajoute le {formatDate(resource.createdAt)}</p>
                        </div>
                      </div>
                    </a>
                  ))
                ) : (
                  <EmptyState
                    title="Aucune ressource disponible"
                    description="Les nouveaux supports publies apparaitront ici automatiquement."
                  />
                )}
              </div>
            </SectionCard>
          </aside>
        </section>

        <SectionCard
          eyebrow="Historique"
          title="Historique des sessions et formations"
          description="Retrouvez l'ensemble de vos inscriptions avec leur statut de paiement et les informations de calendrier."
          icon={Clock3}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sessionsHistory.length ? (
              sessionsHistory.map((item: any) => (
                <div
                  key={item.enrollmentId}
                  className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_16px_40px_-30px_rgba(0,45,114,0.28)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{item.formationTitle}</p>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(item.paymentStatus)}`}>
                      {item.paymentStatus}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">Periode:</span> {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Type:</span> {item.sessionType || '-'}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Cycle:</span> {lifecycleLabel(item.sessionLifecycle)}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Heures:</span> {item.hours}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 xl:col-span-3">
                <EmptyState
                  title="Aucune session historique"
                  description="Vos parcours termines ou enregistres apparaitront ici pour un suivi complet."
                />
              </div>
            )}
          </div>
        </SectionCard>
      </main>
    </div>
  )
}
