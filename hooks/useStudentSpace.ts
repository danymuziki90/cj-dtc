'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Document {
  id: string
  title: string
  type: string
  size: number
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
  formationId: number
  formationName: string
  instructorId: string
  instructorName: string
  feedback?: string
}

interface ElearningCourse {
  id: string
  title: string
  description: string
  progress: number
  totalLessons: number
  completedLessons: number
  formationId: number
  formationName: string
  instructorId: string
  instructorName: string
  lastAccessed: string
  estimatedHours: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  thumbnail?: string
}

interface Certificate {
  id: string
  title: string
  formationName: string
  issueDate: string
  expiryDate?: string
  verificationCode: string
  status: 'valid' | 'expired' | 'revoked'
  qrCodeUrl: string
  downloadUrl: string
  grade?: string
  skills: string[]
}

interface CalendarEvent {
  id: string
  title: string
  type: 'exam' | 'assignment' | 'meeting' | 'holiday' | 'session'
  date: string
  startTime: string
  endTime?: string
  location?: string
  description: string
  formationId?: number
  formationName?: string
  instructorId?: string
  instructorName?: string
  isOnline: boolean
  meetingLink?: string
}

interface Exam {
  id: string
  title: string
  type: 'online' | 'written' | 'oral'
  date: string
  startTime: string
  duration: number
  location?: string
  formationId: number
  formationName: string
  instructorId: string
  instructorName: string
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
  maxScore: number
  studentScore?: number
  hasStarted: boolean
  isSubmitted: boolean
  instructions: string
  materials: string[]
}

export const useStudentSpace = () => {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [elearningCourses, setElearningCourses] = useState<ElearningCourse[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Charger les documents de l'étudiant
  const loadDocuments = async () => {
    if (!session) return
    
    setIsLoading(true)
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockDocuments: Document[] = [
        {
          id: '1',
          title: 'Devoir JavaScript - Module 3',
          type: 'assignment',
          size: 2048576,
          uploadDate: new Date().toISOString(),
          status: 'approved',
          formationId: 1,
          formationName: 'Développement Web Full Stack',
          instructorId: '1',
          instructorName: 'Jean Dupont',
          feedback: 'Excellent travail !'
        },
        {
          id: '2',
          title: 'Projet Final React',
          type: 'project',
          size: 5242880,
          uploadDate: new Date(Date.now() - 86400000).toISOString(),
          status: 'pending',
          formationId: 1,
          formationName: 'Développement Web Full Stack',
          instructorId: '1',
          instructorName: 'Jean Dupont'
        }
      ]
      
      setDocuments(mockDocuments)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Déposer un document
  const uploadDocument = async (file: File, documentType: string, formationId: number) => {
    if (!session) throw new Error('Vous devez être connecté')

    const newDocument: Document = {
      id: Date.now().toString(),
      title: file.name,
      type: documentType,
      size: file.size,
      uploadDate: new Date().toISOString(),
      status: 'pending',
      formationId,
      formationName: 'Formation en cours',
      instructorId: '1',
      instructorName: 'Formateur'
    }

    setDocuments(prev => [newDocument, ...prev])
    return newDocument
  }

  // Charger les cours e-learning
  const loadElearningCourses = async () => {
    if (!session) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockCourses: ElearningCourse[] = [
        {
          id: '1',
          title: 'Introduction à React',
          description: 'Apprenez les bases de React et créez votre première application',
          progress: 75,
          totalLessons: 12,
          completedLessons: 9,
          formationId: 1,
          formationName: 'Développement Web Full Stack',
          instructorId: '1',
          instructorName: 'Jean Dupont',
          lastAccessed: new Date().toISOString(),
          estimatedHours: 8,
          difficulty: 'beginner'
        },
        {
          id: '2',
          title: 'Node.js Backend',
          description: 'Créez des APIs RESTful avec Node.js et Express',
          progress: 30,
          totalLessons: 15,
          completedLessons: 4,
          formationId: 1,
          formationName: 'Développement Web Full Stack',
          instructorId: '1',
          instructorName: 'Jean Dupont',
          lastAccessed: new Date(Date.now() - 86400000).toISOString(),
          estimatedHours: 12,
          difficulty: 'intermediate'
        }
      ]
      
      setElearningCourses(mockCourses)
    } catch (error) {
      console.error('Error loading elearning courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les certificats
  const loadCertificates = async () => {
    if (!session) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockCertificates: Certificate[] = [
        {
          id: '1',
          title: 'Certification Développement Web',
          formationName: 'Développement Web Full Stack',
          issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
          verificationCode: 'CERT-2024-001',
          status: 'valid',
          qrCodeUrl: '/certificates/qr-1.png',
          downloadUrl: '/certificates/cert-1.pdf',
          grade: 'A',
          skills: ['React', 'Node.js', 'MongoDB', 'TypeScript']
        }
      ]
      
      setCertificates(mockCertificates)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Vérifier un certificat
  const verifyCertificate = async (verificationCode: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const certificate = certificates.find(cert => cert.verificationCode === verificationCode)
      
      if (!certificate) {
        return { valid: false, message: 'Certificat non trouvé' }
      }
      
      if (certificate.status === 'expired') {
        return { valid: false, message: 'Certificat expiré' }
      }
      
      if (certificate.status === 'revoked') {
        return { valid: false, message: 'Certificat révoqué' }
      }
      
      return { valid: true, certificate }
    } catch (error) {
      console.error('Error verifying certificate:', error)
      return { valid: false, message: 'Erreur lors de la vérification' }
    }
  }

  // Charger le calendrier académique
  const loadCalendarEvents = async () => {
    if (!session) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Examen Final JavaScript',
          type: 'exam',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '11:00',
          location: 'Salle A101',
          description: 'Examen final du module JavaScript',
          formationId: 1,
          formationName: 'Développement Web Full Stack',
          instructorId: '1',
          instructorName: 'Jean Dupont',
          isOnline: false
        },
        {
          id: '2',
          title: 'Soutenance Projets',
          type: 'meeting',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '17:00',
          location: 'Salle B205',
          description: 'Soutenance des projets finaux',
          formationId: 1,
          formationName: 'Développement Web Full Stack',
          instructorId: '1',
          instructorName: 'Jean Dupont',
          isOnline: false
        },
        {
          id: '3',
          title: 'Vacances de Printemps',
          type: 'holiday',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: '00:00',
          description: 'Période de vacances',
          isOnline: false
        }
      ]
      
      setCalendarEvents(mockEvents)
    } catch (error) {
      console.error('Error loading calendar events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les examens et soutenances
  const loadExams = async () => {
    if (!session) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockExams: Exam[] = [
        {
          id: '1',
          title: 'Examen Final - React & Node.js',
          type: 'written',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: '09:00',
          duration: 120,
          location: 'Salle A101',
          formationId: 1,
          formationName: 'Développement Web Full Stack',
          instructorId: '1',
          instructorName: 'Jean Dupont',
          status: 'upcoming',
          maxScore: 100,
          hasStarted: false,
          isSubmitted: false,
          instructions: 'Examen écrit de 2 heures sur React et Node.js',
          materials: ['Calculatrice', 'Documents de cours autorisés']
        },
        {
          id: '2',
          title: 'Soutenance Projet Final',
          type: 'oral',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: '14:00',
          duration: 30,
          location: 'Salle B205',
          formationId: 1,
          formationName: 'Développement Web Full Stack',
          instructorId: '1',
          instructorName: 'Jean Dupont',
          status: 'upcoming',
          maxScore: 50,
          hasStarted: false,
          isSubmitted: false,
          instructions: 'Présentation orale de 20 minutes + 10 minutes questions',
          materials: ['Présentation PowerPoint', 'Démo du projet']
        }
      ]
      
      setExams(mockExams)
    } catch (error) {
      console.error('Error loading exams:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Commencer un examen
  const startExam = async (examId: string) => {
    setExams(prev => 
      prev.map(exam => 
        exam.id === examId 
          ? { ...exam, status: 'in_progress' as const, hasStarted: true }
          : exam
      )
    )
  }

  // Soumettre un examen
  const submitExam = async (examId: string, answers: any) => {
    setExams(prev => 
      prev.map(exam => 
        exam.id === examId 
          ? { ...exam, status: 'completed' as const, isSubmitted: true, studentScore: Math.floor(Math.random() * 30) + 70 }
          : exam
      )
    )
  }

  // Obtenir les statistiques
  const getStats = () => {
    const pendingDocuments = documents.filter(doc => doc.status === 'pending').length
    const approvedDocuments = documents.filter(doc => doc.status === 'approved').length
    const totalProgress = elearningCourses.reduce((sum, course) => sum + course.progress, 0) / (elearningCourses.length || 1)
    const upcomingExams = exams.filter(exam => exam.status === 'upcoming').length
    const validCertificates = certificates.filter(cert => cert.status === 'valid').length

    return {
      pendingDocuments,
      approvedDocuments,
      totalProgress: Math.round(totalProgress),
      upcomingExams,
      validCertificates,
      totalDocuments: documents.length,
      totalCourses: elearningCourses.length,
      totalExams: exams.length,
      totalCertificates: certificates.length
    }
  }

  return {
    documents,
    elearningCourses,
    certificates,
    calendarEvents,
    exams,
    isLoading,
    loadDocuments,
    uploadDocument,
    loadElearningCourses,
    loadCertificates,
    verifyCertificate,
    loadCalendarEvents,
    loadExams,
    startExam,
    submitExam,
    getStats
  }
}
