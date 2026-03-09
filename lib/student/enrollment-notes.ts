type JsonObject = Record<string, unknown>

export type StudentQuestionEntry = {
  id: string
  message: string
  createdAt: string
  status: 'open' | 'resolved'
  adminReply?: string | null
  adminReplyAt?: string | null
}

export type SubmissionFeedbackEntry = {
  feedback?: string | null
  status?: string | null
  updatedAt: string
}

export type EnrollmentNotesData = JsonObject & {
  studentQuestions?: StudentQuestionEntry[]
  submissionFeedback?: Record<string, SubmissionFeedbackEntry>
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
