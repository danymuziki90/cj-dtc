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
  _count: {
    submissions: number
  }
}

interface Submission {
  id: number
  assignmentId: number
  studentEmail: string
  status: 'submitted' | 'graded' | 'returned'
  grade?: number
  feedback?: string
  submittedAt: string
  gradedAt?: string
  gradedBy?: string
  assignment: Assignment
  files: Array<{
    id: number
    name: string
    originalName: string
    size: number
    mimeType: string
    url: string
  }>
}

export default function AdminSubmissionsPage() {
  const { data: session } = useSession()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [grading, setGrading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded' | 'returned'>('all')
  const [selectedAssignment, setSelectedAssignment] = useState<string>('')

  useEffect(() => {
    fetchSubmissions()
    fetchAssignments()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions')
      const data = await response.json()
      setSubmissions(data)
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignments = async () => {
    try {
      // Simuler les travaux (en réalité, viendraient de l'API)
      const mockAssignments: Assignment[] = [
        {
          id: 1,
          title: 'TP 1 - Introduction à la programmation',
          description: 'Exercices de base en JavaScript',
          type: 'tp',
          formationId: 1,
          formation: { title: 'Développement Web' },
          deadline: '2025-07-15',
          maxFileSize: 10,
          allowedFileTypes: ['pdf', 'doc', 'docx', 'zip'],
          instructions: 'Résolvez les exercices et soumettez vos solutions',
          createdAt: '2025-06-01',
          _count: { submissions: 15 }
        },
        {
          id: 2,
          title: 'Examen mi-parcours',
          description: 'Évaluation des connaissances acquises',
          type: 'exam',
          formationId: 1,
          formation: { title: 'Développement Web' },
          deadline: '2025-07-20',
          maxFileSize: 15,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          instructions: 'Examen écrit de 2 heures',
          createdAt: '2025-06-10',
          _count: { submissions: 12 }
        }
      ]
      setAssignments(mockAssignments)
    } catch (error) {
      console.error('Erreur lors du chargement des travaux:', error)
    }
  }

  const handleGradeSubmission = async (submissionId: number, grade: number, feedback: string) => {
    setGrading(true)
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId,
          grade,
          feedback,
          status: 'graded'
        })
      })

      if (response.ok) {
        const updatedSubmission = await response.json()
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId ? updatedSubmission : sub
        ))
        setSelectedSubmission(null)
      }
    } catch (error) {
      console.error('Erreur lors de la notation:', error)
    } finally {
      setGrading(false)
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = filter === 'all' || submission.status === filter
    const matchesAssignment = !selectedAssignment || submission.assignmentId.toString() === selectedAssignment
    return matchesStatus && matchesAssignment
  })

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

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600'
    if (grade >= 12) return 'text-blue-600'
    if (grade >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des soumissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Soumissions des étudiants
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Consultez, notez et donnez du feedback sur les travaux soumis
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="assignment" className="block text-sm font-medium text-gray-700 mb-2">
              Travail
            </label>
            <select
              id="assignment"
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les travaux</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id.toString()}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              id="status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="submitted">Soumis</option>
              <option value="graded">Notés</option>
              <option value="returned">Renvoyés</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredSubmissions.length}</span> soumission(s) trouvée(s)
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-6">
        {filteredSubmissions.map((submission) => (
          <div key={submission.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(submission.assignment.type)}</span>
                    <h3 className="text-xl font-bold text-gray-900">{submission.assignment.title}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getTypeLabel(submission.assignment.type)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                    <span>👤 {submission.studentEmail}</span>
                    <span>📚 {submission.assignment.formation.title}</span>
                    <span>📅 Soumis le {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {submission.grade && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold" style={{ color: getGradeColor(submission.grade) }}>
                        Note: {submission.grade}/20
                      </span>
                      {submission.gradedBy && (
                        <span className="text-xs text-gray-500">
                          par {submission.gradedBy}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 sm:mt-0">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                    {getStatusLabel(submission.status)}
                  </span>
                </div>
              </div>

              {/* Files */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Fichiers soumis ({submission.files.length})</h4>
                <div className="space-y-2">
                  {submission.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{file.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • {file.mimeType}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {submission.feedback && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Feedback</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-700">{submission.feedback}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                {submission.status === 'submitted' && (
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Noter
                  </button>
                )}
                {submission.status === 'graded' && (
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Modifier la note
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubmissions.length === 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-12 text-center">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune soumission trouvée</h3>
          <p className="text-gray-600">
            {filter !== 'all' || selectedAssignment 
              ? 'Essayez de modifier les filtres pour voir plus de soumissions.'
              : 'Aucun travail n\'a été soumis pour le moment.'
            }
          </p>
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Noter: {selectedSubmission.assignment.title}
                </h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Informations de soumission</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">Étudiant:</span> {selectedSubmission.studentEmail}</div>
                    <div><span className="text-gray-600">Formation:</span> {selectedSubmission.assignment.formation.title}</div>
                    <div><span className="text-gray-600">Soumis le:</span> {new Date(selectedSubmission.submittedAt).toLocaleDateString('fr-FR')}</div>
                    <div><span className="text-gray-600">Type:</span> {getTypeLabel(selectedSubmission.assignment.type)}</div>
                  </div>
                </div>

                {/* Files */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Fichiers soumis</h3>
                  <div className="space-y-2">
                    {selectedSubmission.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📄</span>
                          <div>
                            <p className="text-sm font-medium">{file.originalName}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                        >
                          Voir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grading Form */}
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const grade = Number(formData.get('grade'))
                  const feedback = formData.get('feedback') as string
                  handleGradeSubmission(selectedSubmission.id, grade, feedback)
                }}>
                  <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                      Note /20 *
                    </label>
                    <input
                      type="number"
                      id="grade"
                      name="grade"
                      min="0"
                      max="20"
                      step="0.5"
                      defaultValue={selectedSubmission.grade || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback
                    </label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      rows={4}
                      defaultValue={selectedSubmission.feedback || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Commentaires sur le travail de l'étudiant..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={grading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {grading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H2a8 8 0 0 0 6 0z"></path>
                          </svg>
                          Notation...
                        </span>
                      ) : (
                        'Enregistrer la note'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
