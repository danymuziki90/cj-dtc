'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../../../../components/Breadcrumbs'

interface Session {
  id: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  format: string
  status: string
  formation: {
    id: number
    title: string
    slug: string
  }
}

export default function CalendrierPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchSessions()
  }, [selectedMonth, selectedYear])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sessions')
      const data = await response.json()
      // Filtrer par mois et année
      const filtered = data.filter((session: Session) => {
        const sessionDate = new Date(session.startDate)
        return sessionDate.getMonth() === selectedMonth && sessionDate.getFullYear() === selectedYear
      })
      setSessions(filtered)
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      ouverte: 'bg-green-100 text-green-800',
      fermee: 'bg-gray-100 text-gray-800',
      complete: 'bg-blue-100 text-blue-800',
      annulee: 'bg-red-100 text-red-800',
      terminee: 'bg-purple-100 text-purple-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ouverte: 'Ouverte',
      fermee: 'Fermée',
      complete: 'Complète',
      annulee: 'Annulée',
      terminee: 'Terminée'
    }
    return labels[status] || status
  }

  const getFormatLabel = (format: string) => {
    const labels: Record<string, string> = {
      presentiel: 'Présentiel',
      distanciel: 'Distanciel',
      hybride: 'Hybride'
    }
    return labels[format] || format
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[
        { label: 'Espace Étudiants', href: '/fr/espace-etudiants' },
        { label: 'Calendrier académique' }
      ]} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-cjblue mb-8">Calendrier Académique</h1>
        <p className="text-lg text-gray-700 mb-8">
          Consultez les dates importantes, échéances et planning de vos formations.
        </p>

        {/* Sélecteur de mois */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Mois:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border rounded-lg px-4 py-2"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <label className="text-sm font-medium">Année:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border rounded-lg px-4 py-2"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cjblue mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du calendrier...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              Aucune session prévue pour {months[selectedMonth]} {selectedYear}.
            </p>
            <Link href="/fr/espace-etudiants" className="text-cjblue hover:underline">
              Retour à l'espace étudiant
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-cjblue mb-2">
                      {session.formation.title}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Date de début</p>
                        <p className="font-medium">
                          {new Date(session.startDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Date de fin</p>
                        <p className="font-medium">
                          {new Date(session.endDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Horaires</p>
                        <p className="font-medium">{session.startTime} - {session.endTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Lieu</p>
                        <p className="font-medium">{session.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
                      {getStatusLabel(session.status)}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {getFormatLabel(session.format)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Link
                    href={`/fr/formations/${session.formation.slug}`}
                    className="text-cjblue hover:underline text-sm"
                  >
                    Voir la formation
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
