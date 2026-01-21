'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StudentDashboard() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/auth/login')
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
    }
  }

  const quickActions = [
    {
      title: 'Mes Cours',
      description: 'Accédez à vos cours e-learning',
      icon: '📚',
      href: '/student/elearning',
      color: 'bg-blue-500'
    },
    {
      title: 'Travaux',
      description: 'Soumettez vos devoirs et TP',
      icon: '📋',
      href: '/student/assignments',
      color: 'bg-green-500'
    },
    {
      title: 'Examens',
      description: 'Passez vos examens en ligne',
      icon: '📝',
      href: '/student/exams',
      color: 'bg-purple-500'
    },
    {
      title: 'Certificats',
      description: 'Téléchargez vos certificats',
      icon: '🎓',
      href: '/student/certificates',
      color: 'bg-yellow-500'
    }
  ]

  const stats = [
    { label: 'Cours en cours', value: '3', color: 'text-blue-600' },
    { label: 'Travaux à rendre', value: '2', color: 'text-green-600' },
    { label: 'Examens à venir', value: '1', color: 'text-purple-600' },
    { label: 'Certificats obtenus', value: '1', color: 'text-yellow-600' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">CJ</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">Espace Étudiant</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user?.email}
                </p>
              </div>
              
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {session?.user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Voici votre tableau de bord et vos prochaines activités.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                    {action.icon}
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activités récentes</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Nouveau cours disponible</p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Travail soumis avec succès</p>
                  <p className="text-xs text-gray-500">Hier</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Examen terminé</p>
                  <p className="text-xs text-gray-500">Il y a 3 jours</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prochaines échéances</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <p className="text-sm font-medium text-gray-900">TP: Développement Web</p>
                <p className="text-xs text-red-600">Dans 2 jours</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="text-sm font-medium text-gray-900">Examen: Marketing Digital</p>
                <p className="text-xs text-yellow-600">Dans 5 jours</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm font-medium text-gray-900">Quiz: Gestion de Projet</p>
                <p className="text-xs text-blue-600">Dans 1 semaine</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
