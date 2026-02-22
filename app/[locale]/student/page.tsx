'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  FileText, 
  Award, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Filter,
  ChevronRight,
  BarChart3,
  Users,
  Target,
  Globe,
  Flag,
  Star
} from 'lucide-react'

export default function StudentDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)


  // Mock data - would come from API
  const studentStats = {
    totalCourses: 5,
    completedCourses: 2,
    inProgressCourses: 3,
    totalCertificates: 2,
    averageGrade: 85,
    studyHours: 127,
    nextDeadline: '2 jours',
    streak: 15
  }

  const recentCourses = [
    {
      id: 1,
      title: 'Management des Ressources Humaines',
      progress: 75,
      nextClass: 'Demain, 14:00',
      instructor: 'Dr. Marie Mwamba',
      status: 'in-progress',
      thumbnail: '/formations/mrh.jpg'
    },
    {
      id: 2,
      title: 'Leadership et Management d\'Équipe',
      progress: 45,
      nextClass: 'Vendredi, 10:00',
      instructor: 'Prof. Jean-Pierre Lukoki',
      status: 'in-progress',
      thumbnail: '/formations/leadership.jpg'
    },
    {
      id: 3,
      title: 'Digital Marketing Stratégique',
      progress: 90,
      nextClass: 'Terminé',
      instructor: 'Mme. Sarah Kabeya',
      status: 'completed',
      thumbnail: '/formations/marketing.jpg'
    }
  ]

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'TP: Analyse de cas RH',
      course: 'Management des Ressources Humaines',
      deadline: '2024-02-01',
      priority: 'high',
      type: 'assignment'
    },
    {
      id: 2,
      title: 'Quiz: Théories du Leadership',
      course: 'Leadership et Management d\'Équipe',
      deadline: '2024-02-03',
      priority: 'medium',
      type: 'quiz'
    },
    {
      id: 3,
      title: 'Projet: Plan Marketing Digital',
      course: 'Digital Marketing Stratégique',
      deadline: '2024-02-05',
      priority: 'low',
      type: 'project'
    }
  ]

  const recentCertificates = [
    {
      id: 1,
      title: 'Certificat en Communication Professionnelle',
      issueDate: '2024-01-15',
      score: 92,
      qrCode: '/certificates/qr-001.png',
      downloadUrl: '/certificates/download/001'
    },
    {
      id: 2,
      title: 'Certificat en Gestion de Projet',
      issueDate: '2023-12-20',
      score: 88,
      qrCode: '/certificates/qr-002.png',
      downloadUrl: '/certificates/download/002'
    }
  ]

  const quickActions = [
    {
      title: 'Mes Cours',
      description: 'Accédez à vos formations en cours',
      icon: BookOpen,
      href: '/fr/student/courses',
      color: 'from-blue-500 to-blue-600',
      count: studentStats.inProgressCourses
    },
    {
      title: 'Devoirs',
      description: 'Soumettez vos travaux et projets',
      icon: FileText,
      href: '/fr/student/assignments',
      color: 'from-green-500 to-green-600',
      count: 5
    },
    {
      title: 'Certificats',
      description: 'Téléchargez vos certificats',
      icon: Award,
      href: '/fr/student/certificates',
      color: 'from-yellow-500 to-yellow-600',
      count: studentStats.totalCertificates
    },
    {
      title: 'Calendrier',
      description: 'Consultez votre emploi du temps',
      icon: Calendar,
      href: '/fr/student/calendar',
      color: 'from-purple-500 to-purple-600',
      count: 3
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Flag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CJ DTC</h1>
                  <p className="text-xs text-gray-500">Espace Étudiant</p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Tableau de bord
                </button>
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'courses' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Mes Cours
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'assignments' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Devoirs
                </button>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'certificates' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Certificats
                </button>
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-48"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || 'Étudiant'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.email || 'student@cjdtc.com'}
                  </p>
                </div>
                
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                <div className="relative group">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link href="/fr/student/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Mon Profil
                    </Link>
                    <Link href="/fr/student/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Paramètres
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Bienvenue, {session?.user?.name || 'Étudiant'}! 👋
                </h1>
                <p className="text-blue-100 mb-4">
                  Continuez votre parcours d'excellence avec CJ DTC
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">Série: {studentStats.streak} jours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">{studentStats.studyHours}h d'étude</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span className="text-sm">Prochaine échéance: {studentStats.nextDeadline}</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <Globe className="w-32 h-32 text-blue-400 opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{studentStats.totalCourses}</h3>
            <p className="text-sm text-gray-600">Formations suivies</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{studentStats.completedCourses}</h3>
            <p className="text-sm text-gray-600">Formations terminées</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+2</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{studentStats.totalCertificates}</h3>
            <p className="text-sm text-gray-600">Certificats obtenus</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+5%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{studentStats.averageGrade}%</h3>
            <p className="text-sm text-gray-600">Moyenne générale</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {action.count} éléments
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Formations Récentes</h2>
                  <Link href="/fr/student/courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Voir tout
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {recentCourses.map((course) => (
                  <div key={course.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{course.progress}%</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(course.status)}`}>
                          {course.status === 'in-progress' ? 'En cours' : 'Terminé'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Échéances à Venir</h2>
              </div>
              <div className="p-6 space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-start space-x-3">
                    <AlertCircle className={`w-5 h-5 mt-0.5 ${getPriorityColor(deadline.priority).split(' ')[0]}`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{deadline.title}</h4>
                      <p className="text-xs text-gray-600 mb-1">{deadline.course}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{deadline.deadline}</span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(deadline.priority)}`}>
                          {deadline.priority === 'high' ? 'Urgent' : deadline.priority === 'medium' ? 'Moyen' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Certificates */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Certificats Récents</h2>
                  <Link href="/fr/student/certificates" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Voir tout
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {recentCertificates.map((certificate) => (
                  <div key={certificate.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{certificate.title}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-600">{certificate.issueDate}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-600">{certificate.score}%</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-1 text-blue-600 hover:text-blue-700 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
