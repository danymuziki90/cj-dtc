'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  User,
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  Menu,
  X,
  Home,
  FileText,
  CreditCard,
  Target,
  Globe,
  Shield,
  Activity,
  UserCheck,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Star,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [notifications, setNotifications] = useState(5)

  // Mock data - would come from API
  const stats = {
    totalStudents: 523,
    activeStudents: 487,
    totalFormations: 12,
    totalEnrollments: 156,
    totalRevenue: 125750,
    completionRate: 92,
    satisfactionScore: 4.8,
    pendingApprovals: 8,
    upcomingSessions: 15,
    certificatesIssued: 89,
    monthlyRevenue: 28500,
    newStudents: 47,
    activeCourses: 6,
    completionRateChange: 5.2,
    revenueChange: 12.8
  }

  const recentEnrollments = [
    {
      id: 1,
      studentName: "Marie Mwamba",
      email: "marie.mwamba@email.com",
      formation: "Management des Ressources Humaines",
      enrollmentDate: "2024-01-28",
      status: "pending",
      amount: 850,
      paymentStatus: "pending"
    },
    {
      id: 2,
      studentName: "Jean-Pierre Lukoki",
      email: "jp.lukoki@email.com",
      formation: "Leadership et Management d'Équipe",
      enrollmentDate: "2024-01-27",
      status: "confirmed",
      amount: 650,
      paymentStatus: "paid"
    },
    {
      id: 3,
      studentName: "Sarah Kabeya",
      email: "sarah.kabeya@email.com",
      formation: "Digital Marketing Stratégique",
      enrollmentDate: "2024-01-26",
      status: "confirmed",
      amount: 450,
      paymentStatus: "paid"
    },
    {
      id: 4,
      studentName: "Christian Junior",
      email: "c.junior@email.com",
      formation: "Family Business Governance",
      enrollmentDate: "2024-01-25",
      status: "pending",
      amount: 1200,
      paymentStatus: "partial"
    }
  ]

  const upcomingSessions = [
    {
      id: 1,
      title: "Management RH - Session 3",
      formation: "Management des Ressources Humaines",
      date: "2024-02-01",
      time: "14:00",
      location: "Kinshasa",
      instructor: "Dr. Marie Mwamba",
      enrolled: 25,
      capacity: 30
    },
    {
      id: 2,
      title: "Leadership Transformationnel",
      formation: "Leadership et Management d'Équipe",
      date: "2024-02-02",
      time: "10:00",
      location: "En ligne",
      instructor: "Prof. Jean-Pierre Lukoki",
      enrolled: 45,
      capacity: 50
    },
    {
      id: 3,
      title: "SEO Avancé",
      formation: "Digital Marketing Stratégique",
      date: "2024-02-03",
      time: "16:00",
      location: "En ligne",
      instructor: "Mme. Sarah Kabeya",
      enrolled: 32,
      capacity: 40
    }
  ]

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Inscriptions en attente',
      message: '8 inscriptions nécessitent votre approbation',
      timestamp: 'Il y a 2 heures'
    },
    {
      id: 2,
      type: 'info',
      title: 'Nouvelle inscription',
      message: 'Marie Mwamba s\'est inscrite au programme MRH',
      timestamp: 'Il y a 3 heures'
    },
    {
      id: 3,
      type: 'success',
      title: 'Paiement reçu',
      message: 'Jean-Pierre Lukoki a payé sa formation',
      timestamp: 'Il y a 5 heures'
    }
  ]

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: Home,
      href: '/admin'
    },
    {
      id: 'students',
      label: 'Étudiants',
      icon: Users,
      href: '/admin/students'
    },
    {
      id: 'formations',
      label: 'Formations',
      icon: BookOpen,
      href: '/admin/formations'
    },
    {
      id: 'enrollments',
      label: 'Inscriptions',
      icon: FileText,
      href: '/admin/enrollments'
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: Calendar,
      href: '/admin/sessions'
    },
    {
      id: 'certificates',
      label: 'Certificats',
      icon: Award,
      href: '/admin/certificates'
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: CreditCard,
      href: '/admin/payments'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      href: '/admin/analytics'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      href: '/admin/settings'
    }
  ]

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CJ DTC Admin</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Back Office</p>
              </div>
            </div>

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

            {/* Right side */}
            <div className="flex items-center space-x-4">
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
                  <p className="text-sm font-medium text-gray-900">Admin CJ DTC</p>
                  <p className="text-xs text-gray-500">admin@cjdtc.com</p>
                </div>
                
                <div className="relative group">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Mon Profil
                    </Link>
                    <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Paramètres
                    </Link>
                    <hr className="my-1" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-600">Vue d'ensemble de la plateforme CJ DTC</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center space-x-1">
                  {stats.completionRateChange > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${stats.completionRateChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats.completionRateChange)}%
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
              <p className="text-sm text-gray-600">Total Étudiants</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeStudents} actifs</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">+8%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalFormations}</h3>
              <p className="text-sm text-gray-600">Formations</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeCourses} actives</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">+12.8%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Revenu Total</p>
              <p className="text-xs text-gray-500 mt-1">${stats.monthlyRevenue.toLocaleString()} ce mois</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">+5.2%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.completionRate}%</h3>
              <p className="text-sm text-gray-600">Taux de Réussite</p>
              <p className="text-xs text-gray-500 mt-1">{stats.satisfactionScore} satisfaction</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Gérer les Étudiants</h3>
              <p className="text-sm text-gray-600 mb-3">Voir et gérer tous les étudiants</p>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </button>

            <button className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Nouvelle Formation</h3>
              <p className="text-sm text-gray-600 mb-3">Créer une nouvelle formation</p>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </button>

            <button className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Inscriptions</h3>
              <p className="text-sm text-gray-600 mb-3">{stats.pendingApprovals} en attente</p>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
            </button>

            <button className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Certificats</h3>
              <p className="text-sm text-gray-600 mb-3">{stats.certificatesIssued} émis</p>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Enrollments */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Inscriptions Récentes</h2>
                  <Link href="/admin/enrollments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Voir tout
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{enrollment.studentName}</h4>
                          <p className="text-xs text-gray-500">{enrollment.formation}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status === 'pending' ? 'En attente' : enrollment.status === 'confirmed' ? 'Confirmé' : enrollment.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getPaymentStatusColor(enrollment.paymentStatus)}`}>
                        ${enrollment.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Sessions à Venir</h2>
                  <Link href="/admin/sessions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Voir tout
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{session.title}</h4>
                      <p className="text-xs text-gray-500">{session.formation}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{session.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {session.enrolled}/{session.capacity}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(session.enrolled / session.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Alertes Système</h2>
            </div>
            <div className="p-6 space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <p className="text-xs mt-1">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-1">{alert.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
