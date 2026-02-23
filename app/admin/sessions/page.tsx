'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  BookOpen,
  ChevronRight,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Play,
  FileText,
  Settings,
  Image,
  Upload
} from 'lucide-react'
import { FormattedDate } from '@/components/FormattedDate'

interface TrainingSession {
  id: number
  formationId: number
  formation: {
    id: number
    title: string
    slug: string
  }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  format: string
  maxParticipants: number
  currentParticipants: number
  price: number
  status: string
  description?: string
  imageUrl?: string
  enrollments?: any[]
}

interface Enrollment {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  formation: {
    title: string
  }
  session?: {
    startDate: string
    location: string
  }
  status: string
  paymentStatus: string
  createdAt: string
}

export default function SessionsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'sessions' | 'enrollments'>('sessions')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSessions, setSelectedSessions] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  // State for real data
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [formations, setFormations] = useState<any[]>([])
  const [createForm, setCreateForm] = useState({
    formationId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    format: 'presentiel',
    maxParticipants: 25,
    price: 0,
    description: '',
    prerequisites: '',
    objectives: '',
    imageUrl: ''
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Load data from API
  useEffect(() => {
    loadSessions()
    loadEnrollments()
    loadFormations()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Erreur chargement sessions:', error)
    }
  }

  const loadEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments')
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data)
      }
    } catch (error) {
      console.error('Erreur chargement inscriptions:', error)
    }
  }

  const loadFormations = async () => {
    try {
      const response = await fetch('/api/formations')
      if (response.ok) {
        const data = await response.json()
        setFormations(data)
      }
    } catch (error) {
      console.error('Erreur chargement formations:', error)
    }
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let imageUrl = createForm.imageUrl

      // Upload image if file selected
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('folder', 'sessions')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        } else {
          alert('Erreur lors de l\'upload de l\'image')
          return
        }
      }

      const sessionData = {
        ...createForm,
        imageUrl,
        formationId: parseInt(createForm.formationId),
        maxParticipants: parseInt(createForm.maxParticipants.toString()),
        price: parseFloat(createForm.price.toString())
      }

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      })

      if (response.ok) {
        const newSession = await response.json()
        setSessions(prev => [newSession, ...prev])
        setShowCreateModal(false)
        resetCreateForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création de la session')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setCreateForm(prev => ({ ...prev, imageUrl: '' }))
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || session.status === selectedStatus
    const matchesFormat = selectedFormat === 'all' || session.format === selectedFormat
    return matchesSearch && matchesStatus && matchesFormat
  })

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = `${enrollment.firstName} ${enrollment.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.formation.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || enrollment.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ouverte': return 'bg-green-100 text-green-800'
      case 'complete': return 'bg-blue-100 text-blue-800'
      case 'fermee': return 'bg-red-100 text-red-800'
      case 'annulee': return 'bg-gray-100 text-gray-800'
      case 'terminee': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'unpaid': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cjblue"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cjblue mb-2">Gestion des Sessions</h1>
          <p className="text-gray-600">Créez et gérez les sessions de formation</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-cjblue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Session
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sessions'
                ? 'border-cjblue text-cjblue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Sessions ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'enrollments'
                ? 'border-cjblue text-cjblue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Inscriptions ({enrollments.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={activeTab === 'sessions' ? "Rechercher une session..." : "Rechercher une inscription..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cjblue focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cjblue focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              {activeTab === 'sessions' ? (
                <>
                  <option value="ouverte">Ouverte</option>
                  <option value="complete">Complète</option>
                  <option value="fermee">Fermée</option>
                  <option value="annulee">Annulée</option>
                  <option value="terminee">Terminée</option>
                </>
              ) : (
                <>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="rejected">Rejetée</option>
                  <option value="cancelled">Annulée</option>
                </>
              )}
            </select>
            {activeTab === 'sessions' && (
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cjblue focus:border-transparent"
              >
                <option value="all">Tous formats</option>
                <option value="presentiel">Présentiel</option>
                <option value="distanciel">Distanciel</option>
                <option value="hybride">Hybride</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates & Lieu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {session.formation.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.formation.categorie}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <FormattedDate date={session.startDate} /> - <FormattedDate date={session.endDate} />
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {session.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {session.enrollments?.length || 0}/{session.maxParticipants}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-cjblue h-2 rounded-full"
                          style={{ width: `${((session.enrollments?.length || 0) / session.maxParticipants) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(session.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-cjblue hover:text-blue-700">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-700">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune session trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer votre première session de formation.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cjblue hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paiement
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.firstName} {enrollment.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enrollment.email}
                        </div>
                        {enrollment.phone && (
                          <div className="text-sm text-gray-500">
                            {enrollment.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {enrollment.formation.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enrollment.session ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            <FormattedDate date={enrollment.session.startDate} />
                          </div>
                          <div className="text-sm text-gray-500">
                            {enrollment.session.location}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Non assignée</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEnrollmentStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(enrollment.paymentStatus)}`}>
                        {enrollment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-cjblue hover:text-blue-700">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="text-green-600 hover:text-green-700">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-700">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEnrollments.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune inscription</h3>
              <p className="mt-1 text-sm text-gray-500">
                Les inscriptions apparaîtront ici une fois que les candidats se seront inscrits.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-cjblue">Créer une Nouvelle Session</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de la session
                </label>
                <div className="space-y-4">
                  {imagePreview || createForm.imageUrl ? (
                    <div className="relative">
                      <img
                        src={imagePreview || createForm.imageUrl}
                        alt="Aperçu de la session"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Ajoutez une image pour illustrer la session
                      </p>
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-cjblue text-white rounded-md hover:bg-blue-700">
                        <Upload className="w-4 h-4 mr-2" />
                        Choisir une image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ou URL de l'image
                    </label>
                    <input
                      type="url"
                      value={createForm.imageUrl}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://exemple.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formation
                  </label>
                  <select
                    value={createForm.formationId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, formationId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner une formation</option>
                    {formations.map((formation) => (
                      <option key={formation.id} value={formation.id}>
                        {formation.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <select
                    value={createForm.format}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                  >
                    <option value="presentiel">Présentiel</option>
                    <option value="distanciel">Distanciel</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Dakar, Sénégal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (USD)
                  </label>
                  <input
                    type="number"
                    value={createForm.price}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="150000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre max de participants
                  </label>
                  <input
                    type="number"
                    value={createForm.maxParticipants}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 25 }))}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la session..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prérequis
                </label>
                <textarea
                  rows={3}
                  value={createForm.prerequisites}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, prerequisites: e.target.value }))}
                  placeholder="Prérequis pour participer à la session..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectifs
                </label>
                <textarea
                  rows={3}
                  value={createForm.objectives}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, objectives: e.target.value }))}
                  placeholder="Objectifs pédagogiques de la session..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                ></textarea>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cjblue text-white rounded-md hover:bg-blue-700"
                >
                  Créer la Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
