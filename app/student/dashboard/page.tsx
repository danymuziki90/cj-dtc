'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import StudentPortalNav from '@/components/student-portal/StudentPortalNav'

type DashboardPayload = {
  student: {
    id: string
    fullName: string
    firstName: string
    lastName: string
    username: string | null
    email: string
    whatsapp: string | null
    status: string
    address: string | null
    city: string | null
    country: string | null
    createdAt: string
    photoUrl: string | null
  }
  dashboard: {
    currentSession: {
      enrollmentId: number
      formationTitle: string
      sessionId: number | null | undefined
      sessionType: string | null | undefined
      startDate: string | null | undefined
      endDate: string | null | undefined
      location: string | null | undefined
      format: string | null | undefined
      status: string
    } | null
    sessionsHistory: Array<{
      enrollmentId: number
      formationTitle: string
      formationCategory: string | null
      sessionId: number
      sessionType: string | null
      startDate: string
      endDate: string
      location: string
      format: string
      enrollmentStatus: string
      paymentStatus: string
      totalAmount: number
      paidAmount: number
      questionsCount: number
      hours: number
    }>
    resources: Array<{
      id: number
      title: string
      description: string | null
      category: string
      filePath: string
      fileName: string
      createdAt: string
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
      gateway: string | null
      operator: string | null
      proofUrl: string | null
      formationTitle: string
      enrollmentPaymentStatus: string
      enrollmentPaidAmount: number
      enrollmentTotalAmount: number
    }>
    submissions: Array<{
      id: string
      title: string
      status: string
      submittedAt: string
      updatedAt: string
      reviewFeedback: string | null
      reviewedAt: string | null
      reviewStatus: string | null
      fileUrl: string
    }>
    certificates: Array<{
      id: string
      code: string
      type: string
      holderName: string
      issuedAt: string
      verified: boolean
      source: string
      title?: string
      fileUrl: string | null
      formation: {
        title: string
      } | null
    }>
    questions: Array<{
      id: string
      message: string
      createdAt: string
      status: string
      adminReply?: string | null
      adminReplyAt?: string | null
      formationTitle: string
      enrollmentId: number
    }>
    notifications: Array<{
      id: string
      type: 'info' | 'reminder' | 'correction'
      title: string
      message: string
      createdAt: string
    }>
    progress: {
      hoursCompleted: number
      hoursRemaining: number
      exercisesCompleted: number
      exercisesInProgress: number
      projectsCompleted: number
      evaluationsCompleted: number
    }
    metrics: {
      totalSessions: number
      completedSessions: number
      pendingSessions: number
      totalPayments: number
      successfulPayments: number
    }
  }
}

function currency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function statusClass(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('success') || normalized.includes('paid') || normalized.includes('approved') || normalized.includes('confirmed')) {
    return 'bg-blue-100 text-blue-700'
  }
  if (normalized.includes('pending') || normalized.includes('wait') || normalized.includes('partial')) {
    return 'bg-red-100 text-red-700'
  }
  if (normalized.includes('failed') || normalized.includes('rejected') || normalized.includes('cancel')) {
    return 'bg-red-100 text-red-700'
  }
  return 'bg-slate-100 text-slate-700'
}

function paymentMethodLabel(value: string) {
  if (value === 'mobile_money') return 'Mobile Money'
  if (value === 'bank_transfer') return 'Virement bancaire'
  if (value === 'card') return 'Carte bancaire'
  return value
}

export default function StudentDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [questionMessage, setQuestionMessage] = useState('')
  const [questionError, setQuestionError] = useState('')
  const [questionLoading, setQuestionLoading] = useState(false)

  async function loadData() {
    setLoading(true)
    const response = await fetch('/api/student/system/dashboard', { cache: 'no-store' })
    if (response.status === 401 || response.status === 403) {
      router.push('/student/login')
      return
    }

    if (!response.ok) {
      setLoading(false)
      return
    }

    const payload = (await response.json()) as DashboardPayload
    setData(payload)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [router])

  async function logout() {
    await fetch('/api/student/auth/logout', { method: 'POST' })
    router.push('/student/login')
    router.refresh()
  }

  async function submitQuestion(event: FormEvent) {
    event.preventDefault()
    setQuestionError('')

    const message = questionMessage.trim()
    if (message.length < 5) {
      setQuestionError('Votre question doit contenir au moins 5 caracteres.')
      return
    }

    setQuestionLoading(true)
    const response = await fetch('/api/student/system/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    const payload = await response.json()

    if (!response.ok) {
      setQuestionError(payload.error || 'Impossible d envoyer votre question.')
      setQuestionLoading(false)
      return
    }

    setQuestionMessage('')
    setQuestionLoading(false)
    await loadData()
  }

  const completionRate = useMemo(() => {
    if (!data) return 0
    const total = data.dashboard.progress.hoursCompleted + data.dashboard.progress.hoursRemaining
    if (total <= 0) return 0
    return Math.round((data.dashboard.progress.hoursCompleted / total) * 100)
  }, [data])

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Chargement du dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
              {data.student.firstName?.[0] || 'E'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{data.student.fullName}</h1>
              <p className="text-sm text-slate-500">{data.student.email}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(data.student.status)}`}>
              {data.student.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/student/submissions"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Travaux
            </Link>
            <Link
              href="/student/profile"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Mon compte
            </Link>
            <button
              onClick={logout}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <StudentPortalNav />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Sessions</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{data.dashboard.metrics.totalSessions}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Sessions terminees</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{data.dashboard.metrics.completedSessions}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Paiements valides</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{data.dashboard.metrics.successfulPayments}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Travaux valides</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{data.dashboard.progress.projectsCompleted}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Notifications</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{data.dashboard.notifications.length}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Session active</h2>
              {data.dashboard.currentSession ? (
                <div className="space-y-1 text-sm text-slate-700">
                  <p><strong>Formation:</strong> {data.dashboard.currentSession.formationTitle}</p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {data.dashboard.currentSession.startDate
                      ? `${new Date(data.dashboard.currentSession.startDate).toLocaleDateString('fr-FR')} - ${new Date(
                          data.dashboard.currentSession.endDate || data.dashboard.currentSession.startDate
                        ).toLocaleDateString('fr-FR')}`
                      : '-'}
                  </p>
                  <p><strong>Type parcours:</strong> {data.dashboard.currentSession.sessionType || '-'}</p>
                  <p><strong>Format:</strong> {data.dashboard.currentSession.format || '-'}</p>
                  <p><strong>Lieu:</strong> {data.dashboard.currentSession.location || '-'}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Aucune session active pour le moment.</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Paiements et certificats</h2>
              <div className="space-y-3">
                {data.dashboard.payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{payment.formationTitle}</p>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-slate-700">
                      {currency(payment.amount)} via {paymentMethodLabel(payment.method)}
                      {payment.gateway ? ` (${payment.gateway})` : ''}
                    </p>
                    <p className="text-xs text-slate-500">Cree le {new Date(payment.createdAt).toLocaleString('fr-FR')}</p>
                    {payment.proofUrl ? (
                      <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-700 underline">
                        Ouvrir preuve de paiement
                      </a>
                    ) : null}
                  </div>
                ))}
                {data.dashboard.payments.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucun paiement enregistre.</p>
                ) : null}
              </div>

              <div className="mt-4 border-t border-slate-200 pt-3">
                <h3 className="mb-2 text-sm font-semibold text-slate-800">Certificats</h3>
                <div className="space-y-2">
                  {data.dashboard.certificates.map((certificate) => (
                    <div key={certificate.id} className="rounded border border-slate-200 px-3 py-2 text-sm">
                      <p className="font-medium text-slate-900">
                        {certificate.formation?.title || certificate.title || 'Certificat'}
                      </p>
                      <p className="text-xs text-slate-500">Emis le {new Date(certificate.issuedAt).toLocaleDateString('fr-FR')}</p>
                      <div className="mt-1 flex gap-2">
                        {certificate.fileUrl ? (
                          <a href={certificate.fileUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                            Telecharger
                          </a>
                        ) : (
                          <Link href={`/fr/certificates?code=${certificate.code}`} className="text-blue-700 underline">
                            Voir certificat
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                  {data.dashboard.certificates.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucun certificat disponible.</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Historique des sessions</h2>
              <div className="space-y-2">
                {data.dashboard.sessionsHistory.map((row) => (
                  <div key={row.enrollmentId} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                    <p className="font-medium text-slate-900">{row.formationTitle}</p>
                    <p className="text-slate-700">
                      {new Date(row.startDate).toLocaleDateString('fr-FR')} - {new Date(row.endDate).toLocaleDateString('fr-FR')} | {row.location}
                    </p>
                    <p className="text-xs text-slate-500">
                      Type: {row.sessionType || '-'} | Statut inscription: {row.enrollmentStatus} | Paiement: {row.paymentStatus}
                    </p>
                  </div>
                ))}
                {data.dashboard.sessionsHistory.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucun historique de session.</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Progression</h2>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Heures completees:</strong> {data.dashboard.progress.hoursCompleted}</p>
                <p><strong>Heures restantes:</strong> {data.dashboard.progress.hoursRemaining}</p>
                <p><strong>Exercices termines:</strong> {data.dashboard.progress.exercisesCompleted}</p>
                <p><strong>Exercices en cours:</strong> {data.dashboard.progress.exercisesInProgress}</p>
                <p><strong>Evaluations:</strong> {data.dashboard.progress.evaluationsCompleted}</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${completionRate}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">Avancement global: {completionRate}%</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Notifications</h2>
              <div className="space-y-2">
                {data.dashboard.notifications.map((notification) => (
                  <div key={notification.id} className="rounded border border-slate-200 bg-slate-50 p-2 text-sm">
                    <p className="font-medium text-slate-900">{notification.title}</p>
                    <p className="text-slate-700">{notification.message}</p>
                    <p className="text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                ))}
                {data.dashboard.notifications.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucune notification.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Ressources pedagogiques</h2>
              <div className="space-y-2">
                {data.dashboard.resources.slice(0, 10).map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.filePath.startsWith('/') ? resource.filePath : `/${resource.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <p className="font-medium text-slate-900">{resource.title}</p>
                    <p className="text-xs text-slate-500">{resource.category}</p>
                  </a>
                ))}
                {data.dashboard.resources.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucune ressource partagee pour le moment.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Questions sur la session</h2>
              <form onSubmit={submitQuestion} className="space-y-2">
                <textarea
                  value={questionMessage}
                  onChange={(event) => setQuestionMessage(event.target.value)}
                  rows={3}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Posez une question a l administration ou au formateur"
                />
                {questionError ? <p className="text-xs text-red-600">{questionError}</p> : null}
                <button
                  type="submit"
                  disabled={questionLoading}
                  className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {questionLoading ? 'Envoi...' : 'Envoyer la question'}
                </button>
              </form>

              <div className="mt-4 space-y-2">
                {data.dashboard.questions.map((question) => (
                  <div key={question.id} className="rounded border border-slate-200 bg-slate-50 p-2 text-sm">
                    <p className="font-medium text-slate-900">{question.formationTitle}</p>
                    <p className="text-slate-700">{question.message}</p>
                    <p className="text-xs text-slate-500">{new Date(question.createdAt).toLocaleString('fr-FR')}</p>
                    {question.adminReply ? (
                      <div className="mt-2 rounded border border-blue-100 bg-blue-50 p-2 text-xs text-blue-800">
                        <p className="font-semibold">Reponse admin</p>
                        <p>{question.adminReply}</p>
                      </div>
                    ) : null}
                  </div>
                ))}
                {data.dashboard.questions.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucune question envoyee.</p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

