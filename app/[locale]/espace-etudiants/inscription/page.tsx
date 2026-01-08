'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Formation {
  id: number
  title: string
  slug: string
  description: string
}

export default function InscriptionPage() {
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    formationId: '',
    startDate: '',
    notes: ''
  })

  useEffect(() => {
    fetch('/api/formations')
      .then(res => {
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des formations')
        }
        return res.json()
      })
      .then(data => {
        // S'assurer que data est un tableau
        if (Array.isArray(data)) {
          setFormations(data)
        } else {
          console.error('Réponse API invalide:', data)
          setFormations([])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur:', err)
        setError('Erreur lors du chargement des formations')
        setFormations([]) // S'assurer que formations reste un tableau
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      setSuccess(true)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        formationId: '',
        startDate: '',
        notes: ''
      })
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link 
        href="/fr/espace-etudiants" 
        className="text-cjblue hover:underline mb-4 inline-block"
      >
        ← Retour à l'espace étudiants
      </Link>

      <div className="mt-6">
        <h1 className="text-4xl font-bold text-cjblue mb-4">Inscription aux formations</h1>
        <p className="text-lg text-gray-600 mb-8">
          Inscrivez-vous à nos formations et programmes certifiants. 
          Remplissez le formulaire ci-dessous et nous vous contacterons pour confirmer votre inscription.
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✓ Inscription réussie !
            </p>
            <p className="text-green-700 mt-1">
              Votre demande d'inscription a été enregistrée. Nous vous contacterons bientôt pour confirmer votre inscription.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cjblue"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cjblue"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cjblue"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cjblue"
                placeholder="+243 XXX XXX XXX"
              />
            </div>
          </div>

          <div>
            <label htmlFor="formationId" className="block text-sm font-medium mb-2">
              Formation <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                Chargement des formations...
              </div>
            ) : (
              <select
                id="formationId"
                required
                value={formData.formationId}
                onChange={(e) => setFormData({ ...formData, formationId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cjblue"
              >
                <option value="">Sélectionnez une formation</option>
                {Array.isArray(formations) && formations.map((formation) => (
                  <option key={formation.id} value={formation.id}>
                    {formation.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-2">
              Date de début souhaitée <span className="text-red-500">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cjblue"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              Notes ou commentaires (optionnel)
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cjblue"
              placeholder="Informations supplémentaires, questions, etc."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi en cours...' : 'Soumettre l\'inscription'}
            </button>
            <Link
              href="/fr/formations"
              className="px-6 py-3 border border-cjblue text-cjblue rounded-lg hover:bg-cjblue hover:text-white transition-colors"
            >
              Voir les formations
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
