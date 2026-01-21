'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PricingRule {
    id: number
    formationId: number
    formationTitle: string
    basePrice: number
    reducedPrice?: number
    enterprisePrice?: number
    paymentOptions: string[] // ['integral', 'installments', 'scholarship']
    maxInstallments?: number
    installmentAmount?: number
    active: boolean
    createdAt: string
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
    applicableFormations: number[] // IDs des formations
    active: boolean
    createdAt: string
}

export default function TarifsAdminPage() {
    const [activeTab, setActiveTab] = useState<'pricing' | 'promos'>('pricing')
    const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
    const [loading, setLoading] = useState(true)

    // Mock data - à remplacer par l'API
    const mockPricingRules: PricingRule[] = [
        {
            id: 1,
            formationId: 1,
            formationTitle: 'Management des Ressources Humaines (MRH)',
            basePrice: 150000,
            reducedPrice: 120000,
            enterprisePrice: 200000,
            paymentOptions: ['integral', 'installments'],
            maxInstallments: 3,
            installmentAmount: 50000,
            active: true,
            createdAt: '2026-01-10'
        },
        {
            id: 2,
            formationId: 2,
            formationTitle: 'IOP – Insertion & Orientation Professionnelle',
            basePrice: 100000,
            reducedPrice: 80000,
            enterprisePrice: 150000,
            paymentOptions: ['integral', 'scholarship'],
            active: true,
            createdAt: '2026-01-05'
        }
    ]

    const mockPromoCodes: PromoCode[] = [
        {
            id: 1,
            code: 'REDUC20',
            discountType: 'percentage',
            discountValue: 20,
            validFrom: '2026-01-01',
            validUntil: '2026-12-31',
            maxUses: 100,
            currentUses: 45,
            applicableFormations: [1, 2],
            active: true,
            createdAt: '2026-01-01'
        },
        {
            id: 2,
            code: 'ETUDIANT',
            discountType: 'fixed',
            discountValue: 25000,
            validFrom: '2026-01-01',
            validUntil: '2026-12-31',
            maxUses: 50,
            currentUses: 12,
            applicableFormations: [1, 2, 3, 4, 5],
            active: true,
            createdAt: '2026-01-01'
        }
    ]

    useEffect(() => {
        // Simulation du chargement
        setTimeout(() => {
            setPricingRules(mockPricingRules)
            setPromoCodes(mockPromoCodes)
            setLoading(false)
        }, 1000)
    }, [])

    const getPaymentOptionsText = (options: string[]) => {
        const labels: { [key: string]: string } = {
            integral: 'Intégral',
            installments: 'Échéancier',
            scholarship: 'Bourse'
        }
        return options.map(opt => labels[opt] || opt).join(', ')
    }

    const getDiscountText = (code: PromoCode) => {
        if (code.discountType === 'percentage') {
            return `${code.discountValue}%`
        }
        return `${code.discountValue.toLocaleString('fr-FR')} FCFA`
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestion Tarifaire</h1>
                <div className="flex space-x-3">
                    <Link
                        href="/admin/tarifs/new-pricing"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Nouveau Tarif
                    </Link>
                    <Link
                        href="/admin/tarifs/new-promo"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Nouveau Code Promo
                    </Link>
                </div>
            </div>

            {/* Onglets */}
            <div className="mb-6">
                <div className="flex space-x-2">
                    {[
                        { key: 'pricing', label: 'Tarifs & Paiements' },
                        { key: 'promos', label: 'Codes Promo' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">
                        {pricingRules.filter(r => r.active).length}
                    </div>
                    <div className="text-sm text-gray-600">Règles tarifaires actives</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-600">
                        {promoCodes.filter(c => c.active).length}
                    </div>
                    <div className="text-sm text-gray-600">Codes promo actifs</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-yellow-600">
                        {Math.round(promoCodes.reduce((acc, c) => acc + c.currentUses, 0) / promoCodes.length)}
                    </div>
                    <div className="text-sm text-gray-600">Utilisations moyennes</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-purple-600">
                        {pricingRules.reduce((acc, r) => acc + r.basePrice, 0) / pricingRules.length || 0}€
                    </div>
                    <div className="text-sm text-gray-600">Prix moyen</div>
                </div>
            </div>

            {/* Contenu selon l'onglet */}
            {activeTab === 'pricing' ? (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Règles Tarifaires ({pricingRules.length})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Formation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prix de Base
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prix Réduit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prix Entreprise
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Options Paiement
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pricingRules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {rule.formationTitle}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {rule.basePrice.toLocaleString('fr-FR')} FCFA
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {rule.reducedPrice ? `${rule.reducedPrice.toLocaleString('fr-FR')} FCFA` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {rule.enterprisePrice ? `${rule.enterprisePrice.toLocaleString('fr-FR')} FCFA` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getPaymentOptionsText(rule.paymentOptions)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rule.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {rule.active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/admin/tarifs/pricing/${rule.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Voir
                                                </Link>
                                                <Link
                                                    href={`/admin/tarifs/pricing/${rule.id}/edit`}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Modifier
                                                </Link>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pricingRules.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-gray-500">Aucune règle tarifaire configurée.</p>
                            <Link href="/admin/tarifs/new-pricing" className="text-blue-600 hover:text-blue-800">
                                Créer la première règle
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Codes Promo ({promoCodes.length})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Réduction
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Validité
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Utilisation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {promoCodes.map((code) => (
                                    <tr key={code.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 font-mono">
                                                {code.code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getDiscountText(code)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>Du {new Date(code.validFrom).toLocaleDateString('fr-FR')}</div>
                                            <div>Au {new Date(code.validUntil).toLocaleDateString('fr-FR')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {code.currentUses}/{code.maxUses || '∞'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${code.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {code.active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/admin/tarifs/promo/${code.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Voir
                                                </Link>
                                                <Link
                                                    href={`/admin/tarifs/promo/${code.id}/edit`}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Modifier
                                                </Link>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {promoCodes.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-gray-500">Aucun code promo configuré.</p>
                            <Link href="/admin/tarifs/new-promo" className="text-blue-600 hover:text-blue-800">
                                Créer le premier code
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Actions supplémentaires */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions & Outils</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        📊 Générer un rapport tarifaire
                    </button>
                    <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
                        📧 Envoyer les tarifs par email
                    </button>
                    <button className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                        💰 Calculatrice de paiement
                    </button>
                </div>
            </div>
        </div>
    )
}