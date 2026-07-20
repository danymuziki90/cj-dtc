import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { extname } from 'path'
import { randomUUID } from 'crypto'
import { uploadToR2 } from '@/lib/r2'

export const runtime = 'nodejs'

const ENROLLMENT_STATUSES_WITH_ACCESS = ['accepted', 'confirmed', 'completed']

function parseAllowedFileTypes(value: string | null | undefined) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeExtension(value: string) {
  return value.replace(/^\./, '').trim().toLowerCase()
}

function mapSubmissionFile(file: any) {
  return {
    ...file,
    type: file.mimeType,
  }
}

function mapAssignment(assignment: any) {
  return {
    ...assignment,
    allowedFileTypes: parseAllowedFileTypes(assignment.allowedFileTypes),
    submissions: assignment.submissions.map((submission: any) => ({
      ...submission,
      files: submission.files.map(mapSubmissionFile),
    })),
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireStudent(request)
    if (auth.error) return auth.error

    const studentEnrollments = await prisma.enrollment.findMany({
      where: {
        OR: [
          { studentId: auth.student.id },
          { email: { equals: auth.student.email, mode: 'insensitive' } },
        ],
        status: { in: ENROLLMENT_STATUSES_WITH_ACCESS }
      },
      select: {
        formationId: true,
        sessionId: true
      }
    })

    const formationIds = studentEnrollments.map(e => e.formationId)
    const sessionIds = studentEnrollments.map(e => e.sessionId).filter(Boolean) as number[]

    const assignments = await prisma.assignment.findMany({
      where: {
        formationId: { in: formationIds },
        OR: [
          { sessionId: null },
          { sessionId: { in: sessionIds } }
        ],
        status: 'publie',
        publishDate: { lte: new Date() }
      },
      include: {
        formation: true,
        files: true,
        submissions: {
          where: {
            studentEmail: { equals: auth.student.email, mode: 'insensitive' },
          },
          include: {
            files: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: { deadline: 'asc' },
    })

    return NextResponse.json(assignments.map(mapAssignment))
  } catch (error) {
    console.error('Student assignments list error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireStudent(request)
    if (auth.error) return auth.error

    const formData = await request.formData()
    const assignmentId = Number(formData.get('assignmentId'))
    const fileCount = Number(formData.get('fileCount'))

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return NextResponse.json({ error: 'ID du travail requis.' }, { status: 400 })
    }

    if (!Number.isInteger(fileCount) || fileCount <= 0 || fileCount > 10) {
      return NextResponse.json({ error: 'Ajoutez entre 1 et 10 fichiers.' }, { status: 400 })
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { formation: true },
    })
    if (!assignment) {
      return NextResponse.json({ error: 'Travail introuvable.' }, { status: 404 })
    }

    if (assignment.deadline < new Date()) {
      return NextResponse.json({ error: 'La date limite de remise est depassee.' }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        OR: [
          { studentId: auth.student.id },
          { email: { equals: auth.student.email, mode: 'insensitive' } },
        ],
        formationId: assignment.formationId,
        status: { in: ENROLLMENT_STATUSES_WITH_ACCESS },
        ...(assignment.sessionId && { sessionId: assignment.sessionId }),
      },
      select: { id: true },
    })
    if (!enrollment) {
      return NextResponse.json({ error: 'Vous n\'êtes pas inscrit à la session spécifique requise pour ce devoir.' }, { status: 403 })
    }

    const allowedTypes = parseAllowedFileTypes(assignment.allowedFileTypes).map(normalizeExtension)
    const maxBytes = assignment.maxFileSize * 1024 * 1024
    const files: File[] = []

    for (let index = 0; index < fileCount; index += 1) {
      const file = formData.get(`file_${index}`)
      if (!(file instanceof File)) continue

      const extension = normalizeExtension(file.name.split('.').pop() || '')
      if (allowedTypes.length && !allowedTypes.includes(extension)) {
        return NextResponse.json({ error: `Format non autorise: ${file.name}` }, { status: 400 })
      }

      if (file.size > maxBytes) {
        return NextResponse.json({ error: `Fichier trop volumineux: ${file.name}` }, { status: 400 })
      }

      files.push(file)
    }

    if (!files.length) {
      return NextResponse.json({ error: 'Aucun fichier valide fourni.' }, { status: 400 })
    }

    // Vérifier qu'une soumission n'existe pas déjà pour cet étudiant et ce devoir
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentEmail: { equals: auth.student.email, mode: 'insensitive' },
      },
      select: { id: true, status: true, submittedAt: true },
    })

    if (existingSubmission) {
      return NextResponse.json(
        {
          error: 'Vous avez déjà soumis ce devoir.',
          detail: `Soumission existante (ID: ${existingSubmission.id}) — statut : ${existingSubmission.status}. Contactez votre formateur pour toute modification.`,
        },
        { status: 409 }
      )
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentEmail: auth.student.email,
        status: 'submitted',
        submittedAt: new Date(),
      },
    })

    try {
      await prisma.adminNotification.create({
        data: {
          title: '📥 Nouveau dépôt de devoir',
          message: `L'étudiant ${auth.student.email} (${auth.student.firstName} ${auth.student.lastName}) a remis son travail pour "${assignment.title}".`,
          type: 'info',
          target: 'admin',
          createdBy: auth.student.email,
        }
      })
    } catch (err) {
      console.error('Failed to create admin notification for submission:', err)
    }

    const r2Folder = `travaux/${auth.student.id}`

    for (const [index, file] of files.entries()) {
      const extension = extname(file.name).toLowerCase()
      const fileName = `${Date.now()}-${randomUUID()}${extension}`
      
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileUrl = await uploadToR2(buffer, fileName, r2Folder, file.type)

      await prisma.submissionFile.create({
        data: {
          submissionId: submission.id,
          name: file.name,
          originalName: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          url: fileUrl,
        },
      })
    }

    const submissionWithFiles = await prisma.submission.findUnique({
      where: { id: submission.id },
      include: { files: true },
    })

    return NextResponse.json(
      {
        success: true,
        submission: submissionWithFiles
          ? {
              ...submissionWithFiles,
              files: submissionWithFiles.files.map(mapSubmissionFile),
            }
          : null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Student assignment submit error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
