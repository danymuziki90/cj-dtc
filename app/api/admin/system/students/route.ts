import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { hashPassword } from '@/lib/auth-portal/password'
import { resolveAppBaseUrl, sendStudentPortalAccessEmail, withEmailTimeout } from '@/lib/email'
import { syncEnrollmentPaymentStatus, toCanonicalPaymentStatus } from '@/lib/payments/status'

const createStudentSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  sessionId: z.string().optional().nullable(),
})

const STUDENT_PAYMENT_LOCK_MESSAGE =
  'Le compte etudiant ne peut etre cree qu\'apres validation complete du paiement de la session souscrite.'

function splitName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, ' ')
  const [firstName, ...rest] = cleaned.split(' ')
  return {
    firstName: firstName || 'Student',
    lastName: rest.join(' ') || 'Account',
  }
}

function generatePassword() {
  return `std-${randomBytes(4).toString('hex')}`
}

function buildCandidateUsername(name: string) {
  const candidate = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.')

  return candidate || `student.${randomBytes(2).toString('hex')}`
}

async function ensureUniqueUsername(baseUsername: string) {
  let candidate = baseUsername
  let suffix = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.student.findUnique({ where: { username: candidate } })
    if (!existing) return candidate
    candidate = `${baseUsername}${suffix}`
    suffix += 1
  }
}

function generateStudentNumber() {
  const time = Date.now().toString().slice(-8)
  const random = randomBytes(2).toString('hex')
  return `STU${time}${random}`
}

function isEnrollmentPaymentSettled(enrollment: {
  paymentStatus: string
  paidAmount: number
  totalAmount: number
}) {
  if (enrollment.totalAmount <= 0) return true
  if (enrollment.paidAmount >= enrollment.totalAmount) return true
  return toCanonicalPaymentStatus(enrollment.paymentStatus) === 'success'
}

type StudentCreationEnrollmentCandidate = {
  id: number
  status: string
  paymentStatus: string
  paidAmount: number
  totalAmount: number
  createdAt: Date
  formation: {
    title: string
  }
  session: {
    id: number
    startDate: Date
    location: string | null
  } | null
}

async function resolveEligibleEnrollmentForStudentCreation(email: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
      status: {
        notIn: ['rejected', 'cancelled'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      paidAmount: true,
      totalAmount: true,
      createdAt: true,
      formation: {
        select: {
          title: true,
        },
      },
      session: {
        select: {
          id: true,
          startDate: true,
          location: true,
        },
      },
    },
  })

  if (enrollments.length === 0) {
    return {
      latestEnrollment: null,
      settledEnrollment: null,
    }
  }

  const paymentSnapshots = await Promise.all(
    enrollments.map(async (enrollment) => {
      const syncedPayment = enrollment.totalAmount > 0 ? await syncEnrollmentPaymentStatus(enrollment.id) : null

      return {
        ...enrollment,
        paymentStatus: syncedPayment?.paymentStatus || enrollment.paymentStatus,
        paidAmount: syncedPayment?.paidAmount ?? enrollment.paidAmount,
      }
    }),
  )

  return {
    latestEnrollment: paymentSnapshots[0],
    settledEnrollment: paymentSnapshots.find((enrollment) => isEnrollmentPaymentSettled(enrollment)) || null,
  }
}

function buildStudentWhere(params: { search: string; status: string; sessionId: string }) {
  const where: any = {}

  if (params.status && ['PENDING', 'ACTIVE', 'SUSPENDED'].includes(params.status)) {
    where.status = params.status
  }

  if (params.sessionId) {
    where.adminSessionId = params.sessionId
  }

  if (params.search) {
    where.OR = [
      { firstName: { contains: params.search, mode: 'insensitive' } },
      { lastName: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
      { username: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  return where
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const search = request.nextUrl.searchParams.get('search')?.trim() || ''
  const status = request.nextUrl.searchParams.get('status')?.trim() || ''
  const sessionId = request.nextUrl.searchParams.get('sessionId')?.trim() || ''
  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || 1))
  const pageSize = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get('pageSize') || 10)))
  const skip = (page - 1) * pageSize
  const where = buildStudentWhere({ search, status, sessionId })

  const [totalItems, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        status: true,
        createdAt: true,
        adminSession: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    }),
  ])

  const emails = Array.from(new Set(students.map((student) => student.email)))
  const latestEnrollments = emails.length
    ? await prisma.enrollment.findMany({
        where: {
          email: {
            in: emails,
          },
        },
        include: {
          session: {
            select: {
              id: true,
              startDate: true,
              location: true,
            },
          },
          formation: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    : []

  const latestByEmail = latestEnrollments.reduce<Record<string, (typeof latestEnrollments)[number]>>(
    (acc, enrollment) => {
      if (!acc[enrollment.email]) acc[enrollment.email] = enrollment
      return acc
    },
    {}
  )

  const enrichedStudents = students.map((student) => {
    const enrollment = latestByEmail[student.email]
    return {
      ...student,
      latestEnrollment: enrollment
        ? {
            id: enrollment.id,
            status: enrollment.status,
            paymentStatus: enrollment.paymentStatus,
            paidAmount: enrollment.paidAmount,
            totalAmount: enrollment.totalAmount,
            formationTitle: enrollment.formation.title,
            session: enrollment.session,
          }
        : null,
    }
  })

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  return NextResponse.json({
    students: enrichedStudents,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  try {
    const parsed = createStudentSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, email, sessionId } = parsed.data
    const { firstName, lastName } = splitName(name)
    const normalizedEmail = email.trim().toLowerCase()

    const existingStudent = await prisma.student.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existingStudent) {
      return NextResponse.json({ error: 'A student account already exists for this email.' }, { status: 409 })
    }

    const assignedSession = sessionId
      ? await prisma.adminTrainingSession.findUnique({
          where: { id: sessionId },
          select: { id: true, title: true },
        })
      : null

    if (sessionId && !assignedSession) {
      return NextResponse.json({ error: 'Selected session was not found.' }, { status: 400 })
    }

    const { latestEnrollment, settledEnrollment } = await resolveEligibleEnrollmentForStudentCreation(normalizedEmail)

    if (!latestEnrollment) {
      await writeAdminAuditLog({
        request,
        adminId: auth.admin.id,
        adminUsername: auth.admin.username,
        action: 'student.create.blocked',
        targetType: 'student',
        targetLabel: normalizedEmail,
        summary: `Creation de compte etudiant bloquee pour ${normalizedEmail} : aucune inscription payee n'a ete trouvee.`,
        status: 'blocked',
        metadata: {
          email: normalizedEmail,
          adminSessionId: assignedSession?.id || null,
          reason: 'missing_paid_enrollment',
        },
      })

      return NextResponse.json({ error: STUDENT_PAYMENT_LOCK_MESSAGE }, { status: 409 })
    }

    if (!settledEnrollment) {
      const paymentSnapshot = {
        paymentStatus: latestEnrollment.paymentStatus,
        paidAmount: latestEnrollment.paidAmount,
        totalAmount: latestEnrollment.totalAmount,
      }

      await writeAdminAuditLog({
        request,
        adminId: auth.admin.id,
        adminUsername: auth.admin.username,
        action: 'student.create.blocked',
        targetType: 'student',
        targetLabel: normalizedEmail,
        summary: `Creation de compte etudiant bloquee pour ${normalizedEmail} : paiement non solde.`,
        status: 'blocked',
        metadata: {
          email: normalizedEmail,
          adminSessionId: assignedSession?.id || null,
          enrollmentId: latestEnrollment.id,
          enrollmentStatus: latestEnrollment.status,
          paymentStatus: paymentSnapshot.paymentStatus,
          paidAmount: paymentSnapshot.paidAmount,
          totalAmount: paymentSnapshot.totalAmount,
          formationTitle: latestEnrollment.formation.title,
          sessionStartDate: latestEnrollment.session?.startDate?.toISOString() || null,
          sessionLocation: latestEnrollment.session?.location || null,
        },
      })

      return NextResponse.json({ error: STUDENT_PAYMENT_LOCK_MESSAGE }, { status: 409 })
    }

    const plainPassword = generatePassword()
    const hashedPassword = await hashPassword(plainPassword)
    const baseUsername = buildCandidateUsername(name)
    const username = await ensureUniqueUsername(baseUsername)

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        username,
        password: hashedPassword,
        studentNumber: generateStudentNumber(),
        status: 'ACTIVE',
        role: 'STUDENT',
        adminSessionId: assignedSession?.id || null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        status: true,
        createdAt: true,
        adminSessionId: true,
      },
    })

    let credentialsEmailSent = false
    let credentialsEmailError: string | null = null

    try {
      await withEmailTimeout(
        sendStudentPortalAccessEmail({
          to: student.email,
          fullName: `${student.firstName} ${student.lastName}`.trim(),
          username,
          password: plainPassword,
          appBaseUrl: resolveAppBaseUrl(request.url),
          sessionTitle: assignedSession?.title || null,
        })
      )
      credentialsEmailSent = true
    } catch (error) {
      credentialsEmailError = 'Unable to send credentials email automatically.'
      console.error('Student credentials email failed:', error)
    }

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'student.create',
      targetType: 'student',
      targetId: student.id,
      targetLabel: `${student.firstName} ${student.lastName}`.trim(),
      summary: `Compte etudiant cree pour ${student.email}.`,
      metadata: {
        email: student.email,
        username: student.username,
        adminSessionId: student.adminSessionId,
        credentialsEmailSent,
      },
    })

    return NextResponse.json(
      {
        student,
        credentials: {
          username,
          password: plainPassword,
        },
        notifications: {
          credentialsEmailSent,
          credentialsEmailError,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create student failed:', error)
    return NextResponse.json(
      {
        error: 'Unable to create student.',
        details: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
