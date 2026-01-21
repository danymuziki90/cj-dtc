'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Formation {
    id: number
    title: string
    slug: string
}

export default function NewPromoPage() {
    const router = useRouter()
    const [formations, setFormations] = useState<Formation[]>([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: 0,
        validFrom: '',
        validUntil: '',
        maxUses: 0,
        applicableFormations: [] as number[],
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
            // Validation
            if (formData.discountValue <= 0) {
                alert('La valeur de réduction doit être supérieure à 0')
                return
            }

            if (formData.discountType === 'percentage' && formData.discountValue > 100) {
                alert('La réduction en pourcentage ne peut pas dépasser 100%')
                return
            }

            // Simulation de l'API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Ici on ferait l'appel API pour créer le code promo
            console.log('Création de code promo:', formData)

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
            const formationId = parseInt(checkbox.value)
            setFormData(prev => ({
                ...prev,
                applicableFormations: checkbox.checked
                    ? [...prev.applicableFormations, formationId]
                    : prev.applicableFormations.filter(id => id !== formationId)
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseInt(value) || 0 : value
            }))
        }
    }

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData(prev => ({ ...prev, code: result }))
    }

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
                    <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau code promo</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Code promo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Code Promo *
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="Ex: REDUC20"
                                required
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                            />
                            <button
                                type="button"
                                onClick={generateCode}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Générer
                            </button>
                        </div>
                    </div>

                    {/* Type et valeur de réduction */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de Réduction *
                            </label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="percentage">Pourcentage (%)</option>
                                <option value="fixed">Montant fixe (FCFA)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valeur de la Réduction *
                            </label>
                            <input
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleChange}
                                min="0"
                                max={formData.discountType === 'percentage' ? 100 : undefined}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.discountType === 'percentage' ? 'Maximum 100%' : 'Montant en FCFA'}
                            </p>
                        </div>
                    </div>

                    {/* Période de validité */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valide à partir du *
                            </label>
                            <input
                                type="date"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valide jusqu'au *
                            </label>
                            <input
                                type="date"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Nombre d'utilisations maximum */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre maximum d'utilisations
                        </label>
                        <input
                            type="number"
                            name="maxUses"
                            value={formData.maxUses}
                            onChange={handleChange}
                            min="0"
                            placeholder="Laisser vide pour utilisation illimitée"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Laisser vide pour permettre une utilisation illimitée du code
                        </p>
                    </div>

                    {/* Formations applicables */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Formations Applicables *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {formations.map(formation => (
                                <label key={formation.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="applicableFormations"
                                        value={formation.id}
                                        checked={formData.applicableFormations.includes(formation.id)}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{formation.title}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Sélectionnez au moins une formation pour appliquer ce code promo
                        </p>
                    </div>

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
                            <span className="ml-2 text-sm text-gray-700">Activer ce code promo</span>
                        </label>
                    </div>

                    {/* Aperçu */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu du code promo</h3>
                        <div className="text-sm text-gray-600">
                            <p><strong>Code:</strong> {formData.code || 'À définir'}</p>
                            <p><strong>Réduction:</strong> {
                                formData.discountValue > 0
                                    ? (formData.discountType === 'percentage'
                                        ? `${formData.discountValue}%`
                                        : `${formData.discountValue.toLocaleString('fr-FR')} FCFA`)
                                    : 'À définir'
                            }</p>
                            <p><strong>Formations:</strong> {
                                formData.applicableFormations.length > 0
                                    ? `${formData.applicableFormations.length} formation(s) sélectionnée(s)`
                                    : 'Aucune formation sélectionnée'
                            }</p>
                        </div>
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
                            disabled={loading || formData.applicableFormations.length === 0}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Création...' : 'Créer le code promo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}