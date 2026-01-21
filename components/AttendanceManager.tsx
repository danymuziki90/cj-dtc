'use client'

import { useState } from 'react'

interface Participant {
  id: number
  enrollmentId: number
  firstName: string
  lastName: string
  email: string
  attendance?: {
    date: string
    status: 'present' | 'absent' | 'late' | 'excused'
    notes?: string
  }[]
}

interface AttendanceManagerProps {
  sessionId: number
  participants: Participant[]
  sessionDates: string[]
  onUpdate?: () => void
}

export default function AttendanceManager({
  sessionId,
  participants,
  sessionDates,
  onUpdate
}: AttendanceManagerProps) {
  const [selectedDate, setSelectedDate] = useState(sessionDates[0] || '')
  const [attendanceData, setAttendanceData] = useState<Record<number, string>>({})

  const handleAttendanceChange = (participantId: number, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [participantId]: status
    }))
  }

  const handleSaveAttendance = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          attendance: Object.entries(attendanceData).map(([participantId, status]) => ({
            participantId: parseInt(participantId),
            status
          }))
        })
      })

      if (response.ok) {
        alert('Présences enregistrées!')
        setAttendanceData({})
        onUpdate?.()
      } else {
        alert('Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'enregistrement')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✅'
      case 'absent': return '❌'
      case 'late': return '⏰'
      case 'excused': return '📝'
      default: return '○'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Présent'
      case 'absent': return 'Absent'
      case 'late': return 'En retard'
      case 'excused': return 'Excusé'
      default: return 'Non renseigné'
    }
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Gestion des Présences</h3>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          {sessionDates.map((date) => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString('fr-FR')}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 mb-4">
        {participants.map((participant) => {
          const currentStatus = attendanceData[participant.id] || 
            participant.attendance?.find(a => a.date === selectedDate)?.status || 
            ''

          return (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {participant.firstName} {participant.lastName}
                </p>
                <p className="text-sm text-gray-600">{participant.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getStatusIcon(currentStatus)}</span>
                <select
                  value={currentStatus}
                  onChange={(e) => handleAttendanceChange(participant.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="">Sélectionner</option>
                  <option value="present">Présent</option>
                  <option value="absent">Absent</option>
                  <option value="late">En retard</option>
                  <option value="excused">Excusé</option>
                </select>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          <p>Légende:</p>
          <div className="flex gap-4 mt-1">
            <span>✅ Présent</span>
            <span>❌ Absent</span>
            <span>⏰ En retard</span>
            <span>📝 Excusé</span>
          </div>
        </div>
        <button
          onClick={handleSaveAttendance}
          className="bg-cjblue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Enregistrer les présences
        </button>
      </div>
    </div>
  )
}
