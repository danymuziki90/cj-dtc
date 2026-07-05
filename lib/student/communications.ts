import type {
  EnrollmentNotesData,
  StudentCommunicationAttachment,
  StudentCommunicationMessage,
  StudentQuestionEntry,
} from '@/lib/student/enrollment-notes'
import { getStudentQuestions } from '@/lib/student/enrollment-notes'

export type CommunicationThread = {
  id: string
  subject: string
  message: string
  createdAt: string
  updatedAt: string
  status: 'open' | 'pending' | 'resolved'
  category: 'general' | 'absence' | 'payment' | 'resources' | 'technical'
  priority: 'normal' | 'urgent'
  assignedAdminUsername: string | null
  responseDueAt: string | null
  templateKey: string | null
  adminReply: string | null
  adminReplyAt: string | null
  attachments: StudentCommunicationAttachment[]
  messages: StudentCommunicationMessage[]
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function buildLegacyMessages(question: StudentQuestionEntry): StudentCommunicationMessage[] {
  const messages: StudentCommunicationMessage[] = [
    {
      id: `${question.id}-student`,
      senderRole: 'student',
      senderName: 'Etudiant',
      message: question.message,
      createdAt: question.createdAt,
      attachments: safeArray<StudentCommunicationAttachment>(question.attachments),
    },
  ]

  if (question.adminReply) {
    messages.push({
      id: `${question.id}-admin`,
      senderRole: 'admin',
      senderName: question.assignedAdminUsername || 'Administration',
      message: question.adminReply,
      createdAt: question.adminReplyAt || question.createdAt,
      templateKey: question.templateKey || null,
    })
  }

  return messages
}

export function normalizeCommunicationThread(question: StudentQuestionEntry): CommunicationThread {
  const subject = question.subject?.trim() || question.message.trim().slice(0, 72) || 'Message etudiant'
  const messages = safeArray<StudentCommunicationMessage>(question.messages).length
    ? safeArray<StudentCommunicationMessage>(question.messages)
    : buildLegacyMessages(question)

  const updatedAt = question.lastUpdatedAt || messages[messages.length - 1]?.createdAt || question.adminReplyAt || question.createdAt

  return {
    id: question.id,
    subject,
    message: question.message,
    createdAt: question.createdAt,
    updatedAt,
    status: question.status || 'open',
    category: question.category || 'general',
    priority: question.priority || 'normal',
    assignedAdminUsername: question.assignedAdminUsername || null,
    responseDueAt: question.responseDueAt || null,
    templateKey: question.templateKey || null,
    adminReply: question.adminReply || null,
    adminReplyAt: question.adminReplyAt || null,
    attachments: safeArray<StudentCommunicationAttachment>(question.attachments),
    messages,
  }
}

export function getCommunicationThreads(data: EnrollmentNotesData) {
  return getStudentQuestions(data).map(normalizeCommunicationThread)
}

export function upsertCommunicationThread(data: EnrollmentNotesData, thread: CommunicationThread) {
  const questions = getStudentQuestions(data)
  const nextQuestions = questions.some((item) => item.id === thread.id)
    ? questions.map((item) =>
        item.id === thread.id
          ? {
              ...item,
              message: thread.message,
              createdAt: thread.createdAt,
              status: thread.status,
              subject: thread.subject,
              category: thread.category,
              priority: thread.priority,
              assignedAdminUsername: thread.assignedAdminUsername,
              responseDueAt: thread.responseDueAt,
              templateKey: thread.templateKey,
              lastUpdatedAt: thread.updatedAt,
              adminReply: thread.adminReply,
              adminReplyAt: thread.adminReplyAt,
              attachments: thread.attachments,
              messages: thread.messages,
            }
          : item,
      )
    : [
        {
          id: thread.id,
          message: thread.message,
          createdAt: thread.createdAt,
          status: thread.status,
          subject: thread.subject,
          category: thread.category,
          priority: thread.priority,
          assignedAdminUsername: thread.assignedAdminUsername,
          responseDueAt: thread.responseDueAt,
          templateKey: thread.templateKey,
          lastUpdatedAt: thread.updatedAt,
          adminReply: thread.adminReply,
          adminReplyAt: thread.adminReplyAt,
          attachments: thread.attachments,
          messages: thread.messages,
        },
        ...questions,
      ]

  return {
    ...data,
    studentQuestions: nextQuestions.slice(0, 100),
  }
}
