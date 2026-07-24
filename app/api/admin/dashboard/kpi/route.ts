import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req)
    if (auth.error) {
      return auth.error
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Parallel queries to fetch all required KPIs and trends
    const [
      studentsTotal,
      studentsNew7d,
      studentsActive,
      sessionsOpen,
      sessionsFuture,
      newsPublished,
      notificationsTotal,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.trainingSession.count({ where: { status: 'ouverte' } }),
      prisma.trainingSession.count({ where: { startDate: { gte: now } } }),
      prisma.news.count({ where: { published: true } }),
      prisma.adminNotification.count(),
      prisma.adminAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          adminUsername: true,
          action: true,
          createdAt: true
        }
      }),
    ])

    // Calculate trends / helper labels
    const studentTrend = studentsTotal > 0 ? `+${Math.round((studentsNew7d / studentsTotal) * 100)}% cette semaine` : '0%'
    const submissionTrend = '0%'
    const submissionsPending = 0

    return NextResponse.json({
      totals: {
        studentsTotal,
        studentsActive,
        sessionsOpen,
        sessionsFuture,
        assignmentsPublished: 0,
        submissionsPending: 0,
        newsPublished,
        notificationsTotal,
      },
      trends: {
        studentTrend,
        studentsNew7d,
        submissionTrend,
        portalSubmissionsPending,
      },
      recentLogs: recentAuditLogs.map(log => ({
        username: log.adminUsername,
        action: log.action,
        time: formatRelativeTime(log.createdAt)
      }))
    })
  } catch (error) {
    console.error('Erreur API Dashboard KPIs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function formatRelativeTime(date: Date) {
  const diffMs = new Date().getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `Il y a ${diffMin} min`
  if (diffHour < 24) return `Il y a ${diffHour} h`
  return `Il y a ${diffDay} j`
}
