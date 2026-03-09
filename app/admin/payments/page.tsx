'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Eye } from 'lucide-react'

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

const METHOD_LABELS: Record<string, string> = {
  cash: 'Especes',
  card: 'Carte',
  mobile_money: 'Mobile Money',
  bank_transfer: 'Virement',
  check: 'Cheque',
}

const STATUS_STYLES: Record<'pending' | 'success' | 'failed', string> = {
  pending: 'bg-red-100 text-red-800',
  success: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
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
  })

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.method) params.set('method', filters.method)
    if (filters.sessionId) params.set('sessionId', filters.sessionId)
    return params.toString()
  }, [filters])

  async function loadData() {
    setLoading(true)
    try {
      const [paymentsResponse, sessionsResponse, enrollmentsResponse] = await Promise.all([
        fetch(`/api/payments${queryString ? `?${queryString}` : ''}`, { cache: 'no-store' }),
        fetch('/api/sessions', { cache: 'no-store' }),
        fetch('/api/enrollments', { cache: 'no-store' }),
      ])

      const [paymentsData, sessionsData, enrollmentsData] = await Promise.all([
        paymentsResponse.json(),
        sessionsResponse.json(),
        enrollmentsResponse.json(),
      ])

      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      setSessions(Array.isArray(sessionsData) ? sessionsData : [])
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : [])
    } catch (error) {
      console.error('Unable to load payments data:', error)
      setPayments([])
      setSessions([])
      setEnrollments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [queryString])

  const totalSuccessAmount = payments
    .filter((payment) => payment.status === 'success')
    .reduce((sum, payment) => sum + payment.amount, 0)

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
      await loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur de creation.')
    }
  }

  function exportReport() {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.method) params.set('method', filters.method)
    if (filters.sessionId) params.set('sessionId', filters.sessionId)
    params.set('format', 'csv')
    window.location.href = `/api/payments?${params.toString()}`
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Gestion des paiements</h1>
          <p className="text-sm text-slate-600">
            Etudiants, sessions, montant, methode, statut, details transaction, export rapport.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportReport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowCreateForm((value) => !value)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {showCreateForm ? 'Fermer' : 'Nouveau paiement'}
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total paiements</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{payments.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Montant encaisse</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(totalSuccessAmount)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Paiements en attente</p>
          <p className="mt-1 text-2xl font-semibold text-red-700">
            {payments.filter((payment) => payment.status === 'pending').length}
          </p>
        </div>
      </div>

      {showCreateForm ? (
        <form onSubmit={createManualPayment} className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Enregistrer un paiement manuel</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Inscription</label>
              <select
                required
                value={formData.enrollmentId}
                onChange={(event) => setFormData((prev) => ({ ...prev, enrollmentId: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Selectionner...</option>
                {enrollments.map((enrollment) => (
                  <option key={enrollment.id} value={enrollment.id}>
                    {enrollment.firstName} {enrollment.lastName} - {enrollment.formation.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Montant</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Methode</label>
              <select
                value={formData.method}
                onChange={(event) => setFormData((prev) => ({ ...prev, method: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="mobile_money">Mobile Money</option>
                <option value="card">Carte</option>
                <option value="bank_transfer">Virement</option>
                <option value="cash">Especes</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Statut</label>
              <select
                value={formData.status}
                onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="pending">pending</option>
                <option value="success">success</option>
                <option value="failed">failed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Transaction ID</label>
              <input
                value={formData.transactionId}
                onChange={(event) => setFormData((prev) => ({ ...prev, transactionId: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Reference</label>
              <input
                value={formData.reference}
                onChange={(event) => setFormData((prev) => ({ ...prev, reference: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Enregistrer
            </button>
          </div>
        </form>
      ) : null}

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Filtre session</label>
          <select
            value={filters.sessionId}
            onChange={(event) => setFilters((prev) => ({ ...prev, sessionId: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
          <label className="mb-1 block text-sm font-medium text-slate-700">Filtre methode</label>
          <select
            value={filters.method}
            onChange={(event) => setFilters((prev) => ({ ...prev, method: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Toutes les methodes</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Carte</option>
            <option value="bank_transfer">Virement</option>
            <option value="cash">Especes</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Filtre statut</label>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">pending</option>
            <option value="success">success</option>
            <option value="failed">failed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Etudiant</th>
              <th className="px-4 py-3 font-medium">Session</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Methode</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Chargement...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Aucun paiement trouve.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {payment.enrollment.firstName} {payment.enrollment.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{payment.enrollment.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatSessionLabel(payment.enrollment.session)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {METHOD_LABELS[payment.method] || payment.method}
                    {payment.gateway ? <span className="ml-1 text-xs text-slate-500">({payment.gateway})</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_STYLES[payment.status]}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Voir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedPayment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-xl">
            {(() => {
              const notes = parseNotes(selectedPayment.notes)
              const gateway = typeof notes?.gateway === 'string' ? notes.gateway : selectedPayment.gateway || '-'
              const proofUrl = typeof notes?.proofUrl === 'string' ? notes.proofUrl : null
              const phoneMasked = typeof notes?.phoneNumberMasked === 'string' ? notes.phoneNumberMasked : null

              return (
                <>
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Details transaction #{selectedPayment.id}</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-sm text-slate-600 hover:text-slate-900">
                Fermer
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 text-sm text-slate-700">
                <p>
                  <strong>Etudiant:</strong> {selectedPayment.enrollment.firstName} {selectedPayment.enrollment.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedPayment.enrollment.email}
                </p>
                <p>
                  <strong>Session:</strong> {formatSessionLabel(selectedPayment.enrollment.session)}
                </p>
                <p>
                  <strong>Methode:</strong> {METHOD_LABELS[selectedPayment.method] || selectedPayment.method}
                </p>
                <p>
                  <strong>Gateway:</strong> {gateway}
                </p>
              </div>
              <div className="space-y-1 text-sm text-slate-700">
                <p>
                  <strong>Montant:</strong> {formatCurrency(selectedPayment.amount)}
                </p>
                <p>
                  <strong>Statut:</strong> {selectedPayment.status}
                </p>
                <p>
                  <strong>Reference:</strong> {selectedPayment.reference || '-'}
                </p>
                <p>
                  <strong>Transaction ID:</strong> {selectedPayment.transactionId || '-'}
                </p>
                {phoneMasked ? (
                  <p>
                    <strong>Numero masque:</strong> {phoneMasked}
                  </p>
                ) : null}
                {proofUrl ? (
                  <p>
                    <strong>Preuve:</strong>{' '}
                    <a href={proofUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                      Ouvrir la preuve
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-medium text-slate-700">Payload transaction</p>
              <pre className="max-h-60 overflow-auto text-xs text-slate-800">
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
  )
}

