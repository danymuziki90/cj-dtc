'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Formation {
    id: number
    title: string
    slug: string
}

export default function NewSessionPage() {
    const router = useRouter()
    const [formations, setFormations] = useState<Formation[]>([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        formationId: '',
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '17:00',
        location: '',
        format: 'presentiel' as 'presentiel' | 'distanciel' | 'hybride',
        maxParticipants: 25,
        price: 0,
        description: '',
        prerequisites: '',
        objectives: ''
    })

    // Mock formations data
    const mockFormations: Formation[] = [
        { id: 1, title: 'Management des Ressources Humaines (MRH)', slug: 'mrh' },
        { id: 2, title: 'IOP – Insertion & Orientation Professionnelle', slug: 'iop' },
        { id: 3, title: 'Leadership & Intelligence Émotionnelle', slug: 'leadership-ei' },
        { id: 4, title: 'CJ Master System', slug: 'master-system' },
        { id: 5, title: 'CJ Family Business – Entrepreneuriat & Business', slug: 'family-business' }
    ]

    useEffect(() => {
        // Simulation du chargement des formations
        setTimeout(() => {
            setFormations(mockFormations)
        }, 500)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Simulation de l'API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Ici on ferait l'appel API pour créer la session
            console.log('Création de session:', formData)

            // Redirection vers la liste des sessions
            router.push('/admin/sessions')
        } catch (error) {
            console.error('Erreur lors de la création:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }))
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin/sessions"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                    ← Retour aux sessions
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">Créer une nouvelle session</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Formation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Formation *
                        </label>
                        <select
                            name="formationId"
                            value={formData.formationId}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sélectionner une formation</option>
                            {formations.map(formation => (
                                <option key={formation.id} value={formation.id}>
                                    {formation.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dates et horaires */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de début *
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de fin *
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Heure de début *
                            </label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Heure de fin *
                            </label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Format et lieu */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Format *
                            </label>
                            <select
                                name="format"
                                value={formData.format}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="presentiel">Présentiel</option>
                                <option value="distanciel">Distanciel</option>
                                <option value="hybride">Hybride</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lieu *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Ex: Kinshasa, RDC ou En ligne"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Participants et prix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre maximum de participants *
                            </label>
                            <input
                                type="number"
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                                min="1"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix (USD) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description de la session
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Description spécifique de cette session..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Prérequis */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prérequis
                        </label>
                        <textarea
                            name="prerequisites"
                            value={formData.prerequisites}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Prérequis pour participer à cette session..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Objectifs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Objectifs spécifiques
                        </label>
                        <textarea
                            name="objectives"
                            value={formData.objectives}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Objectifs spécifiques de cette session..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Link
                            href="/admin/sessions"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Création...' : 'Créer la session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}