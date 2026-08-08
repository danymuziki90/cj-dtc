import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { supabase } from '@/lib/supabase'
import { apiHandler, ApiError } from '@/lib/api-error'
import { canStudentResubmit, getStudentAssignmentSummary } from '@/lib/submission-rules'

const submissionSchema = z.object({
  assignmentId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  files: z.array(z.any()).min(1, 'Fichiers manquants')
})

export const dynamic = 'force-dynamic'

export const GET = apiHandler(async (req: NextRequest) => {
  const auth = await requireStudent(req)
  if (auth.error) throw new ApiError(401, "Non authentifié")
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: auth.student.id,
        status: { in: ['accepted', 'confirmed', 'completed'] }
      }
    })

    const formationIds = enrollments.map(e => e.formationId)
    const sessionIds = enrollments.map(e => e.sessionId).filter(Boolean) as number[]

    const assignments = await prisma.assignment.findMany({
      where: {
        published: true,
        OR: [
          { sessionId: { in: sessionIds } },
          { formationId: { in: formationIds }, sessionId: null }
        ]
      },
      include: {
        Formation: { select: { title: true } },
        TrainingSession: { select: { id: true, startDate: true } },
        Submission: {
          where: { studentId: auth.student.id },
          include: { SubmissionFile: true }
        },
        AssignmentFile: true
      }
    })

    const formattedAssignments = assignments.map(a => ({
      ...a,
      formation: a.Formation,
      session: a.TrainingSession,
      submissions: a.Submission,
      files: a.AssignmentFile
    }))

    return NextResponse.json({
      assignments: formattedAssignments,
      summary: getStudentAssignmentSummary(formattedAssignments),
    }, { status: 200 })
})

export const POST = apiHandler(async (req: NextRequest) => {
  const auth = await requireStudent(req)
  if (!auth.student) {
    return auth.error ?? NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Corps de la requête invalide ou manquant.' }, { status: 400 })
  }

  const parsed = submissionSchema.safeParse(body)
  if (!parsed.success) {
    console.error('[POST /api/student/assignments] Validation error:', parsed.error.errors)
    return NextResponse.json({
      error: parsed.error.errors[0]?.message || 'Données invalides',
      details: parsed.error.errors,
    }, { status: 400 })
  }

  const { assignmentId, files } = parsed.data

  console.log(`[POST /api/student/assignments] Student ${auth.student.id} submitting assignmentId=${assignmentId}, files=${files.length}`)

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  })

  if (!assignment) {
    console.error(`[POST /api/student/assignments] Assignment ${assignmentId} not found`)
    return NextResponse.json({ error: 'Travail introuvable' }, { status: 404 })
  }

  if (!assignment.published) {
    return NextResponse.json({ error: "Ce travail n'est pas encore publié" }, { status: 403 })
  }

  // Find or create submission
  let submission = await prisma.submission.findFirst({
    where: {
      assignmentId: assignment.id,
      studentId: auth.student.id,
    }
  })

  if (submission) {
    if (!canStudentResubmit(assignment.allowResubmission, submission)) {
      return NextResponse.json({
        error: 'Ce travail a déjà été remis et ne peut plus être soumis à nouveau.',
      }, { status: 409 })
    }

    submission = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: 'submitted',
        correctionStatus: 'pending',
        submittedAt: new Date(),
        sessionId: assignment.sessionId ?? null,
        maxGrade: assignment.maxGrade,
      }
    })
    // Delete old files for a clean resubmission
    await prisma.submissionFile.deleteMany({
      where: { submissionId: submission.id }
    })
    console.log(`[POST /api/student/assignments] Updated existing submission id=${submission.id}`)
  } else {
    submission = await prisma.submission.create({
      data: {
        assignmentId: assignment.id,
        studentId: auth.student.id,
        sessionId: assignment.sessionId ?? null,
        maxGrade: assignment.maxGrade,
        status: 'submitted',
        submittedAt: new Date(),
      }
    })
    console.log(`[POST /api/student/assignments] Created new submission id=${submission.id}`)
  }

  // Create file records — use file.mimeType (UploadedFileData) and file.originalName
  for (const file of files) {
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        name: file.name,
        originalName: file.originalName || file.name,
        url: file.url,
        size: file.size,
        mimeType: file.mimeType || file.type || 'application/octet-stream',
      }
    })
  }

  console.log(`[POST /api/student/assignments] Saved ${files.length} file(s) for submission id=${submission.id}`)

  // Broadcast to admin dashboard (non-blocking, best-effort)
  if (supabase) {
    try {
      const channel = supabase.channel('submissions_travaux_channel')
      await channel.send({
        type: 'broadcast',
        event: 'submission_created',
        payload: {
          submissionId: submission.id,
          assignmentId: assignment.id,
          studentId: auth.student.id,
        }
      })
    } catch (broadcastErr) {
      // Non-fatal: submission is already saved, just log the broadcast failure
      console.warn('[POST /api/student/assignments] Supabase broadcast failed (non-fatal):', broadcastErr)
    }
  }

  return NextResponse.json(submission, { status: 201 })
})
