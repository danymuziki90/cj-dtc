'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type DashboardPayload = {
  student: {
    fullName: string
    firstName: string
    email: string
    whatsapp: string | null
    status: string
    city: string | null
    country: string | null
    photoUrl: string | null
  }
  dashboard: {
    currentSession: {
      formationTitle: string
      sessionType: string | null
      startDate: string | null
      endDate: string | null
      location: string | null
      format: string | null
      lifecycle: 'upcoming' | 'active' | 'completed' | 'unknown'
      availableSpots: number | null
      reservedSpot: number | null
    } | null
    payments: Array<{ id: number; formationTitle: string; amount: number; method: string; status: string; proofUrl: string | null }>
    certificates: Array<{ id: string; code: string; issuedAt: string; fileUrl: string | null; title?: string; formation: { title: string } | null }>
    submissions: Array<{ id: string; title: string; status: string; submittedAt: string; reviewFeedback: string | null; fileUrl: string }>
    notifications: Array<{ id: string; type: string; title: string; message: string; createdAt: string }>
    questions: Array<{ id: string; message: string; adminReply?: string | null; formationTitle: string; createdAt: string }>
    resources: Array<{ id: number; title: string; category: string; filePath: string; createdAt: string }>
    sessionsHistory: Array<{ enrollmentId: number; formationTitle: string; sessionType: string | null; startDate: string; endDate: string; paymentStatus: string; hours: number; sessionLifecycle: 'upcoming' | 'active' | 'completed' | 'unknown' }>
    progress: {
      hoursCompleted: number
      hoursRemaining: number
      exercisesCompleted: number
      exercisesInProgress: number
      projectsCompleted: number
      evaluationsCompleted: number
    }
    metrics: { totalSessions: number; completedSessions: number; successfulPayments: number }
    certificateEligibility: {
      paymentValidated: boolean
      projectValidated: boolean
      attendanceTracked: boolean
      attendanceRate: number | null
      attendanceValidated: boolean
      eligible: boolean
    }
  }
}

function statusClass(value: string) {
  const x = value.toLowerCase()
  if (x.includes('success') || x.includes('paid') || x.includes('approved') || x.includes('active')) return 'bg-blue-100 text-blue-700'
  if (x.includes('pending') || x.includes('wait')) return 'bg-blue-50 text-cjblue'
  if (x.includes('failed') || x.includes('rejected') || x.includes('suspend')) return 'bg-red-100 text-red-700'
  return 'bg-slate-100 text-slate-700'
}

function lifecycleLabel(value?: string | null) {
  if (value === 'upcoming') return 'A venir'
  if (value === 'active') return 'Active'
  if (value === 'completed') return 'Terminee'
  return 'Inconnu'
}

function date(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '-'
}

function dateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString('fr-FR') : '-'
}

function money(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0)
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
      setAuthError(payload.error || "Vous devez vous connecter pour accéder à l'espace étudiant.")
      setLoading(false)
      return
    }
    if (!response.ok) {
      setAuthError(payload.error || 'Impossible de charger vos donnees.')
      setLoading(false)
      return
    }
    setData(payload as DashboardPayload)
    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const completionRate = useMemo(() => {
    if (!data) return 0
    const total = data.dashboard.progress.hoursCompleted + data.dashboard.progress.hoursRemaining
    return total > 0 ? Math.round((data.dashboard.progress.hoursCompleted / total) * 100) : 0
  }, [data])

  async function logout() {
    await fetch('/api/student/auth/logout', { method: 'POST' })
    router.push('/student/login')
  }

  async function sendQuestion(event: FormEvent) {
    event.preventDefault()
    setQuestionError('')
    if (question.trim().length < 5) {
      setQuestionError('Votre question doit contenir au moins 5 caracteres.')
      return
    }
    const response = await fetch('/api/student/system/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question.trim() }),
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
    const form = new FormData()
    form.append('title', submissionTitle.trim())
    form.append('file', submissionFile)
    const response = await fetch('/api/student/system/submissions', { method: 'POST', body: form })
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
    const form = new FormData()
    form.append('file', proofFile)
    if (proofPaymentId) form.append('paymentId', proofPaymentId)
    const response = await fetch('/api/student/system/payments/proof', { method: 'POST', body: form })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setProofError(payload.error || 'Echec du televersement.')
      return
    }
    setProofFile(null)
    await loadDashboard()
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-cjblue">Chargement...</div>

  if (authError || !data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4">
        <div className="w-full rounded-2xl border border-blue-100 bg-white p-6">
          <h1 className="text-2xl font-bold text-cjblue">Espace Etudiant securise</h1>
          <p className="mt-3 text-sm text-slate-700">{authError || 'Acces refuse.'}</p>
          <div className="mt-4 flex gap-3">
            <Link href="/student/login" className="rounded-lg bg-cjblue px-4 py-2 text-sm font-semibold text-white">Se connecter</Link>
            <Link href={`/${locale}`} className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-cjblue">Retour accueil</Link>
          </div>
        </div>
      </div>
    )
  }

  const firstCertificate = data.dashboard.certificates[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--cj-blue-50)] via-white to-[var(--cj-blue-50)]">
      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            {data.student.photoUrl ? <img src={data.student.photoUrl} alt={data.student.fullName} className="h-12 w-12 rounded-full border border-blue-200 object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cjblue font-bold text-white">{(data.student.firstName?.[0] || 'E').toUpperCase()}</div>}
            <div>
              <h1 className="text-lg font-bold text-cjblue">{data.student.fullName}</h1>
              <p className="text-xs text-slate-600">{data.student.email}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(data.student.status)}`}>{data.student.status}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/student/submissions" className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-cjblue">Soumettre travail</Link>
            {firstCertificate ? <a href={firstCertificate.fileUrl || `/fr/certificates?code=${firstCertificate.code}`} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-cjblue">Telecharger certificat</a> : null}
            <Link href="/student/profile" className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-cjblue">Modifier profil</Link>
            <button onClick={logout} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Deconnexion</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-blue-100 bg-white p-4"><p className="text-xs text-slate-500">Sessions</p><p className="mt-1 text-2xl font-bold text-cjblue">{data.dashboard.metrics.totalSessions}</p></div>
          <div className="rounded-xl border border-blue-100 bg-white p-4"><p className="text-xs text-slate-500">Sessions terminees</p><p className="mt-1 text-2xl font-bold text-cjblue">{data.dashboard.metrics.completedSessions}</p></div>
          <div className="rounded-xl border border-blue-100 bg-white p-4"><p className="text-xs text-slate-500">Paiements valides</p><p className="mt-1 text-2xl font-bold text-cjblue">{data.dashboard.metrics.successfulPayments}</p></div>
          <div className="rounded-xl border border-blue-100 bg-white p-4"><p className="text-xs text-slate-500">Progression</p><p className="mt-1 text-2xl font-bold text-cjblue">{completionRate}%</p></div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <div className="space-y-6">
            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Informations et session</h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-slate-700">
                <div className="space-y-1"><p><strong>Nom:</strong> {data.student.fullName}</p><p><strong>Email:</strong> {data.student.email}</p><p><strong>WhatsApp:</strong> {data.student.whatsapp || '-'}</p><p><strong>Ville/Pays:</strong> {[data.student.city, data.student.country].filter(Boolean).join(', ') || '-'}</p></div>
                {data.dashboard.currentSession ? <div className="space-y-1"><p><strong>Session:</strong> {data.dashboard.currentSession.formationTitle}</p><p><strong>Type:</strong> {data.dashboard.currentSession.sessionType || '-'}</p><p><strong>Dates:</strong> {date(data.dashboard.currentSession.startDate)} - {date(data.dashboard.currentSession.endDate)}</p><p><strong>Lieu:</strong> {data.dashboard.currentSession.location || '-'}</p><p><strong>Statut:</strong> {lifecycleLabel(data.dashboard.currentSession.lifecycle)}</p><p><strong>Places dispo:</strong> {data.dashboard.currentSession.availableSpots ?? '-'}</p><p><strong>Place reservee:</strong> {data.dashboard.currentSession.reservedSpot ?? '-'}</p></div> : <p className="text-slate-500">Aucune session active.</p>}
              </div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Paiements et certificats</h2>
              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
                <p><strong>Paiement valide:</strong> {data.dashboard.certificateEligibility.paymentValidated ? 'Oui' : 'Non'}</p>
                <p><strong>Projet valide:</strong> {data.dashboard.certificateEligibility.projectValidated ? 'Oui' : 'Non'}</p>
                <p><strong>Presence validee:</strong> {data.dashboard.certificateEligibility.attendanceValidated ? 'Oui' : 'Non'}{data.dashboard.certificateEligibility.attendanceTracked && data.dashboard.certificateEligibility.attendanceRate !== null ? ` (${data.dashboard.certificateEligibility.attendanceRate}%)` : ''}</p>
                <p><strong>Eligibilite certificat:</strong> <span className={data.dashboard.certificateEligibility.eligible ? 'text-blue-700' : 'text-red-700'}>{data.dashboard.certificateEligibility.eligible ? 'Eligible' : 'Non eligible'}</span></p>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">{data.dashboard.payments.slice(0, 4).map((p) => <div key={p.id} className="rounded-lg border border-blue-100 bg-white p-3 text-sm"><div className="flex items-center justify-between"><p className="font-semibold text-cjblue">{p.formationTitle}</p><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(p.status)}`}>{p.status}</span></div><p className="text-slate-700">{money(p.amount)} via {p.method}</p>{p.proofUrl ? <a href={p.proofUrl} className="text-xs text-cjblue underline">Telecharger preuve</a> : <p className="text-xs text-slate-500">Pas de preuve</p>}</div>)}</div>
                <form onSubmit={submitProof} className="rounded-lg border border-blue-100 p-3">
                  {proofError ? <p className="text-xs text-red-600">{proofError}</p> : null}
                  <select value={proofPaymentId} onChange={(e) => setProofPaymentId(e.target.value)} className="mt-2 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm"><option value="">Dernier paiement (auto)</option>{data.dashboard.payments.map((p) => <option key={p.id} value={String(p.id)}>#{p.id} - {p.formationTitle}</option>)}</select>
                  <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="mt-2 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm" />
                  <button className="mt-2 w-full rounded-lg bg-cjblue px-4 py-2 text-sm font-semibold text-white">Envoyer preuve</button>
                </form>
              </div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Travaux / projets</h2>
              <form onSubmit={submitWork} className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">{submissionError ? <p className="text-xs text-red-600">{submissionError}</p> : null}<div className="grid gap-2 md:grid-cols-[1fr_auto]"><input value={submissionTitle} onChange={(e) => setSubmissionTitle(e.target.value)} placeholder="Titre du travail" className="rounded-lg border border-blue-200 px-3 py-2 text-sm" /><input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)} className="rounded-lg border border-blue-200 px-3 py-2 text-sm" /></div><button className="mt-2 rounded-lg bg-cjblue px-4 py-2 text-sm font-semibold text-white">Soumettre</button></form>
              <div className="mt-3 space-y-2">{data.dashboard.submissions.slice(0, 5).map((s) => <div key={s.id} className="rounded-lg border border-blue-100 bg-white p-3 text-sm"><div className="flex items-center justify-between"><p className="font-medium text-slate-900">{s.title}</p><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(s.status)}`}>{s.status}</span></div><p className="text-xs text-slate-500">{dateTime(s.submittedAt)}</p>{s.reviewFeedback ? <p className="text-slate-700">Feedback: {s.reviewFeedback}</p> : null}<a href={s.fileUrl} className="text-xs text-cjblue underline">Telecharger fichier</a></div>)}</div>
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Progression</h2>
              <div className="mt-2 space-y-1 text-sm text-slate-700"><p><strong>Heures completees:</strong> {data.dashboard.progress.hoursCompleted}</p><p><strong>Heures restantes:</strong> {data.dashboard.progress.hoursRemaining}</p><p><strong>Exercices termines:</strong> {data.dashboard.progress.exercisesCompleted}</p><p><strong>Exercices en cours:</strong> {data.dashboard.progress.exercisesInProgress}</p><p><strong>Projets termines:</strong> {data.dashboard.progress.projectsCompleted}</p><p><strong>Evaluations:</strong> {data.dashboard.progress.evaluationsCompleted}</p></div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Notifications</h2>
              <div className="mt-3 max-h-72 space-y-2 overflow-auto">{data.dashboard.notifications.map((n) => <div key={n.id} className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm"><div className="flex items-center justify-between"><p className="font-medium text-slate-900">{n.title}</p><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(n.type)}`}>{n.type}</span></div><p className="mt-1 text-slate-700">{n.message}</p><p className="mt-1 text-xs text-slate-500">{dateTime(n.createdAt)}</p></div>)}</div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Commentaires / questions</h2>
              <form onSubmit={sendQuestion} className="mt-3">{questionError ? <p className="text-xs text-red-600">{questionError}</p> : null}<textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} placeholder="Posez votre question..." className="mt-2 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm" /><button className="mt-2 w-full rounded-lg bg-cjblue px-4 py-2 text-sm font-semibold text-white">Envoyer</button></form>
              <div className="mt-3 max-h-64 space-y-2 overflow-auto">{data.dashboard.questions.map((q) => <div key={q.id} className="rounded-lg border border-blue-100 p-3 text-sm"><p className="font-medium text-slate-900">{q.formationTitle}</p><p className="mt-1 text-slate-700">{q.message}</p>{q.adminReply ? <p className="mt-2 rounded bg-blue-50 p-2 text-slate-700"><strong>Reponse admin:</strong> {q.adminReply}</p> : null}<p className="mt-1 text-xs text-slate-500">{dateTime(q.createdAt)}</p></div>)}</div>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-cjblue">Ressources pedagogiques</h2>
              <div className="mt-3 space-y-2">{data.dashboard.resources.slice(0, 8).map((r) => <a key={r.id} href={r.filePath.startsWith('/') ? r.filePath : `/${r.filePath}`} className="block rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm"><p className="font-medium text-slate-900">{r.title}</p><p className="text-xs text-slate-600">{r.category} | {date(r.createdAt)}</p></a>)}</div>
            </article>
          </aside>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-white p-5">
          <h2 className="text-lg font-semibold text-cjblue">Historique sessions / formations</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.dashboard.sessionsHistory.map((h) => <div key={h.enrollmentId} className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm"><p className="font-semibold text-slate-900">{h.formationTitle}</p><p className="text-slate-700">{date(h.startDate)} - {date(h.endDate)}</p><p className="text-slate-700">Type: {h.sessionType || '-'}</p><p className="text-slate-700">Statut: {lifecycleLabel(h.sessionLifecycle)}</p><p className="text-slate-700">Paiement: {h.paymentStatus}</p><p className="text-slate-700">Heures: {h.hours}</p></div>)}</div>
        </section>
      </main>
    </div>
  )
}
