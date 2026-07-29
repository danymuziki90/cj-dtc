export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { parseSessionMetadata } from '@/lib/sessions/metadata'
import { getPublishedSessions } from '@/lib/sessions/published'
import { getStudentQuestions, parseEnrollmentNotes } from '@/lib/student/enrollment-notes'

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

function getSessionLifecycle(startDate?: Date | null, endDate?: Date | null, now = new Date()) {
  if (!startDate || !endDate) return 'unknown'
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const current = now.getTime()

  if (current < start) return 'upcoming'
  if (current > end) return 'completed'
  return 'active'
}

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const now = new Date()
  const studentEmail = auth.student.email

  try {
  const [enrollmentsRaw, portalCertificates, issuedCertificates, news, evaluations, assignments] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: {
          OR: [
            { studentId: auth.student.id },
            { email: { equals: studentEmail, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          formation: {
            select: {
              id: true,
              title: true,
              slug: true,
              categorie: true,
              imageUrl: true,
              description: true,
            },
          },
          session: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              location: true,
              format: true,
              status: true,
              prerequisites: true,
              maxParticipants: true,
              currentParticipants: true,
              imageUrl: true,
            },
          },
        },
      }),
      prisma.certificate.findMany({
        where: { studentId: auth.student.id },
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.certificate.findMany({
        where: {
          status: 'actif',
          OR: [
            { studentId: auth.student.id },
            {
              enrollment: {
                is: {
                  email: studentEmail,
                },
              },
            }
          ]
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
      prisma.evaluation.findMany({
        where: {
          enrollment: {
            is: {
              email: studentEmail,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        include: {
          formation: {
            select: {
              title: true,
            },
          },
          session: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              location: true,
              format: true,
            },
          },
        },
      }),
      // Fetch assignments based on enrollments
      prisma.assignment.findMany({
        where: {
          published: true,
          OR: [
            // Student is enrolled in the formation (global assignments)
            {
              Formation: {
                enrollments: {
                  some: {
                    studentId: auth.student.id,
                    status: { in: ['accepted', 'confirmed', 'completed'] }
                  }
                }
              },
              sessionId: null
            },
            // Student is enrolled in the specific session
            {
              TrainingSession: {
                enrollments: {
                  some: {
                    studentId: auth.student.id,
                    status: { in: ['accepted', 'confirmed', 'completed'] }
                  }
                }
              }
            }
          ]
        },
        include: {
          Formation: { select: { title: true } },
          TrainingSession: { select: { title: true } },
          submissions: {
            where: { studentId: auth.student.id },
            include: { SubmissionFile: true }
          }
        },
        orderBy: { deadline: 'asc' }
      })
    ])

  const enrollments = enrollmentsRaw as any[]
  const activeEnrollments = enrollments.filter((e) =>
    ['accepted', 'confirmed', 'completed'].includes(e.status)
  )
  const formationIds = Array.from(new Set(activeEnrollments.map((item) => item.formationId)))
  const sessionIds = Array.from(
    new Set(activeEnrollments.map((item) => item.sessionId).filter((value): value is number => Boolean(value)))
  )

  const adminNotifications = await prisma.adminNotification.findMany({
    where: {
      OR: [
        { target: 'all' },
        { target: 'student', studentEmail },
        ...(sessionIds.length
          ? [{ target: 'session', sessionId: { in: sessionIds } }]
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
            category: { not: 'certificate_template' },
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
            formation: { select: { id: true, title: true } },
            session: {
              select: {
                id: true,
                startDate: true,
                endDate: true,
                location: true,
                format: true,
              },
            },
          },
        })
      : []

  const enrollmentsWithSession = enrollments.filter((item) => item.session)

  const currentEnrollment = enrollmentsWithSession
    .filter((item) => ['accepted', 'confirmed'].includes(item.status))
    .sort((a, b) => {
      const aDate = a.session?.startDate ? new Date(a.session.startDate).getTime() : Number.MAX_SAFE_INTEGER
      const bDate = b.session?.startDate ? new Date(b.session.startDate).getTime() : Number.MAX_SAFE_INTEGER
      return aDate - bDate
    })[0]

  const currentReservedSpot =
    currentEnrollment?.sessionId && currentEnrollment?.createdAt
      ? await prisma.enrollment.count({
          where: {
            sessionId: currentEnrollment.sessionId,
            status: { in: ['pending', 'accepted', 'confirmed', 'waitlist'] },
            createdAt: { lte: currentEnrollment.createdAt },
          },
        })
      : null

  const waitlistRows = enrollmentsWithSession.length
    ? await prisma.waitlist.findMany({
        where: { enrollmentId: { in: enrollmentsWithSession.map((item) => item.id) } },
        select: { enrollmentId: true, position: true },
      })
    : []
  const waitlistPositionByEnrollmentId = new Map(waitlistRows.map((item) => [item.enrollmentId, item.position]))

  const attendanceRows = enrollmentsWithSession.length
    ? await prisma.attendance.findMany({
        where: { enrollmentId: { in: enrollmentsWithSession.map((item) => item.id) } },
        orderBy: [{ date: 'desc' }, { recordedAt: 'desc' }],
      })
    : []

  const currentEnrollmentAttendanceRows = currentEnrollment
    ? attendanceRows.filter((item) => item.enrollmentId === currentEnrollment.id)
    : []

  const attendanceRecordedCount = currentEnrollmentAttendanceRows.length
  const attendancePresentCount = currentEnrollmentAttendanceRows.filter((item) =>
    ['present', 'late', 'excused'].includes(item.status.toLowerCase())
  ).length
  const attendanceRate =
    attendanceRecordedCount > 0
      ? Math.round((attendancePresentCount / attendanceRecordedCount) * 100)
      : null
  const attendanceValidated = attendanceRecordedCount === 0 ? true : (attendanceRate || 0) >= 80

  // Fetch all open sessions for the student to browse/register
  const openSessionsRaw = await getPublishedSessions(now)

  const registeredSessionIds = new Set(
    enrollments
      .map((e) => e.sessionId)
      .filter((id): id is number => Boolean(id))
  )

  const availableSessions = openSessionsRaw
    .filter((s) => !registeredSessionIds.has(s.id))
    .map((s) => {
      const parsedMetadata = parseSessionMetadata(s.prerequisites)
      return {
        id: s.id,
        formationId: s.formationId,
        formationTitle: (s as any).formation?.title || '',
        formationSlug: (s as any).formation?.slug || '',
        formationCategory: (s as any).formation?.categorie || '',
        formationImageUrl: s.imageUrl || (s as any).formation?.imageUrl || null,
        startDate: s.startDate,
        endDate: s.endDate,
        location: s.location,
        format: s.format,
        status: s.status,
        availableSpots: Math.max(0, s.maxParticipants - ((s as any).enrollments?.length || 0)),
        maxParticipants: s.maxParticipants,
        durationLabel: parsedMetadata.metadata.durationLabel || null,
        registrationDeadline: parsedMetadata.metadata.registrationDeadline || null,
      }
    })

  const sessionsHistory = enrollmentsWithSession.map((item) => {
    const session = item.session!
    const notes = parseEnrollmentNotes(item.notes)
    const sessionMeta = parseSessionMetadata(session.prerequisites)
    return {
      enrollmentId: item.id,
      formationId: item.formationId,
      formationTitle: item.formation.title,
      formationCategory: item.formation.categorie,
      formationImageUrl: session.imageUrl || item.formation.imageUrl || null,
      formationDescription: item.formation.description,
      sessionId: session.id,
      sessionType: sessionMeta.metadata.sessionType || null,
      startDate: session.startDate,
      endDate: session.endDate,
      location: session.location,
      format: session.format,
      sessionStatus: session.status,
      sessionLifecycle: getSessionLifecycle(session.startDate, session.endDate, now),
      enrollmentStatus: item.status,
      waitlistPosition: waitlistPositionByEnrollmentId.get(item.id) || null,
      reservedSpot:
        item.sessionId && item.createdAt
          ? enrollmentsWithSession.filter(
              (row) =>
                row.sessionId === item.sessionId &&
                ['pending', 'accepted', 'confirmed', 'waitlist'].includes(row.status) &&
                row.createdAt <= item.createdAt
            ).length
          : null,
      questionsCount: getStudentQuestions(notes).length,
      hours: getSessionHours({
        startDate: session.startDate,
        endDate: session.endDate,
        prerequisites: session.prerequisites,
      }),
      // Champs paiement supprimés — cohérence refonte admin
    }
  })

  const completedSessionRows = sessionsHistory.filter(
    (item) =>
      new Date(item.endDate).getTime() < now.getTime() &&
      !['rejected', 'cancelled'].includes(item.enrollmentStatus)
  )
  const pendingSessionRows = sessionsHistory.filter(
    (item) =>
      new Date(item.endDate).getTime() >= now.getTime() &&
      !['rejected', 'cancelled'].includes(item.enrollmentStatus)
  )

  const hoursCompleted = completedSessionRows.reduce((sum, item) => sum + item.hours, 0)
  const hoursRemaining = pendingSessionRows.reduce((sum, item) => sum + item.hours, 0)

  const enrollmentMap = new Map(enrollmentsWithSession.map((item) => [item.id, item]))

  const attendance = attendanceRows.map((attendanceRow) => {
    const enrollment = enrollmentMap.get(attendanceRow.enrollmentId)
    const session = enrollment?.session
    return {
      id: attendanceRow.id,
      enrollmentId: attendanceRow.enrollmentId,
      sessionId: attendanceRow.sessionId,
      date: attendanceRow.date,
      status: attendanceRow.status,
      notes: attendanceRow.notes,
      recordedAt: attendanceRow.recordedAt,
      formationTitle: enrollment?.formation.title || 'Session',
      sessionLabel: session
        ? `${new Date(session.startDate).toLocaleDateString('fr-FR')} - ${session.location || 'En ligne'}`
        : 'Session non affectee',
    }
  })

  const results = evaluations.map((evaluation) => ({
    id: evaluation.id,
    enrollmentId: evaluation.enrollmentId,
    formationTitle: evaluation.formation.title,
    sessionLabel: evaluation.session
      ? `${new Date(evaluation.session.startDate).toLocaleDateString('fr-FR')} - ${evaluation.session.location || 'En ligne'}`
      : 'Sans session',
    overallRating: evaluation.overallRating,
    overallComment: evaluation.overallComment,
    contentRating: evaluation.contentRating,
    instructorRating: evaluation.instructorRating,
    materialRating: evaluation.materialRating,
    organizationRating: evaluation.organizationRating,
    facilityRating: evaluation.facilityRating,
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
    recommendations: evaluation.recommendations,
    submittedAt: evaluation.submittedAt,
    isAnonymous: evaluation.isAnonymous,
  }))

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

  const notifications = [
    // 1. Inscriptions à des formations
    ...enrollments.map((item) => ({
      id: `enrollment-${item.id}`,
      type: 'info',
      title: item.status === 'confirmed' || item.status === 'accepted' ? 'Inscription confirmée' : 'Inscription enregistrée',
      message: `Votre inscription à la formation "${item.formation.title}" a été enregistrée (Statut : ${item.status}).`,
      createdAt: new Date(item.createdAt),
    })),
    // 2. Nouvelles ressources pédagogiques
    ...resources.map((item) => ({
      id: `resource-${item.id}`,
      type: 'info',
      title: 'Nouveau document disponible',
      message: `Le document "${item.title}" (${item.category}) a été ajouté à votre espace de formation.`,
      createdAt: new Date(item.createdAt),
    })),
    // 3. Certificats délivrés
    ...issuedCertificates.map((item) => ({
      id: `cert-issue-core-${item.id}`,
      type: 'correction',
      title: 'Certificat disponible',
      message: `Votre certificat officiel de formation pour "${item.formation?.title || 'votre formation'}" a été délivré.`,
      createdAt: new Date(item.issuedAt),
    })),
    ...portalCertificates
      .filter((pc: any) => !issuedCertificates.some((ic) => ic.id === pc.id))
      .map((item: any) => ({
        id: `cert-issue-portal-${item.id}`,
        type: 'correction',
        title: 'Certificat disponible',
        message: `Votre certificat de formation pour "${item.formation?.title || 'votre formation'}" est disponible.`,
        createdAt: new Date(item.issuedAt),
      })),
    // 4. Notifications admin ciblées ou globales
    ...adminNotifications.map((item) => ({
      id: `admin-notification-${item.id}`,
      type: item.type,
      title: item.title,
      message: item.message,
      createdAt: item.createdAt,
    })),
    // 5. Rappels automatiques de début de session
    ...(currentEnrollment?.session &&
    new Date(currentEnrollment.session.startDate).getTime() > now.getTime()
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
    // 11. Réponses aux questions de l'étudiant
    ...questions
      .filter((item) => item.adminReply)
      .map((item) => ({
        id: `reply-${item.id}`,
        type: 'info',
        title: 'Réponse à votre question',
        message: item.adminReply as string,
        createdAt: item.adminReplyAt ? new Date(item.adminReplyAt) : new Date(item.createdAt),
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
      fileUrl: certificate.fileUrl,
    })),
    ...portalCertificates.map((certificate: any) => ({
      id: `portal-${certificate.id}`,
      code: String(certificate.code || certificate.id),
      type: certificate.type || 'portal',
      holderName: certificate.holderName || `${auth.student.firstName} ${auth.student.lastName}`.trim(),
      issuedAt: certificate.issuedAt,
      verified: certificate.verified ?? true,
      formation: certificate.formation || null,
      session: certificate.session || null,
      source: 'student_certificate',
      fileUrl: certificate.fileUrl,
      title: certificate.formation?.title || certificate.type,
    })),
  ]

  const currentEnrollmentProjectValidated = false
  const certificateEligibility = {
    projectValidated: false,
    attendanceTracked: attendanceRecordedCount > 0,
    attendanceRate,
    attendanceValidated,
    eligible: currentEnrollmentProjectValidated && attendanceValidated,
  }

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
      enrollments: enrollmentsRaw,
      currentSession: currentEnrollment
        ? {
            enrollmentId: currentEnrollment.id,
            formationTitle: currentEnrollment.formation.title,
            formationImageUrl: currentEnrollment.formation.imageUrl,
            formationDescription: currentEnrollment.formation.description,
            sessionId: currentEnrollment.session?.id,
            sessionType: currentEnrollment.session
              ? parseSessionMetadata(currentEnrollment.session.prerequisites).metadata.sessionType || null
              : null,
            startDate: currentEnrollment.session?.startDate,
            endDate: currentEnrollment.session?.endDate,
            location: currentEnrollment.session?.location,
            format: currentEnrollment.session?.format,
            status: currentEnrollment.status,
            sessionStatus: currentEnrollment.session?.status || null,
            lifecycle: currentEnrollment.session
              ? getSessionLifecycle(
                  currentEnrollment.session.startDate,
                  currentEnrollment.session.endDate,
                  now
                )
              : 'unknown',
            availableSpots: currentEnrollment.session
              ? Math.max(
                  0,
                  (currentEnrollment.session.maxParticipants || 0) -
                    (currentEnrollment.session.currentParticipants || 0)
                )
              : null,
            reservedSpot: currentReservedSpot,
            waitlistPosition: waitlistPositionByEnrollmentId.get(currentEnrollment.id) || null,
            maxParticipants: currentEnrollment.session?.maxParticipants || null,
            currentParticipants: currentEnrollment.session?.currentParticipants || null,
            // Champs paiement supprimés — cohérence avec la refonte admin (auto-activation sans validation paiement)
          }
        : null,
      sessionsHistory,
      availableSessions,
      resources,
      certificates,
      certificateEligibility,
      questions,
      notifications,
      news,
      attendance,
      results,
      assignments,
      progress: {
        hoursCompleted,
        hoursRemaining,
        exercisesCompleted: 0,
        exercisesInProgress: 0,
        projectsCompleted: 0,
        evaluationsCompleted: evaluations.length,
      },
      metrics: {
        totalSessions: sessionsHistory.length,
        completedSessions: completedSessionRows.length,
        pendingSessions: pendingSessionRows.length,
        successfulPayments: 0,
      },
    },
  })
  } catch (error: any) {
    console.error('[Dashboard] Erreur lors de la récupération des données:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement du tableau de bord. Veuillez réessayer.' },
      { status: 500 },
    )
  }
}
