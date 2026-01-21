'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../../../../components/Breadcrumbs'

interface StudentProfile {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  enrollmentsCount: number
  certificatesCount: number
  totalFormations: number
}

export default function MonComptePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      // TODO: Récupérer le profil depuis l'API avec l'étudiant connecté
      // Pour l'instant, on simule
      const response = await fetch('/api/enrollments')
      const data = await response.json()
      if (data.length > 0) {
        const enrollment = data[0]
        setProfile({
          firstName: enrollment.firstName,
          lastName: enrollment.lastName,
          email: enrollment.email,
          phone: enrollment.phone,
          address: enrollment.address,
          enrollmentsCount: data.length,
          certificatesCount: 0,
          totalFormations: new Set(data.map((e: any) => e.formation.id)).size
        })
        setFormData({
          firstName: enrollment.firstName,
          lastName: enrollment.lastName,
          email: enrollment.email,
          phone: enrollment.phone || '',
          address: enrollment.address || ''
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Mettre à jour le profil via l'API
      alert('Profil mis à jour avec succès!')
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour du profil')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cjblue mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Aucun profil trouvé.</p>
          <Link href="/fr/espace-etudiants/inscription" className="text-cjblue hover:underline">
            S'inscrire à une formation
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[
        { label: 'Espace Étudiants', href: '/fr/espace-etudiants' },
        { label: 'Mon Compte' }
      ]} />

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-cjblue">Mon Compte</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-cjblue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editing ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-cjblue mb-2">{profile.enrollmentsCount}</div>
            <div className="text-sm text-gray-600">Inscriptions</div>
          </div>
          <div className="bg-white border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-cjblue mb-2">{profile.totalFormations}</div>
            <div className="text-sm text-gray-600">Formations</div>
          </div>
          <div className="bg-white border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-cjblue mb-2">{profile.certificatesCount}</div>
            <div className="text-sm text-gray-600">Certificats</div>
          </div>
        </div>

        {/* Formulaire de profil */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-cjblue mb-6">Informations Personnelles</h2>
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Adresse</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="bg-cjblue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prénom</p>
                  <p className="font-medium">{profile.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nom</p>
                  <p className="font-medium">{profile.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                  <p className="font-medium">{profile.phone || 'Non renseigné'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Adresse</p>
                  <p className="font-medium">{profile.address || 'Non renseignée'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liens rapides */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Link
            href="/fr/espace-etudiants/mes-formations"
            className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-cjblue mb-2">Mes Formations</h3>
            <p className="text-sm text-gray-600">Consultez vos formations suivies</p>
          </Link>
          <Link
            href="/fr/espace-etudiants/mes-certificats"
            className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-cjblue mb-2">Mes Certificats</h3>
            <p className="text-sm text-gray-600">Voir tous vos certificats</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
