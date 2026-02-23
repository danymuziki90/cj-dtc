'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Clock, Users, DollarSign, ArrowRight, Filter } from 'lucide-react'
import { FormattedDate } from '@/components/FormattedDate'

interface TrainingSession {
  id: number
  formationId: number
  formation: {
    id: number
    title: string
    slug: string
    categorie: string
  }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  format: string
  maxParticipants: number
  currentParticipants: number
  price: number
  status: string
  description?: string
  imageUrl?: string
}

export default function ProgrammesPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'formation' | 'leadership'>('all')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        // Filtrer les sessions à venir et publiées
        const upcomingSessions = data.filter((session: TrainingSession) => {
          const sessionDate = new Date(session.startDate)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return sessionDate >= today && (session.status === 'ouverte' || session.status === 'complete')
        })
        setSessions(upcomingSessions)
      }
    } catch (error) {
      console.error('Erreur chargement sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true
    if (filter === 'formation') return session.formation.categorie?.toLowerCase().includes('formation') || session.formation.categorie?.toLowerCase().includes('développement')
    if (filter === 'leadership') return session.formation.categorie?.toLowerCase().includes('leadership') || session.formation.categorie?.toLowerCase().includes('management')
    return true
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getFormatColor = (format: string) => {
    switch (format.toLowerCase()) {
      case 'presentiel': return 'bg-blue-100 text-blue-800'
      case 'distanciel': return 'bg-green-100 text-green-800'
      case 'hybride': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cjblue"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-cjblue to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Nos Sessions</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Découvrez nos sessions de formation professionnelle et de leadership à venir
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">{sessions.length}</div>
                <div className="text-sm text-blue-100">Sessions disponibles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">
                  {sessions.reduce((acc, session) => acc + (session.maxParticipants - (session.currentParticipants || 0)), 0)}
                </div>
                <div className="text-sm text-blue-100">Places disponibles</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${filter === 'all'
              ? 'bg-cjblue text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            Toutes les sessions
          </button>
          <button
            onClick={() => setFilter('formation')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${filter === 'formation'
              ? 'bg-cjblue text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            Formation Professionnelle
          </button>
          <button
            onClick={() => setFilter('leadership')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${filter === 'leadership'
              ? 'bg-cjblue text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            Leadership & Management
          </button>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSessions.map((session) => {
              const availableSpots = session.maxParticipants - (session.currentParticipants || 0)
              const isFull = availableSpots <= 0
              const isUpcoming = new Date(session.startDate) > new Date()

              return (
                <div key={session.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Session Image */}
                  {session.imageUrl && (
                    <div className="relative h-48">
                      <Image
                        src={session.imageUrl}
                        alt={session.formation.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getFormatColor(session.format)}`}>
                          {session.format}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Formation Title */}
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {session.formation.title}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs bg-cjblue/10 text-cjblue rounded-full">
                        {session.formation.categorie}
                      </span>
                    </div>

                    {/* Session Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-cjblue" />
                        <FormattedDate date={session.startDate} /> - <FormattedDate date={session.endDate} />
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-cjblue" />
                        {session.startTime} - {session.endTime}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-cjblue" />
                        {session.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-cjblue" />
                        {availableSpots} places disponibles
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-cjblue">
                        {formatPrice(session.price)}
                      </div>
                      {isFull && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Complet
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {session.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {session.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        href={`/formations/${session.formation.slug}`}
                        className="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        En savoir plus
                      </Link>
                      <Link
                        href={`/formations/inscription?session=${session.id}`}
                        className={`flex-1 text-center px-4 py-2 rounded-lg transition-colors ${isFull
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-cjblue text-white hover:bg-blue-700'
                          }`}
                        onClick={(e) => isFull && e.preventDefault()}
                      >
                        {isFull ? 'Complet' : 'S\'inscrire'}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune session disponible
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "Il n'y a pas de sessions à venir pour le moment."
                : `Il n'y a pas de sessions ${filter === 'formation' ? 'de formation' : 'de leadership'} disponibles.`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="bg-cjblue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voir toutes les sessions
              </button>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-cjblue to-blue-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Prêt à développer vos compétences ?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Rejoignez nos sessions de formation et donnez un nouvel élan à votre carrière professionnelle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/formations"
              className="bg-white text-cjblue px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Explorer les formations
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
