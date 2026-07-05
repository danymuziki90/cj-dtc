'use client'

import { useState } from 'react'
import { AdminBadge, adminDangerButtonClassName, adminPrimaryButtonClassName, adminSecondaryButtonClassName, adminTextareaClassName } from '@/components/admin-portal/ui'

interface EnrollmentActionProps {
  enrollmentId: number
  currentStatus: string
  email: string
  formationTitle: string
  onStatusChanged?: (newStatus: string) => void
}

function getStatusTone(status: string): 'warning' | 'success' | 'danger' | 'neutral' | 'primary' {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'accepted':
      return 'success'
    case 'confirmed':
      return 'primary'
    case 'rejected':
      return 'danger'
    default:
      return 'neutral'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'En attente'
    case 'accepted':
      return 'Accepte'
    case 'confirmed':
      return 'Confirme'
    case 'rejected':
      return 'Rejete'
    case 'cancelled':
      return 'Annule'
    default:
      return status
  }
}

export default function EnrollmentStatusChanger({
  enrollmentId,
  currentStatus,
  email,
  formationTitle,
  onStatusChanged,
}: EnrollmentActionProps) {
  const [status, setStatus] = useState(currentStatus)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showReasonInput, setShowReasonInput] = useState(false)

  async function handleStatusChange(newStatus: string) {
    if (newStatus === 'rejected' && !showReasonInput) {
      setShowReasonInput(true)
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reason: rejectionReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de la mise a jour du statut.')
      }

      setStatus(newStatus)
      setSuccess(true)
      setShowReasonInput(false)
      setRejectionReason('')
      onStatusChanged?.(newStatus)
      window.setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <AdminBadge tone={getStatusTone(status)}>{getStatusLabel(status)}</AdminBadge>
        <span className="text-xs text-slate-500">Email cible: {email}</span>
      </div>

      {success ? (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Statut mis a jour. Un email a ete prepare pour {email} au sujet de {formationTitle}.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}

      {showReasonInput && status !== 'rejected' ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50/70 px-4 py-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Raison du rejet</label>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Ajoutez un contexte clair pour l'equipe et pour le candidat."
            className={`${adminTextareaClassName} min-h-[96px] border-rose-200 bg-white`}
            rows={3}
          />
          <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setShowReasonInput(false)
                setRejectionReason('')
              }}
              disabled={submitting}
              className={adminSecondaryButtonClassName}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('rejected')}
              disabled={submitting}
              className={adminDangerButtonClassName}
            >
              {submitting ? 'Envoi...' : 'Confirmer le rejet'}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {status !== 'accepted' ? (
          <button
            type="button"
            onClick={() => handleStatusChange('accepted')}
            disabled={submitting}
            className={adminPrimaryButtonClassName}
          >
            {submitting ? 'Envoi...' : 'Accepter'}
          </button>
        ) : null}
        {status !== 'rejected' ? (
          <button
            type="button"
            onClick={() => handleStatusChange('rejected')}
            disabled={submitting}
            className={adminDangerButtonClassName}
          >
            Rejeter
          </button>
        ) : null}
        {status !== 'pending' ? (
          <button
            type="button"
            onClick={() => handleStatusChange('pending')}
            disabled={submitting}
            className={adminSecondaryButtonClassName}
          >
            Repasser en attente
          </button>
        ) : null}
      </div>
    </div>
  )
}
