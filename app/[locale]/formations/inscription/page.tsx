'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Users, DollarSign, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import { FormattedDate } from '@/components/FormattedDate'

interface TrainingSession {
    id: number
    formationId: number
    formation: {
        id: number
        title: string
        slug: string
        description: string
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
    prerequisites?: string
    objectives?: string
    imageUrl?: string
}

export default function InscriptionPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session')

    const [session, setSession] = useState<TrainingSession | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [onWaitlist, setOnWaitlist] = useState(false)

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        motivationLetter: '',
        acceptTerms: false
    })

    useEffect(() => {
        if (sessionId) {
            loadSession()
        } else {
            setLoading(false)
        }
    }, [sessionId])

    const loadSession = async () => {
        try {
            const response = await fetch(`/api/sessions/${sessionId}`)
            if (response.ok) {
                const data = await response.json()
                setSession(data)
            } else {
                alert('Session non trouvée')
                router.push('/formations')
            }
        } catch (error) {
            console.error('Erreur chargement session:', error)
            alert('Erreur lors du chargement de la session')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.acceptTerms) {
            alert('Veuillez accepter les conditions générales')
            return
        }

        if (!session) return

        setSubmitting(true)

        try {
            const enrollmentData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                formationId: session.formationId,
                sessionId: session.id,
                motivationLetter: formData.motivationLetter,
                startDate: session.startDate
            }

            const response = await fetch('/api/enrollments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(enrollmentData)
            })

            if (response.ok) {
                const result = await response.json()
                setOnWaitlist(result.onWaitlist || false)
                setSuccess(true)
            } else {
                const error = await response.json()
                alert(error.error || 'Erreur lors de l\'inscription')
            }
        } catch (error) {
            console.error('Erreur:', error)
            alert('Erreur lors de l\'inscription')
        } finally {
            setSubmitting(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cjblue"></div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        {onWaitlist ? (
                            <>
                                <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    Inscription en liste d'attente
                                </h1>
                                <p className="text-gray-600 mb-6">
                                    La session <strong>{session?.formation.title}</strong> est complète. Votre inscription a été enregistrée dans la liste d'attente.
                                </p>
                                <div className="space-y-4">
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-orange-900 mb-2">Vous serez notifié si :</h3>
                                        <ul className="text-orange-800 text-sm space-y-1">
                                            <li>• Une place se libère dans la session actuelle</li>
                                            <li>• Une nouvelle session est ouverte</li>
                                            <li>• Une date alternative devient disponible</li>
                                        </ul>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Un email de confirmation a été envoyé à <strong>{formData.email}</strong>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    Inscription réussie !
                                </h1>
                                <p className="text-gray-600 mb-6">
                                    Votre inscription à la formation <strong>{session?.formation.title}</strong> a été enregistrée.
                                    Vous recevrez un email de confirmation dans les plus brefs délais.
                                </p>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes :</h3>
                                        <ul className="text-blue-800 text-sm space-y-1">
                                            <li>• Vérification de votre dossier d'inscription</li>
                                            <li>• Confirmation de paiement si nécessaire</li>
                                            <li>• Réception des informations de connexion</li>
                                            <li>• Accès à la plateforme d'apprentissage</li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/formations"
                                className="bg-cjblue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Voir d'autres formations
                            </Link>
                            <Link
                                href="/"
                                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Retour à l'accueil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Session non trouvée
                    </h1>
                    <p className="text-gray-600 mb-6">
                        La session que vous recherchez n'existe pas ou n'est plus disponible.
                    </p>
                    <Link
                        href="/formations"
                        className="bg-cjblue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Voir les formations disponibles
                    </Link>
                </div>
            </div>
        )
    }

    const availableSpots = session.maxParticipants - (session.currentParticipants || 0)
    const isFull = availableSpots <= 0

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/formations/${session.formation.slug}`}
                        className="inline-flex items-center text-cjblue hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Retour à la formation
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Inscription à la formation
                    </h1>
                    <p className="text-gray-600">
                        Remplissez le formulaire ci-dessous pour vous inscrire à cette session
                    </p>
                </div>

                {/* Session Image */}
                {session.imageUrl && (
                    <div className="mb-8">
                        <img
                            src={session.imageUrl}
                            alt={`Session ${session.formation.title}`}
                            className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Session Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {session.formation.title}
                            </h2>

                            {/* Session Details */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-cjblue mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Dates</p>
                                        <p className="text-sm text-gray-600">
                                            <FormattedDate date={session.startDate} /> - <FormattedDate date={session.endDate} />
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-cjblue mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Horaires</p>
                                        <p className="text-sm text-gray-600">
                                            {session.startTime} - {session.endTime}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-cjblue mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Lieu</p>
                                        <p className="text-sm text-gray-600">{session.location}</p>
                                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                            {session.format}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-cjblue mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Places disponibles</p>
                                        <p className={`text-sm ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                                            {availableSpots} places restantes
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <DollarSign className="w-5 h-5 text-cjblue mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Prix</p>
                                        <p className="text-sm text-gray-600">{formatPrice(session.price)}</p>
                                    </div>
                                </div>
                            </div>

                            {isFull && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 text-sm">
                                        Cette session est complète. Vous pouvez vous inscrire sur liste d'attente.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Informations personnelles
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prénom *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Téléphone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lettre de motivation
                                    </label>
                                    <textarea
                                        name="motivationLetter"
                                        value={formData.motivationLetter}
                                        onChange={handleInputChange}
                                        rows={4}
                                        placeholder="Expliquez brièvement vos motivations pour suivre cette formation..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                    ></textarea>
                                </div>

                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1"
                                    />
                                    <div className="text-sm">
                                        <label className="text-gray-700">
                                            J'accepte les{' '}
                                            <Link href="/conditions-generales" className="text-cjblue hover:underline">
                                                conditions générales
                                            </Link>{' '}
                                            et la{' '}
                                            <Link href="/politique-confidentialite" className="text-cjblue hover:underline">
                                                politique de confidentialité
                                            </Link>
                                            *
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-6 border-t">
                                    <Link
                                        href={`/formations/${session.formation.slug}`}
                                        className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={submitting || isFull}
                                        className="px-6 py-3 bg-cjblue text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {submitting ? 'Inscription en cours...' : isFull ? 'Liste d\'attente' : 'S\'inscrire'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}