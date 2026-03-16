import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { extname, join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { getCommunicationThreads, upsertCommunicationThread } from '@/lib/student/communications'
import { communicationTemplateOptions, resolveCommunicationTemplate } from '@/lib/student/communication-templates'
import {
  parseEnrollmentNotes,
  serializeEnrollmentNotes,
  type StudentCommunicationAttachment,
  type StudentCommunicationMessage,
} from '@/lib/student/enrollment-notes'

export const runtime = 'nodejs'

const replySchema = z.object({
  enrollmentId: z.coerce.number().int().positive(),
  threadId: z.string().min(3),
  message: z.string().max(4000).optional(),
  templateKey: z.string().optional(),
  status: z.enum(['open', 'pending', 'resolved']).optional(),
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

async function storeAttachment(studentId: string, file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Fichier trop volumineux (max 10MB).')
  }

  const extension = extname(file.name).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error('Format invalide. Utilisez PDF, JPG, PNG, WEBP, TXT, DOC ou DOCX.')
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'admin-communications', studentId)
  await mkdir(uploadDir, { recursive: true })

  const fileName = `${Date.now()}-${randomUUID()}${extension}`
  const absoluteFilePath = join(uploadDir, fileName)
  const fileUrl = `/uploads/admin-communications/${studentId}/${fileName}`
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const student = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  })

  if (!student) {
    return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      email: {
        equals: student.email,
        mode: 'insensitive',
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      formation: {
        select: { title: true },
      },
      session: {
        select: {
          id: true,
          startDate: true,
          location: true,
        },
      },
    },
  })

  const threads = enrollments
    .flatMap((enrollment) => {
      const notes = parseEnrollmentNotes(enrollment.notes)
      return getCommunicationThreads(notes).map((thread) => ({
        ...thread,
        enrollmentId: enrollment.id,
        formationTitle: enrollment.formation.title,
        sessionLabel: enrollment.session
          ? `${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')} - ${enrollment.session.location || 'En ligne'}`
          : 'Sans session',
      }))
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return NextResponse.json({
    student: {
      id: student.id,
      fullName: `${student.firstName} ${student.lastName}`.trim(),
      email: student.email,
    },
    threads,
    templates: communicationTemplateOptions,
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
    }

    const formData = await request.formData()
    const parsed = replySchema.safeParse({
      enrollmentId: formData.get('enrollmentId'),
      threadId: formData.get('threadId'),
      message: formData.get('message'),
      templateKey: formData.get('templateKey'),
      status: formData.get('status'),
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }

    const template = resolveCommunicationTemplate(parsed.data.templateKey || null)
    const replyMessage = parsed.data.message?.toString().trim() || template?.message || ''
    if (!replyMessage) {
      return NextResponse.json({ error: 'Une reponse ou un modele est requis.' }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: parsed.data.enrollmentId,
        email: {
          equals: student.email,
          mode: 'insensitive',
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found for this student.' }, { status: 404 })
    }

    const notes = parseEnrollmentNotes(enrollment.notes)
    const thread = getCommunicationThreads(notes).find((item) => item.id === parsed.data.threadId)
    if (!thread) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 })
    }

    const file = formData.get('file')
    const attachment = file instanceof File && file.size > 0 ? await storeAttachment(student.id, file) : null
    const now = new Date().toISOString()
    const status = parsed.data.status || 'pending'

    const replyEntry: StudentCommunicationMessage = {
      id: randomUUID(),
      senderRole: 'admin',
      senderName: auth.admin.username,
      message: replyMessage,
      createdAt: now,
      templateKey: template?.key || null,
      attachments: attachment ? [attachment] : [],
    }

    const nextThread = {
      ...thread,
      status,
      updatedAt: now,
      assignedAdminUsername: auth.admin.username,
      responseDueAt: status === 'open' ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() : null,
      templateKey: template?.key || null,
      adminReply: replyMessage,
      adminReplyAt: now,
      attachments: attachment ? [...thread.attachments, attachment] : thread.attachments,
      messages: [...thread.messages, replyEntry],
    }

    const updatedNotes = upsertCommunicationThread(notes, nextThread)
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        notes: serializeEnrollmentNotes(updatedNotes),
      },
    })

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'student.communication.reply',
      targetType: 'student',
      targetId: student.id,
      targetLabel: `${student.firstName} ${student.lastName}`.trim(),
      summary: `Reponse envoyee a une conversation etudiante (${nextThread.subject}).`,
      metadata: {
        enrollmentId: enrollment.id,
        threadId: nextThread.id,
        status: nextThread.status,
        templateKey: template?.key || null,
      },
    })

    return NextResponse.json({ success: true, thread: nextThread }, { status: 201 })
  } catch (error) {
    console.error('Admin communication reply error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur.' },
      { status: 500 },
    )
  }
}
