import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { parseEnrollmentNotes, serializeEnrollmentNotes } from '@/lib/student/enrollment-notes'
import { parseSessionMetadata } from '@/lib/sessions/metadata'

const progressSchema = z.object({
  courseId: z.number().int().positive(),
  completed: z.boolean(),
  timeSpent: z.number().int().min(0).max(60 * 24 * 30),
})

function getSessionHours(startDate?: Date | null, endDate?: Date | null, metadata?: string | null) {
  if (!startDate || !endDate) return 0

  const parsed = parseSessionMetadata(metadata)
  const durationLabel = parsed.metadata.durationLabel || ''
  const durationMatch = durationLabel.match(/(\d+(?:[.,]\d+)?)\s*(h|heure|heures)/i)
  if (durationMatch) {
    const value = Number(durationMatch[1].replace(',', '.'))
    if (!Number.isNaN(value) && value > 0) return value
  }

  const raw = (endDate.getTime() - startDate.getTime()) / 3600000
  return raw > 0 ? Math.round(raw * 10) / 10 : 0
}

function buildProgressRecord(enrollment: any) {
  const notes = parseEnrollmentNotes(enrollment.notes)
  const override = notes.elearningProgress?.[String(enrollment.id)]
  const sessionEnded = enrollment.session?.endDate ? new Date(enrollment.session.endDate).getTime() < Date.now() : false
  const completed = override?.completed ?? sessionEnded
  const completedAt = override?.completedAt || (completed && enrollment.session?.endDate ? enrollment.session.endDate.toISOString() : undefined)
  const defaultMinutes = Math.round(getSessionHours(enrollment.session?.startDate, enrollment.session?.endDate, enrollment.session?.prerequisites) * 60)
  const evaluationScore = enrollment.evaluation?.overallRating ? enrollment.evaluation.overallRating * 20 : null

  return {
    id: enrollment.id,
    studentEmail: enrollment.email,
    courseId: enrollment.id,
    completed,
    completedAt,
    timeSpent: override?.timeSpent ?? defaultMinutes,
    score: override?.score ?? evaluationScore,
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const enrollments = await prisma.enrollment.findMany({
    where: {
      email: auth.student.email,
      status: {
        notIn: ['rejected', 'cancelled'],
      },
    },
    orderBy: { startDate: 'asc' },
    include: {
      session: {
        select: {
          id: true,
          endDate: true,
          prerequisites: true,
          startDate: true,
        },
      },
      evaluation: {
        select: {
          overallRating: true,
        },
      },
    },
  })

  return NextResponse.json(enrollments.map(buildProgressRecord))
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const parsed = progressSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id: parsed.data.courseId,
      email: auth.student.email,
      status: {
        notIn: ['rejected', 'cancelled'],
      },
    },
    include: {
      session: {
        select: {
          id: true,
          endDate: true,
          prerequisites: true,
          startDate: true,
        },
      },
      evaluation: {
        select: {
          overallRating: true,
        },
      },
    },
  })

  if (!enrollment) {
    return NextResponse.json({ error: 'Course not found for this student.' }, { status: 404 })
  }

  const notes = parseEnrollmentNotes(enrollment.notes)
  const nextProgress = {
    ...(notes.elearningProgress && typeof notes.elearningProgress === 'object' ? notes.elearningProgress : {}),
    [String(enrollment.id)]: {
      completed: parsed.data.completed,
      timeSpent: parsed.data.timeSpent,
      completedAt: parsed.data.completed ? new Date().toISOString() : null,
      score: notes.elearningProgress?.[String(enrollment.id)]?.score ?? (enrollment.evaluation?.overallRating ? enrollment.evaluation.overallRating * 20 : null),
      updatedAt: new Date().toISOString(),
    },
  }

  const updated = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      notes: serializeEnrollmentNotes({
        ...notes,
        elearningProgress: nextProgress,
      }),
    },
    include: {
      session: {
        select: {
          id: true,
          endDate: true,
          prerequisites: true,
          startDate: true,
        },
      },
      evaluation: {
        select: {
          overallRating: true,
        },
      },
    },
  })

  return NextResponse.json(buildProgressRecord(updated), { status: 201 })
}
