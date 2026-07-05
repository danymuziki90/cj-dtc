'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Formation {
  id: number
  title: string
  description: string
  duree: string
  modules: string
  methodes: string
  certification: string
  categorie: string
  imageUrl?: string
}

interface InscriptionData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  city: string
  country: string
  formationId: number | string
  niveau: string
  motivation: string
  documents: File[]
}

export default function InscriptionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<InscriptionData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    formationId: 0,
    niveau: '',
    motivation: '',
    documents: []
  })
  const [errors, setErrors] = useState<Partial<InscriptionData>>({})

  useEffect(() => {
    fetchFormations()
  }, [])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations')
      const data = await response.json()
      setFormations(data)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof InscriptionData]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof InscriptionData]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }))
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<InscriptionData> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis'
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis'
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La date de naissance est requise'
    if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise'
    if (!formData.city.trim()) newErrors.city = 'La ville est requise'
    if (!formData.country.trim()) newErrors.country = 'Le pays est requis'
    if (!formData.formationId) newErrors.formationId = 'La formation est requise'
    if (!formData.niveau.trim()) newErrors.niveau = 'Le niveau est requis'
    if (!formData.motivation.trim()) newErrors.motivation = 'La motivation est requise'
    if (formData.documents.length === 0) newErrors.documents = 'Au moins un document est requis' as any

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const formDataToSubmit = new FormData()
      
      // Ajouter toutes les données du formulaire
      Object.keys(formData).forEach(key => {
        if (key === 'documents') {
          formDataToSubmit.append('documents', JSON.stringify(formData[key]))
        } else {
          formDataToSubmit.append(key, String(formData[key as keyof InscriptionData]))
        }
      })

      // Ajouter les fichiers
      formData.documents.forEach((file, index) => {
        formDataToSubmit.append(`document_${index}`, file)
      })

      const response = await fetch('/api/inscriptions', {
        method: 'POST',
        body: formDataToSubmit
      })

      if (response.ok) {
        const result = await response.json()
        // Rediriger vers la page de confirmation
        router.push('/student/inscription/success')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'inscription')
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      alert('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedFormation = formations.find(f => f.id === formData.formationId)

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cjblue"></div>
          <p className="mt-4 text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Inscription en ligne
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Rejoignez notre communauté et commencez votre parcours professionnel
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full text-sm font-bold">
            1
          </div>
          <div className="flex-1 h-1 bg-gray-200 rounded-full"></div>
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 text-white rounded-full text-sm font-bold">
            2
          </div>
          <div className="flex-1 h-1 bg-gray-200 rounded-full"></div>
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 text-white rounded-full text-sm font-bold">
            3
          </div>
          <div className="flex-1 h-1 bg-gray-200 rounded-full"></div>
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 text-white rounded-full text-sm font-bold">
            4
          </div>
          <div className="flex-1 h-1 bg-gray-200 rounded-full"></div>
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 text-white rounded-full text-sm font-bold">
            5
          </div>
        </div>
        <div className="flex justify-center space-x-4 text-xs sm:text-sm text-gray-600">
          <span>Informations</span>
          <span>Documents</span>
          <span>Formation</span>
          <span>Validation</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Informations Personnelles */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
          
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
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Entrez votre prénom"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
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
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Entrez votre nom"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
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
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="votre.email@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
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
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+243 XXX XXX XXX"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date de naissance *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Rue Example"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Kinshasa"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Pays *
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.country ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="République Démocratique du Congo"
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>
        </div>

        {/* Choix de la formation */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Choix de la formation</h2>
          
          <div className="mb-6">
            <label htmlFor="formationId" className="block text-sm font-medium text-gray-700 mb-2">
              Formation *
            </label>
            <select
              id="formationId"
              name="formationId"
              value={formData.formationId}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.formationId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionnez une formation</option>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.title} - {formation.categorie}
                </option>
              ))}
            </select>
            {errors.formationId && (
              <p className="text-red-500 text-xs mt-1">{errors.formationId}</p>
            )}
          </div>

          {selectedFormation && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">{selectedFormation.title}</h3>
              <p className="text-sm text-blue-700 mb-2">{selectedFormation.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Durée:</span>
                  <span className="text-gray-900">{selectedFormation.duree}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Modules:</span>
                  <span className="text-gray-900">{selectedFormation.modules}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Certification:</span>
                  <span className="text-gray-900">{selectedFormation.certification}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 mb-2">
              Niveau *
            </label>
            <select
              id="niveau"
              name="niveau"
              value={formData.niveau}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.niveau ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionnez un niveau</option>
              <option value="débutant">Débutant</option>
              <option value="intermédiaire">Intermédiaire</option>
              <option value="avancé">Avancé</option>
            </select>
            {errors.niveau && (
              <p className="text-red-500 text-xs mt-1">{errors.niveau}</p>
            )}
          </div>
        </div>

        {/* Motivation */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Motivation</h2>
          <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
            Pourquoi souhaitez-vous rejoindre cette formation ? *
          </label>
          <textarea
            id="motivation"
            name="motivation"
            value={formData.motivation}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.motivation ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Explique vos objectifs et motivations..."
          />
          {errors.motivation && (
            <p className="text-red-500 text-xs mt-1">{errors.motivation}</p>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Documents requis</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <span className="text-3xl mb-2">📄</span>
                <p className="text-sm text-gray-600 mb-2">
                  Cliquez pour ajouter vos documents
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="documents-upload"
                />
                <label
                  htmlFor="documents-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-8 0M4 12a8 8 0 018 0m-8-8v8m0 0l8 8" />
                  </svg>
                  <span className="text-sm font-medium">
                    Ajouter des fichiers
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              {formData.documents.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 text-center">
              Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 5MB par fichier)
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 sm:px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H2a8 8 0 0 016 0z"></path>
                </svg>
                Envoi...
              </span>
            ) : (
              'Soumettre l\'inscription'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
