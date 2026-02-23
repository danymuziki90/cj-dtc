'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react'

interface PaymentData {
    totalEnrollments: number
    totalRevenue: number
    paidAmount: number
    unpaidAmount: number
    partialAmount: number
    pendingEnrollments: number
    paymentStatusBreakdown: {
        unpaid: number
        partial: number
        paid: number
    }
    revenueByFormation: Array<{
        formationTitle: string
        revenue: number
        enrollments: number
        unpaid: number
    }>
}

export default function PaymentsDashboard() {
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('all')

    useEffect(() => {
        loadPaymentData()
    }, [timeRange])

    const loadPaymentData = async () => {
        try {
            const response = await fetch(`/api/enrollments?paymentStatus=all`)
            if (response.ok) {
                const enrollments = await response.json()

                // Calculer les statistiques
                const data: PaymentData = {
                    totalEnrollments: enrollments.length,
                    totalRevenue: enrollments.reduce((sum: number, e: any) => sum + e.paidAmount, 0),
                    paidAmount: enrollments.reduce((sum: number, e: any) => e.paymentStatus === 'paid' ? sum + e.totalAmount : sum, 0),
                    unpaidAmount: enrollments.reduce((sum: number, e: any) => e.paymentStatus === 'unpaid' ? sum + e.totalAmount : sum, 0),
                    partialAmount: enrollments.reduce((sum: number, e: any) => e.paymentStatus === 'partial' ? sum + (e.totalAmount - e.paidAmount) : sum, 0),
                    pendingEnrollments: enrollments.filter((e: any) => e.status === 'pending').length,
                    paymentStatusBreakdown: {
                        unpaid: enrollments.filter((e: any) => e.paymentStatus === 'unpaid').length,
                        partial: enrollments.filter((e: any) => e.paymentStatus === 'partial').length,
                        paid: enrollments.filter((e: any) => e.paymentStatus === 'paid').length
                    },
                    revenueByFormation: Array.from(
                        enrollments.reduce((map: any, e: any) => {
                            const key = e.formation.title
                            if (!map.has(key)) {
                                map.set(key, { formationTitle: key, revenue: 0, enrollments: 0, unpaid: 0 })
                            }
                            const current = map.get(key)
                            current.revenue += e.paidAmount
                            current.enrollments += 1
                            if (e.paymentStatus === 'unpaid') current.unpaid += 1
                            return map
                        }, new Map()).values()
                    ).sort((a: any, b: any) => b.revenue - a.revenue)
                }
                setPaymentData(data)
            }
        } catch (error) {
            console.error('Erreur chargement données paiements:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !paymentData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cjblue"></div>
            </div>
        )
    }

    const paymentRate = paymentData.totalEnrollments > 0
        ? ((paymentData.paymentStatusBreakdown.paid / paymentData.totalEnrollments) * 100).toFixed(1)
        : 0

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Paiements</h1>
                        <p className="text-gray-600">Suivi des revenus et des paiements des inscriptions</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4" />
                        Exporter
                    </button>
                </div>

                {/* Filtres */}
                <div className="mb-6 flex gap-2">
                    {['all', 'today', 'week', 'month', 'year'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg transition-colors ${timeRange === range
                                    ? 'bg-cjblue text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {range === 'all' && 'Vue complète'}
                            {range === 'today' && 'Aujourd\'hui'}
                            {range === 'week' && 'Cette semaine'}
                            {range === 'month' && 'Ce mois'}
                            {range === 'year' && 'Cette année'}
                        </button>
                    ))}
                </div>

                {/* Carte de statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Revenu Total */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-600 text-sm font-medium">Revenu Total</h3>
                            <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            ${paymentData.paidAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Paiements reçus
                        </p>
                    </div>

                    {/* À recevoir */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-600 text-sm font-medium">À Recevoir</h3>
                            <AlertCircle className="w-8 h-8 text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            ${paymentData.unpaidAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            {paymentData.paymentStatusBreakdown.unpaid} inscriptions impayées
                        </p>
                    </div>

                    {/* Taux de paiement */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-600 text-sm font-medium">Taux de Paiement</h3>
                            <TrendingUp className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{paymentRate}%</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {paymentData.paymentStatusBreakdown.paid} sur {paymentData.totalEnrollments} payées
                        </p>
                    </div>

                    {/* Paiements partiels */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-600 text-sm font-medium">Paiements Partiels</h3>
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            ${paymentData.partialAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            {paymentData.paymentStatusBreakdown.partial} en cours
                        </p>
                    </div>
                </div>

                {/* Graphique de répartition des paiements */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Paiements</h2>
                        <div className="space-y-4">
                            {/* Payés */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Payés</span>
                                    <span className="text-sm font-semibold text-green-600">
                                        {paymentData.paymentStatusBreakdown.paid}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{
                                            width: `${(paymentData.paymentStatusBreakdown.paid / paymentData.totalEnrollments) * 100
                                                }%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Partiels */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Partiellement Payés</span>
                                    <span className="text-sm font-semibold text-yellow-600">
                                        {paymentData.paymentStatusBreakdown.partial}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{
                                            width: `${(paymentData.paymentStatusBreakdown.partial / paymentData.totalEnrollments) * 100
                                                }%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Impayés */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Impayés</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {paymentData.paymentStatusBreakdown.unpaid}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{
                                            width: `${(paymentData.paymentStatusBreakdown.unpaid / paymentData.totalEnrollments) * 100
                                                }%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenus par formation */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Formations par Revenu</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="text-left text-sm font-medium text-gray-700 pb-3">Formation</th>
                                        <th className="text-right text-sm font-medium text-gray-700 pb-3">Inscrits</th>
                                        <th className="text-right text-sm font-medium text-gray-700 pb-3">Impayés</th>
                                        <th className="text-right text-sm font-medium text-gray-700 pb-3">Revenu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentData.revenueByFormation.map((item, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="py-3 text-sm text-gray-900">{item.formationTitle}</td>
                                            <td className="py-3 text-right text-sm font-medium text-gray-900">
                                                {item.enrollments}
                                            </td>
                                            <td className="py-3 text-right text-sm">
                                                <span className={item.unpaid > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                                                    {item.unpaid}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-sm font-semibold text-gray-900">
                                                ${item.revenue.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Actions recommandées */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Actions Recommandées</h3>
                    <ul className="space-y-2 text-blue-800">
                        {paymentData.paymentStatusBreakdown.unpaid > 0 && (
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">→</span>
                                <span>
                                    <strong>{paymentData.paymentStatusBreakdown.unpaid} inscriptions impayées</strong> - Envoyer des rappels de paiement aux candidats
                                </span>
                            </li>
                        )}
                        {paymentData.pendingEnrollments > 0 && (
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">→</span>
                                <span>
                                    <strong>{paymentData.pendingEnrollments} inscriptions en attente</strong> - Valider ou rejeter les candidatures
                                </span>
                            </li>
                        )}
                        {paymentData.paymentStatusBreakdown.partial > 0 && (
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">→</span>
                                <span>
                                    <strong>{paymentData.paymentStatusBreakdown.partial} paiements partiels</strong> - Suivre les paiements non complétés
                                </span>
                            </li>
                        )}
                        {paymentData.paymentStatusBreakdown.unpaid === 0 && paymentData.pendingEnrollments === 0 && (
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>
                                    Tous les paiements sont à jour et toutes les inscriptions ont été validées
                                </span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}
