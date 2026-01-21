'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

interface StudentStats {
  totalFormations: number
  activeFormations: number
  completedFormations: number
  pendingAssignments: number
  unreadMessages: number
}

export default function EspaceEtudiantsPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<StudentStats>({
    totalFormations: 0,
    activeFormations: 0,
    completedFormations: 0,
    pendingAssignments: 0,
    unreadMessages: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentStats()
  }, [])

  const fetchStudentStats = async () => {
    try {
      const mockStats: StudentStats = {
        totalFormations: 3,
        activeFormations: 2,
        completedFormations: 1,
        pendingAssignments: 5,
        unreadMessages: 2
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: '📋',
      title: 'Guide d\'inscription',
      description: 'Procédure complète pour vous inscrire à nos formations',
      href: '/fr/espace-etudiants/inscription',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      icon: '📚',
      title: 'Mes formations',
      description: 'Consultez vos formations en cours et passées',
      href: '/fr/espace-etudiants/mes-formations',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      icon: '📤',
      title: 'Soumission des travaux',
      description: 'Déposez vos TP, dossiers et préparez vos soutenances',
      href: '/fr/espace-etudiants/travaux',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      icon: '📊',
      title: 'Résultats & certifications',
      description: 'Consultez vos notes, résultats et téléchargez vos certificats',
      href: '/fr/espace-etudiants/resultats',
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    },
    {
      icon: '💻',
      title: 'Plateforme e-learning',
      description: 'Accès à votre environnement d\'apprentissage en ligne',
      href: '/fr/espace-etudiants/elearning',
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
    },
    {
      icon: '📅',
      title: 'Calendrier',
      description: 'Consultez vos emplois du temps et échéances',
      href: '/fr/espace-etudiants/calendrier',
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
    },
    {
      icon: '👤',
      title: 'Mon compte',
      description: 'Gérez vos informations personnelles et paramètres',
      href: '/fr/espace-etudiants/mon-compte',
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
    },
    {
      icon: '✅',
      title: 'Vérification des certificats',
      description: 'Vérifiez l\'authenticité de vos certificats CJ DTC en ligne',
      href: '/fr/certificates',
      color: 'bg-red-50 hover:bg-red-100 border-red-200'
    }
  ]

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-cjblue"></div>
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="bg-gradient-to-r from-cjblue to-blue-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 mb-6 sm:mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Bienvenue dans votre espace</h1>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Accédez à toutes vos ressources et suivez votre progression</p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold">{stats.activeFormations}</div>
            <div className="text-xs sm:text-sm text-blue-100">Formations actives</div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
          <div className="bg-white/15 border border-white/25 rounded-lg sm:rounded-xl p-4 sm:p-5 text-blue-50 text-sm sm:text-base max-w-2xl">
            <p className="font-semibold text-white mb-1">Instructions</p>
            <p>
              Connectez-vous pour accéder à votre dashboard, suivre vos formations et déposer vos travaux.
              Si vous n&apos;avez pas encore de compte, créez-en un en quelques minutes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!session ? (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-white text-cjblue font-semibold shadow-sm hover:bg-blue-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-white/60 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  Créer un compte
                </Link>
              </>
            ) : (
              <>
                <span className="text-white/90 text-sm sm:text-base">
                  Connecté{session.user?.name ? ` : ${session.user.name}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-white text-cjblue font-semibold shadow-sm hover:bg-blue-50 transition-colors"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.totalFormations}</div>
            <div className="text-xs sm:text-sm text-blue-100">Total formations</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.completedFormations}</div>
            <div className="text-xs sm:text-sm text-blue-100">Terminées</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.pendingAssignments}</div>
            <div className="text-xs sm:text-sm text-blue-100">Devoirs en attente</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.unreadMessages}</div>
            <div className="text-xs sm:text-sm text-blue-100">Messages non lus</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {features.map((feature, index) => (
          <Link
            key={index}
            href={feature.href}
            className={`group block p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${feature.color} hover:scale-105`}
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-cjblue transition-colors">
                  {feature.title}
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              {feature.description}
            </p>
            <div className="mt-3 sm:mt-4 flex items-center text-cjblue font-medium text-xs sm:text-sm">
              Accéder
              <svg className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 sm:mt-12 bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Actions rapides</h2>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-1 md:grid-cols-3">
          <Link
            href="/fr/formations"
            className="flex items-center p-3 sm:p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-cjblue"
          >
            <span className="text-xl sm:text-2xl mr-3 sm:mr-4">🎓</span>
            <div>
              <div className="font-medium text-gray-900 text-sm sm:text-base">Nouvelles formations</div>
              <div className="text-xs sm:text-sm text-gray-500">Découvrir nos programmes</div>
            </div>
          </Link>
          <Link
            href="/fr/contact"
            className="flex items-center p-3 sm:p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-cjblue"
          >
            <span className="text-xl sm:text-2xl mr-3 sm:mr-4">💬</span>
            <div>
              <div className="font-medium text-gray-900 text-sm sm:text-base">Support</div>
              <div className="text-xs sm:text-sm text-gray-500">Besoin d'aide ?</div>
            </div>
          </Link>
          <Link
            href="/fr/actualites"
            className="flex items-center p-3 sm:p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-cjblue"
          >
            <span className="text-xl sm:text-2xl mr-3 sm:mr-4">📰</span>
            <div>
              <div className="font-medium text-gray-900 text-sm sm:text-base">Actualités</div>
              <div className="text-xs sm:text-sm text-gray-500">Nouvelles et annonces</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}