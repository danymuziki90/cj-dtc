'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '../../../components/Breadcrumbs'

interface StudentStats {
  totalFormations: number
  completedFormations: number
  certificates: number
  upcomingSessions: number
}

export default function EspaceEtudiantsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<StudentStats>({
    totalFormations: 0,
    completedFormations: 0,
    certificates: 0,
    upcomingSessions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/fr/auth/login?callbackUrl=/fr/espace-etudiants')
      return
    }

    if (session.user?.role !== 'STUDENT' && session.user?.role !== 'ADMIN') {
      router.push('/fr/auth/login')
      return
    }

    // Rediriger les admins vers le tableau de bord admin
    if (session.user?.role === 'ADMIN') {
      router.push('/fr/admin/dashboard')
      return
    }

    fetchStudentStats()
  }, [session, status, router])

  const fetchStudentStats = async () => {
    try {
      const response = await fetch('/api/student/dashboard')
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Espace Étudiants' }]} />
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cjblue"></div>
          <p className="mt-4 text-lg text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      title: 'Mes Formations',
      description: 'Consultez vos formations en cours et terminées',
      icon: '📚',
      href: '/fr/espace-etudiants/mes-formations',
      color: 'bg-blue-500'
    },
    {
      title: 'E-Learning',
      description: 'Accédez à vos modules en ligne',
      icon: '💻',
      href: '/fr/espace-etudiants/elearning',
      color: 'bg-green-500'
    },
    {
      title: 'Calendrier',
      description: 'Consultez votre emploi du temps',
      icon: '📅',
      href: '/fr/espace-etudiants/calendrier',
      color: 'bg-purple-500'
    },
    {
      title: 'Travaux',
      description: 'Soumettez vos devoirs et projets',
      icon: '📝',
      href: '/fr/espace-etudiants/travaux',
      color: 'bg-orange-500'
    },
    {
      title: 'Résultats',
      description: 'Consultez vos notes et évaluations',
      icon: '📊',
      href: '/fr/espace-etudiants/resultats',
      color: 'bg-red-500'
    },
    {
      title: 'Certificats',
      description: 'Téléchargez vos certificats',
      icon: '🏆',
      href: '/fr/espace-etudiants/mes-certificats',
      color: 'bg-yellow-500'
    },
    {
      title: 'Supports',
      description: 'Accédez aux supports de cours',
      icon: '📁',
      href: '/fr/espace-etudiants/supports',
      color: 'bg-indigo-500'
    },
    {
      title: 'Mon Compte',
      description: 'Gérez vos informations personnelles',
      icon: '👤',
      href: '/fr/espace-etudiants/mon-compte',
      color: 'bg-gray-500'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: 'Espace Étudiants' }]} />
      
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-cjblue mb-4">
          Bienvenue, {session?.user?.name || 'Étudiant'} !
        </h1>
        <p className="text-lg text-gray-600">
          Accédez à votre espace personnel pour gérer votre parcours d'apprentissage
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Formations</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalFormations}</p>
            </div>
            <div className="text-3xl">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Terminées</p>
              <p className="text-2xl font-bold text-gray-800">{stats.completedFormations}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Certificats</p>
              <p className="text-2xl font-bold text-gray-800">{stats.certificates}</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sessions à venir</p>
              <p className="text-2xl font-bold text-gray-800">{stats.upcomingSessions}</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className={`h-2 ${item.color}`}></div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-cjblue transition-colors">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
              <div className="mt-4 flex items-center text-cjblue font-medium text-sm group-hover:translate-x-1 transition-transform">
                Accéder
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-cjblue mb-6">Actions Rapides</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/fr/formations"
            className="inline-flex items-center px-6 py-3 bg-cjblue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle inscription
          </Link>
          <Link
            href="/fr/contact"
            className="inline-flex items-center px-6 py-3 bg-white text-cjblue border-2 border-cjblue rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contacter le support
          </Link>
        </div>
      </div>
    </div>
  )
}