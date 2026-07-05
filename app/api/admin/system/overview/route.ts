import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { parseSessionMetadata } from '@/lib/sessions/metadata'

type SessionTypeKey = 'MRH' | 'IOP' | 'CONFERENCE_FORUM'

function toSessionType(raw?: string | null): SessionTypeKey {
  if (raw === 'IOP') return 'IOP'
  if (raw === 'CONFERENCE_FORUM') return 'CONFERENCE_FORUM'
  return 'MRH'
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const [sessions, studentsCount, paymentsSuccessCount, paymentsPendingCount, submissions, certificatesCount, newsCount] =
    await Promise.all([
      prisma.trainingSession.findMany({
        select: {
          id: true,
          maxParticipants: true,
          currentParticipants: true,
          prerequisites: true,
        },
      }),
      prisma.student.count(),
      prisma.payment.count({
        where: {
          status: {
            in: ['success', 'completed'],
          },
        },
      }),
      prisma.payment.count({
        where: {
          status: {
            in: ['pending'],
          },
        },
      }),
      prisma.studentSubmission.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      prisma.certificate.count(),
      prisma.news.count(),
    ])

  const sessionTypeBreakdown: Record<SessionTypeKey, number> = {
    MRH: 0,
    IOP: 0,
    CONFERENCE_FORUM: 0,
  }

  let totalAvailableSpots = 0

  for (const session of sessions) {
    const parsed = parseSessionMetadata(session.prerequisites)
    const type = toSessionType(parsed.metadata.sessionType || null)
    sessionTypeBreakdown[type] += 1
    totalAvailableSpots += Math.max(0, (session.maxParticipants || 0) - (session.currentParticipants || 0))
  }

  const submissionsByStatus = submissions.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count.status
    return acc
  }, {})

  return NextResponse.json({
    totals: {
      sessions: sessions.length,
      students: studentsCount,
      availableSpots: totalAvailableSpots,
      paymentsConfirmed: paymentsSuccessCount,
      paymentsPending: paymentsPendingCount,
      submissions: submissions.reduce((sum, row) => sum + row._count.status, 0),
      submissionsPending: submissionsByStatus.pending || 0,
      submissionsValidated: submissionsByStatus.approved || 0,
      certificates: certificatesCount,
      news: newsCount,
    },
    sessionTypes: sessionTypeBreakdown,
  })
}
