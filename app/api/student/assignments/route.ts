import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { supabase } from '@/lib/supabase'

const submissionSchema = z.object({
  assignmentId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  files: z.array(z.any()).min(1, 'Fichiers manquants')
})

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireStudent(req)
  if (auth.error) return auth.error

  try {
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

    return NextResponse.json({ assignments: formattedAssignments }, { status: 200 })
  } catch (error) {
    console.error('[API] Error fetching assignments:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireStudent(req)
  if (auth.error) return auth.error

  try {
    const parsed = submissionSchema.safeParse(await req.json())
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Données invalides.'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { assignmentId, files } = parsed.data

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    })
    
    if (!assignment) {
      return NextResponse.json({ error: 'Travail introuvable' }, { status: 404 })
    }

    // Find or create submission
    let submission = await prisma.submission.findFirst({
      where: {
        assignmentId: assignment.id,
        studentId: auth.student.id
      }
    })

    if (submission) {
      submission = await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: 'submitted',
          submittedAt: new Date(),
        }
      })
      // Delete old files for a clean slate
      await prisma.submissionFile.deleteMany({
        where: { submissionId: submission.id }
      })
    } else {
      submission = await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          studentId: auth.student.id,
          status: 'submitted',
          submittedAt: new Date(),
        }
      })
    }

    // Create file records
    for (const file of files) {
      await prisma.submissionFile.create({
        data: {
          submissionId: submission.id,
          name: file.name,
          originalName: file.name,
          url: file.url,
          size: file.size,
          mimeType: file.type || 'application/octet-stream'
        }
      })
    }

    if (supabase) {
      const channel = supabase.channel('submissions_travaux_channel')
      channel.send({
        type: 'broadcast',
        event: 'submission_created',
        payload: { submissionId: submission.id, assignmentId: assignment.id, studentId: auth.student.id }
      })
    }

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('[API] Error submitting assignment:', error)
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 })
  }
}
