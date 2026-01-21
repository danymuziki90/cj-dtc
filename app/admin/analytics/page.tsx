'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
    summary: {
        totalEnrollments: number
        confirmedEnrollments: number
        totalRevenue: number
        paidRevenue: number
        conversionRate: number
    }
    formationsPopularity: Array<{
        id: number
        title: string
        enrollments: number
        revenue: number
        confirmed: number
    }>
    monthlyTrends: Array<{
        month: string
        monthLabel: string
        enrollments: number
        revenue: number
        confirmed: number
    }>
    sourceBreakdown: Array<{
        source: string
        sourceLabel: string
        count: number
        percentage: number
    }>
    statusBreakdown: Array<{
        status: string
        statusLabel: string
        count: number
        percentage: number
    }>
    insertionStats: {
        totalCompleted: number
        placed: number
        placementRate: number
    }
    paymentBreakdown: Array<{
        status: string
        statusLabel: string
        count: number
        percentage: number
    }>
    filters: {
        startDate: string | null
        endDate: string | null
        formationId: string | null
    }
}

interface Formation {
    id: number
    title: string
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0
    }).format(amount)
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [formations, setFormations] = useState<Formation[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        formationId: ''
    })

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.startDate) params.append('startDate', filters.startDate)
            if (filters.endDate) params.append('endDate', filters.endDate)
            if (filters.formationId) params.append('formationId', filters.formationId)

            const response = await fetch(`/api/analytics?${params}`)
            const result = await response.json()
            setData(result)
        } catch (error) {
            console.error('Erreur lors du chargement des analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchFormations = async () => {
        try {
            const response = await fetch('/api/formations')
            const result = await response.json()
            setFormations(result)
        } catch (error) {
            console.error('Erreur lors du chargement des formations:', error)
        }
    }

    useEffect(() => {
        fetchFormations()
        fetchAnalytics()
    }, [])

    useEffect(() => {
        fetchAnalytics()
    }, [filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const resetFilters = () => {
        setFilters({ startDate: '', endDate: '', formationId: '' })
    }

    if (loading || !data) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Analytics & Statistiques</h1>
                <div className="text-sm text-gray-500">
                    Données mises à jour en temps réel
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date de début
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date de fin
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Formation
                        </label>
                        <select
                            value={filters.formationId}
                            onChange={(e) => handleFilterChange('formationId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Toutes les formations</option>
                            {formations.map(formation => (
                                <option key={formation.id} value={formation.id}>
                                    {formation.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={resetFilters}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Inscrits</p>
                            <p className="text-2xl font-bold text-gray-900">{data.summary.totalEnrollments}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Taux de Conversion</p>
                            <p className="text-2xl font-bold text-gray-900">{data.summary.conversionRate.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">CA Total</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalRevenue)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">CA Réalisé</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.paidRevenue)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popularité des formations */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Popularité des Formations</h2>
                    <div className="space-y-4">
                        {data.formationsPopularity.slice(0, 5).map((formation, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">{formation.title}</p>
                                    <p className="text-xs text-gray-500">{formation.enrollments} inscrits ({formation.confirmed} confirmés)</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(formation.revenue)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Répartition par statut */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Répartition par Statut</h2>
                    <div className="space-y-3">
                        {data.statusBreakdown.map((status, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{status.statusLabel}</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${status.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                                        {status.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Origine des inscrits */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Origine des Inscrits</h2>
                    <div className="space-y-3">
                        {data.sourceBreakdown.map((source, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{source.sourceLabel}</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${source.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                                        {source.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Taux d'insertion professionnelle */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Insertion Professionnelle</h2>
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {data.insertionStats.placementRate.toFixed(1)}%
                            </div>
                            <p className="text-sm text-gray-600">Taux d'insertion</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-xl font-semibold text-gray-900">{data.insertionStats.totalCompleted}</div>
                                <div className="text-xs text-gray-500">Formations terminées</div>
                            </div>
                            <div>
                                <div className="text-xl font-semibold text-green-600">{data.insertionStats.placed}</div>
                                <div className="text-xs text-gray-500">Insérés professionnellement</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Répartition des paiements */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Statut des Paiements</h2>
                    <div className="space-y-3">
                        {data.paymentBreakdown.map((payment, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{payment.statusLabel}</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${payment.status === 'paid' ? 'bg-green-600' :
                                                    payment.status === 'partial' ? 'bg-yellow-600' : 'bg-red-600'
                                                }`}
                                            style={{ width: `${payment.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                                        {payment.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Évolution temporelle */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution Mensuelle</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Graphique des inscriptions */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Nombre d'inscriptions</h3>
                        <div className="space-y-2">
                            {data.monthlyTrends.map((month, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700 w-16">{month.monthLabel}</span>
                                    <div className="flex-1 mx-4">
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-blue-600 h-3 rounded-full"
                                                style={{
                                                    width: `${data.monthlyTrends.length > 0 ? (month.enrollments / Math.max(...data.monthlyTrends.map(m => m.enrollments))) * 100 : 0}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{month.enrollments}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Graphique du CA */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Chiffre d'affaires</h3>
                        <div className="space-y-2">
                            {data.monthlyTrends.map((month, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700 w-16">{month.monthLabel}</span>
                                    <div className="flex-1 mx-4">
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-green-600 h-3 rounded-full"
                                                style={{
                                                    width: `${data.monthlyTrends.length > 0 ? (month.revenue / Math.max(...data.monthlyTrends.map(m => m.revenue))) * 100 : 0}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                                        {formatCurrency(month.revenue).replace('FCFA', 'F')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions et export */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions & Export</h2>
                <div className="flex flex-wrap gap-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        📊 Exporter le rapport complet
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        📈 Générer un graphique détaillé
                    </button>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        📧 Envoyer le rapport par email
                    </button>
                    <button
                        onClick={fetchAnalytics}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        🔄 Actualiser les données
                    </button>
                </div>
            </div>
        </div>
    )
}