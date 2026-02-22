'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  X,
  ChevronRight,
  User,
  MoreHorizontal,
  Star,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  UserCheck,
  GraduationCap
} from 'lucide-react'

export default function StudentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedFormation, setSelectedFormation] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  // Mock data - would come from API
  const students = [
    {
      id: '1',
      firstName: 'Marie',
      lastName: 'Mwamba',
      email: 'marie.mwamba@email.com',
      phone: '+243 123 456 789',
      studentNumber: 'STU001',
      dateOfBirth: '1990-05-15',
      address: 'Avenue des Aviateurs, Gombe',
      city: 'Kinshasa',
      country: 'République Démocratique du Congo',
      status: 'active',
      enrollmentDate: '2024-01-15',
      lastLogin: '2024-01-28',
      avatar: '/students/marie.jpg',
      enrollments: [
        {
          id: '1',
          formationId: '1',
          formationTitle: 'Management des Ressources Humaines',
          status: 'in_progress',
          progress: 75,
          enrolledDate: '2024-01-15'
        }
      ],
      certificates: [
        {
          id: '1',
          title: 'Certificat en Communication Professionnelle',
          issueDate: '2024-01-20',
          score: 92,
          status: 'issued'
        }
      ],
      totalSpent: 850,
      coursesCompleted: 1,
      averageGrade: 85
    },
    {
      id: '2',
      firstName: 'Jean-Pierre',
      lastName: 'Lukoki',
      email: 'jp.lukoki@email.com',
      phone: '+243 987 654 321',
      studentNumber: 'STU002',
      dateOfBirth: '1985-08-22',
      address: 'Boulevard du 30 Juin, Limete',
      city: 'Lubumbashi',
      country: 'République Démocratique du Congo',
      status: 'active',
      enrollmentDate: '2024-01-10',
      lastLogin: '2024-01-27',
      avatar: '/students/jean-pierre.jpg',
      enrollments: [
        {
          id: '2',
          formationId: '2',
          formationTitle: 'Leadership et Management d\'Équipe',
          status: 'completed',
          progress: 100,
          enrolledDate: '2024-01-10'
        }
      ],
      certificates: [
        {
          id: '2',
          title: 'Certificat en Leadership',
          issueDate: '2024-01-25',
          score: 88,
          status: 'issued'
        }
      ],
      totalSpent: 650,
      coursesCompleted: 1,
      averageGrade: 88
    },
    {
      id: '3',
      firstName: 'Sarah',
      lastName: 'Kabeya',
      email: 'sarah.kabeya@email.com',
      phone: '+243 765 432 109',
      studentNumber: 'STU003',
      dateOfBirth: '1992-12-03',
      address: 'Avenue de la Paix, Matete',
      city: 'Kinshasa',
      country: 'République Démocratique du Congo',
      status: 'active',
      enrollmentDate: '2024-01-05',
      lastLogin: '2024-01-26',
      avatar: '/students/sarah.jpg',
      enrollments: [
        {
          id: '3',
          formationId: '3',
          formationTitle: 'Digital Marketing Stratégique',
          status: 'in_progress',
          progress: 45,
          enrolledDate: '2024-01-05'
        }
      ],
      certificates: [],
      totalSpent: 450,
      coursesCompleted: 0,
      averageGrade: 78
    },
    {
      id: '4',
      firstName: 'Christian',
      lastName: 'Junior',
      email: 'c.junior@email.com',
      phone: '+243 543 210 987',
      studentNumber: 'STU004',
      dateOfBirth: '1988-07-10',
      address: 'Place de la Nation, Gombe',
      city: 'Kinshasa',
      country: 'République Démocratique du Congo',
      status: 'suspended',
      enrollmentDate: '2023-12-01',
      lastLogin: '2024-01-15',
      avatar: '/students/christian.jpg',
      enrollments: [
        {
          id: '4',
          formationId: '4',
          formationTitle: 'Family Business Governance',
          status: 'completed',
          progress: 100,
          enrolledDate: '2023-12-01'
        }
      ],
      certificates: [
        {
          id: '3',
          title: 'Certificat en Family Business',
          issueDate: '2024-01-15',
          score: 95,
          status: 'issued'
        }
      ],
      totalSpent: 1200,
      coursesCompleted: 1,
      averageGrade: 95
    },
    {
      id: '5',
      firstName: 'Patricia',
      lastName: 'Lukoki',
      email: 'p.lukoki@email.com',
      phone: '+243 876 543 210',
      studentNumber: 'STU005',
      dateOfBirth: '1995-03-18',
      address: 'Avenue Kasa-Vubu, Kasa-Vubu',
      city: 'Kasa-Vubu',
      country: 'République Démocratique du Congo',
      status: 'active',
      enrollmentDate: '2024-01-20',
      lastLogin: '2024-01-29',
      avatar: '/students/patricia.jpg',
      enrollments: [
        {
          id: '5',
          formationId: '5',
          formationTitle: 'CJ Master System',
          status: 'in_progress',
          progress: 30,
          enrolledDate: '2024-01-20'
        }
      ],
      certificates: [],
      totalSpent: 3500,
      coursesCompleted: 0,
      averageGrade: 82
    }
  ]

  const formations = [
    { id: 'all', name: 'Toutes les formations' },
    { id: '1', name: 'Management des Ressources Humaines' },
    { id: '2', name: 'Leadership et Management d\'Équipe' },
    { id: '3', name: 'Digital Marketing Stratégique' },
    { id: '4', name: 'Family Business Governance' },
    { id: '5', name: 'CJ Master System' },
    { id: '6', name: 'International Operations Protocol' }
  ]

  const statuses = [
    { id: 'all', name: 'Tous les statuts', count: students.length },
    { id: 'active', name: 'Actifs', count: students.filter(s => s.status === 'active').length },
    { id: 'suspended', name: 'Suspendus', count: students.filter(s => s.status === 'suspended').length },
    { id: 'graduated', name: 'Diplômés', count: students.filter(s => s.status === 'graduated').length }
  ]

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus
    const matchesFormation = selectedFormation === 'all' || student.enrollments.some(e => e.formationId === selectedFormation)
    
    return matchesSearch && matchesStatus && matchesFormation
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'graduated': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600'
    if (grade >= 80) return 'text-blue-600'
    if (grade >= 70) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    // API call to delete student
    console.log('Deleting student:', studentId)
    // In real implementation, this would call an API
  }

  const handleExportStudents = () => {
    // Export students data to CSV/Excel
    console.log('Exporting students...')
    // In real implementation, this would generate and download a file
  }

  const handleSendEmail = async (studentId: string) => {
    // Send email to student
    console.log('Sending email to student:', studentId)
    // In real implementation, this would call an API
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ChevronRight className="w-5 h-5 rotate-180" />
                <span>Retour</span>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Étudiants</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des étudiants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-600" />
                <span>Filtres</span>
                {(selectedStatus !== 'all' || selectedFormation !== 'all' || searchQuery) && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {selectedStudents.length === filteredStudents.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
                
                {selectedStudents.length > 0 && (
                  <>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Download className="w-4 h-4" />
                      <span>Exporter</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 bg-white">
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name} ({status.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formation</label>
                  <select
                    value={selectedFormation}
                    onChange={(e) => setSelectedFormation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {formations.map(formation => (
                      <option key={formation.id} value={formation.id}>{formation.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedStatus('all')
                      setSelectedFormation('all')
                      setSearchQuery('')
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredStudents.length}</span> étudiant{filteredStudents.length > 1 ? 's' : ''} trouvé{filteredStudents.length > 1 ? 's' : ''}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {selectedStudents.length} sélectionné{selectedStudents.length > 1 ? 's' : ''}
            </span>
            {selectedStudents.length > 0 && (
              <button
                onClick={() => setSelectedStudents([])}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                <X className="w-4 h-4" />
                <span>Désélectionner</span>
              </button>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrit
                  </th>
                  <th className="progress-column px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dépensé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className={`hover:bg-gray-50 ${selectedStudents.includes(student.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.studentNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-2 mb-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{student.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{student.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                        {student.status === 'active' ? 'Actif' : 
                         student.status === 'suspended' ? 'Suspendu' : 
                         student.status === 'graduated' ? 'Diplômé' : student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(student.enrollmentDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {student.enrollments.map((enrollment, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{enrollment.formationTitle}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressColor(enrollment.progress)}`}
                                  style={{ width: `${enrollment.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{enrollment.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ${student.totalSpent.toLocaleString()}$
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span>{student.certificates.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditStudent(student.id)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(student.id)}
                          className="p-1 text-green-600 hover:text-green-700"
                          title="Envoyer un email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewStudent(student.id)}
                          className="p-1 text-gray-600 hover:text-gray-700"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Affichage de {(currentPage - 1) * 10 + 1} à {Math.min(currentPage * 10, filteredStudents.length)} sur {filteredStudents.length}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: Math.ceil(filteredStudents.length / 10) }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                    currentPage === index + 1 ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(Math.ceil(filteredStudents.length / 10), currentPage + 1))}
              disabled={currentPage >= Math.ceil(filteredStudents.length / 10)}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </main>
    </div>
  )

  function handleEditStudent(studentId: string) {
    router.push(`/admin/students/${studentId}`)
  }

  function handleViewStudent(studentId: string) {
    router.push(`/admin/students/${studentId}`)
  }
}
