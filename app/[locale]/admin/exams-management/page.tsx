'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Exam {
  id: number
  title: string
  description: string
  formationId: number
  formation: {
    title: string
    categorie: string
  }
  duration: number
  questions: Array<{
    id: number
    question: string
    type: 'multiple' | 'text' | 'essay'
    options?: string[]
    correctAnswer?: string | number
    points: number
  }>
  startDate: string
  endDate: string
  maxAttempts: number
  status: 'draft' | 'published' | 'closed'
  createdAt: string
  updatedAt: string
  submissions: Array<{
    id: number
    studentEmail: string
    score?: number
    maxScore: number
    status: 'in_progress' | 'submitted' | 'graded'
    submittedAt: string
    gradedAt?: string
    gradedBy: string
  }>
}

export default function AdminExamsPage() {
  const { data: session } = useSession()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    formationId: 1,
    duration: 60,
    startDate: '',
    endDate: '',
    maxAttempts: 2,
    status: 'draft' as 'draft' | 'published' | 'closed'
  })
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'closed'>('all')

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/admin/exams')
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newExam = await response.json()
        setExams(prev => [newExam, ...prev])
        setShowCreateForm(false)
        setFormData({
          title: '',
          description: '',
          formationId: 1,
          duration: 60,
          startDate: '',
          endDate: '',
          maxAttempts: 2,
          status: 'draft'
        })
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'examen:', error)
    }
  }

  const handleUpdateExamStatus = async (examId: number, status: string) => {
    try {
      const response = await fetch('/api/admin/exams', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ examId, status })
      })

      if (response.ok) {
        setExams(prev => prev.map(exam => 
          exam.id === examId ? { ...exam, status: status as any } : exam
        ))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'published': return 'Publié'
      case 'closed': return 'Fermé'
      default: return status
    }
  }

  const filteredExams = exams.filter(exam => filter === 'all' || exam.status === filter)

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des examens...</p>
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
            Gestion des Examens & Corrections
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Créez, gérez et corrigez les examens en ligne
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvel examen
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total examens</p>
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Publiés</p>
              <p className="text-2xl font-bold text-green-600">
                {exams.filter(e => e.status === 'published').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Brouillons</p>
              <p className="text-2xl font-bold text-gray-600">
                {exams.filter(e => e.status === 'draft').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total soumissions</p>
              <p className="text-2xl font-bold text-purple-600">
                {exams.reduce((sum, e) => sum + e.submissions.length, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Filtres</h3>
            <p className="text-sm text-gray-600">Filtrer par statut</p>
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Tous', icon: '📚' },
              { value: 'draft', label: 'Brouillons', icon: '📋' },
              { value: 'published', label: 'Publiés', icon: '✅' },
              { value: 'closed', label: 'Fermés', icon: '❌' }
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilter(status.value as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{status.icon}</span>
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="space-y-6">
        {filteredExams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                  <p className="text-gray-600 mb-2">{exam.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📚 {exam.formation.title}</span>
                    <span>⏱️ {exam.duration} min</span>
                    <span>📝 {exam.questions.length} questions</span>
                    <span>🎯 {exam.maxAttempts} tentative(s)</span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 text-right">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                    {getStatusLabel(exam.status)}
                  </span>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Période de l'examen</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Début:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(exam.startDate).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fin:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(exam.endDate).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submissions Overview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Soumissions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-gray-900">{exam.submissions.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">En cours:</span>
                    <span className="font-medium text-blue-600">
                      {exam.submissions.filter(s => s.status === 'in_progress').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Notés:</span>
                    <span className="font-medium text-green-600">
                      {exam.submissions.filter(s => s.status === 'graded').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setSelectedExam(exam)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir détails
                </button>
                {exam.status === 'draft' && (
                  <button
                    onClick={() => handleUpdateExamStatus(exam.id, 'published')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Publier
                  </button>
                )}
                {exam.status === 'published' && (
                  <button
                    onClick={() => handleUpdateExamStatus(exam.id, 'closed')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Fermer
                  </button>
                )}
                {exam.status === 'closed' && (
                  <button
                    onClick={() => handleUpdateExamStatus(exam.id, 'published')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Réouvrir
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredExams.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun examen trouvé</h3>
          <p className="text-gray-600">
            {filter !== 'all' 
              ? 'Essayez de modifier le filtre pour voir plus d\'examens.'
              : 'Aucun examen n\'a été créé pour le moment.'
            }
          </p>
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Nouvel examen
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

              <form onSubmit={handleCreateExam} className="space-y-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <option value={1}>Développement Web</option>
                      <option value={2}>Marketing Digital</option>
                      <option value={3}>Gestion de Projet</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Durée (minutes) *
                    </label>
                    <input
                      type="number"
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="maxAttempts" className="block text-sm font-medium text-gray-700 mb-2">
                      Tentatives maximales
                    </label>
                    <input
                      type="number"
                      id="maxAttempts"
                      value={formData.maxAttempts}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                      <option value="closed">Fermé</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin *
                    </label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
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
                    Créer l'examen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Exam Detail Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Détails de l'examen
                </h2>
                <button
                  onClick={() => setSelectedExam(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Exam Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Informations générales</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Titre:</span> {selectedExam.title}</div>
                    <div><span className="text-gray-600">Formation:</span> {selectedExam.formation.title}</div>
                    <div><span className="text-gray-600">Durée:</span> {selectedExam.duration} minutes</div>
                    <div><span className="text-gray-600">Questions:</span> {selectedExam.questions.length}</div>
                    <div><span className="text-gray-600">Tentatives:</span> {selectedExam.maxAttempts}</div>
                    <div><span className="text-gray-600">Statut:</span> 
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedExam.status)}`}>
                        {getStatusLabel(selectedExam.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
                  <div className="space-y-3">
                    {selectedExam.questions.map((question, index) => (
                      <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-medium text-gray-900">Q{index + 1}: {question.question}</span>
                            <span className="text-sm text-gray-600 ml-2">({question.points} points)</span>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            question.type === 'multiple' ? 'bg-blue-100 text-blue-800' :
                            question.type === 'text' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {question.type === 'multiple' ? 'QCM' : question.type === 'text' ? 'Texte' : 'Essai'}
                          </span>
                        </div>
                        {question.options && (
                          <div className="space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="text-sm text-gray-600">
                                {optIndex + 1}. {option}
                                {option === question.correctAnswer && (
                                  <span className="ml-2 text-green-600 font-medium">(✓ Correct)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submissions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Soumissions</h3>
                  <div className="space-y-3">
                    {selectedExam.submissions.map((submission) => (
                      <div key={submission.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{submission.studentEmail}</p>
                            <p className="text-sm text-gray-600">
                              Soumis le {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                              submission.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {submission.status === 'graded' ? 'Noté' :
                               submission.status === 'submitted' ? 'Soumis' : 'En cours'}
                            </span>
                            {submission.score && (
                              <p className="text-sm font-bold text-green-600 mt-1">
                                {submission.score}/{submission.maxScore}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setSelectedExam(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  {selectedExam.status === 'draft' && (
                    <button
                      onClick={() => {
                        handleUpdateExamStatus(selectedExam.id, 'published')
                        setSelectedExam(null)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Publier
                    </button>
                  )}
                  {selectedExam.status === 'published' && (
                    <button
                      onClick={() => {
                        handleUpdateExamStatus(selectedExam.id, 'closed')
                        setSelectedExam(null)
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Fermer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
