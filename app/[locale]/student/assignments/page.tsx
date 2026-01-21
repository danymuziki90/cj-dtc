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
    status: 'submitted' | 'graded' | 'returned'
    grade?: number
    feedback?: string
    submittedAt: string
    gradedAt?: string
    files: Array<{
      id: number
      name: string
      size: number
      type: string
      url: string
    }>
  }>
}

export default function StudentAssignmentsPage() {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [filter, setFilter] = useState<'all' | 'tp' | 'exam' | 'project'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/student/assignments')
      const data = await response.json()
      setAssignments(data)
    } catch (error) {
      console.error('Erreur lors du chargement des travaux:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAssignment = async (assignmentId: number) => {
    if (!files || files.length === 0) {
      alert('Veuillez sélectionner au moins un fichier')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      
      // Ajouter les fichiers
      Array.from(files).forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })
      
      // Ajouter les métadonnées
      formData.append('assignmentId', assignmentId.toString())
      formData.append('fileCount', files.length.toString())

      const response = await fetch('/api/student/assignments/submit', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        // Mettre à jour l'assignment dans la liste
        setAssignments(prev => prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, submissions: [...assignment.submissions, result.submission] }
            : assignment
        ))
        setSelectedAssignment(null)
        setFiles(null)
        alert('Travail soumis avec succès!')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la soumission')
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert('Une erreur est survenue lors de la soumission. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesType = filter === 'all' || assignment.type === filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && assignment.submissions.length === 0) ||
      (statusFilter === 'submitted' && assignment.submissions.some(s => s.status === 'submitted')) ||
      (statusFilter === 'graded' && assignment.submissions.some(s => s.status === 'graded'))
    
    return matchesType && matchesStatus
  })

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'graded': return 'bg-green-100 text-green-800'
      case 'returned': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Soumis'
      case 'graded': return 'Noté'
      case 'returned': return 'Renvoyé'
      default: return status
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
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Travaux et Devoirs
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Soumettez vos travaux et suivez leur progression
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type de travail
            </label>
            <select
              id="type"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="tp">TP</option>
              <option value="exam">Examens</option>
              <option value="project">Projets</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="submitted">Soumis</option>
              <option value="graded">Notés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {filteredAssignments.map((assignment) => {
          const latestSubmission = assignment.submissions[assignment.submissions.length - 1]
          const hasSubmission = assignment.submissions.length > 0
          
          return (
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
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0">
                    {hasSubmission ? (
                      <div className="text-right">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(latestSubmission.status)}`}>
                          {getStatusLabel(latestSubmission.status)}
                        </span>
                        {latestSubmission.grade && (
                          <p className="text-lg font-bold text-green-600 mt-2">
                            Note: {latestSubmission.grade}/20
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Soumettre
                      </button>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                {assignment.instructions && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
                  </div>
                )}

                {/* Submission History */}
                {hasSubmission && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Historique des soumissions</h4>
                    <div className="space-y-3">
                      {assignment.submissions.map((submission, index) => (
                        <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                                {getStatusLabel(submission.status)}
                              </span>
                              <span className="text-sm text-gray-600">
                                Soumis le {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {submission.files.length} fichier(s) • {submission.files.reduce((sum, file) => sum + file.size, 0)} bytes
                            </div>
                            {submission.feedback && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                                <strong>Feedback:</strong> {submission.feedback}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {submission.grade && (
                              <p className="text-lg font-bold text-green-600">{submission.grade}/20</p>
                            )}
                            {submission.gradedAt && (
                              <p className="text-xs text-gray-500">
                                Noté le {new Date(submission.gradedAt).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {!latestSubmission || latestSubmission.status === 'submitted' ? (
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {hasSubmission ? 'Soumettre une nouvelle version' : 'Soumettre'}
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-12 text-center">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun travail trouvé</h3>
          <p className="text-gray-600">
            {filter !== 'all' || statusFilter !== 'all' 
              ? 'Essayez de modifier les filtres pour voir plus de travaux.'
              : 'Aucun travail n\'a été assigné pour le moment.'
            }
          </p>
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Soumettre: {selectedAssignment.title}
                </h2>
                <button
                  onClick={() => {
                    setSelectedAssignment(null)
                    setFiles(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Assignment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Détails du travail</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">Type:</span> {getTypeLabel(selectedAssignment.type)}</div>
                    <div><span className="text-gray-600">Formation:</span> {selectedAssignment.formation.title}</div>
                    <div><span className="text-gray-600">Deadline:</span> {new Date(selectedAssignment.deadline).toLocaleDateString('fr-FR')}</div>
                    <div><span className="text-gray-600">Taille max:</span> {selectedAssignment.maxFileSize}MB</div>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fichiers à soumettre
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <span className="text-3xl mb-2 block">📁</span>
                      <p className="text-sm text-gray-600 mb-2">
                        Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
                      </p>
                      <input
                        type="file"
                        multiple
                        accept={selectedAssignment.allowedFileTypes.join(',')}
                        onChange={(e) => setFiles(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-8 0M4 12a8 8 0 018 0m-8-8v8m0 0l8 8" />
                        </svg>
                        <span className="text-sm font-medium">Choisir les fichiers</span>
                      </label>
                    </div>
                  </div>

                  {/* File List */}
                  {files && files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {Array.from(files).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📄</span>
                            <div>
                              <p className="text-sm font-medium text-gray-700">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB • {file.type}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    Formats acceptés: {selectedAssignment.allowedFileTypes.join(', ')}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setSelectedAssignment(null)
                      setFiles(null)
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleSubmitAssignment(selectedAssignment.id)}
                    disabled={submitting || !files || files.length === 0}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H2a8 8 0 0 0 6 0z"></path>
                        </svg>
                        Soumission...
                      </span>
                    ) : (
                      'Soumettre le travail'
                    )}
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
