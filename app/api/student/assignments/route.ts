import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { extname } from 'path'
import { randomUUID } from 'crypto'
import { uploadToR2 } from '@/lib/r2'

export const runtime = 'nodejs'

const ENROLLMENT_STATUSES_WITH_ACCESS = ['accepted', 'confirmed', 'completed', 'pending']

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

    console.log(`[POST /api/student/assignments] Request received from student: ${auth.student.email} (ID: ${auth.student.id})`)

    const formData = await request.formData()
    const assignmentId = Number(formData.get('assignmentId'))

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return NextResponse.json({
        success: false,
        message: 'L\'identifiant du devoir est invalide ou manquant.',
        error: 'Invalid assignmentId'
      }, { status: 400 })
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { formation: true },
    })
    if (!assignment) {
      console.warn(`[POST /api/student/assignments] Assignment #${assignmentId} not found`)
      return NextResponse.json({
        success: false,
        message: 'Le devoir demandé est introuvable.',
        error: 'Assignment not found'
      }, { status: 404 })
    }

    // Fetch existing submission first to inspect its status
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentEmail: { equals: auth.student.email, mode: 'insensitive' },
      },
      select: { id: true, status: true, submittedAt: true },
    })

    const isResubmissionAllowed = existingSubmission && existingSubmission.status === 'returned'

    if (assignment.deadline < new Date() && !isResubmissionAllowed) {
      console.warn(`[POST /api/student/assignments] Deadline passed for assignment #${assignmentId}`)
      return NextResponse.json({
        success: false,
        message: 'La date limite de remise pour ce devoir est dépassée.',
        error: 'Deadline exceeded'
      }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        OR: [
          { studentId: auth.student.id },
          { email: { equals: auth.student.email, mode: 'insensitive' } },
        ],
        formationId: assignment.formationId,
        status: { in: ENROLLMENT_STATUSES_WITH_ACCESS },
      },
      select: { id: true },
    })
    if (!enrollment) {
      console.warn(`[POST /api/student/assignments] Student ${auth.student.email} is not enrolled in formation #${assignment.formationId}`)
      return NextResponse.json({
        success: false,
        message: 'Vous n\'êtes pas inscrit à la formation requise pour ce devoir.',
        error: 'Enrollment check failed'
      }, { status: 403 })
    }

    const allowedTypes = parseAllowedFileTypes(assignment.allowedFileTypes).map(normalizeExtension)
    const maxBytes = assignment.maxFileSize * 1024 * 1024
    const files: File[] = []

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.name && value.size > 0) {
        const extension = normalizeExtension(value.name.split('.').pop() || '')
        if (allowedTypes.length && !allowedTypes.includes(extension)) {
          return NextResponse.json({
            success: false,
            message: `Format non autorisé: .${extension}. Formats acceptés: ${allowedTypes.join(', ')}`,
            error: `Disallowed extension .${extension}`
          }, { status: 400 })
        }

        if (value.size > maxBytes) {
          return NextResponse.json({
            success: false,
            message: `Le fichier "${value.name}" dépasse la taille maximale autorisée de ${assignment.maxFileSize} MB.`,
            error: `File size ${value.size} > max ${maxBytes}`
          }, { status: 400 })
        }

        files.push(value)
      }
    }

    if (!files.length) {
      return NextResponse.json({
        success: false,
        message: 'Veuillez choisir au moins un fichier valide à remettre.',
        error: 'No valid files in request payload'
      }, { status: 400 })
    }

    if (existingSubmission && !isResubmissionAllowed) {
      return NextResponse.json({
        success: false,
        message: 'Vous avez déjà soumis ce devoir. Contactez votre formateur pour tout changement.',
        error: `Submission #${existingSubmission.id} already exists with status ${existingSubmission.status}`
      }, { status: 409 })
    }

    console.log(`[POST /api/student/assignments] Processing ${files.length} file(s) for assignment "${assignment.title}"...`)

    let submission
    if (isResubmissionAllowed) {
      await prisma.submissionFile.deleteMany({
        where: { submissionId: existingSubmission.id }
      })

      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          status: 'submitted',
          submittedAt: new Date(),
          grade: null,
          feedback: null,
          gradedAt: null,
          gradedBy: null,
        }
      })
      console.log(`[POST /api/student/assignments] Updated existing submission #${submission.id}`)
    } else {
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentEmail: auth.student.email,
          status: 'submitted',
          submittedAt: new Date(),
        },
      })
      console.log(`[POST /api/student/assignments] Created new submission #${submission.id}`)
    }

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

    for (const file of files) {
      const extension = extname(file.name).toLowerCase()
      const fileName = `${Date.now()}-${randomUUID()}${extension}`
      
      console.log(`[POST /api/student/assignments] Uploading file "${file.name}" to R2 folder "${r2Folder}"...`)
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileUrl = await uploadToR2(buffer, fileName, r2Folder, file.type)
      console.log(`[POST /api/student/assignments] R2 Upload success, fileUrl: ${fileUrl}`)

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

    console.log(`[POST /api/student/assignments] Submission #${submission.id} completed successfully for ${auth.student.email}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Votre travail a été déposé avec succès !',
        submission: submissionWithFiles
          ? {
              ...submissionWithFiles,
              files: submissionWithFiles.files.map(mapSubmissionFile),
            }
          : null,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[POST /api/student/assignments] CRITICAL SERVER ERROR:', error)
    return NextResponse.json({
      success: false,
      message: error?.message || 'Une erreur système est survenue lors de l\'enregistrement du devoir.',
      error: error?.stack || String(error)
    }, { status: 500 })
  }
}
