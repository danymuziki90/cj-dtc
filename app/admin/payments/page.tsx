'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  Eye,
  Plus,
  Search,
  X,
} from 'lucide-react'
import AdminShell from '@/components/admin-portal/AdminShell'
import PaginationControls from '@/components/admin-portal/PaginationControls'
import {
  AdminBadge,
  AdminEmptyState,
  AdminMetricCard,
  AdminPanel,
  AdminPanelHeader,
  adminInputClassName,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
  adminSelectClassName,
  adminTextareaClassName,
} from '@/components/admin-portal/ui'

type SessionOption = {
  id: number
  formation: {
    title: string
  }
  startDate: string
  location: string
}

type EnrollmentOption = {
  id: number
  firstName: string
  lastName: string
  totalAmount: number
  paidAmount: number
  formation: {
    title: string
  }
  session: {
    id: number
    startDate: string
    location: string
  } | null
}

type PaymentRow = {
  id: number
  amount: number
  method: string
  status: 'pending' | 'success' | 'failed'
  transactionId: string | null
  reference: string | null
  notes: string | null
  paidAt: string | null
  createdAt: string
  gateway: string | null
  enrollment: {
    id: number
    firstName: string
    lastName: string
    email: string
    formation: {
      id: number
      title: string
    }
    session: {
      id: number
      startDate: string
      endDate: string
      location: string
      format: string
    } | null
  }
}

type PaginationState = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type PaymentSummary = {
  totalCount: number
  successCount: number
  pendingCount: number
  successfulAmount: number
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'Especes',
  card: 'Carte',
  mobile_money: 'Mobile Money',
  bank_transfer: 'Virement',
  check: 'Cheque',
}

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

const emptySummary: PaymentSummary = {
  totalCount: 0,
  successCount: 0,
  pendingCount: 0,
  successfulAmount: 0,
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatSessionLabel(session: PaymentRow['enrollment']['session']) {
  if (!session) return 'Sans session'
  return `${new Date(session.startDate).toLocaleDateString('fr-FR')} - ${session.location}`
}

function formatPaymentStatus(status: PaymentRow['status']) {
  if (status === 'success') return 'Confirme'
  if (status === 'pending') return 'En attente'
  return 'Echoue'
}

function paymentStatusTone(status: PaymentRow['status']) {
  if (status === 'success') return 'success' as const
  if (status === 'pending') return 'warning' as const
  return 'danger' as const
}

function parseNotes(notes: string | null) {
  if (!notes) return null
  try {
    return JSON.parse(notes) as Record<string, unknown>
  } catch {
    return { raw: notes }
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [enrollments, setEnrollments] = useState<EnrollmentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null)
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  const [summary, setSummary] = useState<PaymentSummary>(emptySummary)
  const [formData, setFormData] = useState({
    enrollmentId: '',
    amount: '',
    method: 'mobile_money',
    status: 'success',
    transactionId: '',
    reference: '',
    notes: '',
  })
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    sessionId: '',
    search: '',
  })

  const paymentQueryString = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.method) params.set('method', filters.method)
    if (filters.sessionId) params.set('sessionId', filters.sessionId)
    if (filters.search) params.set('search', filters.search)
    params.set('page', String(pagination.page))
    params.set('pageSize', String(pagination.pageSize))
    return params.toString()
  }, [filters, pagination.page, pagination.pageSize])

  const paidRatio = summary.totalCount > 0 ? Math.round((summary.successCount / summary.totalCount) * 100) : 0

  async function loadReferenceData() {
    try {
      const [sessionsResponse, enrollmentsResponse] = await Promise.all([
        fetch('/api/sessions', { cache: 'no-store' }),
        fetch('/api/enrollments', { cache: 'no-store' }),
      ])

      const [sessionsData, enrollmentsData] = await Promise.all([sessionsResponse.json(), enrollmentsResponse.json()])

      setSessions(Array.isArray(sessionsData) ? sessionsData : [])
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : [])
    } catch (error) {
      console.error('Impossible de charger les donnees de reference des paiements:', error)
      setSessions([])
      setEnrollments([])
    }
  }

  async function loadPayments() {
    setLoading(true)
    try {
      const response = await fetch(`/api/payments?${paymentQueryString}`, { cache: 'no-store' })
      const data = await response.json()

      setPayments(Array.isArray(data?.payments) ? data.payments : [])
      setPagination(data.pagination || initialPagination)
      setSummary(data.summary || emptySummary)
    } catch (error) {
      console.error('Impossible de charger les paiements:', error)
      setPayments([])
      setPagination(initialPagination)
      setSummary(emptySummary)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReferenceData()
  }, [])

  useEffect(() => {
    loadPayments()
  }, [paymentQueryString])

  async function createManualPayment(event: React.FormEvent) {
    event.preventDefault()
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: Number(formData.enrollmentId),
          amount: Number(formData.amount),
          method: formData.method,
          status: formData.status,
          transactionId: formData.transactionId || null,
          reference: formData.reference || null,
          notes: formData.notes || null,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Creation du paiement impossible.')
      }

      setShowCreateForm(false)
      setFormData({
        enrollmentId: '',
        amount: '',
        method: 'mobile_money',
        status: 'success',
        transactionId: '',
        reference: '',
        notes: '',
      })
      await loadPayments()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible d enregistrer le paiement.')
    }
  }

  function exportReport() {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.method) params.set('method', filters.method)
    if (filters.sessionId) params.set('sessionId', filters.sessionId)
    if (filters.search) params.set('search', filters.search)
    params.set('format', 'csv')
    window.location.href = `/api/payments?${params.toString()}`
  }

  const filteredEnrollmentCount = enrollments.length

  return (
    <AdminShell title="Gestion des paiements">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-[26px] border border-slate-200 bg-white/92 px-5 py-4 shadow-[0_20px_55px_-44px_rgba(15,23,42,0.28)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportReport} className={adminSecondaryButtonClassName}>
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button type="button" onClick={() => setShowCreateForm((value) => !value)} className={adminPrimaryButtonClassName}>
              <Plus className="h-4 w-4" />
              {showCreateForm ? 'Fermer le formulaire' : 'Nouveau paiement'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="primary">{summary.totalCount} transaction(s)</AdminBadge>
            <AdminBadge tone="success">{paidRatio}% confirmes</AdminBadge>
            <AdminBadge tone="neutral">{filteredEnrollmentCount} inscription(s)</AdminBadge>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard
            icon={CreditCard}
            label="Transactions"
            value={String(summary.totalCount)}
            helper="Volume total dans la vue active."
            tone="primary"
          />
          <AdminMetricCard
            icon={CircleDollarSign}
            label="Montant encaisse"
            value={formatCurrency(summary.successfulAmount)}
            helper="Somme des paiements confirmes."
            tone="success"
          />
          <AdminMetricCard
            icon={BadgeCheck}
            label="Confirme"
            value={String(summary.successCount)}
            helper="Paiements deja reconcilies."
            tone="neutral"
          />
          <AdminMetricCard
            icon={Clock3}
            label="En attente"
            value={String(summary.pendingCount)}
            helper="Transactions a relancer ou verifier."
            tone="warning"
          />
        </section>

        <div className={`grid gap-6 ${showCreateForm ? 'xl:grid-cols-[0.95fr_1.05fr]' : ''}`}>
          {showCreateForm ? (
            <AdminPanel>
              <AdminPanelHeader
                eyebrow="Enregistrement manuel"
                title="Ajouter une transaction"
                description="Saisissez un paiement manuellement lorsque le flux passe hors du portail ou doit etre regularise par l'equipe admin."
              />
              <form onSubmit={createManualPayment} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Inscription</label>
                    <select
                      required
                      value={formData.enrollmentId}
                      onChange={(event) => setFormData((prev) => ({ ...prev, enrollmentId: event.target.value }))}
                      className={adminSelectClassName}
                    >
                      <option value="">Selectionner une inscription...</option>
                      {enrollments.map((enrollment) => (
                        <option key={enrollment.id} value={enrollment.id}>
                          {enrollment.firstName} {enrollment.lastName} - {enrollment.formation.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Montant</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                      className={adminInputClassName}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Methode</label>
                    <select
                      value={formData.method}
                      onChange={(event) => setFormData((prev) => ({ ...prev, method: event.target.value }))}
                      className={adminSelectClassName}
                    >
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Carte</option>
                      <option value="bank_transfer">Virement</option>
                      <option value="cash">Especes</option>
                      <option value="check">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Statut</label>
                    <select
                      value={formData.status}
                      onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                      className={adminSelectClassName}
                    >
                      <option value="pending">En attente</option>
                      <option value="success">Confirme</option>
                      <option value="failed">Echoue</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">ID transaction</label>
                    <input
                      value={formData.transactionId}
                      onChange={(event) => setFormData((prev) => ({ ...prev, transactionId: event.target.value }))}
                      className={adminInputClassName}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Reference</label>
                    <input
                      value={formData.reference}
                      onChange={(event) => setFormData((prev) => ({ ...prev, reference: event.target.value }))}
                      className={adminInputClassName}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Notes internes</label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                    className={adminTextareaClassName}
                    placeholder="Ajoutez un contexte operationnel, une reference de rapprochement ou un commentaire de verification."
                  />
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setShowCreateForm(false)} className={adminSecondaryButtonClassName}>
                    Fermer
                  </button>
                  <button type="submit" className={adminPrimaryButtonClassName}>
                    <Plus className="h-4 w-4" />
                    Enregistrer le paiement
                  </button>
                </div>
              </form>
            </AdminPanel>
          ) : null}

          <AdminPanel>
            <AdminPanelHeader
              eyebrow="Filtres"
              title="Affiner la lecture des transactions"
              description="Croisez statut, methode, session et recherche libre pour obtenir une vue exploitable par l'equipe finance ou operationnelle."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="xl:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Recherche</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={filters.search}
                    onChange={(event) => {
                      setFilters((prev) => ({ ...prev, search: event.target.value }))
                      setPagination((prev) => ({ ...prev, page: 1 }))
                    }}
                    placeholder="Etudiant, email, reference, transaction"
                    className={`pl-11 ${adminInputClassName}`}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Session</label>
                <select
                  value={filters.sessionId}
                  onChange={(event) => {
                    setFilters((prev) => ({ ...prev, sessionId: event.target.value }))
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }}
                  className={adminSelectClassName}
                >
                  <option value="">Toutes les sessions</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {new Date(session.startDate).toLocaleDateString('fr-FR')} - {session.formation.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Methode</label>
                <select
                  value={filters.method}
                  onChange={(event) => {
                    setFilters((prev) => ({ ...prev, method: event.target.value }))
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }}
                  className={adminSelectClassName}
                >
                  <option value="">Toutes les methodes</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="card">Carte</option>
                  <option value="bank_transfer">Virement</option>
                  <option value="cash">Especes</option>
                  <option value="check">Cheque</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Statut</label>
                <select
                  value={filters.status}
                  onChange={(event) => {
                    setFilters((prev) => ({ ...prev, status: event.target.value }))
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }}
                  className={adminSelectClassName}
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="success">Confirme</option>
                  <option value="failed">Echoue</option>
                </select>
              </div>
            </div>
          </AdminPanel>
        </div>

        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Table transactionnelle"
            title="Paiements visibles"
            description="Chaque ligne consolide l'etudiant, la session, la methode et l'etat de rapprochement."
          />

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/90">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Etudiant</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Session</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Montant</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Methode</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      Chargement des paiements...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10">
                      <AdminEmptyState
                        title="Aucun paiement trouve"
                        description="Ajustez les filtres ou ajoutez une transaction manuelle pour alimenter cette vue."
                      />
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-4 text-slate-600">
                        {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {payment.enrollment.firstName} {payment.enrollment.lastName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{payment.enrollment.email}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{formatSessionLabel(payment.enrollment.session)}</td>
                      <td className="px-4 py-4 font-semibold text-slate-950">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-4 text-slate-700">
                        <p>{METHOD_LABELS[payment.method] || payment.method}</p>
                        {payment.gateway ? <p className="mt-1 text-xs text-slate-500">Passerelle: {payment.gateway}</p> : null}
                      </td>
                      <td className="px-4 py-4">
                        <AdminBadge tone={paymentStatusTone(payment.status)}>{formatPaymentStatus(payment.status)}</AdminBadge>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(payment)}
                          className={adminSecondaryButtonClassName}
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <PaginationControls
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
        />

        {selectedPayment ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_40px_110px_-60px_rgba(15,23,42,0.7)] md:p-7">
              {(() => {
                const notes = parseNotes(selectedPayment.notes)
                const gateway = typeof notes?.gateway === 'string' ? notes.gateway : selectedPayment.gateway || '-'
                const proofUrl = typeof notes?.proofUrl === 'string' ? notes.proofUrl : null
                const phoneMasked = typeof notes?.phoneNumberMasked === 'string' ? notes.phoneNumberMasked : null

                return (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Paiement</p>
                        <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                          Details du paiement #{selectedPayment.id}
                        </h3>
                      </div>
                      <button type="button" onClick={() => setSelectedPayment(null)} className={adminSecondaryButtonClassName}>
                        <X className="h-4 w-4" />
                        Fermer
                      </button>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-700">
                        <p><strong>Etudiant:</strong> {selectedPayment.enrollment.firstName} {selectedPayment.enrollment.lastName}</p>
                        <p className="mt-2"><strong>Email:</strong> {selectedPayment.enrollment.email}</p>
                        <p className="mt-2"><strong>Session:</strong> {formatSessionLabel(selectedPayment.enrollment.session)}</p>
                        <p className="mt-2"><strong>Methode:</strong> {METHOD_LABELS[selectedPayment.method] || selectedPayment.method}</p>
                        <p className="mt-2"><strong>Passerelle:</strong> {gateway}</p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-700">
                        <p><strong>Montant:</strong> {formatCurrency(selectedPayment.amount)}</p>
                        <p className="mt-2"><strong>Statut:</strong> {formatPaymentStatus(selectedPayment.status)}</p>
                        <p className="mt-2"><strong>Reference:</strong> {selectedPayment.reference || '-'}</p>
                        <p className="mt-2"><strong>ID transaction:</strong> {selectedPayment.transactionId || '-'}</p>
                        {phoneMasked ? <p className="mt-2"><strong>Numero masque:</strong> {phoneMasked}</p> : null}
                        {proofUrl ? (
                          <p className="mt-2">
                            <strong>Preuve:</strong>{' '}
                            <a href={proofUrl} target="_blank" rel="noreferrer" className="font-semibold text-[var(--admin-primary)] underline">
                              Ouvrir la preuve
                            </a>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-950 px-4 py-4 text-sm text-slate-100">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Donnees techniques</p>
                      <pre className="max-h-72 overflow-auto text-xs text-slate-200">
                        {JSON.stringify(notes, null, 2)}
                      </pre>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
