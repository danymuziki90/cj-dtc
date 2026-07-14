import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { parseSessionMetadata } from '@/lib/sessions/metadata'
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

  const [enrollmentsRaw, submissions, portalCertificates, issuedCertificates, news, evaluations, userProfile] =
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
      prisma.user.findUnique({
        where: { email: studentEmail },
        select: {
          image: true,
        },
      }),
    ])

  const enrollments = enrollmentsRaw as any[]
  const formationIds = Array.from(new Set(enrollments.map((item) => item.formationId)))
  const sessionIds = Array.from(
    new Set(enrollments.map((item) => item.sessionId).filter((value): value is number => Boolean(value)))
  )

  // Fetch active assignments for the student's formations and sessions
  const assignmentsRaw = await prisma.assignment.findMany({
    where: {
      formationId: { in: formationIds },
      OR: [
        { sessionId: null },
        { sessionId: { in: sessionIds } }
      ],
      status: 'publie',
      publishDate: { lte: new Date() }
    },
    include: {
      formation: {
        select: {
          id: true,
          title: true,
          categorie: true,
        }
      },
      files: true,
      submissions: {
        where: {
          studentEmail: { equals: studentEmail, mode: 'insensitive' },
        },
        include: {
          files: true,
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
    orderBy: { deadline: 'asc' },
  })

  const mappedAssignments = assignmentsRaw.map((assignment) => ({
    ...assignment,
    allowedFileTypes: (assignment.allowedFileTypes || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    submissions: assignment.submissions.map((submission) => ({
      ...submission,
      reviewFeedback: submission.feedback,
      files: submission.files.map((file) => ({
        ...file,
        type: file.mimeType,
      })),
    })),
  }))

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
    .filter((item) => ['pending', 'accepted', 'confirmed', 'waitlist'].includes(item.status))
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

  const sessionsHistory = enrollmentsWithSession.map((item) => {
    const session = item.session!
    const notes = parseEnrollmentNotes(item.notes)
    const sessionMeta = parseSessionMetadata(session.prerequisites)
    return {
      enrollmentId: item.id,
      formationTitle: item.formation.title,
      formationCategory: item.formation.categorie,
      formationImageUrl: item.formation.imageUrl,
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

  const submissionFeedbackMap = enrollments.reduce<
    Record<string, { feedback?: string | null; status?: string | null; updatedAt?: string }>
  >((acc, enrollment) => {
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
  }, {})

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

  const assignmentSubmissions = mappedAssignments.flatMap((assign) => 
    assign.submissions.map((sub) => ({
      ...sub,
      assignmentTitle: assign.title,
    }))
  )

  const notifications = [
    // 1. Inscriptions à des formations
    ...enrollments.map((item) => ({
      id: `enrollment-${item.id}`,
      type: 'info',
      title: item.status === 'confirmed' || item.status === 'accepted' ? 'Inscription confirmée' : 'Inscription enregistrée',
      message: `Votre inscription à la formation "${item.formation.title}" a été enregistrée (Statut : ${item.status}).`,
      createdAt: new Date(item.createdAt),
    })),
    // 2. Nouveaux devoirs publiés
    ...mappedAssignments.map((item) => ({
      id: `assignment-pub-${item.id}`,
      type: 'reminder',
      title: 'Nouveau travail publié',
      message: `Le devoir "${item.title}" a été mis en ligne pour la formation "${item.formation.title}". Rendu limite : ${new Date(item.deadline).toLocaleDateString('fr-FR')}.`,
      createdAt: new Date(item.publishDate || item.createdAt),
    })),
    // 3. Soumission initiale de devoirs
    ...assignmentSubmissions.map((item) => ({
      id: `assignment-sub-${item.id}`,
      type: 'info',
      title: 'Travail rendu',
      message: `Vous avez déposé votre travail pour le devoir "${item.assignmentTitle}".`,
      createdAt: new Date(item.submittedAt),
    })),
    // 4. Corrections de devoirs officiels
    ...assignmentSubmissions
      .filter((item) => item.status === 'graded' || item.status === 'returned')
      .map((item) => ({
        id: `assignment-corr-${item.id}`,
        type: 'correction',
        title: 'Note ou retour publié',
        message: `Votre travail pour "${item.assignmentTitle}" a été corrigé par l'administration (Statut: ${item.status}${item.grade !== null && item.grade !== undefined ? ` | Note: ${item.grade}/20` : ''}${item.reviewFeedback ? ` | Retour: ${item.reviewFeedback}` : ''}).`,
        createdAt: item.gradedAt ? new Date(item.gradedAt) : new Date(item.submittedAt),
      })),
    // 5. Nouvelles ressources pédagogiques
    ...resources.map((item) => ({
      id: `resource-${item.id}`,
      type: 'info',
      title: 'Nouveau document disponible',
      message: `Le document "${item.title}" (${item.category}) a été ajouté à votre espace de formation.`,
      createdAt: new Date(item.createdAt),
    })),
    // 6. Certificats délivrés
    ...issuedCertificates.map((item) => ({
      id: `cert-issue-core-${item.id}`,
      type: 'correction',
      title: 'Certificat disponible',
      message: `Votre certificat officiel de formation pour "${item.formation?.title || 'votre formation'}" a été délivré.`,
      createdAt: new Date(item.issuedAt),
    })),
    ...portalCertificates.map((item) => ({
      id: `cert-issue-portal-${item.id}`,
      type: 'correction',
      title: 'Certificat disponible',
      message: `Votre certificat de formation pour "${item.title || 'votre formation'}" est disponible.`,
      createdAt: new Date(item.createdAt),
    })),
    // 7. Actualités générales
    ...news.map((item) => ({
      id: `news-${item.id}`,
      type: 'info',
      title: item.title,
      message: item.content,
      createdAt: item.createdAt,
    })),
    // 8. Notifications importantes ciblées ou globales
    ...adminNotifications.map((item) => ({
      id: `admin-notification-${item.id}`,
      type: item.type,
      title: item.title,
      message: item.message,
      createdAt: item.createdAt,
    })),
    // 9. Dépôt de fichiers généraux
    ...mappedSubmissions.map((item) => ({
      id: `submission-dep-${item.id}`,
      type: 'info',
      title: 'Fichier déposé',
      message: `Vous avez mis en ligne le document "${item.title}".`,
      createdAt: new Date(item.submittedAt),
    })),
    // 10. Corrections de fichiers généraux
    ...mappedSubmissions
      .filter((item) => item.status !== 'pending' && item.reviewStatus !== 'pending')
      .map((item) => ({
        id: `submission-corr-${item.id}`,
        type: 'correction',
        title: 'Fichier vérifié',
        message: `Votre document "${item.title}" a été vérifié par l'administration (Statut: ${item.status}${item.reviewFeedback ? ` | Retour: ${item.reviewFeedback}` : ''}).`,
        createdAt: item.reviewedAt ? new Date(item.reviewedAt) : new Date(item.updatedAt),
      })),
    // 11. Rappels automatiques de début de session
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
    // 12. Réponses aux questions de l'étudiant
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

  const currentEnrollmentProjectValidated = mappedSubmissions.some(
    (item) => item.status === 'approved' || item.reviewStatus === 'approved'
  )
  const certificateEligibility = {
    projectValidated: currentEnrollmentProjectValidated,
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
      photoUrl: userProfile?.image || null,
    },
    dashboard: {
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
      resources,
      submissions: mappedSubmissions,
      assignments: mappedAssignments,
      certificates,
      certificateEligibility,
      questions,
      notifications,
      news,
      attendance,
      results,
      progress: {
        hoursCompleted,
        hoursRemaining,
        exercisesCompleted: mappedSubmissions.filter((item) => item.status === 'approved').length,
        exercisesInProgress: mappedSubmissions.filter((item) => item.status === 'pending').length,
        projectsCompleted: mappedSubmissions.filter((item) => item.status === 'approved').length,
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
}
