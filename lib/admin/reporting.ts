import { prisma } from '@/lib/prisma'
import { toCanonicalPaymentStatus } from '@/lib/payments/status'

export type ReportingPeriod = '7d' | '30d' | '90d' | '365d' | 'all'
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'
export type AlertCategory =
  | 'payment'
  | 'session'
  | 'attendance'
  | 'submission'
  | 'certificate'
  | 'waitlist'
  | 'document'
  | 'notification'

const ACTIVE_ENROLLMENT_STATUSES = ['pending', 'accepted', 'confirmed', 'completed']
const COMPLETED_ENROLLMENT_STATUSES = ['confirmed', 'completed']
const ATTENDED_STATUSES = new Set(['present', 'late'])
const NON_ABSENT_STATUSES = new Set(['present', 'late', 'excused'])

function round(value: number, fractionDigits = 1) {
  return Number(value.toFixed(fractionDigits))
}

function percentage(part: number, total: number, fractionDigits = 1) {
  if (!total) return 0
  return round((part / total) * 100, fractionDigits)
}

function normalizeEmail(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

function resolvePeriodStart(period: ReportingPeriod) {
  if (period === 'all') return null

  const now = new Date()
  const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '365d' ? 365 : 30
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

function getAgeBucketLabel(daysOpen: number) {
  if (daysOpen <= 7) return '0-7 jours'
  if (daysOpen <= 30) return '8-30 jours'
  return '31+ jours'
}

function getSeverityWeight(severity: AlertSeverity) {
  if (severity === 'critical') return 4
  if (severity === 'high') return 3
  if (severity === 'medium') return 2
  return 1
}

function formatPeriodLabel(period: ReportingPeriod) {
  if (period === '7d') return '7 derniers jours'
  if (period === '90d') return '90 derniers jours'
  if (period === '365d') return '12 derniers mois'
  if (period === 'all') return 'historique complet'
  return '30 derniers jours'
}

function isEnrollmentSettled(enrollment: { paymentStatus: string; paidAmount: number; totalAmount: number }) {
  if (enrollment.totalAmount <= 0) return true
  if (enrollment.paidAmount >= enrollment.totalAmount) return true
  return toCanonicalPaymentStatus(enrollment.paymentStatus) === 'success'
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function formatSessionLabel(startDate: Date | null | undefined, location?: string | null) {
  if (!startDate) return 'Session non planifiee'
  return `${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(startDate)} · ${location || 'Lieu a confirmer'}`
}

export type AdminOperationalAlert = {
  id: string
  category: AlertCategory
  severity: AlertSeverity
  title: string
  message: string
  actionLabel: string
  actionHref: string
  createdAt: string
}

export type AdminReportingSnapshot = {
  generatedAt: string
  period: ReportingPeriod
  periodLabel: string
  totals: {
    sessions: number
    students: number
    paymentsConfirmed: number
    paymentsPending: number
    submissionsPending: number
    certificatesIssued: number
    notificationsRecent: number
  }
  summary: {
    expectedRevenue: number
    collectedRevenue: number
    outstandingRevenue: number
    collectionRate: number
    averageFillRate: number
    attendanceRate: number
    pendingCorrections: number
    certificatesReady: number
    paymentConversionRate: number
    accountConversionRate: number
  }
  reports: {
    fillRate: {
      averageRate: number
      fullSessions: number
      sessions: Array<{
        sessionId: number
        formationTitle: string
        startDate: string
        endDate: string
        location: string | null
        format: string
        status: string
        occupiedSeats: number
        maxParticipants: number
        availableSeats: number
        waitlistCount: number
        documentCount: number
        fillRate: number
      }>
    }
    revenue: {
      expected: number
      collected: number
      outstanding: number
      collectionRate: number
      agingBuckets: Array<{
        label: string
        count: number
        amount: number
      }>
      trend: Array<{
        label: string
        expected: number
        collected: number
      }>
    }
    attendance: {
      overallRate: number
      totals: {
        present: number
        late: number
        excused: number
        absent: number
      }
      sessions: Array<{
        sessionId: number
        formationTitle: string
        rate: number
        records: number
        absentCount: number
        lateCount: number
      }>
      repeatedAbsences: Array<{
        email: string
        studentName: string
        sessionLabel: string
        absentCount: number
      }>
    }
    submissions: {
      pendingPortal: number
      pendingLegacy: number
      pendingTotal: number
      queue: Array<{
        id: string
        source: 'portal' | 'legacy'
        title: string
        studentName: string
        email: string
        status: string
        createdAt: string
      }>
      overdueAssignments: Array<{
        assignmentId: number
        title: string
        formationTitle: string
        deadline: string
        missingCount: number
      }>
    }
    certificates: {
      issuedCount: number
      readyCount: number
      eligibleNotIssued: Array<{
        enrollmentId: number
        studentName: string
        email: string
        formationTitle: string
        sessionLabel: string
        sessionEndDate: string
        attendanceRate: number | null
      }>
    }
    conversion: {
      totalEnrollments: number
      settledPayments: number
      studentAccounts: number
      paymentRate: number
      accountRate: number
      stages: Array<{
        stage: string
        value: number
      }>
      blockedWithoutAccount: Array<{
        enrollmentId: number
        studentName: string
        email: string
        formationTitle: string
        sessionLabel: string
        paidAmount: number
        totalAmount: number
      }>
    }
  }
  actionsNow: {
    paymentsToValidate: Array<{
      enrollmentId: number
      studentName: string
      email: string
      formationTitle: string
      sessionLabel: string
      balanceAmount: number
      createdAt: string
    }>
    studentsBlockedWithoutAccount: Array<{
      enrollmentId: number
      studentName: string
      email: string
      formationTitle: string
      sessionLabel: string
    }>
    submissionsPendingReview: Array<{
      id: string
      source: 'portal' | 'legacy'
      title: string
      studentName: string
      createdAt: string
    }>
    waitlistToPromote: Array<{
      sessionId: number
      formationTitle: string
      sessionLabel: string
      availableSeats: number
      waitlistCount: number
    }>
    certificatesToIssue: Array<{
      enrollmentId: number
      studentName: string
      formationTitle: string
      sessionLabel: string
    }>
    notificationsToTreat: Array<{
      id: string
      title: string
      type: string
      createdAt: string
    }>
  }
  alerts: AdminOperationalAlert[]
}

export async function buildAdminReportingSnapshot(period: ReportingPeriod = '30d'): Promise<AdminReportingSnapshot> {
  const since = resolvePeriodStart(period)
  const now = new Date()

  const [
    sessions,
    studentsCount,
    confirmedPaymentsCount,
    pendingPaymentsCount,
    recentNotifications,
    portalPendingSubmissions,
    legacyPendingSubmissions,
    overdueAssignments,
    attendanceRows,
    certificatesCount,
    recentEnrollments,
    outstandingEnrollments,
    endedCandidateEnrollments,
    activeEnrollmentsByFormation,
  ] = await Promise.all([
    prisma.trainingSession.findMany({
      where: since
        ? {
            OR: [{ startDate: { gte: since } }, { endDate: { gte: since } }, { status: { in: ['ouverte', 'complete'] } }],
          }
        : undefined,
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        location: true,
        format: true,
        status: true,
        maxParticipants: true,
        currentParticipants: true,
        formation: {
          select: {
            title: true,
          },
        },
        _count: {
          select: {
            waitlist: true,
            documents: true,
            attendances: true,
          },
        },
      },
    }),
    prisma.student.count(),
    prisma.payment.count({
      where: {
        status: {
          in: ['success', 'completed', 'paid'],
        },
      },
    }),
    prisma.payment.count({
      where: {
        status: {
          in: ['pending', 'processing', 'submitted'],
        },
      },
    }),
    prisma.adminNotification.findMany({
      where: since ? { createdAt: { gte: since } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
      },
    }),
    prisma.studentSubmission.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.submission.findMany({
      where: { status: { in: ['submitted', 'returned'] } },
      orderBy: { submittedAt: 'desc' },
      take: 8,
      select: {
        id: true,
        status: true,
        submittedAt: true,
        studentEmail: true,
        assignment: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.assignment.findMany({
      where: { deadline: { lt: now } },
      orderBy: { deadline: 'asc' },
      select: {
        id: true,
        title: true,
        deadline: true,
        formationId: true,
        formation: {
          select: {
            title: true,
          },
        },
        submissions: {
          select: {
            studentEmail: true,
          },
        },
      },
    }),
    prisma.attendance.findMany({
      where: since ? { date: { gte: since } } : undefined,
      orderBy: { date: 'desc' },
      select: {
        sessionId: true,
        date: true,
        status: true,
        enrollment: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            session: {
              select: {
                location: true,
                formation: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.certificate.count(),
    prisma.enrollment.findMany({
      where: since ? { createdAt: { gte: since } } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        paidAmount: true,
        createdAt: true,
        formation: {
          select: {
            title: true,
          },
        },
        session: {
          select: {
            startDate: true,
            endDate: true,
            location: true,
          },
        },
      },
    }),
    prisma.enrollment.findMany({
      where: {
        status: { notIn: ['rejected', 'cancelled'] },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        paymentStatus: true,
        totalAmount: true,
        paidAmount: true,
        formation: { select: { title: true } },
        session: { select: { startDate: true, location: true } },
      },
    }),
    prisma.enrollment.findMany({
      where: {
        status: { in: COMPLETED_ENROLLMENT_STATUSES },
        session: {
          endDate: { lt: now },
        },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        paymentStatus: true,
        totalAmount: true,
        paidAmount: true,
        certificateIssued: true,
        formation: {
          select: {
            title: true,
          },
        },
        session: {
          select: {
            endDate: true,
            startDate: true,
            location: true,
          },
        },
        attendances: {
          select: {
            status: true,
          },
        },
      },
    }),
    prisma.enrollment.groupBy({
      by: ['formationId'],
      where: {
        status: { in: ACTIVE_ENROLLMENT_STATUSES },
      },
      _count: {
        _all: true,
      },
    }),
  ])

  const studentEmails = Array.from(new Set(recentEnrollments.map((item) => normalizeEmail(item.email)).filter(Boolean)))
  const students = studentEmails.length
    ? await prisma.student.findMany({
        where: {
          email: {
            in: studentEmails,
          },
        },
        select: {
          email: true,
        },
      })
    : []
  const studentEmailSet = new Set(students.map((student) => normalizeEmail(student.email)))
  const activeEnrollmentsByFormationMap = new Map(activeEnrollmentsByFormation.map((item) => [item.formationId, item._count._all]))

  const sessionMetrics = sessions.map((session) => {
    const occupiedSeats = Math.max(session.currentParticipants || 0, 0)
    const maxParticipants = Math.max(session.maxParticipants || 0, 0)
    const availableSeats = Math.max(0, maxParticipants - occupiedSeats)
    const fillRate = maxParticipants > 0 ? round((occupiedSeats / maxParticipants) * 100) : 0

    return {
      sessionId: session.id,
      formationTitle: session.formation.title,
      startDate: session.startDate.toISOString(),
      endDate: session.endDate.toISOString(),
      location: session.location || null,
      format: session.format,
      status: session.status,
      occupiedSeats,
      maxParticipants,
      availableSeats,
      waitlistCount: session._count.waitlist,
      documentCount: session._count.documents,
      fillRate,
    }
  })

  const fillRateAverage = sessionMetrics.length
    ? round(sessionMetrics.reduce((sum, session) => sum + session.fillRate, 0) / sessionMetrics.length)
    : 0
  const fullSessions = sessionMetrics.filter((session) => session.fillRate >= 100).length

  const revenueExpected = recentEnrollments.reduce((sum, enrollment) => sum + (enrollment.totalAmount || 0), 0)
  const revenueCollected = recentEnrollments.reduce((sum, enrollment) => sum + (enrollment.paidAmount || 0), 0)
  const revenueOutstanding = Math.max(0, revenueExpected - revenueCollected)

  const trendMap = new Map<string, { label: string; expected: number; collected: number }>()
  for (const enrollment of recentEnrollments) {
    const bucketDate = enrollment.session?.startDate || enrollment.createdAt
    const label = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(bucketDate)
    const bucket = trendMap.get(label) || { label, expected: 0, collected: 0 }
    bucket.expected += enrollment.totalAmount || 0
    bucket.collected += enrollment.paidAmount || 0
    trendMap.set(label, bucket)
  }
  const revenueTrend = Array.from(trendMap.values())

  const agingMap = new Map<string, { label: string; count: number; amount: number }>()
  const paymentActionRows = outstandingEnrollments
    .filter((enrollment) => !isEnrollmentSettled(enrollment))
    .map((enrollment) => {
      const balanceAmount = Math.max(0, (enrollment.totalAmount || 0) - (enrollment.paidAmount || 0))
      const daysOpen = Math.max(0, Math.ceil((now.getTime() - enrollment.createdAt.getTime()) / (24 * 60 * 60 * 1000)))
      const bucketLabel = getAgeBucketLabel(daysOpen)
      const bucket = agingMap.get(bucketLabel) || { label: bucketLabel, count: 0, amount: 0 }
      bucket.count += 1
      bucket.amount += balanceAmount
      agingMap.set(bucketLabel, bucket)

      return {
        enrollmentId: enrollment.id,
        studentName: `${enrollment.firstName} ${enrollment.lastName}`.trim(),
        email: enrollment.email,
        formationTitle: enrollment.formation.title,
        sessionLabel: formatSessionLabel(enrollment.session?.startDate, enrollment.session?.location),
        balanceAmount,
        createdAt: enrollment.createdAt.toISOString(),
        daysOpen,
        sessionStartDate: enrollment.session?.startDate?.toISOString() || null,
      }
    })
    .sort((a, b) => b.balanceAmount - a.balanceAmount || b.daysOpen - a.daysOpen)

  const attendanceTotals = attendanceRows.reduce(
    (acc, row) => {
      const status = row.status.toLowerCase()
      if (status === 'present') acc.present += 1
      else if (status === 'late') acc.late += 1
      else if (status === 'excused') acc.excused += 1
      else acc.absent += 1
      return acc
    },
    { present: 0, late: 0, excused: 0, absent: 0 },
  )
  const attendancePositive = attendanceRows.filter((row) => NON_ABSENT_STATUSES.has(row.status.toLowerCase())).length
  const attendanceRate = percentage(attendancePositive, attendanceRows.length || 0)

  const attendanceBySession = new Map<number, { formationTitle: string; records: number; positive: number; absentCount: number; lateCount: number }>()
  const absencesByStudent = new Map<string, { email: string; studentName: string; sessionLabel: string; absentCount: number }>()
  for (const row of attendanceRows) {
    const entry = attendanceBySession.get(row.sessionId) || {
      formationTitle: row.enrollment.session?.formation.title || 'Session',
      records: 0,
      positive: 0,
      absentCount: 0,
      lateCount: 0,
    }
    entry.records += 1
    if (NON_ABSENT_STATUSES.has(row.status.toLowerCase())) entry.positive += 1
    if (row.status.toLowerCase() === 'absent') entry.absentCount += 1
    if (row.status.toLowerCase() === 'late') entry.lateCount += 1
    attendanceBySession.set(row.sessionId, entry)

    if (row.status.toLowerCase() === 'absent') {
      const email = normalizeEmail(row.enrollment.email)
      const key = `${email}:${row.sessionId}`
      const absenceEntry = absencesByStudent.get(key) || {
        email: row.enrollment.email,
        studentName: `${row.enrollment.firstName} ${row.enrollment.lastName}`.trim(),
        sessionLabel: `${row.enrollment.session?.formation.title || 'Session'} · ${row.enrollment.session?.location || 'Lieu a confirmer'}`,
        absentCount: 0,
      }
      absenceEntry.absentCount += 1
      absencesByStudent.set(key, absenceEntry)
    }
  }

  const attendanceSessionRates = Array.from(attendanceBySession.entries())
    .map(([sessionId, value]) => ({
      sessionId,
      formationTitle: value.formationTitle,
      rate: percentage(value.positive, value.records),
      records: value.records,
      absentCount: value.absentCount,
      lateCount: value.lateCount,
    }))
    .sort((a, b) => a.rate - b.rate)

  const repeatedAbsences = Array.from(absencesByStudent.values())
    .filter((item) => item.absentCount >= 2)
    .sort((a, b) => b.absentCount - a.absentCount)

  const portalQueue = portalPendingSubmissions.map((submission) => ({
    id: submission.id,
    source: 'portal' as const,
    title: submission.title,
    studentName: `${submission.student.firstName} ${submission.student.lastName}`.trim(),
    email: submission.student.email,
    status: submission.status,
    createdAt: submission.createdAt.toISOString(),
  }))
  const legacyQueue = legacyPendingSubmissions.map((submission) => ({
    id: `legacy-${submission.id}`,
    source: 'legacy' as const,
    title: submission.assignment.title,
    studentName: submission.studentEmail,
    email: submission.studentEmail,
    status: submission.status,
    createdAt: submission.submittedAt.toISOString(),
  }))
  const submissionQueue = [...portalQueue, ...legacyQueue]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const overdueAssignmentRows = overdueAssignments
    .map((assignment) => {
      const targetEnrollments = Number(activeEnrollmentsByFormationMap.get(assignment.formationId) || 0)
      const submittedEmails = new Set(assignment.submissions.map((item) => normalizeEmail(item.studentEmail)).filter(Boolean))
      const missingCount = Math.max(0, targetEnrollments - submittedEmails.size)
      return {
        assignmentId: assignment.id,
        title: assignment.title,
        formationTitle: assignment.formation.title,
        deadline: assignment.deadline.toISOString(),
        missingCount,
      }
    })
    .filter((assignment) => assignment.missingCount > 0)
    .sort((a, b) => b.missingCount - a.missingCount)
    .slice(0, 8)

  const eligibleNotIssued = endedCandidateEnrollments
    .filter((enrollment) => !enrollment.certificateIssued)
    .filter((enrollment) => isEnrollmentSettled(enrollment))
    .map((enrollment) => {
      const totalAttendance = enrollment.attendances.length
      const validAttendance = enrollment.attendances.filter((entry) => ATTENDED_STATUSES.has(entry.status.toLowerCase())).length
      const attendanceRateForEnrollment = totalAttendance ? percentage(validAttendance, totalAttendance) : null
      return {
        enrollmentId: enrollment.id,
        studentName: `${enrollment.firstName} ${enrollment.lastName}`.trim(),
        email: enrollment.email,
        formationTitle: enrollment.formation.title,
        sessionLabel: formatSessionLabel(enrollment.session?.startDate, enrollment.session?.location),
        sessionEndDate: enrollment.session?.endDate?.toISOString() || now.toISOString(),
        attendanceRate: attendanceRateForEnrollment,
      }
    })
    .filter((enrollment) => enrollment.attendanceRate === null || enrollment.attendanceRate >= 75)
    .sort((a, b) => new Date(a.sessionEndDate).getTime() - new Date(b.sessionEndDate).getTime())

  const blockedWithoutAccount = recentEnrollments
    .filter((enrollment) => isEnrollmentSettled(enrollment))
    .filter((enrollment) => !studentEmailSet.has(normalizeEmail(enrollment.email)))
    .map((enrollment) => ({
      enrollmentId: enrollment.id,
      studentName: `${enrollment.firstName} ${enrollment.lastName}`.trim(),
      email: enrollment.email,
      formationTitle: enrollment.formation.title,
      sessionLabel: formatSessionLabel(enrollment.session?.startDate, enrollment.session?.location),
      paidAmount: enrollment.paidAmount,
      totalAmount: enrollment.totalAmount,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)

  const conversionSettled = recentEnrollments.filter((enrollment) => isEnrollmentSettled(enrollment)).length
  const conversionAccounts = recentEnrollments.filter((enrollment) => studentEmailSet.has(normalizeEmail(enrollment.email))).length

  const waitlistToPromote = sessionMetrics
    .filter((session) => session.availableSeats > 0 && session.waitlistCount > 0)
    .slice(0, 8)
    .map((session) => ({
      sessionId: session.sessionId,
      formationTitle: session.formationTitle,
      sessionLabel: formatSessionLabel(new Date(session.startDate), session.location),
      availableSeats: session.availableSeats,
      waitlistCount: session.waitlistCount,
    }))

  const actionsNow = {
    paymentsToValidate: paymentActionRows.slice(0, 8).map(({ daysOpen, sessionStartDate, ...item }) => item),
    studentsBlockedWithoutAccount: blockedWithoutAccount.slice(0, 8).map(({ paidAmount, totalAmount, ...item }) => item),
    submissionsPendingReview: submissionQueue.slice(0, 8).map(({ email, status, ...item }) => item),
    waitlistToPromote,
    certificatesToIssue: eligibleNotIssued.slice(0, 8).map(({ email, sessionEndDate, attendanceRate, ...item }) => item),
    notificationsToTreat: recentNotifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      type: notification.type,
      createdAt: notification.createdAt.toISOString(),
    })),
  }

  const alerts: AdminOperationalAlert[] = []

  for (const item of paymentActionRows.slice(0, 5)) {
    const daysUntilSession = item.sessionStartDate
      ? Math.ceil((new Date(item.sessionStartDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      : null
    const severity: AlertSeverity = item.daysOpen > 30 || (daysUntilSession !== null && daysUntilSession <= 5) ? 'critical' : item.daysOpen > 14 ? 'high' : 'medium'
    alerts.push({
      id: `payment-${item.enrollmentId}`,
      category: 'payment',
      severity,
      title: `Paiement incomplet pour ${item.studentName}`,
      message: `${item.formationTitle} · solde restant ${item.balanceAmount.toFixed(0)} USD${daysUntilSession !== null ? ` · session dans ${Math.max(daysUntilSession, 0)} jour(s)` : ''}.`,
      actionLabel: 'Ouvrir les paiements',
      actionHref: `/admin/payments?search=${encodeURIComponent(item.email)}`,
      createdAt: item.createdAt,
    })
  }

  for (const session of sessionMetrics.filter((item) => {
    const daysUntil = Math.ceil((new Date(item.startDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    return daysUntil >= 0 && daysUntil <= 7
  }).slice(0, 4)) {
    alerts.push({
      id: `session-${session.sessionId}`,
      category: 'session',
      severity: session.fillRate < 40 ? 'high' : 'medium',
      title: `Session imminente: ${session.formationTitle}`,
      message: `Demarrage le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(session.startDate))} avec ${session.occupiedSeats}/${session.maxParticipants} places occupees.`,
      actionLabel: 'Voir la session',
      actionHref: `/admin/sessions#session-${session.sessionId}`,
      createdAt: session.startDate,
    })
  }

  for (const item of repeatedAbsences.slice(0, 4)) {
    alerts.push({
      id: `absence-${slugify(item.email)}-${slugify(item.sessionLabel)}`,
      category: 'attendance',
      severity: item.absentCount >= 3 ? 'high' : 'medium',
      title: `Absences repetees: ${item.studentName}`,
      message: `${item.absentCount} absence(s) sur ${item.sessionLabel}.`,
      actionLabel: 'Ouvrir le dossier etudiant',
      actionHref: `/admin/students?search=${encodeURIComponent(item.email)}`,
      createdAt: now.toISOString(),
    })
  }

  for (const assignment of overdueAssignmentRows.slice(0, 4)) {
    alerts.push({
      id: `assignment-${assignment.assignmentId}`,
      category: 'submission',
      severity: assignment.missingCount >= 5 ? 'high' : 'medium',
      title: `Travail non remis: ${assignment.title}`,
      message: `${assignment.missingCount} remise(s) manquante(s) sur ${assignment.formationTitle}.`,
      actionLabel: 'Ouvrir les travaux',
      actionHref: '/admin/submissions',
      createdAt: assignment.deadline,
    })
  }

  for (const item of eligibleNotIssued.slice(0, 4)) {
    alerts.push({
      id: `certificate-${item.enrollmentId}`,
      category: 'certificate',
      severity: 'medium',
      title: `Certificat pret pour ${item.studentName}`,
      message: `${item.formationTitle} · session terminee, compte admissible a la delivrance.`,
      actionLabel: 'Ouvrir les certificats',
      actionHref: '/admin/certificates',
      createdAt: item.sessionEndDate,
    })
  }

  for (const item of waitlistToPromote.slice(0, 4)) {
    alerts.push({
      id: `waitlist-${item.sessionId}`,
      category: 'waitlist',
      severity: 'medium',
      title: `Liste d'attente a promouvoir: ${item.formationTitle}`,
      message: `${item.availableSeats} place(s) libre(s) pour ${item.waitlistCount} attente(s).`,
      actionLabel: 'Voir la session',
      actionHref: `/admin/sessions#session-${item.sessionId}`,
      createdAt: now.toISOString(),
    })
  }

  for (const session of sessionMetrics.filter((item) => {
    const daysUntil = Math.ceil((new Date(item.startDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    return daysUntil >= 0 && daysUntil <= 10 && item.documentCount === 0
  }).slice(0, 4)) {
    alerts.push({
      id: `documents-${session.sessionId}`,
      category: 'document',
      severity: 'high',
      title: `Documents manquants pour ${session.formationTitle}`,
      message: `Aucun support rattache a une session qui demarre bientot.`,
      actionLabel: 'Ouvrir les supports',
      actionHref: '/admin/documents',
      createdAt: session.startDate,
    })
  }

  const sortedAlerts = alerts.sort((a, b) => {
    const severityDelta = getSeverityWeight(b.severity) - getSeverityWeight(a.severity)
    if (severityDelta !== 0) return severityDelta
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return {
    generatedAt: now.toISOString(),
    period,
    periodLabel: formatPeriodLabel(period),
    totals: {
      sessions: sessions.length,
      students: studentsCount,
      paymentsConfirmed: confirmedPaymentsCount,
      paymentsPending: pendingPaymentsCount,
      submissionsPending: portalPendingSubmissions.length + legacyPendingSubmissions.length,
      certificatesIssued: certificatesCount,
      notificationsRecent: recentNotifications.length,
    },
    summary: {
      expectedRevenue: round(revenueExpected, 0),
      collectedRevenue: round(revenueCollected, 0),
      outstandingRevenue: round(revenueOutstanding, 0),
      collectionRate: percentage(revenueCollected, revenueExpected),
      averageFillRate: fillRateAverage,
      attendanceRate,
      pendingCorrections: portalPendingSubmissions.length + legacyPendingSubmissions.length,
      certificatesReady: eligibleNotIssued.length,
      paymentConversionRate: percentage(conversionSettled, recentEnrollments.length),
      accountConversionRate: percentage(conversionAccounts, recentEnrollments.length),
    },
    reports: {
      fillRate: {
        averageRate: fillRateAverage,
        fullSessions,
        sessions: sessionMetrics,
      },
      revenue: {
        expected: round(revenueExpected, 0),
        collected: round(revenueCollected, 0),
        outstanding: round(revenueOutstanding, 0),
        collectionRate: percentage(revenueCollected, revenueExpected),
        agingBuckets: ['0-7 jours', '8-30 jours', '31+ jours'].map((label) => {
          const bucket = agingMap.get(label) || { label, count: 0, amount: 0 }
          return {
            label,
            count: bucket.count,
            amount: round(bucket.amount, 0),
          }
        }),
        trend: revenueTrend,
      },
      attendance: {
        overallRate: attendanceRate,
        totals: attendanceTotals,
        sessions: attendanceSessionRates,
        repeatedAbsences,
      },
      submissions: {
        pendingPortal: portalPendingSubmissions.length,
        pendingLegacy: legacyPendingSubmissions.length,
        pendingTotal: portalPendingSubmissions.length + legacyPendingSubmissions.length,
        queue: submissionQueue,
        overdueAssignments: overdueAssignmentRows,
      },
      certificates: {
        issuedCount: certificatesCount,
        readyCount: eligibleNotIssued.length,
        eligibleNotIssued,
      },
      conversion: {
        totalEnrollments: recentEnrollments.length,
        settledPayments: conversionSettled,
        studentAccounts: conversionAccounts,
        paymentRate: percentage(conversionSettled, recentEnrollments.length),
        accountRate: percentage(conversionAccounts, recentEnrollments.length),
        stages: [
          { stage: 'Inscriptions', value: recentEnrollments.length },
          { stage: 'Paiements soldes', value: conversionSettled },
          { stage: 'Comptes crees', value: conversionAccounts },
        ],
        blockedWithoutAccount,
      },
    },
    actionsNow,
    alerts: sortedAlerts,
  }
}

