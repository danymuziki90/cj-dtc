'use client'

import { useState, useEffect } from 'react'

interface Instructor {
    id: number
    firstName: string
    lastName: string
    email: string
    phone?: string
    bio?: string
    expertise?: string
    experience?: string
    photoUrl?: string
    status: string
    sessions: Array<{
        session: {
            id: number
            startDate: string
            location: string
            formation: {
                title: string
            }
        }
    }>
}

export default function InstructorsPage() {
    const [instructors, setInstructors] = useState<Instructor[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        expertise: '',
        experience: '',
        photoUrl: ''
    })

    const fetchInstructors = async () => {
        try {
            const response = await fetch('/api/instructors')
            const data = await response.json()
            setInstructors(data)
        } catch (error) {
            console.error('Erreur lors du chargement des instructeurs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInstructors()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingInstructor ? `/api/instructors/${editingInstructor.id}` : '/api/instructors'
            const method = editingInstructor ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                fetchInstructors()
                setShowForm(false)
                setEditingInstructor(null)
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    bio: '',
                    expertise: '',
                    experience: '',
                    photoUrl: ''
                })
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error)
        }
    }

    const handleEdit = (instructor: Instructor) => {
        setEditingInstructor(instructor)
        setFormData({
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            email: instructor.email,
            phone: instructor.phone || '',
            bio: instructor.bio || '',
            expertise: instructor.expertise || '',
            experience: instructor.experience || '',
            photoUrl: instructor.photoUrl || ''
        })
        setShowForm(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet instructeur ?')) return

        try {
            const response = await fetch(`/api/instructors/${id}`, { method: 'DELETE' })
            if (response.ok) {
                fetchInstructors()
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
        }
    }

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
        try {
            const response = await fetch(`/api/instructors/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (response.ok) {
                fetchInstructors()
            }
        } catch (error) {
            console.error('Erreur lors de la modification du statut:', error)
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Formateurs</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    ➕ Ajouter un formateur
                </button>
            </div>

            {/* Formulaire */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingInstructor ? 'Modifier le formateur' : 'Nouveau formateur'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prénom *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Domaine d'expertise
                            </label>
                            <input
                                type="text"
                                value={formData.expertise}
                                onChange={(e) => setFormData(prev => ({ ...prev, expertise: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ex: Management, Informatique, Ressources Humaines..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Années d'expérience
                            </label>
                            <input
                                type="text"
                                value={formData.experience}
                                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ex: 5 ans, 10+ ans..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Biographie
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Courte biographie du formateur..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingInstructor(null)
                                    setFormData({
                                        firstName: '',
                                        lastName: '',
                                        email: '',
                                        phone: '',
                                        bio: '',
                                        expertise: '',
                                        experience: '',
                                        photoUrl: ''
                                    })
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                {editingInstructor ? 'Modifier' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des instructeurs */}
            <div className="bg-white rounded-lg shadow border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Formateurs ({instructors.length})
                    </h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {instructors.map((instructor) => (
                        <div key={instructor.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {instructor.firstName} {instructor.lastName}
                                        </h3>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${instructor.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {instructor.status === 'active' ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>

                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Email:</span> {instructor.email}
                                        </div>
                                        {instructor.phone && (
                                            <div>
                                                <span className="font-medium">Téléphone:</span> {instructor.phone}
                                            </div>
                                        )}
                                        {instructor.expertise && (
                                            <div>
                                                <span className="font-medium">Expertise:</span> {instructor.expertise}
                                            </div>
                                        )}
                                        {instructor.experience && (
                                            <div>
                                                <span className="font-medium">Expérience:</span> {instructor.experience}
                                            </div>
                                        )}
                                    </div>

                                    {instructor.bio && (
                                        <p className="mt-2 text-sm text-gray-600">{instructor.bio}</p>
                                    )}

                                    {instructor.sessions.length > 0 && (
                                        <div className="mt-3">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Sessions récentes:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {instructor.sessions.slice(0, 3).map((sessionInstructor) => (
                                                    <span
                                                        key={sessionInstructor.session.id}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {sessionInstructor.session.formation.title} - {new Date(sessionInstructor.session.startDate).toLocaleDateString('fr-FR')}
                                                    </span>
                                                ))}
                                                {instructor.sessions.length > 3 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{instructor.sessions.length - 3} autres
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => toggleStatus(instructor.id, instructor.status)}
                                        className={`px-3 py-1 text-xs font-medium rounded ${instructor.status === 'active'
                                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                                            }`}
                                    >
                                        {instructor.status === 'active' ? 'Désactiver' : 'Activer'}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(instructor)}
                                        className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(instructor.id)}
                                        className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}