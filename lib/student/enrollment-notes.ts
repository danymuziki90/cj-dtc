type JsonObject = Record<string, unknown>

export type StudentCommunicationAttachment = {
  id: string
  fileName: string
  fileUrl: string
  mimeType: string
  size: number
  uploadedAt: string
}

export type StudentCommunicationMessage = {
  id: string
  senderRole: 'student' | 'admin'
  senderName: string
  message: string
  createdAt: string
  templateKey?: string | null
  attachments?: StudentCommunicationAttachment[]
}

export type StudentQuestionEntry = {
  id: string
  message: string
  createdAt: string
  status: 'open' | 'pending' | 'resolved'
  subject?: string | null
  category?: 'general' | 'absence' | 'payment' | 'resources' | 'technical'
  priority?: 'normal' | 'urgent'
  assignedAdminUsername?: string | null
  responseDueAt?: string | null
  templateKey?: string | null
  lastUpdatedAt?: string | null
  adminReply?: string | null
  adminReplyAt?: string | null
  attachments?: StudentCommunicationAttachment[]
  messages?: StudentCommunicationMessage[]
}

export type SubmissionFeedbackEntry = {
  feedback?: string | null
  status?: string | null
  updatedAt: string
}

export type ElearningProgressEntry = {
  completed: boolean
  timeSpent: number
  completedAt?: string | null
  score?: number | null
  updatedAt: string
}

export type EnrollmentNotesData = JsonObject & {
  studentQuestions?: StudentQuestionEntry[]
  submissionFeedback?: Record<string, SubmissionFeedbackEntry>
  elearningProgress?: Record<string, ElearningProgressEntry>
}

export function parseEnrollmentNotes(rawNotes?: string | null): EnrollmentNotesData {
  if (!rawNotes) return {}

  try {
    const parsed = JSON.parse(rawNotes) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as EnrollmentNotesData
    }
    return { legacyNotesText: String(rawNotes) }
  } catch {
    return { legacyNotesText: rawNotes }
  }
}

export function serializeEnrollmentNotes(data: EnrollmentNotesData) {
  return JSON.stringify(data)
}

export function getStudentQuestions(data: EnrollmentNotesData) {
  if (!Array.isArray(data.studentQuestions)) return []
  return data.studentQuestions
}

export function upsertSubmissionFeedback(
  data: EnrollmentNotesData,
  submissionId: string,
  value: SubmissionFeedbackEntry
) {
  const current = data.submissionFeedback && typeof data.submissionFeedback === 'object'
    ? data.submissionFeedback
    : {}

  return {
    ...data,
    submissionFeedback: {
      ...current,
      [submissionId]: value,
    },
  }
}
