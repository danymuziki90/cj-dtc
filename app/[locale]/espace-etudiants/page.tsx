'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { 
  BookOpen, 
  Trophy, 
  Calendar, 
  FileText, 
  BarChart3, 
  Award, 
  Folder, 
  User,
  TrendingUp,
  Clock,
  Users,
  Star,
  ChevronRight,
  Play,
  Download,
  Bell,
  Settings,
  LogOut,
  Plus,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface StudentStats {
  totalFormations: number
  completedFormations: number
  certificates: number
  upcomingSessions: number
  activeFormations?: number
  pendingAssignments?: number
  unreadMessages?: number
  averageGrade?: number
  nextExam?: {
    title: string
    date: string
    timeLeft: string
  }
  totalHours?: number
}

interface RecentActivity {
  id: string
  type: 'formation' | 'certificate' | 'session' | 'assignment'
  title: string
  description: string
  date: string
  status: 'completed' | 'in-progress' | 'upcoming'
  icon: React.ReactNode
}

export default function EspaceEtudiantsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<StudentStats>({
    totalFormations: 0,
    completedFormations: 0,
    certificates: 0,
    upcomingSessions: 0,
    activeFormations: 0,
    pendingAssignments: 0,
    unreadMessages: 0,
    averageGrade: 0,
    totalHours: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

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
      router.push('/admin/dashboard')
      return
    }

    fetchStudentData()
  }, [session, status, router])

  const fetchStudentData = async () => {
    try {
      const response = await fetch('/api/student/dashboard')
      if (!response.ok) throw new Error('Erreur lors du chargement des données')
      const data = await response.json()
      setStats(data)
      
      // Utiliser les activités récentes de l'API
      setRecentActivities(data.recentActivity || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/fr/auth/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <Breadcrumbs items={[{ label: 'Espace Étudiants' }]} />
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600 font-medium">Chargement de votre espace...</p>
          </div>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      title: 'Mes Formations',
      description: 'Suivez votre progression et accédez à vos cours',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/fr/espace-etudiants/mes-formations',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      stats: `${stats.activeFormations || 0} en cours`
    },
    {
      title: 'E-Learning',
      description: 'Modules interactifs et ressources en ligne',
      icon: <Play className="w-6 h-6" />,
      href: '/fr/espace-etudiants/elearning',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      stats: `${stats.totalHours || 0}h de contenu`
    },
    {
      title: 'Calendrier',
      description: 'Votre emploi du temps et sessions à venir',
      icon: <Calendar className="w-6 h-6" />,
      href: '/fr/espace-etudiants/calendrier',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      stats: `${stats.upcomingSessions} sessions`
    },
    {
      title: 'Travaux',
      description: 'Devoirs, projets et évaluations',
      icon: <FileText className="w-6 h-6" />,
      href: '/fr/espace-etudiants/travaux',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      stats: '3 à rendre'
    },
    {
      title: 'Résultats',
      description: 'Notes, évaluations et progression',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/fr/espace-etudiants/resultats',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      stats: `Moyenne: ${stats.averageGrade || 0}/20`
    },
    {
      title: 'Certificats',
      description: 'Téléchargez vos attestations et diplômes',
      icon: <Award className="w-6 h-6" />,
      href: '/fr/espace-etudiants/mes-certificats',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      stats: `${stats.certificates} obtenus`
    },
    {
      title: 'Supports',
      description: 'Documents, PDFs et ressources pédagogiques',
      icon: <Folder className="w-6 h-6" />,
      href: '/fr/espace-etudiants/supports',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      stats: '45 ressources'
    },
    {
      title: 'Mon Compte',
      description: 'Profil, paramètres et informations',
      icon: <User className="w-6 h-6" />,
      href: '/fr/espace-etudiants/mon-compte',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      stats: 'Complété à 75%'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumbs items={[{ label: 'Espace Étudiants' }]} />
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Bienvenue, {session?.user?.name || 'Étudiant'} ! 👋
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Continuez votre parcours d'excellence avec CJ Development Training Center
                </p>
              </div>
              
              <div className="flex items-center space-x-3 mt-6 lg:mt-0">
                <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalFormations}</h3>
            <p className="text-gray-600 text-sm mt-1">Formations total</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {stats.totalHours || 0}h de formation
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                +12%
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.completedFormations}</h3>
            <p className="text-gray-600 text-sm mt-1">Formations terminées</p>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.completedFormations / stats.totalFormations) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.certificates}</h3>
            <p className="text-gray-600 text-sm mt-1">Certificats obtenus</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <Target className="w-3 h-3 mr-1" />
              Excellence garantie
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                Prochain
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</h3>
            <p className="text-gray-600 text-sm mt-1">Sessions à venir</p>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              Cette semaine
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Votre Espace</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${item.bgColor} ${item.borderColor} border rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <div className={`text-transparent bg-clip-text bg-gradient-to-r ${item.color}`}>
                          {item.icon}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        {item.stats}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {item.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-all duration-300">
                      Accéder
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Activités Récentes</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className={`flex items-start space-x-3 ${index !== recentActivities.length - 1 ? 'pb-4 mb-4 border-b border-gray-100' : ''}`}>
                    <div className="flex-shrink-0 mt-1">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
                
                {recentActivities.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">Aucune activité récente</p>
                  </div>
                )}
              </div>
              
              <div className="px-6 pb-6">
                <Link 
                  href="/fr/espace-etudiants/activites"
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-sm transition-colors"
                >
                  Voir toutes les activités
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-2xl font-bold mb-2">Prêt à continuer votre formation ?</h2>
              <p className="text-blue-100">
                Explorez nos programmes ou contactez votre conseiller pédagogique
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/fr/formations"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle inscription
              </Link>
              <Link
                href="/fr/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 text-white border border-blue-400 border-opacity-30 rounded-xl font-semibold transition-colors"
              >
                <Users className="w-5 h-5 mr-2" />
                Contacter le support
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  )
}