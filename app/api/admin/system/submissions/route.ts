import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { parseEnrollmentNotes } from '@/lib/student/enrollment-notes'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const submissions = await prisma.studentSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
        },
      },
      session: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  const emails = Array.from(
    new Set(submissions.map((submission) => submission.student.email))
  )

  const enrollmentNotes = emails.length
    ? await prisma.enrollment.findMany({
        where: {
          email: { in: emails },
        },
        select: {
          email: true,
          notes: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  const latestEnrollmentNotesByEmail = enrollmentNotes.reduce<Record<string, string | null>>((acc, item) => {
    if (!acc[item.email]) acc[item.email] = item.notes
    return acc
  }, {})

  const enriched = submissions.map((submission) => {
    const rawNotes = latestEnrollmentNotesByEmail[submission.student.email]
    const notes = parseEnrollmentNotes(rawNotes || null)
    const feedbackEntry = notes.submissionFeedback?.[submission.id]
    const feedback =
      feedbackEntry && typeof feedbackEntry === 'object' && !Array.isArray(feedbackEntry)
        ? (feedbackEntry as Record<string, unknown>)
        : null

    return {
      ...submission,
      feedback: feedback && typeof feedback.feedback === 'string' ? feedback.feedback : null,
      reviewedAt: feedback && typeof feedback.updatedAt === 'string' ? feedback.updatedAt : null,
    }
  })

  return NextResponse.json({ submissions: enriched })
}
