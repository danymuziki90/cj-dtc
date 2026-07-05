import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import {
  parseEnrollmentNotes,
  serializeEnrollmentNotes,
  upsertSubmissionFeedback,
} from '@/lib/student/enrollment-notes'

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  feedback: z.string().max(2000).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const parsed = updateStatusSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const submission = await prisma.studentSubmission.update({
    where: { id },
    data: {
      status: parsed.data.status,
    },
    include: {
      student: {
        select: {
          email: true,
        },
      },
    },
  })

  const feedbackText = parsed.data.feedback?.trim()

  if (feedbackText || parsed.data.status !== 'pending') {
    const latestEnrollment = await prisma.enrollment.findFirst({
      where: {
        email: submission.student.email,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        notes: true,
      },
    })

    if (latestEnrollment) {
      const notesData = parseEnrollmentNotes(latestEnrollment.notes)
      const updatedNotes = upsertSubmissionFeedback(notesData, submission.id, {
        feedback: feedbackText || null,
        status: parsed.data.status,
        updatedAt: new Date().toISOString(),
      })

      await prisma.enrollment.update({
        where: { id: latestEnrollment.id },
        data: {
          notes: serializeEnrollmentNotes(updatedNotes),
        },
      })
    }
  }

  return NextResponse.json({ submission })
}
