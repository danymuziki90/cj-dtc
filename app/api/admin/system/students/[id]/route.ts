import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { hashPassword } from '@/lib/auth-portal/password'
import { resolveAppBaseUrl, sendStudentPortalAccessEmail, withEmailTimeout } from '@/lib/email'
import { getStudentQuestions, parseEnrollmentNotes } from '@/lib/student/enrollment-notes'

const updateStudentSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  username: z.string().min(3),
  sessionId: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']).optional(),
  resetPassword: z.boolean().optional(),
})

function splitName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, ' ')
  const [firstName, ...rest] = cleaned.split(' ')
  return {
    firstName: firstName || 'Student',
    lastName: rest.join(' ') || 'Account',
  }
}

function generateResetPassword() {
  return `std-reset-${randomBytes(4).toString('hex')}`
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const student = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      status: true,
      role: true,
      phone: true,
      address: true,
      city: true,
      country: true,
      studentNumber: true,
      createdAt: true,
      updatedAt: true,
      adminSession: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
        },
      },
      portalSubmissions: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          fileUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          session: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
      portalCertificates: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          fileUrl: true,
          createdAt: true,
        },
      },
    },
  })

  if (!student) {
    return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      email: {
        equals: student.email,
        mode: 'insensitive',
      },
    },
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
          status: true,
        },
      },
      evaluation: {
        select: {
          id: true,
          overallRating: true,
          overallComment: true,
          submittedAt: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          reference: true,
          transactionId: true,
          paidAt: true,
          createdAt: true,
        },
      },
      attendances: {
        orderBy: { date: 'desc' },
        select: {
          id: true,
          date: true,
          status: true,
          notes: true,
          recordedAt: true,
          sessionId: true,
        },
      },
      certificate: {
        select: {
          id: true,
          code: true,
          type: true,
          issuedAt: true,
          verified: true,
        },
      },
    },
  })

  const enrollmentIds = enrollments.map((item) => item.id)
  const sessionIds = Array.from(new Set(enrollments.map((item) => item.sessionId).filter((value): value is number => Boolean(value))))

  const [issuedCertificates, notifications, auditLogs] = await Promise.all([
    prisma.certificate.findMany({
      where: {
        enrollment: {
          is: {
            email: {
              equals: student.email,
              mode: 'insensitive',
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
      include: {
        formation: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.adminNotification.findMany({
      where: {
        OR: [
          { target: 'all' },
          { target: 'student', studentEmail: student.email },
          ...(sessionIds.length ? [{ target: 'session', sessionId: { in: sessionIds } }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.adminAuditLog.findMany({
      where: {
        OR: [
          { targetType: 'student', targetId: student.id },
          { targetType: 'student', targetLabel: `${student.firstName} ${student.lastName}`.trim() },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  const payments = enrollments.flatMap((enrollment) =>
    enrollment.payments.map((payment) => ({
      ...payment,
      enrollmentId: enrollment.id,
      formationTitle: enrollment.formation.title,
      sessionLabel: enrollment.session
        ? `${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')} - ${enrollment.session.location || 'En ligne'}`
        : 'Sans session',
    }))
  )

  const attendance = enrollments.flatMap((enrollment) =>
    enrollment.attendances.map((entry) => ({
      ...entry,
      enrollmentId: enrollment.id,
      formationTitle: enrollment.formation.title,
      sessionLabel: enrollment.session
        ? `${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')} - ${enrollment.session.location || 'En ligne'}`
        : 'Sans session',
    }))
  )

  const notes = enrollments.map((enrollment) => {
    const parsedNotes = parseEnrollmentNotes(enrollment.notes)
    const adminComment =
      typeof parsedNotes.adminComment === 'string'
        ? parsedNotes.adminComment
        : typeof parsedNotes.legacyNotesText === 'string'
        ? parsedNotes.legacyNotesText
        : null

    return {
      enrollmentId: enrollment.id,
      formationTitle: enrollment.formation.title,
      sessionLabel: enrollment.session
        ? `${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')} - ${enrollment.session.location || 'En ligne'}`
        : 'Sans session',
      adminComment,
      questions: getStudentQuestions(parsedNotes),
    }
  })

  const results = enrollments
    .filter((enrollment) => enrollment.evaluation)
    .map((enrollment) => ({
      id: enrollment.evaluation!.id,
      enrollmentId: enrollment.id,
      formationTitle: enrollment.formation.title,
      overallRating: enrollment.evaluation!.overallRating,
      overallComment: enrollment.evaluation!.overallComment,
      submittedAt: enrollment.evaluation!.submittedAt,
      sessionLabel: enrollment.session
        ? `${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')} - ${enrollment.session.location || 'En ligne'}`
        : 'Sans session',
    }))

  return NextResponse.json({
    student: {
      ...student,
      fullName: `${student.firstName} ${student.lastName}`.trim(),
    },
    overview: {
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter((item) => ['pending', 'accepted', 'confirmed'].includes(item.status)).length,
      settledEnrollments: enrollments.filter((item) => item.paymentStatus === 'paid').length,
      pendingPayments: payments.filter((item) => item.status === 'pending').length,
      submissionsCount: student.portalSubmissions.length,
      certificatesCount: student.portalCertificates.length + issuedCertificates.length,
      notificationsCount: notifications.length,
      attendanceCount: attendance.length,
    },
    enrollments: enrollments.map((enrollment) => ({
      id: enrollment.id,
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      paidAmount: enrollment.paidAmount,
      totalAmount: enrollment.totalAmount,
      createdAt: enrollment.createdAt,
      startDate: enrollment.startDate,
      formation: enrollment.formation,
      session: enrollment.session,
      evaluation: enrollment.evaluation,
      certificate: enrollment.certificate,
      reminderCount: enrollment.reminderCount,
      lastReminderSent: enrollment.lastReminderSent,
    })),
    payments,
    attendance,
    submissions: student.portalSubmissions,
    results,
    notes,
    certificates: [
      ...student.portalCertificates.map((certificate) => ({
        id: certificate.id,
        title: certificate.title,
        type: 'portal',
        code: certificate.id,
        issuedAt: certificate.createdAt,
        verified: true,
        fileUrl: certificate.fileUrl,
        formationTitle: null,
      })),
      ...issuedCertificates.map((certificate) => ({
        id: String(certificate.id),
        title: certificate.formation?.title || certificate.type,
        type: certificate.type,
        code: certificate.code,
        issuedAt: certificate.issuedAt,
        verified: certificate.verified,
        fileUrl: null,
        formationTitle: certificate.formation?.title || null,
      })),
    ],
    notifications,
    auditLogs,
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const parsed = updateStudentSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const existingStudent = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      status: true,
      adminSessionId: true,
    },
  })

  if (!existingStudent) {
    return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
  }

  const assignedSession = parsed.data.sessionId
    ? await prisma.adminTrainingSession.findUnique({
        where: { id: parsed.data.sessionId },
        select: { id: true, title: true },
      })
    : null

  if (parsed.data.sessionId && !assignedSession) {
    return NextResponse.json({ error: 'Selected session was not found.' }, { status: 400 })
  }

  const { firstName, lastName } = splitName(parsed.data.name)
  const updateData: Record<string, unknown> = {
    firstName,
    lastName,
    email: parsed.data.email.trim().toLowerCase(),
    username: parsed.data.username,
    adminSessionId: assignedSession?.id || null,
  }

  if (parsed.data.status) {
    updateData.status = parsed.data.status
  }

  let generatedPassword: string | null = null
  if (parsed.data.resetPassword) {
    generatedPassword = generateResetPassword()
    updateData.password = await hashPassword(generatedPassword)
  }

  let student: {
    id: string
    firstName: string
    lastName: string
    email: string
    username: string | null
    status: string
    adminSessionId: string | null
    updatedAt: Date
  }

  try {
    student = await prisma.student.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        status: true,
        adminSessionId: true,
        updatedAt: true,
      },
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email or username already exists.' }, { status: 409 })
    }

    throw error
  }

  let credentialsEmailSent = false
  let credentialsEmailError: string | null = null

  if (generatedPassword && student.username) {
    try {
      await withEmailTimeout(
        sendStudentPortalAccessEmail({
          to: student.email,
          fullName: `${student.firstName} ${student.lastName}`.trim(),
          username: student.username,
          password: generatedPassword,
          appBaseUrl: resolveAppBaseUrl(request.url),
          sessionTitle: assignedSession?.title || null,
        })
      )
      credentialsEmailSent = true
    } catch (error) {
      credentialsEmailError = 'Unable to send credentials email automatically.'
      console.error('Student reset credentials email failed:', error)
    }
  }

  const fullName = `${student.firstName} ${student.lastName}`.trim()
  const metadata = {
    previousEmail: existingStudent.email,
    nextEmail: student.email,
    previousUsername: existingStudent.username,
    nextUsername: student.username,
    previousStatus: existingStudent.status,
    nextStatus: student.status,
    previousAdminSessionId: existingStudent.adminSessionId,
    nextAdminSessionId: student.adminSessionId,
    credentialsEmailSent,
  }

  if (parsed.data.resetPassword) {
    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'student.password_reset',
      targetType: 'student',
      targetId: student.id,
      targetLabel: fullName,
      summary: `Mot de passe reinitialise pour ${student.email}.`,
      metadata,
    })
  }

  if (parsed.data.status && parsed.data.status !== existingStudent.status) {
    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'student.status_change',
      targetType: 'student',
      targetId: student.id,
      targetLabel: fullName,
      summary: `Statut etudiant modifie de ${existingStudent.status} vers ${student.status}.`,
      metadata,
    })
  }

  if (
    student.email !== existingStudent.email ||
    student.username !== existingStudent.username ||
    student.adminSessionId !== existingStudent.adminSessionId ||
    student.firstName !== existingStudent.firstName ||
    student.lastName !== existingStudent.lastName
  ) {
    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'student.update',
      targetType: 'student',
      targetId: student.id,
      targetLabel: fullName,
      summary: `Profil etudiant mis a jour pour ${student.email}.`,
      metadata,
    })
  }

  return NextResponse.json({
    student,
    generatedPassword,
    notifications: {
      credentialsEmailSent,
      credentialsEmailError,
    },
  })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const student = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      status: true,
    },
  })

  if (!student) {
    return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
  }

  await prisma.student.delete({ where: { id } })

  await writeAdminAuditLog({
    request,
    adminId: auth.admin.id,
    adminUsername: auth.admin.username,
    action: 'student.delete',
    targetType: 'student',
    targetId: student.id,
    targetLabel: `${student.firstName} ${student.lastName}`.trim(),
    summary: `Compte etudiant supprime pour ${student.email}.`,
    metadata: {
      email: student.email,
      username: student.username,
      status: student.status,
    },
  })

  return NextResponse.json({ success: true })
}
