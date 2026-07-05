import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { extname, join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { getCommunicationThreads, type CommunicationThread, upsertCommunicationThread } from '@/lib/student/communications'
import {
  parseEnrollmentNotes,
  serializeEnrollmentNotes,
  type StudentCommunicationAttachment,
  type StudentCommunicationMessage,
} from '@/lib/student/enrollment-notes'

export const runtime = 'nodejs'

const createThreadSchema = z.object({
  enrollmentId: z.coerce.number().int().positive().optional(),
  subject: z.string().min(3).max(160).optional(),
  message: z.string().min(5).max(4000),
  category: z.enum(['general', 'absence', 'payment', 'resources', 'technical']).optional(),
  priority: z.enum(['normal', 'urgent']).optional(),
  threadId: z.string().optional(),
})

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.txt', '.doc', '.docx'])
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const MAX_FILE_SIZE = 10 * 1024 * 1024

function subjectFromMessage(message: string) {
  const cleaned = message.trim().replace(/\s+/g, ' ')
  return cleaned.length > 72 ? `${cleaned.slice(0, 72)}...` : cleaned
}

async function storeAttachment(studentId: string, file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Fichier trop volumineux (max 10MB).')
  }

  const extension = extname(file.name).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error('Format invalide. Utilisez PDF, JPG, PNG, WEBP, TXT, DOC ou DOCX.')
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'student-communications', studentId)
  await mkdir(uploadDir, { recursive: true })

  const fileName = `${Date.now()}-${randomUUID()}${extension}`
  const absoluteFilePath = join(uploadDir, fileName)
  const fileUrl = `/uploads/student-communications/${studentId}/${fileName}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(absoluteFilePath, buffer)

  return {
    id: randomUUID(),
    fileName: file.name,
    fileUrl,
    mimeType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  } satisfies StudentCommunicationAttachment
}

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const statusFilter = request.nextUrl.searchParams.get('status')?.trim() || ''

  const enrollments = await prisma.enrollment.findMany({
    where: {
      email: auth.student.email,
      status: {
        notIn: ['rejected', 'cancelled'],
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      formation: {
        select: {
          title: true,
        },
      },
      session: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          location: true,
          format: true,
        },
      },
    },
  })

  const now = Date.now()
  const threads = enrollments
    .flatMap((enrollment) => {
      const notes = parseEnrollmentNotes(enrollment.notes)
      return getCommunicationThreads(notes).map((thread) => ({
        ...thread,
        enrollmentId: enrollment.id,
        formationTitle: enrollment.formation.title,
        sessionId: enrollment.sessionId,
        sessionLabel: enrollment.session
          ? `${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')} - ${enrollment.session.location || 'En ligne'}`
          : 'Sans session',
        responseState:
          thread.status === 'resolved'
            ? 'resolved'
            : thread.responseDueAt && new Date(thread.responseDueAt).getTime() < now
            ? 'overdue'
            : 'on_time',
      }))
    })
    .filter((thread) => (statusFilter ? thread.status === statusFilter : true))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return NextResponse.json({
    threads,
    enrollments: enrollments.map((enrollment) => ({
      id: enrollment.id,
      formationTitle: enrollment.formation.title,
      sessionLabel: enrollment.session
        ? `${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')} - ${enrollment.session.location || 'En ligne'}`
        : 'Sans session',
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
    })),
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const rawPayload = {
      enrollmentId: formData.get('enrollmentId'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      category: formData.get('category'),
      priority: formData.get('priority'),
      threadId: formData.get('threadId'),
    }

    const parsed = createThreadSchema.safeParse(rawPayload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Donnees invalides.', details: parsed.error.flatten() }, { status: 400 })
    }

    const file = formData.get('file')
    const attachment = file instanceof File && file.size > 0 ? await storeAttachment(auth.student.id, file) : null
    const now = new Date().toISOString()

    const enrollment = parsed.data.enrollmentId
      ? await prisma.enrollment.findFirst({
          where: {
            id: parsed.data.enrollmentId,
            email: auth.student.email,
          },
        })
      : await prisma.enrollment.findFirst({
          where: { email: auth.student.email },
          orderBy: { createdAt: 'desc' },
        })

    if (!enrollment) {
      return NextResponse.json({ error: "Aucune inscription n'est associee a ce compte." }, { status: 404 })
    }

    const notes = parseEnrollmentNotes(enrollment.notes)
    const existingThreads = getCommunicationThreads(notes)
    const existingThread = parsed.data.threadId
      ? existingThreads.find((thread) => thread.id === parsed.data.threadId)
      : null

    if (parsed.data.threadId && !existingThread) {
      return NextResponse.json({ error: 'Conversation introuvable pour cette inscription.' }, { status: 404 })
    }

    const messageEntry: StudentCommunicationMessage = {
      id: randomUUID(),
      senderRole: 'student',
      senderName: `${auth.student.firstName} ${auth.student.lastName}`.trim(),
      message: parsed.data.message.trim(),
      createdAt: now,
      attachments: attachment ? [attachment] : [],
    }

    const thread: CommunicationThread = existingThread
      ? {
          ...existingThread,
          status: existingThread.status === 'resolved' ? 'open' : 'open',
          updatedAt: now,
          responseDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          attachments: attachment ? [...existingThread.attachments, attachment] : existingThread.attachments,
          messages: [...existingThread.messages, messageEntry],
        }
      : {
          id: randomUUID(),
          subject: parsed.data.subject?.trim() || subjectFromMessage(parsed.data.message),
          message: parsed.data.message.trim(),
          createdAt: now,
          updatedAt: now,
          status: 'open',
          category: parsed.data.category || 'general',
          priority: parsed.data.priority || 'normal',
          assignedAdminUsername: null,
          responseDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          templateKey: null,
          adminReply: null,
          adminReplyAt: null,
          attachments: attachment ? [attachment] : [],
          messages: [messageEntry],
        }

    const updatedNotes = upsertCommunicationThread(notes, thread)
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        notes: serializeEnrollmentNotes(updatedNotes),
      },
    })

    return NextResponse.json({
      success: true,
      thread: {
        ...thread,
        enrollmentId: enrollment.id,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Student communication error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur.' },
      { status: 500 },
    )
  }
}
