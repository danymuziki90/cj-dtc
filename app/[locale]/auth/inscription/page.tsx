'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

interface Formation {
  id: number
  title: string
  categorie: string
  description: string
  duree: string
  objectifs: string
  methodes: string
  certification: string
  statut: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  city: string
  country: string
  formationId: number | string
  motivationLetter: string
  documents: File[]
  paymentMethod: string
  acceptTerms: boolean
}

export default function StudentInscriptionPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    city: '',
    country: '',
    formationId: 0,
    motivationLetter: '',
    documents: [],
    paymentMethod: '',
    acceptTerms: false
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchFormations()
  }, [])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations')
      const data = await response.json()
      setFormations(data.filter((f: Formation) => f.statut === 'publie'))
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis'
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis'
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide'
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (!formData.formationId) newErrors.formationId = 'La formation est requise'
    if (!formData.motivationLetter.trim()) newErrors.motivationLetter = 'La lettre de motivation est requise'
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions' as any

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const submitData = new FormData()
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'documents') {
          submitData.append(key, value.toString())
        }
      })

      formData.documents.forEach((file, index) => {
        submitData.append(`documents[${index}]`, file)
      })

      const response = await fetch('/api/inscriptions', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          dateOfBirth: '',
          city: '',
          country: '',
          formationId: 0,
          motivationLetter: '',
          documents: [],
          paymentMethod: '',
          acceptTerms: false
        })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, documents: files }))
  }

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/auth/login')
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-green-50 rounded-xl p-8 text-center border border-green-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-900 mb-4">
            Inscription envoyée avec succès !
          </h1>
          <p className="text-green-700 mb-8">
            Votre demande d'inscription a été soumise et est en cours de traitement.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Header avec logout si connecté */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Inscription Étudiant
          </h1>
          <p className="text-gray-600">
            Rejoignez notre centre de formation
          </p>
        </div>
        
        {session && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Connecté: {session.user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Informations Personnelles */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            1. Informations Personnelles
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Choix de Formation */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            2. Choix de Formation
          </h2>

          <div>
            <label htmlFor="formationId" className="block text-sm font-medium text-gray-700 mb-2">
              Formation *
            </label>
            <select
              id="formationId"
              name="formationId"
              value={formData.formationId}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.formationId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value={0}>Sélectionnez une formation</option>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.title}
                </option>
              ))}
            </select>
            {errors.formationId && (
              <p className="mt-1 text-sm text-red-600">{errors.formationId}</p>
            )}
          </div>
        </div>

        {/* Lettre de Motivation */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            3. Lettre de Motivation
          </h2>

          <textarea
            id="motivationLetter"
            name="motivationLetter"
            value={formData.motivationLetter}
            onChange={handleInputChange}
            rows={6}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.motivationLetter ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Expliquez vos motivations..."
          />
          {errors.motivationLetter && (
            <p className="mt-1 text-sm text-red-600">{errors.motivationLetter}</p>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            4. Documents Requis
          </h2>

          <input
            type="file"
            id="documents"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-600">
            Carte d'identité, diplômes, CV (PDF, JPG, PNG - Max 5MB)
          </p>
        </div>

        {/* Bouton de soumission */}
        <div className="text-center">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Traitement...' : 'Soumettre ma demande d\'inscription'}
          </button>
        </div>
      </form>
    </div>
  )
}
