'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface StudentStats {
  totalFormations: number
  activeFormations: number
  completedFormations: number
  pendingAssignments: number
  unreadMessages: number
  averageGrade: number
  nextExam: {
    title: string
    date: string
    timeLeft: string
  }
  recentActivity: Array<{
    type: 'assignment' | 'grade' | 'message' | 'exam'
    title: string
    date: string
    status: string
  }>
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    try {
      const response = await fetch('/api/student/dashboard')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cjblue"></div>
          <p className="mt-4 text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Header Section */}
      <div className="mb-8 sm:mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-32 h-32 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  Bienvenue, {session?.user?.name || 'Étudiant'} !
                </h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  Accédez à votre parcours d'apprentissage et suivez votre progression
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">
                  {stats?.activeFormations || 0}
                </div>
                <div className="text-xs sm:text-sm text-blue-100">Formations actives</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl">📚</span>
            <span className="text-xs sm:text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Actif
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.totalFormations || 0}</div>
          <div className="text-xs sm:text-sm text-gray-500">Total formations</div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl">✅</span>
            <span className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Terminées
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.completedFormations || 0}</div>
          <div className="text-xs sm:text-sm text-gray-500">Formations terminées</div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl">📝</span>
            <span className="text-xs sm:text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              En attente
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.pendingAssignments || 0}</div>
          <div className="text-xs sm:text-sm text-gray-500">Devoirs à rendre</div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl">📊</span>
            <span className="text-xs sm:text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              Moyenne
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.averageGrade || 0}%</div>
          <div className="text-xs sm:text-sm text-gray-500">Note moyenne</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
        
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-12">
          
          {/* Next Exam */}
          {stats?.nextExam && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Prochain examen</h2>
                <span className="text-2xl sm:text-3xl">📋</span>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 sm:p-6 border border-orange-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {stats.nextExam.title}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm sm:text-base">📅</span>
                    <span className="text-sm sm:text-base">{stats.nextExam.date}</span>
                  </div>
                  <div className="flex items-center text-orange-600 font-semibold">
                    <span className="text-sm sm:text-base">⏰</span>
                    <span className="text-sm sm:text-base">{stats.nextExam.timeLeft}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/student/exams"
                className="mt-4 inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base"
              >
                Voir les détails
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      {activity.type === 'assignment' && '📝'}
                      {activity.type === 'grade' && '✅'}
                      {activity.type === 'message' && '💬'}
                      {activity.type === 'exam' && '📋'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{activity.title}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{activity.date}</p>
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
              href="/student/activity"
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base inline-flex items-center"
            >
              Voir toute l'activité
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Link
                href="/student/assignments"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📝</span>
                <span className="text-sm font-medium text-gray-700">Devoirs</span>
              </Link>
              <Link
                href="/student/courses"
                className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</span>
                <span className="text-sm font-medium text-gray-700">Cours</span>
              </Link>
              <Link
                href="/student/exams"
                className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</span>
                <span className="text-sm font-medium text-gray-700">Examens</span>
              </Link>
              <Link
                href="/student/certificates"
                className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏆</span>
                <span className="text-sm font-medium text-gray-700">Certificats</span>
              </Link>
              <Link
                href="/student/profile"
                className="flex flex-col items-center p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</span>
                <span className="text-sm font-medium text-gray-700">Profil</span>
              </Link>
              <Link
                href="/student/messages"
                className="flex flex-col items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">💬</span>
                <span className="text-sm font-medium text-gray-700">Messages</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8 sm:space-12">
          
          {/* Progress Overview */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Progression globale</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Formations complétées</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.completedFormations || 0}/{stats?.totalFormations || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalFormations ? (stats.completedFormations / stats.totalFormations) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Moyenne générale</span>
                  <span className="text-sm font-bold text-gray-900">{stats?.averageGrade || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.averageGrade || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Échéances à venir</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📝</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">TP Marketing Digital</p>
                    <p className="text-xs text-red-600">Dans 2 jours</p>
                  </div>
                </div>
                <span className="text-red-600 text-xs font-bold">URGENT</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Examen IOP</p>
                    <p className="text-xs text-orange-600">Dans 5 jours</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📝</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Projet Final</p>
                    <p className="text-xs text-yellow-600">Dans 1 semaine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h2>
              <span className="relative">
                <span className="text-2xl">💬</span>
                {stats?.unreadMessages && stats.unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  Prof
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Rappel: Examen demain</p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
                {stats?.unreadMessages && stats.unreadMessages > 0 && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  Admin
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Nouveau cours disponible</p>
                  <p className="text-xs text-gray-500">Il y a 1 jour</p>
                </div>
              </div>
            </div>
            <Link
              href="/student/messages"
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center"
            >
              Voir tous les messages
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
