import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { parseSessionMetadata } from '@/lib/sessions/metadata'
import { getStudentQuestions, parseEnrollmentNotes } from '@/lib/student/enrollment-notes'

function parsePaymentNotes(notes?: string | null) {
  if (!notes) return {}

  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>
    return {
      gateway: typeof parsed.gateway === 'string' ? parsed.gateway : null,
      operator: typeof parsed.operator === 'string' ? parsed.operator : null,
      proofUrl:
        typeof parsed.proofUrl === 'string'
          ? parsed.proofUrl
          : typeof parsed.paymentProofUrl === 'string'
          ? parsed.paymentProofUrl
          : null,
      referenceExternal:
        typeof parsed.externalReference === 'string' ? parsed.externalReference : null,
    }
  } catch {
    return {}
  }
}

function getSessionHours(session: { startDate: Date; endDate: Date; prerequisites?: string | null }) {
  const parsed = parseSessionMetadata(session.prerequisites)
  const durationLabel = parsed.metadata.durationLabel || ''
  const durationMatch = durationLabel.match(/(\d+(?:[.,]\d+)?)\s*(h|heure|heures)/i)

  if (durationMatch) {
    const value = Number(durationMatch[1].replace(',', '.'))
    if (!Number.isNaN(value) && value > 0) return value
  }

  const raw = (session.endDate.getTime() - session.startDate.getTime()) / 3600000
  if (raw > 0) return Math.round(raw * 10) / 10
  return 2
}

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const now = new Date()
  const studentEmail = auth.student.email

  const [enrollments, payments, submissions, portalCertificates, issuedCertificates, news, evaluationsCount] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { email: studentEmail },
        orderBy: { createdAt: 'desc' },
        include: {
          formation: {
            select: {
              id: true,
              title: true,
              categorie: true,
            },
          },
          session: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              location: true,
              format: true,
              price: true,
              status: true,
              prerequisites: true,
            },
          },
        },
      }),
      prisma.payment.findMany({
        where: {
          enrollment: {
            is: {
              email: studentEmail,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          enrollment: {
            select: {
              id: true,
              totalAmount: true,
              paidAmount: true,
              paymentStatus: true,
              formation: {
                select: { title: true },
              },
              session: {
                select: {
                  id: true,
                  startDate: true,
                  endDate: true,
                  location: true,
                },
              },
            },
          },
        },
      }),
      prisma.studentSubmission.findMany({
        where: { studentId: auth.student.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studentCertificate.findMany({
        where: { studentId: auth.student.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.certificate.findMany({
        where: {
          enrollment: {
            is: {
              email: studentEmail,
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
        include: {
          formation: {
            select: {
              id: true,
              title: true,
              categorie: true,
            },
          },
          session: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              location: true,
            },
          },
        },
      }),
      prisma.news.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.evaluation.count({
        where: {
          enrollment: {
            is: {
              email: studentEmail,
            },
          },
        },
      }),
    ])

  const formationIds = Array.from(new Set(enrollments.map((item) => item.formationId)))
  const sessionIds = Array.from(
    new Set(enrollments.map((item) => item.sessionId).filter((value): value is number => Boolean(value)))
  )

  const adminNotifications = await prisma.adminNotification.findMany({
    where: {
      OR: [
        {
          target: 'all',
        },
        {
          target: 'student',
          studentEmail,
        },
        ...(sessionIds.length
          ? [
              {
                target: 'session',
                sessionId: {
                  in: sessionIds,
                },
              },
            ]
          : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const resources =
    formationIds.length > 0 || sessionIds.length > 0
      ? await prisma.document.findMany({
          where: {
            OR: [
              ...(formationIds.length > 0 ? [{ formationId: { in: formationIds } }] : []),
              ...(sessionIds.length > 0 ? [{ sessionId: { in: sessionIds } }] : []),
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            filePath: true,
            fileName: true,
            isPublic: true,
            createdAt: true,
            formationId: true,
            sessionId: true,
          },
        })
      : []

  const enrollmentsWithSession = enrollments.filter((item) => item.session)

  const currentEnrollment = enrollmentsWithSession
    .filter((item) => ['pending', 'accepted', 'confirmed', 'waitlist'].includes(item.status))
    .sort((a, b) => {
      const aDate = a.session?.startDate ? new Date(a.session.startDate).getTime() : Number.MAX_SAFE_INTEGER
      const bDate = b.session?.startDate ? new Date(b.session.startDate).getTime() : Number.MAX_SAFE_INTEGER
      return aDate - bDate
    })[0]

  const sessionsHistory = enrollmentsWithSession.map((item) => {
    const session = item.session!
    const notes = parseEnrollmentNotes(item.notes)
    const sessionMeta = parseSessionMetadata(session.prerequisites)
    return {
      enrollmentId: item.id,
      formationTitle: item.formation.title,
      formationCategory: item.formation.categorie,
      sessionId: session.id,
      sessionType: sessionMeta.metadata.sessionType || null,
      startDate: session.startDate,
      endDate: session.endDate,
      location: session.location,
      format: session.format,
      enrollmentStatus: item.status,
      paymentStatus: item.paymentStatus,
      totalAmount: item.totalAmount,
      paidAmount: item.paidAmount,
      questionsCount: getStudentQuestions(notes).length,
      hours: getSessionHours({
        startDate: session.startDate,
        endDate: session.endDate,
        prerequisites: session.prerequisites,
      }),
    }
  })

  const completedSessionRows = sessionsHistory.filter(
    (item) => new Date(item.endDate).getTime() < now.getTime() && !['rejected', 'cancelled'].includes(item.enrollmentStatus)
  )
  const pendingSessionRows = sessionsHistory.filter(
    (item) => new Date(item.endDate).getTime() >= now.getTime() && !['rejected', 'cancelled'].includes(item.enrollmentStatus)
  )

  const hoursCompleted = completedSessionRows.reduce((sum, item) => sum + item.hours, 0)
  const hoursRemaining = pendingSessionRows.reduce((sum, item) => sum + item.hours, 0)

  const submissionFeedbackMap = enrollments.reduce<Record<string, { feedback?: string | null; status?: string | null; updatedAt?: string }>>(
    (acc, enrollment) => {
      const notes = parseEnrollmentNotes(enrollment.notes)
      const entry = notes.submissionFeedback
      if (entry && typeof entry === 'object') {
        Object.entries(entry).forEach(([key, value]) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            const cast = value as Record<string, unknown>
            acc[key] = {
              feedback: typeof cast.feedback === 'string' ? cast.feedback : null,
              status: typeof cast.status === 'string' ? cast.status : null,
              updatedAt: typeof cast.updatedAt === 'string' ? cast.updatedAt : undefined,
            }
          }
        })
      }
      return acc
    },
    {}
  )

  const mappedSubmissions = submissions.map((submission) => {
    const feedback = submissionFeedbackMap[submission.id]
    return {
      id: submission.id,
      title: submission.title,
      status: submission.status,
      fileUrl: submission.fileUrl,
      submittedAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      reviewFeedback: feedback?.feedback || null,
      reviewedAt: feedback?.updatedAt || null,
      reviewStatus: feedback?.status || null,
    }
  })

  const questions = enrollments
    .flatMap((enrollment) => {
      const notes = parseEnrollmentNotes(enrollment.notes)
      return getStudentQuestions(notes).map((question) => ({
        ...question,
        enrollmentId: enrollment.id,
        formationTitle: enrollment.formation.title,
        sessionId: enrollment.sessionId,
      }))
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const mappedPayments = payments.map((payment) => {
    const details = parsePaymentNotes(payment.notes)
    return {
      id: payment.id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      reference: payment.reference,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      gateway: details.gateway || null,
      operator: details.operator || null,
      proofUrl: details.proofUrl || null,
      formationTitle: payment.enrollment.formation.title,
      enrollmentId: payment.enrollment.id,
      session: payment.enrollment.session,
      enrollmentPaymentStatus: payment.enrollment.paymentStatus,
      enrollmentPaidAmount: payment.enrollment.paidAmount,
      enrollmentTotalAmount: payment.enrollment.totalAmount,
    }
  })

  const notifications = [
    ...news.map((item) => ({
      id: `news-${item.id}`,
      type: 'info',
      title: item.title,
      message: item.content,
      createdAt: item.createdAt,
    })),
    ...adminNotifications.map((item) => ({
      id: `admin-notification-${item.id}`,
      type: item.type,
      title: item.title,
      message: item.message,
      createdAt: item.createdAt,
    })),
    ...mappedSubmissions
      .filter((item) => item.status !== 'pending')
      .map((item) => ({
        id: `submission-${item.id}`,
        type: 'correction',
        title: 'Mise a jour de travail',
        message: `${item.title}: statut ${item.status}${item.reviewFeedback ? ` - ${item.reviewFeedback}` : ''}`,
        createdAt: item.reviewedAt ? new Date(item.reviewedAt) : new Date(item.updatedAt),
      })),
    ...(currentEnrollment?.session && new Date(currentEnrollment.session.startDate).getTime() > now.getTime()
      ? [
          {
            id: `reminder-${currentEnrollment.id}`,
            type: 'reminder',
            title: 'Rappel de session',
            message: `Votre prochaine session ${currentEnrollment.formation.title} commence le ${new Date(
              currentEnrollment.session.startDate
            ).toLocaleDateString('fr-FR')}.`,
            createdAt: new Date(),
          },
        ]
      : []),
    ...questions
      .filter((item) => item.adminReply)
      .map((item) => ({
        id: `reply-${item.id}`,
        type: 'info',
        title: 'Reponse a votre question',
        message: item.adminReply as string,
        createdAt: item.adminReplyAt ? new Date(item.adminReplyAt) : new Date(item.createdAt),
      })),
    ...mappedPayments
      .filter((item) => ['pending', 'failed'].includes(item.status))
      .map((item) => ({
        id: `payment-${item.id}`,
        type: 'reminder',
        title: 'Suivi paiement',
        message: `Paiement ${item.method} (${item.status}) pour ${item.formationTitle}.`,
        createdAt: new Date(item.createdAt),
      })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20)

  const certificates = [
    ...issuedCertificates.map((certificate) => ({
      id: `core-${certificate.id}`,
      code: certificate.code,
      type: certificate.type,
      holderName: certificate.holderName,
      issuedAt: certificate.issuedAt,
      verified: certificate.verified,
      formation: certificate.formation,
      session: certificate.session,
      source: 'certificate',
      fileUrl: null,
    })),
    ...portalCertificates.map((certificate) => ({
      id: `portal-${certificate.id}`,
      code: certificate.id,
      type: 'portal',
      holderName: `${auth.student.firstName} ${auth.student.lastName}`.trim(),
      issuedAt: certificate.createdAt,
      verified: true,
      formation: null,
      session: null,
      source: 'student_certificate',
      fileUrl: certificate.fileUrl,
      title: certificate.title,
    })),
  ]

  return NextResponse.json({
    student: {
      id: auth.student.id,
      fullName: `${auth.student.firstName} ${auth.student.lastName}`.trim(),
      firstName: auth.student.firstName,
      lastName: auth.student.lastName,
      username: auth.student.username,
      email: auth.student.email,
      whatsapp: auth.student.phone,
      status: auth.student.status,
      address: auth.student.address,
      city: auth.student.city,
      country: auth.student.country,
      createdAt: auth.student.createdAt,
      photoUrl: null,
    },
    dashboard: {
      currentSession: currentEnrollment
        ? {
            enrollmentId: currentEnrollment.id,
            formationTitle: currentEnrollment.formation.title,
            sessionId: currentEnrollment.session?.id,
            sessionType: currentEnrollment.session
              ? parseSessionMetadata(currentEnrollment.session.prerequisites).metadata.sessionType || null
              : null,
            startDate: currentEnrollment.session?.startDate,
            endDate: currentEnrollment.session?.endDate,
            location: currentEnrollment.session?.location,
            format: currentEnrollment.session?.format,
            status: currentEnrollment.status,
          }
        : null,
      sessionsHistory,
      resources,
      payments: mappedPayments,
      submissions: mappedSubmissions,
      certificates,
      questions,
      notifications,
      progress: {
        hoursCompleted,
        hoursRemaining,
        exercisesCompleted: mappedSubmissions.filter((item) => item.status === 'approved').length,
        exercisesInProgress: mappedSubmissions.filter((item) => item.status === 'pending').length,
        projectsCompleted: mappedSubmissions.filter((item) => item.status === 'approved').length,
        evaluationsCompleted: evaluationsCount,
      },
      metrics: {
        totalSessions: sessionsHistory.length,
        completedSessions: completedSessionRows.length,
        pendingSessions: pendingSessionRows.length,
        totalPayments: mappedPayments.length,
        successfulPayments: mappedPayments.filter((item) => item.status === 'success').length,
      },
    },
  })
}
