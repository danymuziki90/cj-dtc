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
  createdAt: string
}

interface ExamSubmission {
  id: number
  examId: number
  studentEmail: string
  answers: Array<{
    questionId: number
    answer: string | string[]
    timeSpent: number
  }>
  score?: number
  maxScore: number
  status: 'in_progress' | 'submitted' | 'graded'
  startedAt: string
  submittedAt?: string
  gradedAt?: string
  gradedBy?: string
}

export default function StudentExamsPage() {
  const { data: session } = useSession()
  const [exams, setExams] = useState<Exam[]>([])
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [currentSubmission, setCurrentSubmission] = useState<ExamSubmission | null>(null)
  const [examState, setExamState] = useState<'not_started' | 'in_progress' | 'submitted'>('not_started')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [startTime, setStartTime] = useState<Date | null>(null)

  useEffect(() => {
    fetchExams()
    fetchSubmissions()
  }, [])

  useEffect(() => {
    if (examState === 'in_progress' && startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        const remaining = Math.max(0, (selectedExam?.duration || 0) * 60 - elapsed)
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          submitExam()
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [examState, startTime, selectedExam])

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/student/exams')
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/student/exams/submissions')
      const data = await response.json()
      setSubmissions(data)
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions:', error)
    }
  }

  const startExam = (exam: Exam) => {
    setSelectedExam(exam)
    setCurrentSubmission({
      id: Date.now(),
      examId: exam.id,
      studentEmail: session?.user?.email || '',
      answers: [],
      maxScore: exam.questions.reduce((sum, q) => sum + q.points, 0),
      status: 'in_progress',
      startedAt: new Date().toISOString()
    })
    setExamState('in_progress')
    setStartTime(new Date())
    setCurrentQuestion(0)
    setAnswers({})
    setTimeRemaining(exam.duration * 60)
  }

  const handleAnswer = (questionId: number, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < (selectedExam?.questions.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const submitExam = async () => {
    if (!selectedExam || !currentSubmission) return

    try {
      const response = await fetch('/api/student/exams/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          examId: selectedExam.id,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId: Number(questionId),
            answer,
            timeSpent: Math.floor((new Date().getTime() - (startTime?.getTime() || 0)) / 1000)
          }))
        })
      })

      if (response.ok) {
        const result = await response.json()
        setCurrentSubmission(result.submission)
        setExamState('submitted')
        setSubmissions(prev => [result.submission, ...prev])
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    }
  }

  const getExamStatus = (examId: number) => {
    const submission = submissions.find(s => s.examId === examId)
    return submission?.status || 'not_started'
  }

  const getExamScore = (examId: number) => {
    const submission = submissions.find(s => s.examId === examId)
    return submission?.score
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const isExamAvailable = (exam: Exam) => {
    const now = new Date()
    const start = new Date(exam.startDate)
    const end = new Date(exam.endDate)
    return now >= start && now <= end
  }

  const isExamOver = (exam: Exam) => {
    return new Date() > new Date(exam.endDate)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'submitted': return 'bg-yellow-100 text-yellow-800'
      case 'graded': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_started': return 'Non commencé'
      case 'in_progress': return 'En cours'
      case 'submitted': return 'Soumis'
      case 'graded': return 'Noté'
      default: return status
    }
  }

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
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Examens & Évaluations
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Passez vos examens en ligne et consultez vos résultats
        </p>
      </div>

      {/* Exam Interface */}
      {selectedExam && examState !== 'not_started' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              {/* Exam Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedExam.title}</h2>
                  <p className="text-gray-600">
                    Question {currentQuestion + 1} / {selectedExam.questions.length}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    ⏰️ {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / selectedExam.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedExam.questions[currentQuestion].question}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedExam.questions[currentQuestion].points} point(s)
                </p>

                {/* Multiple Choice */}
                {selectedExam.questions[currentQuestion].type === 'multiple' && (
                  <div className="space-y-3">
                    {selectedExam.questions[currentQuestion].options?.map((option, index) => (
                      <label key={index} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={option}
                          checked={answers[selectedExam.questions[currentQuestion].id] === option}
                          onChange={(e) => handleAnswer(selectedExam.questions[currentQuestion].id, e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Text Answer */}
                {selectedExam.questions[currentQuestion].type === 'text' && (
                  <div>
                    <textarea
                      value={answers[selectedExam.questions[currentQuestion].id] as string || ''}
                      onChange={(e) => handleAnswer(selectedExam.questions[currentQuestion].id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Votre réponse..."
                    />
                  </div>
                )}

                {/* Essay */}
                {selectedExam.questions[currentQuestion].type === 'essay' && (
                  <div>
                    <textarea
                      value={answers[selectedExam.questions[currentQuestion].id] as string || ''}
                      onChange={(e) => handleAnswer(selectedExam.questions[currentQuestion].id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={6}
                      placeholder="Développez votre réponse..."
                    />
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <div className="flex gap-4">
                  {currentQuestion < selectedExam.questions.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Suivant
                    </button>
                  ) : (
                    <button
                      onClick={submitExam}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Soumettre
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {examState === 'submitted' && currentSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <span className="text-6xl mb-4 block">🎉</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Examen terminé!</h2>
                <p className="text-gray-600">
                  Votre réponse a été soumise avec succès
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Résumé</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Examen:</span> {selectedExam?.title || ''}</div>
                  <div><span className="text-gray-600">Durée:</span> {selectedExam?.duration || 0} min</div>
                  <div><span className="text-gray-600">Questions:</span> {selectedExam?.questions.length || 0}</div>
                  <div><span className="text-gray-600">Temps passé:</span> {formatTime(Math.floor((new Date().getTime() - (startTime?.getTime() || 0)) / 1000))}</div>
                  <div><span className="text-gray-600">Score:</span> {currentSubmission?.score || 0}/{selectedExam?.questions.reduce((sum, q) => sum + q.points, 0) || 0}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setSelectedExam(null)
                    setCurrentSubmission(null)
                    setExamState('not_started')
                    setCurrentQuestion(0)
                    setAnswers({})
                    setStartTime(null)
                    setTimeRemaining(0)
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retour aux examens
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exams List */}
      <div className="space-y-6">
        {exams.map((exam) => {
          const status = getExamStatus(exam.id)
          const score = getExamScore(exam.id)
          const isAvailable = isExamAvailable(exam)
          const isOver = isExamOver(exam)

          return (
            <div key={exam.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
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
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                    {score && (
                      <p className="text-lg font-bold text-green-600 mt-2">
                        Score: {score}/{exam.questions.reduce((sum, q) => sum + q.points, 0)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Période de l'examen</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Début:</span>
                      <span className={`font-medium ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(exam.startDate).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fin:</span>
                      <span className={`font-medium ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(exam.endDate).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  {!isAvailable && !isOver && (
                    <div className="mt-2 text-sm text-orange-600">
                      ⏰️ L'examen n'est pas encore disponible
                    </div>
                  )}
                  {isOver && (
                    <div className="mt-2 text-sm text-red-600">
                      ❌ L'examen est terminé
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  {isAvailable && !isOver && status === 'not_started' && (
                    <button
                      onClick={() => startExam(exam)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Commencer l'examen
                    </button>
                  )}
                  {status === 'in_progress' && (
                    <button
                      onClick={() => setSelectedExam(exam)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Reprendre
                    </button>
                  )}
                  {status === 'submitted' && (
                    <button
                      onClick={() => setSelectedExam(exam)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Voir les détails
                    </button>
                  )}
                  {status === 'graded' && (
                    <button
                      onClick={() => setSelectedExam(exam)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Voir les résultats
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {exams.length === 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-12 text-center">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun examen disponible</h3>
          <p className="text-gray-600">
            Aucun examen n'a été programmé pour le moment.
          </p>
        </div>
      )}
    </div>
  )
}
