'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type DashboardPayload = any

function statusClass(value: string) {
  const x = String(value || '').toLowerCase()
  if (
    x.includes('success') ||
    x.includes('paid') ||
    x.includes('approved') ||
    x.includes('active') ||
    x.includes('confirmed')
  ) {
    return 'bg-blue-100 text-blue-700'
  }
  if (x.includes('pending') || x.includes('wait')) {
    return 'bg-blue-50 text-cjblue'
  }
  if (x.includes('failed') || x.includes('rejected') || x.includes('suspend')) {
    return 'bg-red-100 text-red-700'
  }
  return 'bg-slate-100 text-slate-700'
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
      setProofError(payload.error || 'Échec du téléversement.')
      return
    }

    setProofFile(null)
    await loadDashboard()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cj-blue-50)]">
        <p className="text-cjblue">Chargement...</p>
      </div>
    )
  }

  if (authError || !data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4">
        <div className="w-full rounded-2xl border border-blue-100 bg-white p-6">
          <h1 className="text-2xl font-bold text-cjblue">Espace Etudiant securise</h1>
          <p className="mt-3 text-sm text-slate-700">{authError || 'Acces refuse.'}</p>
          <div className="mt-4 flex gap-3">
            <Link href={`/${locale}/auth/student-login`} className="rounded-lg bg-cjblue px-4 py-2 text-sm font-semibold text-white">
              Se connecter
            </Link>
            <Link href={`/${locale}`} className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-cjblue">
              Retour accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const student = data.student
  const dashboard = data.dashboard
  const currentSession = dashboard.currentSession
  const firstCertificate = dashboard.certificates?.[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--cj-blue-50)] via-white to-[var(--cj-blue-50)]">
      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.fullName} className="h-12 w-12 rounded-full border border-blue-200 object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cjblue font-bold text-white">
                {(student.firstName?.[0] || 'E').toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-cjblue">{student.fullName}</h1>
              <p className="text-xs text-slate-600">{student.email}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(student.status)}`}>
              {student.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/student/submissions" className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-cjblue">
              Soumettre travail
            </Link>
            {firstCertificate ? (
              <a href={firstCertificate.fileUrl || `/fr/certificates?code=${firstCertificate.code}`} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-cjblue">
                Telecharger certificat
              </a>
            ) : null}
            <Link href="/student/profile" className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-cjblue">
              Modifier profil
            </Link>
            <button onClick={logout} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-blue-100 bg-white p-4"><p className="text-xs text-slate-500">Sessions</p><p className="mt-1 text-2xl font-bold text-cjblue">{dashboard.metrics.totalSessions}</p></div>
          <div className="rounded-xl border border-blue-100 bg-white p-4"><p className="text-xs text-slate-500">Sessions terminees</p><p className="mt-1 text-2xl font-bold text-cjblue">{dashboard.metrics.completedSessions}</p></div>
          <div className="rounded-xl border border-blue-100 bg-white p-4"><p className="text-xs text-slate-500">Paiements valides</p><p className="mt-1 text-2xl font-bold text-cjblue">{dashboard.metrics.successfulPayments}</p></div>
          <div className="rounded-xl border border-blue-100 bg-white p-4"><p className="text-xs text-slate-500">Progression</p><p className="mt-1 text-2xl font-bold text-cjblue">{completionRate}%</p></div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <div className="space-y-6">
            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Informations et session</h2>
              <div className="mt-3 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                <div className="space-y-1">
                  <p><strong>Nom:</strong> {student.fullName}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                  <p><strong>WhatsApp:</strong> {student.whatsapp || '-'}</p>
                  <p><strong>Ville / Pays:</strong> {[student.city, student.country].filter(Boolean).join(', ') || '-'}</p>
                </div>
                {currentSession ? (
                  <div className="space-y-1">
                    <p><strong>Session:</strong> {currentSession.formationTitle}</p>
                    <p><strong>Type:</strong> {currentSession.sessionType || '-'}</p>
                    <p><strong>Dates:</strong> {formatDate(currentSession.startDate)} - {formatDate(currentSession.endDate)}</p>
                    <p><strong>Lieu:</strong> {currentSession.location || '-'}</p>
                    <p><strong>Format:</strong> {currentSession.format || '-'}</p>
                    <p><strong>Statut:</strong> {lifecycleLabel(currentSession.lifecycle)}</p>
                    <p><strong>Places dispo:</strong> {currentSession.availableSpots ?? '-'}</p>
                    <p><strong>Place reservee:</strong> {currentSession.reservedSpot ?? '-'}</p>
                  </div>
                ) : (
                  <p className="text-slate-500">Aucune session active.</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Paiements et certificats</h2>
              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                <p><strong>Paiement valide:</strong> {dashboard.certificateEligibility.paymentValidated ? 'Oui' : 'Non'}</p>
                <p><strong>Projet valide:</strong> {dashboard.certificateEligibility.projectValidated ? 'Oui' : 'Non'}</p>
                <p><strong>Presence validee:</strong> {dashboard.certificateEligibility.attendanceValidated ? 'Oui' : 'Non'}{dashboard.certificateEligibility.attendanceTracked && dashboard.certificateEligibility.attendanceRate !== null ? ` (${dashboard.certificateEligibility.attendanceRate}%)` : ''}</p>
                <p><strong>Eligibilite certificat:</strong> <span className={dashboard.certificateEligibility.eligible ? 'text-blue-700' : 'text-red-700'}>{dashboard.certificateEligibility.eligible ? 'Eligible' : 'Non eligible'}</span></p>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  {dashboard.payments.slice(0, 4).map((payment: any) => (
                    <div key={payment.id} className="rounded-lg border border-blue-100 bg-white p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-cjblue">{payment.formationTitle}</p>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(payment.status)}`}>{payment.status}</span>
                      </div>
                      <p className="text-slate-700">{formatCurrency(payment.amount)} via {payment.method}</p>
                      {payment.proofUrl ? <a href={payment.proofUrl} className="text-xs text-cjblue underline">Telecharger preuve</a> : <p className="text-xs text-slate-500">Pas de preuve</p>}
                    </div>
                  ))}
                </div>

                <form onSubmit={submitProof} className="rounded-lg border border-blue-100 p-3">
                  {proofError ? <p className="text-xs text-red-600">{proofError}</p> : null}
                  <select value={proofPaymentId} onChange={(event) => setProofPaymentId(event.target.value)} className="mt-2 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm">
                    <option value="">Dernier paiement (auto)</option>
                    {dashboard.payments.map((payment: any) => (
                      <option key={payment.id} value={String(payment.id)}>
                        #{payment.id} - {payment.formationTitle}
                      </option>
                    ))}
                  </select>
                  <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setProofFile(event.target.files?.[0] || null)} className="mt-2 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm" />
                  <button className="mt-2 w-full rounded-lg bg-cjblue px-4 py-2 text-sm font-semibold text-white">Envoyer preuve</button>
                </form>
              </div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Travaux / projets</h2>
              <form onSubmit={submitWork} className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                {submissionError ? <p className="text-xs text-red-600">{submissionError}</p> : null}
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <input value={submissionTitle} onChange={(event) => setSubmissionTitle(event.target.value)} placeholder="Titre du travail" className="rounded-lg border border-blue-200 px-3 py-2 text-sm" />
                  <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setSubmissionFile(event.target.files?.[0] || null)} className="rounded-lg border border-blue-200 px-3 py-2 text-sm" />
                </div>
                <button className="mt-2 rounded-lg bg-cjblue px-4 py-2 text-sm font-semibold text-white">Soumettre</button>
              </form>
              <div className="mt-3 space-y-2">
                {dashboard.submissions.slice(0, 5).map((submission: any) => (
                  <div key={submission.id} className="rounded-lg border border-blue-100 bg-white p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{submission.title}</p>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(submission.status)}`}>{submission.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{formatDateTime(submission.submittedAt)}</p>
                    {submission.reviewFeedback ? <p className="text-slate-700">Feedback: {submission.reviewFeedback}</p> : null}
                    <a href={submission.fileUrl} className="text-xs text-cjblue underline">Telecharger fichier</a>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Progression</h2>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <p><strong>Heures completees:</strong> {dashboard.progress.hoursCompleted}</p>
                <p><strong>Heures restantes:</strong> {dashboard.progress.hoursRemaining}</p>
                <p><strong>Exercices termines:</strong> {dashboard.progress.exercisesCompleted}</p>
                <p><strong>Exercices en cours:</strong> {dashboard.progress.exercisesInProgress}</p>
                <p><strong>Projets termines:</strong> {dashboard.progress.projectsCompleted}</p>
                <p><strong>Evaluations:</strong> {dashboard.progress.evaluationsCompleted}</p>
              </div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Notifications</h2>
              <div className="mt-3 max-h-72 space-y-2 overflow-auto">
                {dashboard.notifications.map((item: any) => (
                  <div key={item.id} className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(item.type)}`}>{item.type}</span>
                    </div>
                    <p className="mt-1 text-slate-700">{item.message}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Questions / commentaires</h2>
              <form onSubmit={sendQuestion} className="mt-3">
                {questionError ? <p className="text-xs text-red-600">{questionError}</p> : null}
                <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} placeholder="Posez votre question..." className="mt-2 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm" />
                <button className="mt-2 w-full rounded-lg bg-cjblue px-4 py-2 text-sm font-semibold text-white">Envoyer</button>
              </form>
              <div className="mt-3 max-h-64 space-y-2 overflow-auto">
                {dashboard.questions.map((item: any) => (
                  <div key={item.id} className="rounded-lg border border-blue-100 p-3 text-sm">
                    <p className="font-medium text-slate-900">{item.formationTitle}</p>
                    <p className="mt-1 text-slate-700">{item.message}</p>
                    {item.adminReply ? <p className="mt-2 rounded bg-blue-50 p-2 text-slate-700"><strong>Reponse admin:</strong> {item.adminReply}</p> : null}
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Ressources pedagogiques</h2>
              <div className="mt-3 space-y-2">
                {dashboard.resources.slice(0, 8).map((resource: any) => (
                  <a key={resource.id} href={resource.filePath.startsWith('/') ? resource.filePath : `/${resource.filePath}`} className="block rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm">
                    <p className="font-medium text-slate-900">{resource.title}</p>
                    <p className="text-xs text-slate-600">{resource.category} | {formatDate(resource.createdAt)}</p>
                  </a>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-white p-5">
          <h2 className="text-lg font-semibold text-cjblue">Historique sessions / formations</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.sessionsHistory.map((item: any) => (
              <div key={item.enrollmentId} className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
                <p className="font-semibold text-slate-900">{item.formationTitle}</p>
                <p className="text-slate-700">{formatDate(item.startDate)} - {formatDate(item.endDate)}</p>
                <p className="text-slate-700">Type: {item.sessionType || '-'}</p>
                <p className="text-slate-700">Statut: {lifecycleLabel(item.sessionLifecycle)}</p>
                <p className="text-slate-700">Paiement: {item.paymentStatus}</p>
                <p className="text-slate-700">Heures: {item.hours}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
