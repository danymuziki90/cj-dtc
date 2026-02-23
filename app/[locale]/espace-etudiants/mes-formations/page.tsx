'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../../../../components/Breadcrumbs'
import { FormattedDate } from '@/components/FormattedDate'

interface Enrollment {
  id: number
  status: string
  startDate: string
  paymentStatus: string
  totalAmount: number
  paidAmount: number
  formation: {
    id: number
    title: string
    slug: string
    description: string
  }
  session: {
    id: number
    startDate: string
    endDate: string
    location: string
    format: string
  } | null
}

export default function MesFormationsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    setLoading(true)
    try {
      // TODO: Filtrer par email de l'étudiant connecté
      const response = await fetch('/api/enrollments')
      const data = await response.json()
      setEnrollments(data)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-purple-100 text-purple-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      accepted: 'Accepté',
      confirmed: 'Confirmé',
      rejected: 'Rejeté',
      cancelled: 'Annulé',
      completed: 'Terminé'
    }
    return labels[status] || status
  }

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      unpaid: 'Non payé',
      partial: 'Partiel',
      paid: 'Payé'
    }
    return labels[status] || status
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[
        { label: 'Espace Étudiants', href: '/fr/espace-etudiants' },
        { label: 'Mes Formations' }
      ]} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-cjblue mb-8">Mes Formations</h1>
        <p className="text-lg text-gray-700 mb-8">
          Consultez toutes vos formations : inscriptions en cours, formations suivies et formations terminées.
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cjblue mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de vos formations...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Vous n'êtes inscrit à aucune formation pour le moment.</p>
            <Link href="/fr/espace-etudiants/inscription" className="text-cjblue hover:underline">
              S'inscrire à une formation
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-cjblue mb-2">
                      {enrollment.formation.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {enrollment.formation.description}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(enrollment.status)}`}>
                      {getStatusLabel(enrollment.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(enrollment.paymentStatus)}`}>
                      {getPaymentStatusLabel(enrollment.paymentStatus)}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date de début</p>
                    <p className="font-medium">
                      <FormattedDate date={enrollment.startDate} />
                    </p>
                  </div>
                  {enrollment.session && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Session</p>
                        <p className="font-medium">
                          <FormattedDate date={enrollment.session.startDate} /> - <FormattedDate date={enrollment.session.endDate} />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lieu</p>
                        <p className="font-medium">{enrollment.session.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Format</p>
                        <p className="font-medium capitalize">{enrollment.session.format}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Paiement</p>
                    <p className="font-medium">
                      {formatCurrency(enrollment.paidAmount)} / {formatCurrency(enrollment.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Link
                    href={`/fr/formations/${enrollment.formation.slug}`}
                    className="text-cjblue hover:underline text-sm"
                  >
                    Voir les détails
                  </Link>
                  <Link
                    href={`/fr/espace-etudiants/supports?formationId=${enrollment.formation.id}`}
                    className="text-cjblue hover:underline text-sm"
                  >
                    Supports de cours
                  </Link>
                  {enrollment.status === 'completed' && (
                    <Link
                      href="/fr/espace-etudiants/resultats"
                      className="text-cjblue hover:underline text-sm"
                    >
                      Voir les résultats
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
