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
  const [decisionReason, setDecisionReason] = useState('')
  const [targetStatusToConfirm, setTargetStatusToConfirm] = useState<string | null>(null)

  async function handleStatusChange(newStatus: string) {
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reason: decisionReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de la mise à jour du statut.')
      }

      setStatus(newStatus)
      setSuccess(true)
      setTargetStatusToConfirm(null)
      setDecisionReason('')
      onStatusChanged?.(newStatus)
      window.setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInitiateChange = (newStatus: string) => {
    setTargetStatusToConfirm(newStatus)
    setDecisionReason('')
    setError(null)
  }

  return (
    <div className="space-y-3 font-sans">
      <div className="flex flex-wrap items-center gap-2">
        <AdminBadge tone={getStatusTone(status)}>{getStatusLabel(status)}</AdminBadge>
        <span className="text-xs text-slate-500 font-bold">Email cible : {email}</span>
      </div>

      {success ? (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          Le statut a été mis à jour avec succès et un email de notification a été envoyé.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800">{error}</div>
      ) : null}

      {targetStatusToConfirm ? (
        <div className="rounded-[24px] border border-blue-100 bg-blue-50/50 p-4 space-y-3">
          <p className="text-xs font-black text-slate-900">
            Confirmations : Modifier le statut vers « <span className="text-blue-700 font-black">{getStatusLabel(targetStatusToConfirm)}</span> » ?
          </p>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            Un e-mail automatique utilisant le modèle de communication personnalisé sera transmis au candidat ({email}).
          </p>
          <div>
            <label className="mb-1 block text-[10px] font-bold text-slate-650 uppercase tracking-wide">Justification / Note de décision *</label>
            <textarea
              value={decisionReason}
              required
              onChange={(event) => setDecisionReason(event.target.value)}
              placeholder="Saisissez la justification ou le commentaire pour le candidat..."
              className={`${adminTextareaClassName} min-h-[80px] bg-white border-blue-200 text-xs font-semibold`}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setTargetStatusToConfirm(null)}
              disabled={submitting}
              className={adminSecondaryButtonClassName}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange(targetStatusToConfirm)}
              disabled={submitting || (['rejected', 'waitlist', 'cancelled'].includes(targetStatusToConfirm) && !decisionReason.trim())}
              className={targetStatusToConfirm === 'rejected' || targetStatusToConfirm === 'cancelled' ? adminDangerButtonClassName : adminPrimaryButtonClassName}
            >
              {submitting ? 'Traitement...' : 'Confirmer et notifier'}
            </button>
          </div>
        </div>
      ) : null}

      {!targetStatusToConfirm && (
        <div className="flex flex-wrap gap-2">
          {status !== 'accepted' && (
            <button
              type="button"
              onClick={() => handleInitiateChange('accepted')}
              className={adminPrimaryButtonClassName}
            >
              Accepter
            </button>
          )}
          {status !== 'rejected' && (
            <button
              type="button"
              onClick={() => handleInitiateChange('rejected')}
              className={adminDangerButtonClassName}
            >
              Rejeter
            </button>
          )}
          {status !== 'waitlist' && (
            <button
              type="button"
              onClick={() => handleInitiateChange('waitlist')}
              className="px-4 py-2 border border-amber-300 text-amber-800 rounded-xl hover:bg-amber-50 font-bold text-xs shadow-sm bg-white"
            >
              Placer sur liste d'attente
            </button>
          )}
          {status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => handleInitiateChange('cancelled')}
              className="px-4 py-2 border border-slate-300 text-slate-650 rounded-xl hover:bg-slate-50 font-bold text-xs shadow-sm bg-white"
            >
              Annuler l'inscription
            </button>
          )}
          {status !== 'pending' && (
            <button
              type="button"
              onClick={() => handleInitiateChange('pending')}
              className={adminSecondaryButtonClassName}
            >
              Repasser en attente
            </button>
          )}
        </div>
      )}
    </div>
  )
}
