'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Report {
  id: string
  title: string
  description: string
  type: 'students' | 'formations' | 'inscriptions' | 'revenue'
  data: any
  generatedAt: string
}

interface StatCard {
  title: string
  value: number | string
  change?: number
  changeType?: 'increase' | 'decrease'
  icon: string
  color: string
}

export default function AdminReportsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<StatCard[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    fetchReportsData()
  }, [selectedPeriod])

  const fetchReportsData = async () => {
    try {
      const [reportsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/reports'),
        fetch(`/api/admin/stats?period=${selectedPeriod}`)
      ])
      
      const reportsData = await reportsResponse.json()
      const statsData = await statsResponse.json()
      
      setReports(reportsData)
      setStats(statsData)
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type: string) => {
    setGeneratingReport(true)
    try {
      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, period: selectedPeriod })
      })

      if (response.ok) {
        const newReport = await response.json()
        setReports(prev => [newReport, ...prev])
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error)
    } finally {
      setGeneratingReport(false)
    }
  }

  const downloadReport = (reportId: string) => {
    // Implémentation du téléchargement
    window.open(`/api/admin/reports/${reportId}/download`, '_blank')
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des rapports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Rapports et statistiques
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Analysez les performances de votre plateforme
        </p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Période d'analyse</h2>
            <p className="text-sm text-gray-600">Sélectionnez la période pour les rapports</p>
          </div>
          <div className="flex gap-2">
            {['day', 'week', 'month', 'quarter', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'day' && 'Aujourd\'hui'}
                {period === 'week' && 'Semaine'}
                {period === 'month' && 'Mois'}
                {period === 'quarter' && 'Trimestre'}
                {period === 'year' && 'Année'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              {stat.change && (
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="mr-1">
                    {stat.changeType === 'increase' ? '↑' : '↓'}
                  </span>
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Report Generation */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Générer un rapport</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => generateReport('students')}
            disabled={generatingReport}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <span className="text-2xl mb-2 block">👥</span>
            <p className="font-medium text-blue-900">Rapport étudiants</p>
            <p className="text-sm text-blue-700">Liste et statistiques</p>
          </button>
          
          <button
            onClick={() => generateReport('formations')}
            disabled={generatingReport}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <span className="text-2xl mb-2 block">📚</span>
            <p className="font-medium text-green-900">Rapport formations</p>
            <p className="text-sm text-green-700">Performance des cours</p>
          </button>
          
          <button
            onClick={() => generateReport('inscriptions')}
            disabled={generatingReport}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
          >
            <span className="text-2xl mb-2 block">📝</span>
            <p className="font-medium text-purple-900">Rapport inscriptions</p>
            <p className="text-sm text-purple-700">Tendances et analyse</p>
          </button>
          
          <button
            onClick={() => generateReport('revenue')}
            disabled={generatingReport}
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            <span className="text-2xl mb-2 block">💰</span>
            <p className="font-medium text-orange-900">Rapport financier</p>
            <p className="text-sm text-orange-700">Revenus et paiements</p>
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Rapports récents</h2>
          
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">📊</span>
              <p className="text-gray-600">Aucun rapport généré</p>
              <p className="text-sm text-gray-500 mt-2">
                Générez votre premier rapport en utilisant les boutons ci-dessus
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Généré le {new Date(report.generatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.type === 'students' ? 'bg-blue-100 text-blue-800' :
                      report.type === 'formations' ? 'bg-green-100 text-green-800' :
                      report.type === 'inscriptions' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {report.type === 'students' && 'Étudiants'}
                      {report.type === 'formations' && 'Formations'}
                      {report.type === 'inscriptions' && 'Inscriptions'}
                      {report.type === 'revenue' && 'Financier'}
                    </span>
                    <button
                      onClick={() => downloadReport(report.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Inscriptions par mois</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-2 block">📈</span>
              <p className="text-gray-600">Graphique des inscriptions</p>
              <p className="text-sm text-gray-500 mt-2">
                Visualisation des tendances mensuelles
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Répartition des formations</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-2 block">🥧</span>
              <p className="text-gray-600">Graphique circulaire</p>
              <p className="text-sm text-gray-500 mt-2">
                Distribution par catégorie
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
