'use client'

import { useState } from 'react'

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
}

interface SessionCalendarProps {
  sessions: Session[]
  onSessionClick?: (session: Session) => void
}

export default function SessionCalendar({ sessions, onSessionClick }: SessionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const isSessionOnDate = (session: Session, date: Date) => {
    const sessionStart = new Date(session.startDate)
    const sessionEnd = new Date(session.endDate)
    return date >= sessionStart && date <= sessionEnd
  }

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => isSessionOnDate(session, date))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ouverte: 'bg-green-100 border-green-300 text-green-800',
      fermee: 'bg-red-100 border-red-300 text-red-800',
      complete: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      annulee: 'bg-gray-100 border-gray-300 text-gray-800',
      terminee: 'bg-blue-100 border-blue-300 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 border-gray-300'
  }

  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  if (viewMode === 'list') {
    return (
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Vue Liste</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className="px-3 py-1 bg-cjblue text-white rounded text-sm"
            >
              Calendrier
            </button>
            <button
              onClick={() => setViewMode('week')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
            >
              Semaine
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSessionClick?.(session)}
              className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{session.formationTitle}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(session.startDate).toLocaleDateString('fr-FR')} - {new Date(session.endDate).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-500">{session.location}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {session.currentParticipants}/{session.maxParticipants}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (viewMode === 'week') {
    const today = new Date()
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - today.getDay())
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      return date
    })

    return (
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Vue Semaine</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className="px-3 py-1 bg-cjblue text-white rounded text-sm"
            >
              Mois
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
            >
              Liste
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const daySessions = getSessionsForDate(date)
            return (
              <div key={index} className="border rounded p-2 min-h-[100px]">
                <div className="text-sm font-semibold mb-2">
                  {days[date.getDay()]} {date.getDate()}
                </div>
                <div className="space-y-1">
                  {daySessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => onSessionClick?.(session)}
                      className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(session.status)}`}
                      title={session.formationTitle}
                    >
                      {session.formationTitle.substring(0, 20)}...
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold">
            {months[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            →
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('week')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
          >
            Semaine
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
          >
            Liste
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-2">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-20"></div>
        ))}
        {daysArray.map((day) => {
          const date = new Date(currentYear, currentMonth, day)
          const daySessions = getSessionsForDate(date)
          const isToday = date.toDateString() === new Date().toDateString()

          return (
            <div
              key={day}
              className={`border rounded p-1 min-h-[80px] ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                {day}
              </div>
              <div className="space-y-1">
                {daySessions.slice(0, 2).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSessionClick?.(session)}
                    className={`text-xs p-1 rounded cursor-pointer truncate ${getStatusColor(session.status)}`}
                    title={session.formationTitle}
                  >
                    {session.formationTitle.substring(0, 15)}...
                  </div>
                ))}
                {daySessions.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{daySessions.length - 2} autres
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
