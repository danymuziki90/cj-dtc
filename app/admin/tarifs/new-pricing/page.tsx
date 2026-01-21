'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Formation {
    id: number
    title: string
    slug: string
}

export default function NewPricingPage() {
    const router = useRouter()
    const [formations, setFormations] = useState<Formation[]>([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        formationId: '',
        basePrice: 0,
        reducedPrice: 0,
        enterprisePrice: 0,
        paymentOptions: [] as string[],
        maxInstallments: 3,
        installmentAmount: 0,
        active: true
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

            // Ici on ferait l'appel API pour créer la règle tarifaire
            console.log('Création de règle tarifaire:', formData)

            // Redirection vers la liste des tarifs
            router.push('/admin/tarifs')
        } catch (error) {
            console.error('Erreur lors de la création:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement
            setFormData(prev => ({
                ...prev,
                paymentOptions: checkbox.checked
                    ? [...prev.paymentOptions, checkbox.value]
                    : prev.paymentOptions.filter(opt => opt !== checkbox.value)
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseInt(value) || 0 : value
            }))
        }
    }

    const calculateInstallments = () => {
        if (formData.basePrice > 0 && formData.maxInstallments > 0) {
            const amount = Math.ceil(formData.basePrice / formData.maxInstallments)
            setFormData(prev => ({ ...prev, installmentAmount: amount }))
        }
    }

    useEffect(() => {
        calculateInstallments()
    }, [formData.basePrice, formData.maxInstallments])

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin/tarifs"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                    ← Retour aux tarifs
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">Créer une nouvelle règle tarifaire</h1>
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

                    {/* Prix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix de Base (FCFA) *
                            </label>
                            <input
                                type="number"
                                name="basePrice"
                                value={formData.basePrice}
                                onChange={handleChange}
                                min="0"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix Réduit (FCFA)
                            </label>
                            <input
                                type="number"
                                name="reducedPrice"
                                value={formData.reducedPrice}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix Entreprise (FCFA)
                            </label>
                            <input
                                type="number"
                                name="enterprisePrice"
                                value={formData.enterprisePrice}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Options de paiement */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Options de Paiement *
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="paymentOptions"
                                    value="integral"
                                    checked={formData.paymentOptions.includes('integral')}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Paiement intégral</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="paymentOptions"
                                    value="installments"
                                    checked={formData.paymentOptions.includes('installments')}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Paiement en plusieurs fois</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="paymentOptions"
                                    value="scholarship"
                                    checked={formData.paymentOptions.includes('scholarship')}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Bourses disponibles</span>
                            </label>
                        </div>
                    </div>

                    {/* Échéancier (si paiement en plusieurs fois) */}
                    {formData.paymentOptions.includes('installments') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre maximum d'échéances
                                </label>
                                <input
                                    type="number"
                                    name="maxInstallments"
                                    value={formData.maxInstallments}
                                    onChange={handleChange}
                                    min="2"
                                    max="12"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Montant par échéance (calculé)
                                </label>
                                <input
                                    type="number"
                                    value={formData.installmentAmount}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Calculé automatiquement sur {formData.maxInstallments} échéances
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Statut */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Activer cette règle tarifaire</span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Link
                            href="/admin/tarifs"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Création...' : 'Créer la règle tarifaire'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}