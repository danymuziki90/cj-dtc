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
}

interface Progress {
  id: number
  studentEmail: string
  courseId: number
  completed: boolean
  completedAt?: string
  timeSpent: number
  score?: number
}

export default function StudentELearningPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'video' | 'text' | 'quiz' | 'assignment'>('all')

  useEffect(() => {
    fetchCourses()
    fetchProgress()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/student/courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/student/progress')
      const data = await response.json()
      setProgress(data)
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error)
    }
  }

  const updateProgress = async (courseId: number, completed: boolean, timeSpent: number) => {
    try {
      const response = await fetch('/api/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId,
          completed,
          timeSpent
        })
      })

      if (response.ok) {
        const updatedProgress = await response.json()
        setProgress(prev => {
          const filtered = prev.filter(p => p.courseId !== courseId)
          return [...filtered, updatedProgress]
        })
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error)
    }
  }

  const getCourseProgress = (courseId: number) => {
    const courseProgress = progress.find(p => p.courseId === courseId)
    return courseProgress?.completed || false
  }

  const getCourseTimeSpent = (courseId: number) => {
    const courseProgress = progress.find(p => p.courseId === courseId)
    return courseProgress?.timeSpent || 0
  }

  const getOverallProgress = () => {
    if (courses.length === 0) return 0
    const completedCourses = progress.filter(p => p.completed).length
    return Math.round((completedCourses / courses.length) * 100)
  }

  const filteredCourses = courses.filter(course => 
    filter === 'all' || course.type === filter
  )

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
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          E-Learning
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Accédez à vos cours et suivez votre progression
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Votre progression</h2>
            <p className="text-sm text-gray-600">Continuez votre apprentissage!</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{getOverallProgress()}%</div>
            <p className="text-sm text-gray-500">Complété</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${getOverallProgress()}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            <p className="text-sm text-gray-600">Cours disponibles</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{progress.filter(p => p.completed).length}</p>
            <p className="text-sm text-gray-600">Cours complétés</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(progress.reduce((sum, p) => sum + p.timeSpent, 0) / 60)}h
            </p>
            <p className="text-sm text-gray-600">Temps total</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filtrer par type</h3>
            <p className="text-sm text-gray-600">Choisissez le type de contenu</p>
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Tous', icon: '📚' },
              { value: 'video', label: 'Vidéos', icon: '🎥' },
              { value: 'text', label: 'Textes', icon: '📖' },
              { value: 'quiz', label: 'Quiz', icon: '🧩' },
              { value: 'assignment', label: 'Exercices', icon: '📝' }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {filteredCourses.map((course) => {
          const isCompleted = getCourseProgress(course.id)
          const timeSpent = getCourseTimeSpent(course.id)
          
          return (
            <div key={course.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
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
                      <span>📊 {isCompleted ? '✅ Complété' : '⏳ En cours'}</span>
                      <span>⏰️ {Math.round(timeSpent / 60)}h {timeSpent % 60}min</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isCompleted ? 'Revoir' : 'Commencer'}
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progression</span>
                    <span>{isCompleted ? '100%' : `${Math.round((timeSpent / (course.duration || 60)) * 100)}%`}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${isCompleted ? 100 : Math.min((timeSpent / (course.duration || 60)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        // Simuler la progression
                        updateProgress(course.id, true, timeSpent + 30)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Marquer comme complété
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir le contenu
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-12 text-center">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun cours trouvé</h3>
          <p className="text-gray-600">
            {filter !== 'all' 
              ? 'Essayez de modifier le filtre pour voir plus de cours.'
              : 'Aucun cours n\'est disponible pour le moment.'
            }
          </p>
        </div>
      )}

      {/* Course Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                    <div><span className="text-gray-600">Durée:</span> {selectedCourse.duration ? `${selectedCourse.duration} minutes` : 'Non spécifiée'}</div>
                    <div><span className="text-gray-600">Type:</span> {getTypeLabel(selectedCourse.type)}</div>
                  </div>
                </div>

                {/* Course Content */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Contenu du cours</h3>
                  <div className="prose max-w-none">
                    {selectedCourse.type === 'video' && selectedCourse.videoUrl ? (
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="aspect-w-full bg-gray-300 rounded-lg mb-4 flex items-center justify-center">
                          <span className="text-4xl">🎥</span>
                        </div>
                        <p className="text-center text-gray-600">
                          Vidéo du cours "{selectedCourse.title}"
                        </p>
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => window.open(selectedCourse.videoUrl, '_blank')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Lire la vidéo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {selectedCourse.content || 'Contenu du cours en cours de préparation...'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Actions */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Temps passé: {Math.round(getCourseTimeSpent(selectedCourse.id) / 60)}h {getCourseTimeSpent(selectedCourse.id) % 60}min</p>
                    <p className="text-sm text-gray-600">
                      Statut: {getCourseProgress(selectedCourse.id) ? '✅ Complété' : '⏳ En cours'}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    {!getCourseProgress(selectedCourse.id) && (
                      <button
                        onClick={() => {
                          updateProgress(selectedCourse.id, true, getCourseTimeSpent(selectedCourse.id) + 30)
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Marquer comme complété
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
