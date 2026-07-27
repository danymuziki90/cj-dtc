// ─── Types partagés – Module Admin Travaux ────────────────────────────────────

export interface SessionOption {
  id: number
  startDate: string
  endDate: string
  location?: string | null
  format: string
  status: string
  formation?: {
    id: number
    title: string
    slug: string
  }
}

export interface AssignmentFile {
  id: number
  name: string
  originalName: string
  size: number
  mimeType: string
  url: string
}

export interface StudentInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  studentNumber: string
  phone?: string | null
}

export interface SubmissionFile {
  id: number
  name: string
  originalName: string
  size: number
  mimeType: string
  url: string
}

export interface Submission {
  id: number
  assignmentId: number
  studentId: string
  student: StudentInfo
  status: 'submitted' | 'graded' | 'returned'
  grade: number | null
  feedback: string | null
  submittedAt: string
  gradedAt: string | null
  gradedBy?: string | null
  files: SubmissionFile[]
  assignment?: {
    id: number
    title: string
    type: string
    deadline: string
    formation?: { id: number; title: string; slug: string }
    session?: {
      id: number
      startDate: string
      endDate: string
      location: string | null
      format: string
      status: string
    }
  }
}

export interface Assignment {
  id: number
  title: string
  description: string
  objectives: string | null
  instructions: string | null
  type: 'tp' | 'exam' | 'project' | 'homework' | string
  difficulty: 'debutant' | 'intermediaire' | 'avance' | string
  status: 'brouillon' | 'publie' | 'archive' | string
  published: boolean
  publishedAt: string | null
  deadline: string
  maxFileSize: number
  maxFiles: number
  allowResubmission: boolean
  allowedFileTypes: string
  formationId?: number | null
  sessionId: number | null
  session: {
    id: number
    startDate: string
    endDate: string
    location: string | null
    format: string
    status: string
  } | null
  formation: {
    id: number
    title: string
    slug: string
  } | null
  files: AssignmentFile[]
  submissions: Submission[]
  createdAt: string
  _count?: { submissions: number }
}

export type ToastState = { msg: string; type: 'success' | 'error' } | null

export type StatusFilter =
  | 'all'
  | 'publie'
  | 'brouillon'
  | 'archive'
  | 'pending_grading'

export type SubmissionStatusFilter =
  | 'all'
  | 'submitted'
  | 'graded'
  | 'returned'
  | 'overdue'
