'use client'

import { useState } from 'react'

interface EnrollmentActionProps {
    enrollmentId: number
    currentStatus: string
    email: string
    formationTitle: string
    onStatusChanged?: (newStatus: string) => void
}

export default function EnrollmentStatusChanger({
    enrollmentId,
    currentStatus,
    email,
    formationTitle,
    onStatusChanged
}: EnrollmentActionProps) {
    const [status, setStatus] = useState(currentStatus)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [showReasonInput, setShowReasonInput] = useState(false)

    const handleStatusChange = async (newStatus: string) => {
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
                    reason: rejectionReason
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data?.error || 'Erreur lors de la mise à jour')
            }

            setStatus(newStatus)
            setSuccess(true)
            setShowReasonInput(false)
            setRejectionReason('')

            // Call callback to refresh parent with new status
            if (onStatusChanged) {
                onStatusChanged(newStatus)
            }

            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'accepted':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'cancelled':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (s: string) => {
        switch (s) {
            case 'pending':
                return 'En attente'
            case 'accepted':
                return 'Accepté'
            case 'rejected':
                return 'Rejeté'
            case 'cancelled':
                return 'Annulé'
            default:
                return s
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                </span>
            </div>

            {success && (
                <div className="p-2 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                    ✓ Statut mis à jour. Email envoyé à {email}.
                </div>
            )}

            {error && (
                <div className="p-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                    ✗ {error}
                </div>
            )}

            {showReasonInput && status !== 'rejected' && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded space-y-2">
                    <textarea
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="Raison du rejet (optionnel)"
                        className="w-full text-sm p-1 border border-yellow-300 rounded"
                        rows={2}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleStatusChange('rejected')}
                            disabled={submitting}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            {submitting ? 'Envoi...' : 'Confirmer rejet'}
                        </button>
                        <button
                            onClick={() => {
                                setShowReasonInput(false)
                                setRejectionReason('')
                            }}
                            disabled={submitting}
                            className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-1 flex-wrap">
                {status !== 'accepted' && (
                    <button
                        onClick={() => handleStatusChange('accepted')}
                        disabled={submitting}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {submitting && status !== 'rejected' ? 'Envoi...' : 'Accepter'}
                    </button>
                )}
                {status !== 'rejected' && (
                    <button
                        onClick={() => handleStatusChange('rejected')}
                        disabled={submitting}
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        Rejeter
                    </button>
                )}
                {status !== 'pending' && (
                    <button
                        onClick={() => handleStatusChange('pending')}
                        disabled={submitting}
                        className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                        En attente
                    </button>
                )}
            </div>
        </div>
    )
}
