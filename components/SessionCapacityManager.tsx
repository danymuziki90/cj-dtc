'use client'

import { useState, useEffect } from 'react'
import { FormattedDate } from './FormattedDate'

interface Session {
  id: number
  formationId: number
  formationTitle: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  format: 'presentiel' | 'distanciel' | 'hybride'
  maxParticipants: number
  currentParticipants: number
  price: number
  status: 'ouverte' | 'fermee' | 'complete' | 'annulee' | 'terminee'
  createdAt: string
  waitlist?: Array<{
    id: number
    email: string
    firstName: string
    lastName: string
    addedAt: string
  }>
}

interface SessionCapacityManagerProps {
  session: Session
  onUpdate?: () => void
}

export default function SessionCapacityManager({ session, onUpdate }: SessionCapacityManagerProps) {
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [waitlist, setWaitlist] = useState(session.waitlist || [])
  const [loading, setLoading] = useState(false)
  const availableSpots = session.maxParticipants - session.currentParticipants
  const isFull = availableSpots <= 0
  const fillPercentage = (session.currentParticipants / session.maxParticipants) * 100

  useEffect(() => {
    if (showWaitlist) {
      fetchWaitlist()
    }
  }, [showWaitlist, session.id])

  const fetchWaitlist = async () => {
    try {
      const response = await fetch(`/api/sessions/${session.id}/waitlist`)
      const data = await response.json()
      setWaitlist(data)
    } catch (error) {
      console.error('Erreur lors du chargement de la liste d\'attente:', error)
    }
  }

  const handleAddToWaitlist = async (enrollmentId: number) => {
    try {
      const response = await fetch(`/api/sessions/${session.id}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId })
      })

      if (response.ok) {
        alert('Ajouté à la liste d\'attente')
        fetchWaitlist()
        onUpdate?.()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error || 'Erreur lors de l\'ajout'}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'ajout')
    }
  }

  const handleRemoveFromWaitlist = async (waitlistId: number) => {
    try {
      const response = await fetch(`/api/sessions/${session.id}/waitlist/${waitlistId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Retiré de la liste d\'attente')
        fetchWaitlist()
        onUpdate?.()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error || 'Erreur lors de la suppression'}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handlePromoteFromWaitlist = async (waitlistId: number) => {
    try {
      const response = await fetch(`/api/sessions/${session.id}/waitlist/${waitlistId}/promote`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Promu depuis la liste d\'attente')
        fetchWaitlist()
        onUpdate?.()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error || 'Erreur lors de la promotion'}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la promotion')
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Capacité</h3>
        {isFull && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Session complète
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Participants: {session.currentParticipants}/{session.maxParticipants}</span>
          <span className={isFull ? 'text-red-600 font-semibold' : 'text-gray-600'}>
            {availableSpots} place{availableSpots > 1 ? 's' : ''} disponible{availableSpots > 1 ? 's' : ''}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              fillPercentage >= 100
                ? 'bg-red-500'
                : fillPercentage >= 80
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(fillPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {waitlist && waitlist.length > 0 && (
        <div className="mb-4">
            <button
            onClick={() => setShowWaitlist(!showWaitlist)}
            className="text-cjblue hover:underline text-sm font-medium"
          >
            Liste d'attente ({waitlist.length}) {showWaitlist ? '▼' : '▶'}
          </button>
          {showWaitlist && (
            <div className="mt-2 space-y-2">
              {waitlist.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item.firstName} {item.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{item.email}</p>
                    <p className="text-xs text-gray-500">
                      Ajouté le: <FormattedDate date={item.addedAt} />
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isFull && (
                      <button
                        onClick={() => handlePromoteFromWaitlist(item.id)}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Promouvoir
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveFromWaitlist(item.id)}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isFull && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Cette session est complète. Les nouvelles inscriptions seront automatiquement ajoutées à la liste d'attente.
          </p>
        </div>
      )}
    </div>
  )
}
