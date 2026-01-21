'use client'

import { useState } from 'react'
import EnrollmentStatusChanger from './EnrollmentStatusChanger'

interface Enrollment {
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
  formation: {
    id: number
    title: string
    slug: string
  }
}

interface EnrollmentPreviewModalProps {
  enrollment: Enrollment
  onClose: () => void
  onStatusChange: () => void
}

export default function EnrollmentPreviewModal({
  enrollment,
  onClose,
  onStatusChange
}: EnrollmentPreviewModalProps) {
  const [internalComment, setInternalComment] = useState(enrollment.notes || '')
  const [savingComment, setSavingComment] = useState(false)

  const handleSaveComment = async () => {
    setSavingComment(true)
    try {
      const response = await fetch(`/api/enrollments/${enrollment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: internalComment })
      })

      if (response.ok) {
        alert('Commentaire enregistré!')
      } else {
        alert('Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'enregistrement')
    } finally {
      setSavingComment(false)
    }
  }

  const downloadMotivationLetter = () => {
    if (!enrollment.motivationLetter) return
    const link = document.createElement('a')
    link.href = enrollment.motivationLetter
    link.download = `${enrollment.firstName}_${enrollment.lastName}_motivation.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-cjblue">
            Prévisualisation - {enrollment.firstName} {enrollment.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Informations Personnelles</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-medium">{enrollment.firstName} {enrollment.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{enrollment.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium">{enrollment.phone || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Adresse</p>
                <p className="font-medium">{enrollment.address || 'Non renseignée'}</p>
              </div>
            </div>
          </div>

          {/* Formation */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Formation</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Formation</p>
                <p className="font-medium">{enrollment.formation.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de début souhaitée</p>
                <p className="font-medium">
                  {new Date(enrollment.startDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Paiement</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <p className="font-medium capitalize">{enrollment.paymentStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Montant total</p>
                <p className="font-medium">{formatCurrency(enrollment.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Montant payé</p>
                <p className="font-medium">{formatCurrency(enrollment.paidAmount)}</p>
              </div>
            </div>
          </div>

          {/* Lettre de motivation */}
          {enrollment.motivationLetter && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Lettre de Motivation</h3>
              <button
                onClick={downloadMotivationLetter}
                className="bg-cjblue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📄 Télécharger la lettre
              </button>
            </div>
          )}

          {/* Commentaires internes */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Commentaires Internes</h3>
            <textarea
              value={internalComment}
              onChange={(e) => setInternalComment(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              rows={4}
              placeholder="Ajoutez des notes internes sur cette inscription..."
            />
            <button
              onClick={handleSaveComment}
              disabled={savingComment}
              className="mt-2 bg-cjblue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {savingComment ? 'Enregistrement...' : 'Enregistrer le commentaire'}
            </button>
          </div>

          {/* Historique */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Historique</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Inscription créée:</strong>{' '}
                {new Date(enrollment.createdAt).toLocaleString('fr-FR')}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Statut actuel:</strong> {enrollment.status}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-3">Actions</h3>
            <EnrollmentStatusChanger
              enrollmentId={enrollment.id}
              currentStatus={enrollment.status}
              email={enrollment.email}
              formationTitle={enrollment.formation.title}
              onStatusChanged={(newStatus) => {
                onStatusChange()
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
