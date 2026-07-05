'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

/**
 * Composant d'accueil pour l'espace étudiant
 * Affiche un message personnalisé et les actions principales
 */
export function StudentWelcome() {
  const { data: session } = useSession()

  const userName = session?.user?.name || 'Étudiant'
  const userEmail = session?.user?.email || ''

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 mb-8 text-white">
      <h1 className="text-3xl font-bold mb-2">
        {getTimeGreeting()}, {userName}! 👋
      </h1>
      <p className="text-blue-100 mb-6">
        Bienvenue dans votre espace étudiant CJ Development Training Center
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/student/inscriptions"
          className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all"
        >
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-semibold mb-1">Mes Inscriptions</h3>
          <p className="text-sm text-blue-100">Voir mes formations</p>
        </Link>

        <Link
          href="/student/elearning"
          className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all"
        >
          <div className="text-2xl mb-2">📚</div>
          <h3 className="font-semibold mb-1">Cours en Ligne</h3>
          <p className="text-sm text-blue-100">Accéder aux modules</p>
        </Link>

        <Link
          href="/student/profile"
          className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all"
        >
          <div className="text-2xl mb-2">👤</div>
          <h3 className="font-semibold mb-1">Mon Profil</h3>
          <p className="text-sm text-blue-100">Gérer mes infos</p>
        </Link>
      </div>

      <p className="text-blue-100 text-sm mt-6">
        Email: <span className="font-semibold">{userEmail}</span>
      </p>
    </div>
  )
}

/**
 * Composant pour les stats rapides du tableau de bord
 */
export function StudentStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Inscriptions</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="text-3xl">📝</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Certificats</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="text-3xl">🎓</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Examens</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="text-3xl">📊</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Messages</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="text-3xl">💬</div>
        </div>
      </div>
    </div>
  )
}
