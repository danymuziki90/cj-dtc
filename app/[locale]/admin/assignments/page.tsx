'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Assignment {
  id: number
  title: string
  description: string
  type: 'tp' | 'exam' | 'project'
  formationId: number
  formation: {
    title: string
  }
  deadline: string
  maxFileSize: number
  allowedFileTypes: string[]
  instructions: string
  createdAt: string
  submissions: Array<{
    id: number
    studentEmail: string
    status: string
    grade?: number
    submittedAt: string
  }>
}

export default function AdminAssignmentsPage() {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'tp' as 'tp' | 'exam' | 'project',
    formationId: 1,
    deadline: '',
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'zip'],
    instructions: ''
  })

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/admin/assignments')
      const data = await response.json()
      setAssignments(data)
    } catch (error) {
      console.error('Erreur lors du chargement des travaux:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newAssignment = await response.json()
        setAssignments(prev => [newAssignment, ...prev])
        setShowCreateForm(false)
        setFormData({
          title: '',
          description: '',
          type: 'tp',
          formationId: 1,
          deadline: '',
          maxFileSize: 10,
          allowedFileTypes: ['pdf', 'doc', 'docx', 'zip'],
          instructions: ''
        })
      }
    } catch (error) {
      console.error('Erreur lors de la création du travail:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tp': return '💻'
      case 'exam': return '📝'
      case 'project': return '🚀'
      default: return '📄'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tp': return 'TP'
      case 'exam': return 'Examen'
      case 'project': return 'Projet'
      default: return type
    }
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const getDeadlineColor = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'text-red-600'
    if (diffDays <= 3) return 'text-orange-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des travaux...</p>
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
            Gestion des travaux
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Créez et gérez les TP, examens et projets
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouveau travail
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total travaux</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">TP</p>
              <p className="text-2xl font-bold text-green-600">
                {assignments.filter(a => a.type === 'tp').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💻</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Examens</p>
              <p className="text-2xl font-bold text-purple-600">
                {assignments.filter(a => a.type === 'exam').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projets</p>
              <p className="text-2xl font-bold text-orange-600">
                {assignments.filter(a => a.type === 'project').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(assignment.type)}</span>
                    <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getTypeLabel(assignment.type)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{assignment.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📚 {assignment.formation.title}</span>
                    <span className={getDeadlineColor(assignment.deadline)}>
                      📅 Deadline: {new Date(assignment.deadline).toLocaleDateString('fr-FR')}
                      {isOverdue(assignment.deadline) && ' (En retard!)'}
                    </span>
                    <span>📁 Max: {assignment.maxFileSize}MB</span>
                    <span>📄 {assignment.allowedFileTypes.join(', ')}</span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 text-right">
                  <div className="text-sm text-gray-600 mb-2">
                    {assignment.submissions.length} soumission(s)
                  </div>
                  <Link
                    href={`/admin/submissions?assignmentId=${assignment.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Voir les soumissions
                  </Link>
                </div>
              </div>

              {/* Instructions */}
              {assignment.instructions && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
                </div>
              )}

              {/* Recent Submissions */}
              {assignment.submissions.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Soumissions récentes</h4>
                  <div className="space-y-2">
                    {assignment.submissions.slice(0, 3).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{submission.studentEmail}</p>
                          <p className="text-xs text-gray-500">
                            Soumis le {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          {submission.grade ? (
                            <p className="text-sm font-bold text-green-600">{submission.grade}/20</p>
                          ) : (
                            <span className="text-xs text-blue-600">En attente de notation</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {assignment.submissions.length > 3 && (
                    <div className="mt-2 text-center">
                      <Link
                        href={`/admin/submissions?assignmentId=${assignment.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Voir toutes les soumissions →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Assignment Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Nouveau travail
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

              <form onSubmit={handleCreateAssignment} className="space-y-6">
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
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="tp">TP</option>
                      <option value="exam">Examen</option>
                      <option value="project">Projet</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      id="deadline"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-2">
                      Taille max (MB)
                    </label>
                    <input
                      type="number"
                      id="maxFileSize"
                      value={formData.maxFileSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxFileSize: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div>
                    <label htmlFor="formationId" className="block text-sm font-medium text-gray-700 mb-2">
                      Formation
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
                </div>

                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Instructions détaillées pour les étudiants..."
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
                    Créer le travail
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
