'use client'

import { CalendarDays, Eye, MapPin, UserRound } from 'lucide-react'
import { FormattedDate } from './FormattedDate'
import {
  AdminBadge,
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
  adminSecondaryButtonClassName,
} from '@/components/admin-portal/ui'

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

type EnrollmentAccount = {
  state: string
  label: string
  tone: 'warning' | 'success' | 'primary' | 'neutral' | 'danger'
  canCreate: boolean
  canLogin: boolean
  studentId?: string | null
  username?: string | null
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
  account?: EnrollmentAccount
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

function enrollmentStatusTone(status: string) {
  const map: Record<string, 'warning' | 'success' | 'danger' | 'neutral' | 'primary'> = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger',
    confirmed: 'primary',
    completed: 'primary',
    waitlist: 'warning',
    cancelled: 'neutral',
  }

  return map[status] || 'neutral'
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

function paymentStatusTone(status: string) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    paid: 'success',
    partial: 'warning',
    unpaid: 'danger',
  }

  return map[status] || 'neutral'
}

function paymentStatusLabel(status: string) {
  const map: Record<string, string> = {
    paid: 'Solde',
    partial: 'Partiel',
    unpaid: 'Non solde',
  }

  return map[status] || status
}

function buildDateKey(dateValue: string) {
  const date = new Date(dateValue)
  return date.toISOString().split('T')[0]
}

function EnrollmentActionButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`${adminSecondaryButtonClassName} px-3 py-2 text-xs`}>
      <Eye className="h-4 w-4" />
      Ouvrir
    </button>
  )
}

export default function AdminEnrollmentTable({ enrollments, groupBy, onPreview }: AdminEnrollmentTableProps) {
  if (enrollments.length === 0) {
    return (
      <AdminPanel>
        <AdminEmptyState
          title="Aucune inscription a afficher"
          description="Ajustez vos filtres ou attendez de nouvelles inscriptions pour alimenter cette vue."
        />
      </AdminPanel>
    )
  }

  if (groupBy === 'formation') {
    const byFormation = enrollments.reduce((acc: Record<number, EnrollmentRow[]>, enrollment) => {
      const formationId = enrollment.formation.id
      if (!acc[formationId]) acc[formationId] = []
      acc[formationId].push(enrollment)
      return acc
    }, {})

    return (
      <div className="space-y-6">
        {Object.entries(byFormation)
          .sort(([, a], [, b]) => b.length - a.length || a[0].formation.title.localeCompare(b[0].formation.title))
          .map(([formationId, rows]) => {
            const soldCount = rows.filter((row) => row.paymentStatus === 'paid').length
            const activeAccounts = rows.filter((row) => row.account?.state === 'active').length
            return (
              <AdminPanel key={formationId}>
                <AdminPanelHeader
                  eyebrow="Groupe formation"
                  title={rows[0]?.formation.title || 'Formation'}
                  description={`${rows.length} inscription(s), ${soldCount} paiement(s) soldes et ${activeAccounts} compte(s) actif(s).`}
                  actions={<AdminBadge tone="primary">{rows.length} dossiers</AdminBadge>}
                />

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50/90">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Participant</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Contact</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Session</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Paiement</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Compte etudiant</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Dossier</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Inscription</th>
                        {onPreview ? <th className="px-4 py-3 text-left font-semibold text-slate-600">Action</th> : null}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {rows.map((enrollment) => (
                        <tr key={enrollment.id} className="transition hover:bg-slate-50/80">
                          <td className="px-4 py-4">
                            <div className="flex items-start gap-3">
                              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary-50)] text-[var(--admin-primary)] ring-1 ring-[var(--admin-primary-100)]">
                                <UserRound className="h-4 w-4" />
                              </span>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {enrollment.firstName} {enrollment.lastName}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">#{enrollment.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            <p>{enrollment.email}</p>
                            <p className="mt-1 text-xs text-slate-500">{enrollment.phone || '-'}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            <p>
                              <FormattedDate
                                date={enrollment.startDate}
                                options={{ dateStyle: 'short' } as Intl.DateTimeFormatOptions}
                              />
                            </p>
                            <p className="mt-1 text-xs text-slate-500">{enrollment.session?.location || '-'}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {formatCurrency(enrollment.paidAmount)} / {formatCurrency(enrollment.totalAmount)}
                            </p>
                            <div className="mt-2">
                              <AdminBadge tone={paymentStatusTone(enrollment.paymentStatus)}>
                                {paymentStatusLabel(enrollment.paymentStatus)}
                              </AdminBadge>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {enrollment.account ? (
                              <div className="space-y-2">
                                <AdminBadge tone={enrollment.account.tone}>{enrollment.account.label}</AdminBadge>
                                <p className="text-xs text-slate-500">{enrollment.account.username || 'Aucun identifiant'}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500">Etat indisponible</p>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <AdminBadge tone={enrollmentStatusTone(enrollment.status)}>
                              {enrollmentStatusLabel(enrollment.status)}
                            </AdminBadge>
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            <FormattedDate
                              date={enrollment.createdAt}
                              options={{ dateStyle: 'short', timeStyle: 'short' } as Intl.DateTimeFormatOptions}
                            />
                          </td>
                          {onPreview ? (
                            <td className="px-4 py-4">
                              <EnrollmentActionButton onClick={() => onPreview(enrollment)} />
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminPanel>
            )
          })}
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
        .map(([dateKey, rows]) => {
          const dateTitle = new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(new Date(dateKey))

          return (
            <AdminPanel key={dateKey}>
              <AdminPanelHeader
                eyebrow="Vue calendrier"
                title={dateTitle}
                description={`${rows.length} inscription(s) programmee(s) sur cette date.`}
                actions={
                  <AdminBadge tone="primary" className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {rows.length}
                  </AdminBadge>
                }
              />
              <div className="mt-6 space-y-3">
                {rows.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-950">
                          {enrollment.firstName} {enrollment.lastName}
                        </p>
                        <AdminBadge tone={paymentStatusTone(enrollment.paymentStatus)}>
                          {paymentStatusLabel(enrollment.paymentStatus)}
                        </AdminBadge>
                        <AdminBadge tone={enrollmentStatusTone(enrollment.status)}>
                          {enrollmentStatusLabel(enrollment.status)}
                        </AdminBadge>
                        {enrollment.account ? (
                          <AdminBadge tone={enrollment.account.tone}>{enrollment.account.label}</AdminBadge>
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-600">{enrollment.formation.title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{enrollment.email}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {enrollment.session?.location || 'Aucun lieu'}
                        </span>
                        <span>{formatCurrency(enrollment.paidAmount)} / {formatCurrency(enrollment.totalAmount)}</span>
                        {enrollment.account?.username ? <span>ID: {enrollment.account.username}</span> : null}
                      </div>
                    </div>
                    {onPreview ? <EnrollmentActionButton onClick={() => onPreview(enrollment)} /> : null}
                  </div>
                ))}
              </div>
            </AdminPanel>
          )
        })}
    </div>
  )
}
