export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/crons/assignment-reminders
 * Cron de relance automatique pour les travaux ayant une date limite dans les 24h.
 * Crée des notifications d'avertissement pour les étudiants n'ayant pas encore rendu leur devoir.
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // 1. Fetch published assignments with deadline between now and 24 hours in the future
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        published: true,
        status: 'publie',
        deadline: {
          gte: now,
          lte: in24Hours,
        },
      },
      include: {
        session: { select: { id: true, startDate: true, endDate: true } },
        formation: { select: { id: true, title: true } },
        submissions: { select: { studentId: true, student: { select: { email: true } } } },
      },
    })

    if (upcomingAssignments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun travail avec date limite dans les 24h prochaines.',
        sentCount: 0,
      })
    }

    let sentCount = 0
    const BLOCKED_STATUSES = ['rejected', 'cancelled', 'REJECTED', 'CANCELLED', 'annulee', 'rejete', 'refuse']

    for (const assignment of upcomingAssignments) {
      if (!assignment.sessionId && !assignment.formationId) continue

      // Find all active enrollments for this assignment's session or formation
      const enrollments = await prisma.enrollment.findMany({
        where: {
          status: { notIn: BLOCKED_STATUSES },
          OR: [
            ...(assignment.sessionId ? [{ sessionId: assignment.sessionId }] : []),
            ...(assignment.formationId ? [{ formationId: assignment.formationId, sessionId: null }] : []),
          ],
        },
        select: {
          email: true,
          studentId: true,
          firstName: true,
          lastName: true,
        },
      })

      // Get list of emails/ids of students who have already submitted
      const submittedStudentIds = new Set(assignment.submissions.map((s) => s.studentId))
      const submittedEmails = new Set(
        assignment.submissions
          .map((s) => s.student?.email?.toLowerCase())
          .filter(Boolean) as string[]
      )

      const formattedDeadline = new Date(assignment.deadline).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      for (const student of enrollments) {
        const studentEmailLower = student.email.toLowerCase()
        const isSubmitted =
          (student.studentId && submittedStudentIds.has(student.studentId)) ||
          submittedEmails.has(studentEmailLower)

        if (isSubmitted) continue // Skip students who already submitted

        const notifTitle = `⚠️ Rappel : Date limite proche - ${assignment.title}`

        // Check if a reminder notification was already sent in the last 24h
        const existingNotif = await prisma.adminNotification.findFirst({
          where: {
            title: notifTitle,
            studentEmail: student.email,
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          },
        })

        if (!existingNotif) {
          await prisma.adminNotification.create({
            data: {
              title: notifTitle,
              message: `Attention ${student.firstName} ! Il vous reste moins de 24 heures pour rendre votre devoir "${assignment.title}". Date limite : ${formattedDeadline}.`,
              type: 'warning',
              target: 'student',
              studentEmail: student.email,
              sessionId: assignment.sessionId || undefined,
              createdBy: 'System Cron',
            },
          })
          sentCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${sentCount} relance(s) automatique(s) envoyée(s) pour les travaux à rendre dans 24h.`,
      sentCount,
      assignmentsChecked: upcomingAssignments.length,
    })
  } catch (error: any) {
    console.error('[Assignment Reminders Cron Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de l’exécution du cron de relance' },
      { status: 500 }
    )
  }
}
