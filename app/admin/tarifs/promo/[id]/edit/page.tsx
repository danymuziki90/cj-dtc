'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Formation {
    id: number
    title: string
    slug: string
}

interface PromoCode {
    id: number
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    validFrom: string
    validUntil: string
    maxUses?: number
    currentUses: number
    applicableFormations: number[]
    active: boolean
    createdAt: string
}

export default function EditPromoPage() {
    const params = useParams()
    const router = useRouter()
    const [promoCode, setPromoCode] = useState<PromoCode | null>(null)
    const [formations, setFormations] = useState<Formation[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const promoId = params.id as string

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

    // Mock promo code data
    const mockPromoCodes: PromoCode[] = [
        {
            id: 1,
            code: 'REDUC20',
            discountType: 'percentage',
            discountValue: 20,
            validFrom: '2024-01-01',
            validUntil: '2024-12-31',
            maxUses: 100,
            currentUses: 45,
            applicableFormations: [1, 2, 3],
            active: true,
            createdAt: '2024-01-01T10:00:00Z'
        },
        {
            id: 2,
            code: 'SOLDE50',
            discountType: 'fixed',
            discountValue: 50000,
            validFrom: '2024-02-01',
            validUntil: '2024-02-28',
            maxUses: 50,
            currentUses: 12,
            applicableFormations: [4, 5],
            active: true,
            createdAt: '2024-01-15T14:30:00Z'
        }
    ]

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)

                // Simulation du chargement des données
                await new Promise(resolve => setTimeout(resolve, 500))

                const promo = mockPromoCodes.find(p => p.id === parseInt(promoId))
                if (!promo) {
                    setError('Code promo non trouvé')
                    return
                }

                setPromoCode(promo)
                setFormations(mockFormations)

                // Pré-remplir le formulaire
                setFormData({
                    code: promo.code,
                    discountType: promo.discountType,
                    discountValue: promo.discountValue,
                    validFrom: promo.validFrom,
                    validUntil: promo.validUntil,
                    maxUses: promo.maxUses || 0,
                    applicableFormations: promo.applicableFormations,
                    active: promo.active
                })
            } catch (err) {
                setError('Erreur lors du chargement des données')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [promoId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

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

            // Ici on ferait l'appel API pour mettre à jour le code promo
            console.log('Mise à jour de code promo:', formData)

            // Redirection vers les détails du code promo
            router.push(`/admin/tarifs/promo/${promoId}`)
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error)
        } finally {
            setSaving(false)
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error || !promoCode) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
                    <p className="text-gray-600 mb-6">{error || 'Code promo non trouvé'}</p>
                    <Link
                        href="/admin/tarifs"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Retour aux tarifs
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link
                    href={`/admin/tarifs/promo/${promoId}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                    ← Retour au code promo
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Modifier le code promo: <span className="font-mono">{promoCode.code}</span>
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Code promo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Code Promo *
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="Ex: REDUC20"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                        />
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
                                <option value="fixed">Montant fixe (USD)</option>
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
                                {formData.discountType === 'percentage' ? 'Maximum 100%' : 'Montant en USD'}
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
                            Laisser vide pour permettre une utilisation illimitée du code. Utilisations actuelles: {promoCode.currentUses}
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

                    {/* Informations sur l'utilisation actuelle */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">Informations sur l'utilisation actuelle</h3>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>Utilisations actuelles: <strong>{promoCode.currentUses}</strong></p>
                            <p>Utilisations restantes: <strong>{promoCode.maxUses ? promoCode.maxUses - promoCode.currentUses : 'Illimité'}</strong></p>
                            <p className="text-xs text-blue-600 mt-2">
                                ⚠️ Modifier le nombre maximum d'utilisations n'affectera pas les utilisations déjà effectuées.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Link
                            href={`/admin/tarifs/promo/${promoId}`}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={saving || formData.applicableFormations.length === 0}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}