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

export default function PromoDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [promoCode, setPromoCode] = useState<PromoCode | null>(null)
    const [formations, setFormations] = useState<Formation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const promoId = params.id as string

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
            } catch (err) {
                setError('Erreur lors du chargement des données')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [promoId])

    const getDiscountText = (code: PromoCode) => {
        if (code.discountType === 'percentage') {
            return `${code.discountValue}%`
        }
        return `${code.discountValue.toLocaleString('fr-FR')} USD`
    }

    const getApplicableFormations = (formationIds: number[]) => {
        return formations.filter(f => formationIds.includes(f.id))
    }

    const getStatusColor = (active: boolean) => {
        return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }

    const getUsagePercentage = (current: number, max?: number) => {
        if (!max) return 0
        return Math.round((current / max) * 100)
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

    const applicableFormations = getApplicableFormations(promoCode.applicableFormations)
    const usagePercentage = getUsagePercentage(promoCode.currentUses, promoCode.maxUses)

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

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Code Promo: <span className="font-mono">{promoCode.code}</span>
                    </h1>
                    <div className="flex space-x-3">
                        <Link
                            href={`/admin/tarifs/promo/${promoCode.id}/edit`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Modifier
                        </Link>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                            Supprimer
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Informations générales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Code</dt>
                                    <dd className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                                        {promoCode.code}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Réduction</dt>
                                    <dd className="text-sm text-gray-900 font-semibold text-green-600">
                                        {getDiscountText(promoCode)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                                    <dd>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promoCode.active)}`}>
                                            {promoCode.active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Date de création</dt>
                                    <dd className="text-sm text-gray-900">
                                        {new Date(promoCode.createdAt).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Période de validité</h3>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Valide à partir du</dt>
                                    <dd className="text-sm text-gray-900">
                                        {new Date(promoCode.validFrom).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Valide jusqu'au</dt>
                                    <dd className="text-sm text-gray-900">
                                        {new Date(promoCode.validUntil).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Jours restants</dt>
                                    <dd className="text-sm text-gray-900">
                                        {Math.max(0, Math.ceil((new Date(promoCode.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} jours
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Utilisation */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Utilisation</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                    Utilisations: {promoCode.currentUses} / {promoCode.maxUses || '∞'}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {promoCode.maxUses ? `${usagePercentage}%` : 'Illimité'}
                                </span>
                            </div>
                            {promoCode.maxUses && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        style={{ width: `${usagePercentage}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formations applicables */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Formations applicables ({applicableFormations.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {applicableFormations.map(formation => (
                                <div key={formation.id} className="bg-blue-50 p-3 rounded-lg">
                                    <div className="font-medium text-blue-900">{formation.title}</div>
                                    <div className="text-sm text-blue-700">Slug: {formation.slug}</div>
                                </div>
                            ))}
                        </div>
                        {applicableFormations.length === 0 && (
                            <p className="text-gray-500 text-center py-4">
                                Aucune formation associée à ce code promo
                            </p>
                        )}
                    </div>

                    {/* Statistiques */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{promoCode.currentUses}</div>
                                <div className="text-sm text-gray-600">Utilisations totales</div>
                            </div>
                            <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {promoCode.maxUses ? promoCode.maxUses - promoCode.currentUses : '∞'}
                                </div>
                                <div className="text-sm text-gray-600">Utilisations restantes</div>
                            </div>
                            <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {((promoCode.currentUses / Math.max(1, promoCode.maxUses || 1)) * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-600">Taux d'utilisation</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}