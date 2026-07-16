import { NextRequest, NextResponse } from 'next/server'
import { extname } from 'path'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { parseEnrollmentNotes } from '@/lib/student/enrollment-notes'
import { uploadToR2 } from '@/lib/r2'

export const runtime = 'nodejs'

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.zip', '.jpg', '.jpeg', '.png', '.webp'])
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

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
    console.log(`[API Student System Submissions] Requête POST par étudiant ID: ${auth.student.id}`)
    const formData = await request.formData()
    const title = (formData.get('title') as string | null)?.trim()
    const file = formData.get('file') as File | null

    if (!title || title.length < 3) {
      console.warn('[API Student System Submissions] Titre manquant ou trop court')
      return NextResponse.json({ error: 'Titre requis (minimum 3 caracteres).' }, { status: 400 })
    }

    if (!file) {
      console.warn('[API Student System Submissions] Fichier manquant')
      return NextResponse.json({ error: 'Fichier requis.' }, { status: 400 })
    }

    console.log(`[API Student System Submissions] Fichier reçu: ${file.name} (${file.size} octets), titre: ${title}`)
    if (file.size > MAX_FILE_SIZE) {
      console.warn('[API Student System Submissions] Fichier trop volumineux')
      return NextResponse.json({ error: 'Fichier trop volumineux (max 20 MB).' }, { status: 400 })
    }

    const extension = extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
      console.warn(`[API Student System Submissions] Format invalide: extension: ${extension}, type: ${file.type}`)
      return NextResponse.json(
        { error: 'Format invalide. Utilisez uniquement PDF, DOCX, DOC, ZIP, JPG, PNG ou WEBP.' },
        { status: 400 }
      )
    }

    const r2Folder = `travaux/${auth.student.id}`
    const fileName = `${Date.now()}-${randomUUID()}${extension}`
    const bytes = await file.arrayBuffer()
    
    console.log(`[API Student System Submissions] Lancement upload R2. Clé: ${r2Folder}/${fileName}`)
    const fileUrl = await uploadToR2(Buffer.from(bytes), fileName, r2Folder, file.type)
    console.log(`[API Student System Submissions] R2 Upload réussi. URL: ${fileUrl}`)
    
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
  } catch (error: any) {
    console.error('[API Student System Submissions] Erreur critique:', error)
    return NextResponse.json({ error: `Échec du téléversement : ${error.message || error}` }, { status: 500 })
  }
}
