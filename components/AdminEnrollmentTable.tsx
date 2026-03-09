'use client'

import { FormattedDate } from './FormattedDate'

type Payment = {
  id: number
  amount: number
  method: string
  status: string
  reference: string | null
  transactionId: string | null
  paidAt: string | null
  createdAt: string
  notes: string | null
}

export interface EnrollmentRow {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  startDate: string
  status: string
  paymentStatus: string
  totalAmount: number
  paidAmount: number
  createdAt: string
  motivationLetter?: string
  notes?: string
  payments?: Payment[]
  formation: {
    id: number
    title: string
    slug: string
  }
  session?: {
    id: number
    startDate: string
    endDate: string
    location: string
    format: string
    maxParticipants: number
  } | null
}

interface AdminEnrollmentTableProps {
  enrollments: EnrollmentRow[]
  groupBy: 'formation' | 'date'
  onPreview?: (enrollment: EnrollmentRow) => void
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

function enrollmentStatusClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-red-100 text-red-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-blue-100 text-blue-800',
    waitlist: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-700',
  }

  return map[status] || 'bg-slate-100 text-slate-700'
}

function enrollmentStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Acceptee',
    rejected: 'Rejetee',
    confirmed: 'Confirmee',
    completed: 'Terminee',
    waitlist: 'Liste attente',
    cancelled: 'Annulee',
  }

  return map[status] || status
}

function paymentStatusClass(status: string) {
  const map: Record<string, string> = {
    paid: 'bg-blue-100 text-blue-800',
    partial: 'bg-red-100 text-red-800',
    unpaid: 'bg-red-100 text-red-800',
  }

  return map[status] || 'bg-slate-100 text-slate-700'
}

function paymentStatusLabel(status: string) {
  const map: Record<string, string> = {
    paid: 'Paye',
    partial: 'Partiel',
    unpaid: 'Non paye',
  }

  return map[status] || status
}

function buildDateKey(dateValue: string) {
  const date = new Date(dateValue)
  return date.toISOString().split('T')[0]
}

export default function AdminEnrollmentTable({ enrollments, groupBy, onPreview }: AdminEnrollmentTableProps) {
  if (groupBy === 'formation') {
    const byFormation = enrollments.reduce((acc: Record<number, EnrollmentRow[]>, enrollment) => {
      const formationId = enrollment.formation.id
      if (!acc[formationId]) acc[formationId] = []
      acc[formationId].push(enrollment)
      return acc
    }, {})

    return (
      <div className="space-y-6">
        {Object.entries(byFormation).map(([formationId, rows]) => (
          <div key={formationId} className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {rows[0]?.formation.title} ({rows.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">Participant</th>
                    <th className="px-3 py-2 font-medium">Contact</th>
                    <th className="px-3 py-2 font-medium">Session</th>
                    <th className="px-3 py-2 font-medium">Paiement</th>
                    <th className="px-3 py-2 font-medium">Statut</th>
                    <th className="px-3 py-2 font-medium">Inscription</th>
                    {onPreview ? <th className="px-3 py-2 font-medium">Actions</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((enrollment) => (
                    <tr key={enrollment.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-900">
                          {enrollment.firstName} {enrollment.lastName}
                        </p>
                        <p className="text-xs text-slate-500">#{enrollment.id}</p>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <p>{enrollment.email}</p>
                        <p className="text-xs text-slate-500">{enrollment.phone || '-'}</p>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <p>
                          <FormattedDate date={enrollment.startDate} options={{ dateStyle: 'short' } as Intl.DateTimeFormatOptions} />
                        </p>
                        <p className="text-xs text-slate-500">{enrollment.session?.location || '-'}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-900">
                          {formatCurrency(enrollment.paidAmount)} / {formatCurrency(enrollment.totalAmount)}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paymentStatusClass(enrollment.paymentStatus)}`}>
                          {paymentStatusLabel(enrollment.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${enrollmentStatusClass(enrollment.status)}`}>
                          {enrollmentStatusLabel(enrollment.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <FormattedDate date={enrollment.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' } as Intl.DateTimeFormatOptions} />
                      </td>
                      {onPreview ? (
                        <td className="px-3 py-2">
                          <button
                            onClick={() => onPreview(enrollment)}
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Ouvrir
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const byDate = enrollments.reduce((acc: Record<string, EnrollmentRow[]>, enrollment) => {
    const dateKey = buildDateKey(enrollment.startDate)
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(enrollment)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, rows]) => (
          <div key={dateKey} className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="mb-4 text-lg font-semibold text-slate-900">
              <FormattedDate
                date={dateKey}
                options={{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } as Intl.DateTimeFormatOptions}
              />{' '}
              ({rows.length})
            </h4>
            <div className="space-y-3">
              {rows.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {enrollment.firstName} {enrollment.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{enrollment.formation.title}</p>
                    <p className="text-xs text-slate-500">{enrollment.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${paymentStatusClass(enrollment.paymentStatus)}`}>
                      {paymentStatusLabel(enrollment.paymentStatus)}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${enrollmentStatusClass(enrollment.status)}`}>
                      {enrollmentStatusLabel(enrollment.status)}
                    </span>
                    {onPreview ? (
                      <button
                        onClick={() => onPreview(enrollment)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Ouvrir
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

