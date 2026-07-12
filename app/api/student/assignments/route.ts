import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

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

    const assignments = await prisma.assignment.findMany({
      where: {
        formation: {
          enrollments: {
            some: {
              OR: [
                { studentId: auth.student.id },
                { email: { equals: auth.student.email, mode: 'insensitive' } },
              ],
              status: { in: ENROLLMENT_STATUSES_WITH_ACCESS },
            },
          },
        },
      },
      include: {
        formation: true,
        submissions: {
          where: {
            studentEmail: { equals: auth.student.email, mode: 'insensitive' },
          },
          include: {
            files: true,
          },
          orderBy: { submittedAt: 'asc' },
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
      },
      select: { id: true },
    })
    if (!enrollment) {
      return NextResponse.json({ error: 'Vous n etes pas inscrit a cette formation.' }, { status: 403 })
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

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentEmail: auth.student.email,
        status: 'submitted',
        submittedAt: new Date(),
      },
    })

    for (const [index, file] of files.entries()) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const mimeType = file.type || 'application/octet-stream'

      await prisma.submissionFile.create({
        data: {
          submissionId: submission.id,
          name: `assignment-${assignmentId}-${submission.id}-${index}`,
          originalName: file.name,
          size: file.size,
          mimeType,
          url: `data:${mimeType};base64,${base64}`,
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
