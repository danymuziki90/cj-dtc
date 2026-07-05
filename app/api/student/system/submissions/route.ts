import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import { extname, join } from 'path'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { parseEnrollmentNotes } from '@/lib/student/enrollment-notes'

export const runtime = 'nodejs'

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp'])
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const MAX_FILE_SIZE = 10 * 1024 * 1024

function statusLabel(status: string) {
  switch (status) {
    case 'approved':
      return 'valide'
    case 'rejected':
      return 'corrige'
    case 'pending':
    default:
      return 'en_attente_de_correction'
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const [submissions, enrollments] = await Promise.all([
    prisma.studentSubmission.findMany({
      where: { studentId: auth.student.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.enrollment.findMany({
      where: { email: auth.student.email },
      select: { notes: true },
    }),
  ])

  const feedbackMap = enrollments.reduce<Record<string, { feedback?: string | null; updatedAt?: string; status?: string }>>(
    (acc, enrollment) => {
      const notes = parseEnrollmentNotes(enrollment.notes)
      if (notes.submissionFeedback && typeof notes.submissionFeedback === 'object') {
        Object.entries(notes.submissionFeedback).forEach(([submissionId, feedback]) => {
          if (feedback && typeof feedback === 'object' && !Array.isArray(feedback)) {
            const cast = feedback as Record<string, unknown>
            acc[submissionId] = {
              feedback: typeof cast.feedback === 'string' ? cast.feedback : null,
              status: typeof cast.status === 'string' ? cast.status : undefined,
              updatedAt: typeof cast.updatedAt === 'string' ? cast.updatedAt : undefined,
            }
          }
        })
      }
      return acc
    },
    {}
  )

  const payload = submissions.map((submission) => ({
    id: submission.id,
    title: submission.title,
    status: submission.status,
    statusLabel: statusLabel(submission.status),
    fileUrl: submission.fileUrl,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
    feedback: feedbackMap[submission.id]?.feedback || null,
    reviewedAt: feedbackMap[submission.id]?.updatedAt || null,
  }))

  return NextResponse.json({ submissions: payload })
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const title = (formData.get('title') as string | null)?.trim()
    const file = formData.get('file') as File | null

    if (!title || title.length < 3) {
      return NextResponse.json({ error: 'Titre requis (minimum 3 caracteres).' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB).' }, { status: 400 })
    }

    const extension = extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Format invalide. Utilisez uniquement PDF, JPG, PNG ou WEBP.' },
        { status: 400 }
      )
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'student-submissions', auth.student.id)
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${randomUUID()}${extension}`
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const fileUrl = `/uploads/student-submissions/${auth.student.id}/${fileName}`
    const submission = await prisma.studentSubmission.create({
      data: {
        studentId: auth.student.id,
        sessionId: auth.student.adminSessionId ?? null,
        title,
        fileUrl,
        status: 'pending',
      },
    })

    return NextResponse.json(
      {
        submission: {
          ...submission,
          statusLabel: statusLabel(submission.status),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Student submission upload error:', error)
    return NextResponse.json({ error: 'Échec du téléversement.' }, { status: 500 })
  }
}
