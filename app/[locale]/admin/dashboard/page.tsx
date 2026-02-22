'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface AdminStats {
  totalStudents: number
  activeStudents: number
  totalFormations: number
  totalInscriptions: number
  pendingInscriptions: number
  totalAssignments: number
  pendingCorrections: number
  totalExams: number
  scheduledExams: number
  totalCertificates: number
  recentActivity: Array<{
    type: 'inscription' | 'assignment' | 'exam' | 'certificate'
    title: string
    student: string
    date: string
    status: string
  }>
  monthlyStats: Array<{
    month: string
    students: number
    inscriptions: number
    certificates: number
  }>
}

interface Enrollment {
  id: number
  firstName: string
  lastName: string
  email: string
  status: string
  formation: {
    title: string
  }
  createdAt: string
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [inscriptions, setInscriptions] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsResponse, inscriptionsResponse] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/inscriptions')
      ])
      
      const statsData = await statsResponse.json()
      const inscriptionsData = await inscriptionsResponse.json()
      
      setStats(statsData)
      setInscriptions(inscriptionsData)
    } catch (error) {
      console.error('Erreur lors du chargement des données admin:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cjblue"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Header Section */}
      <div className="mb-8 sm:mb-12">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-32 h-32 bg-white rounded-full animate-pulse delay-75"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full animate-pulse delay-150"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                  Tableau de bord Administration
                </h1>
                <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
                  Gérez votre plateforme e-learning et suivez les performances
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
                  {stats?.totalStudents || 0}
                </div>
                <div className="text-xs sm:text-sm text-purple-100">Étudiants actifs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl group-hover:rotate-12 transition-transform duration-300">👥</span>
            <span className="text-xs sm:text-sm text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
              Total
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.totalStudents || 0}</div>
          <div className="text-xs sm:text-sm text-gray-500">Étudiants</div>
        </div>

        <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl group-hover:rotate-12 transition-transform duration-300">📚</span>
            <span className="text-xs sm:text-sm text-green-600 bg-green-200 px-2 py-1 rounded-full">
              Actives
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.activeStudents || 0}</div>
          <div className="text-xs sm:text-sm text-gray-500">Étudiants actifs</div>
        </div>

        <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-orange-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl group-hover:rotate-12 transition-transform duration-300">📝</span>
            <span className="text-xs sm:text-sm text-orange-600 bg-orange-200 px-2 py-1 rounded-full">
              En attente
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.pendingInscriptions || 0}</div>
          <div className="text-xs sm:text-sm text-gray-500">Inscriptions</div>
        </div>

        <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-purple-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl group-hover:rotate-12 transition-transform duration-300">📋</span>
            <span className="text-xs sm:text-sm text-purple-600 bg-purple-200 px-2 py-1 rounded-full">
              À corriger
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.pendingCorrections || 0}</div>
          <div className="text-xs sm:text-sm text-gray-500">Devoirs</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">Actions rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/fr/admin/students"
            className="group flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">👥</span>
            <span className="text-sm font-medium text-gray-700">Étudiants</span>
          </Link>
          <Link
            href="/fr/admin/inscriptions"
            className="group flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">📝</span>
            <span className="text-sm font-medium text-gray-700">Inscriptions</span>
          </Link>
          <Link
            href="/fr/admin/courses"
            className="group flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">📚</span>
            <span className="text-sm font-medium text-gray-700">Cours</span>
          </Link>
          <Link
            href="/fr/admin/assignments"
            className="group flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">📋</span>
            <span className="text-sm font-medium text-gray-700">Devoirs</span>
          </Link>
          <Link
            href="/fr/admin/exams"
            className="group flex flex-col items-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">🎯</span>
            <span className="text-sm font-medium text-gray-700">Examens</span>
          </Link>
          <Link
            href="/fr/admin/certificates"
            className="group flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">🏆</span>
            <span className="text-sm font-medium text-gray-700">Certificats</span>
          </Link>
          <Link
            href="/fr/admin/reports"
            className="group flex flex-col items-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">📊</span>
            <span className="text-sm font-medium text-gray-700">Rapports</span>
          </Link>
          <Link
            href="/fr/admin/settings"
            className="group flex flex-col items-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl hover:from-pink-100 hover:to-pink-200 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">⚙️</span>
            <span className="text-sm font-medium text-gray-700">Paramètres</span>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
        
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8 sm:space-12">
          
          {/* Pending Inscriptions */}
          {stats?.pendingInscriptions && stats.pendingInscriptions > 0 && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Inscriptions en attente</h2>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {stats.pendingInscriptions} à valider
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      JD
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Jean Dupont</p>
                      <p className="text-xs text-gray-500">IOP - Formation RH</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors">
                      Valider
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors">
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
              <Link
                href="/fr/admin/inscriptions"
                className="mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm inline-flex items-center"
              >
                Voir toutes les inscriptions
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Activité récente</h2>
              <span className="text-2xl sm:text-3xl">📈</span>
            </div>
            <div className="space-y-3 sm:space-4">
              {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {activity.type === 'inscription' && '📝'}
                      {activity.type === 'assignment' && '✅'}
                      {activity.type === 'exam' && '📋'}
                      {activity.type === 'certificate' && '🏆'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.student} • {activity.date}</p>
                    </div>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                    activity.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {activity.status === 'completed' ? 'Terminé' :
                     activity.status === 'pending' ? 'En attente' : 'Nouveau'}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/fr/admin/activity"
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center"
            >
              Voir toute l'activité
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Monthly Stats Chart */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Statistiques mensuelles</h2>
            <div className="space-y-4">
              {stats?.monthlyStats?.map((monthData, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{monthData.month}</span>
                    <span className="text-gray-500">{monthData.students} étudiants</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="flex h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-l-full"
                        style={{ width: `${(monthData.students / Math.max(...stats.monthlyStats.map(m => m.students))) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-green-500 h-2"
                        style={{ width: `${(monthData.inscriptions / Math.max(...stats.monthlyStats.map(m => m.inscriptions))) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-purple-500 h-2 rounded-r-full"
                        style={{ width: `${(monthData.certificates / Math.max(...stats.monthlyStats.map(m => m.certificates))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Étudiants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Inscriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Certificats</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8 sm:space-12">
          
          {/* System Overview */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Aperçu du système</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Formations</span>
                <span className="text-sm font-bold text-gray-900">{stats?.totalFormations || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total inscriptions</span>
                <span className="text-sm font-bold text-gray-900">{stats?.totalInscriptions || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Devoirs créés</span>
                <span className="text-sm font-bold text-gray-900">{stats?.totalAssignments || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Examens</span>
                <span className="text-sm font-bold text-gray-900">{stats?.totalExams || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Certificats</span>
                <span className="text-sm font-bold text-gray-900">{stats?.totalCertificates || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Statistiques clés</h2>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats?.totalStudents ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Taux d'activité</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats?.totalInscriptions && stats.totalStudents ? Math.round((stats.totalInscriptions / stats.totalStudents) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Taux d'inscription</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {stats?.totalCertificates && stats.totalStudents ? Math.round((stats.totalCertificates / stats.totalStudents) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Taux de certification</div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Alertes système</h2>
            <div className="space-y-3">
              {stats?.pendingInscriptions && stats.pendingInscriptions > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Inscriptions en attente</p>
                      <p className="text-xs text-orange-600">{stats.pendingInscriptions} à valider</p>
                    </div>
                  </div>
                </div>
              )}
              {stats?.pendingCorrections && stats.pendingCorrections > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Devoirs à corriger</p>
                      <p className="text-xs text-yellow-600">{stats.pendingCorrections} en attente</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Système opérationnel</p>
                    <p className="text-xs text-green-600">Tous les services actifs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
