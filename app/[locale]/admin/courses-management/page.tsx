'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Course {
  id: number
  title: string
  description: string
  content: string
  type: 'video' | 'text' | 'quiz' | 'assignment'
  formationId: number
  formation: {
    title: string
    categorie: string
  }
  order: number
  duration?: number
  videoUrl?: string
  createdAt: string
  updatedAt: string
  _count: {
    progress: number
  }
}

interface Formation {
  id: number
  title: string
  categorie: string
  statut: string
  _count: {
    courses: number
    enrollments: number
  }
}

export default function AdminCoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'text' as 'video' | 'text' | 'quiz' | 'assignment',
    formationId: 1,
    order: 1,
    duration: 30,
    videoUrl: ''
  })
  const [filter, setFilter] = useState<'all' | 'video' | 'text' | 'quiz' | 'assignment'>('all')
  const [formationFilter, setFormationFilter] = useState('all')

  useEffect(() => {
    fetchCourses()
    fetchFormations()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations')
      const data = await response.json()
      setFormations(data)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newCourse = await response.json()
        setCourses(prev => [newCourse, ...prev])
        setShowCreateForm(false)
        setFormData({
          title: '',
          description: '',
          content: '',
          type: 'text',
          formationId: 1,
          order: 1,
          duration: 30,
          videoUrl: ''
        })
      }
    } catch (error) {
      console.error('Erreur lors de la création du cours:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥'
      case 'text': return '📖'
      case 'quiz': return '🧩'
      case 'assignment': return '📝'
      default: return '📄'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Vidéo'
      case 'text': return 'Texte'
      case 'quiz': return 'Quiz'
      case 'assignment': return 'Exercice'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-100 text-purple-800'
      case 'text': return 'bg-blue-100 text-blue-800'
      case 'quiz': return 'bg-green-100 text-green-800'
      case 'assignment': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesType = filter === 'all' || course.type === filter
    const matchesFormation = formationFilter === 'all' || course.formationId.toString() === formationFilter
    return matchesType && matchesFormation
  })

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Header */}
      <div className="mb-8 sm:mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Gestion des Cours & E-Learning
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Créez et gérez les contenus pédagogiques
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouveau cours
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total cours</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vidéos</p>
              <p className="text-2xl font-bold text-purple-600">
                {courses.filter(c => c.type === 'video').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz</p>
              <p className="text-2xl font-bold text-green-600">
                {courses.filter(c => c.type === 'quiz').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🧩</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Exercices</p>
              <p className="text-2xl font-bold text-orange-600">
                {courses.filter(c => c.type === 'assignment').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Filtres</h3>
            <p className="text-sm text-gray-600">Filtrer par type et formation</p>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="video">Vidéos</option>
              <option value="text">Textes</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Exercices</option>
            </select>
            <select
              value={formationFilter}
              onChange={(e) => setFormationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les formations</option>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id.toString()}>
                  {formation.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(course.type)}</span>
                    <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(course.type)}`}>
                      {getTypeLabel(course.type)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{course.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📚 {course.formation.title}</span>
                    <span>📂 {course.formation.categorie}</span>
                    {course.duration && <span>⏱️ {course.duration} min</span>}
                    <span>📊 {course._count.progress} étudiant(s)</span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir détails
                  </button>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Progression des étudiants</h4>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((course._count.progress / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 ml-4">
                    {course._count.progress} / 10 étudiants
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    // Simuler la suppression
                    setCourses(prev => prev.filter(c => c.id !== course.id))
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun cours trouvé</h3>
          <p className="text-gray-600">
            {filter !== 'all' || formationFilter !== 'all' 
              ? 'Essayez de modifier les filtres pour voir plus de cours.'
              : 'Aucun cours n\'a été créé pour le moment.'
            }
          </p>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Nouveau cours
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="text">Texte</option>
                      <option value="video">Vidéo</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Exercice</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="formationId" className="block text-sm font-medium text-gray-700 mb-2">
                      Formation *
                    </label>
                    <select
                      id="formationId"
                      value={formData.formationId}
                      onChange={(e) => setFormData(prev => ({ ...prev, formationId: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {formations.map((formation) => (
                        <option key={formation.id} value={formation.id}>
                          {formation.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Durée (minutes)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>

                  <div>
                    <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                      Ordre
                    </label>
                    <input
                      type="number"
                      id="order"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>

                  <div>
                    <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      URL vidéo (si type vidéo)
                    </label>
                    <input
                      type="url"
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/video"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu *
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contenu détaillé du cours..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Créer le cours
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(selectedCourse.type)}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedCourse.type)}`}>
                      {getTypeLabel(selectedCourse.type)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Course Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Informations du cours</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Formation:</span> {selectedCourse.formation.title}</div>
                    <div><span className="text-gray-600">Catégorie:</span> {selectedCourse.formation.categorie}</div>
                    <div><span className="text-gray-600">Durée:</span> {selectedCourse.duration} minutes</div>
                    <div><span className="text-gray-600">Ordre:</span> {selectedCourse.order}</div>
                    <div><span className="text-gray-600">Étudiants:</span> {selectedCourse._count.progress}</div>
                    <div><span className="text-gray-600">Créé le:</span> {new Date(selectedCourse.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Contenu du cours</h3>
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {selectedCourse.content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      // Simuler la modification
                      setCourses(prev => prev.map(c => 
                        c.id === selectedCourse.id ? { ...c, updatedAt: new Date().toISOString() } : c
                      ))
                      setSelectedCourse(null)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
