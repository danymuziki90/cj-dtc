import { randomBytes } from 'crypto'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { hashPassword } from '@/lib/auth-portal/password'
import { resolveAppBaseUrl, sendStudentPortalAccessEmail, withEmailTimeout } from '@/lib/email'
import { syncEnrollmentPaymentStatus, toCanonicalPaymentStatus } from '@/lib/payments/status'

export type EnrollmentAccountState =
  | 'awaiting_payment'
  | 'pending_creation'
  | 'active'
  | 'created'
  | 'suspended'
  | 'waitlist'
  | 'ineligible'

type StudentSnapshot = {
  id?: string | null
  status?: string | null
  username?: string | null
} | null

type AccountStateDescriptor = {
  state: EnrollmentAccountState
  label: string
  tone: 'warning' | 'success' | 'primary' | 'neutral' | 'danger'
  canCreate: boolean
  canLogin: boolean
}

type AccountStateInput = {
  enrollmentStatus: string
  paymentStatus: string
  paidAmount: number
  totalAmount: number
  student?: StudentSnapshot
}

type ProvisionParams = {
  enrollmentId: number
  appBaseUrl?: string
  notifyStudent?: boolean
  source?: string
  request?: NextRequest
}

type ProvisionResult = {
  eligible: boolean
  reason: 'not_found' | 'waitlist' | 'payment_pending' | 'ineligible' | null
  accountCreated: boolean
  accountActivated: boolean
  credentials: { username: string; password: string } | null
  student: {
    id: string
    email: string
    username: string | null
    status: string
  } | null
  enrollment: {
    id: number
    status: string
    paymentStatus: string
    paidAmount: number
    totalAmount: number
  } | null
  accountStatus: AccountStateDescriptor | null
  notifications: {
    credentialsEmailSent: boolean
    credentialsEmailError: string | null
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function buildBaseUsername(firstName: string, lastName: string, email: string) {
  const fromName = `${firstName}.${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '')
    .replace(/\.+/g, '.')
    .replace(/^\./, '')
    .replace(/\.$/, '')

  if (fromName.length >= 3) return fromName

  const localPart = email.split('@')[0] || `student${Date.now()}`
  return localPart.toLowerCase().replace(/[^a-z0-9.]/g, '') || `student${Date.now()}`
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

function generateSecurePassword() {
  return `Std#${randomBytes(8).toString('hex')}`
}

function generateStudentNumber() {
  return `STU${Date.now().toString().slice(-8)}${randomBytes(2).toString('hex').toUpperCase()}`
}

export function isEnrollmentPaymentSettled(input: {
  paymentStatus: string
  paidAmount: number
  totalAmount: number
}) {
  if (input.totalAmount <= 0) return true
  if (input.paidAmount >= input.totalAmount) return true
  return toCanonicalPaymentStatus(input.paymentStatus) === 'success'
}

export function deriveEnrollmentAccountState(input: AccountStateInput): AccountStateDescriptor {
  const normalizedEnrollmentStatus = input.enrollmentStatus.toLowerCase()
  const student = input.student || null

  if (normalizedEnrollmentStatus === 'rejected' || normalizedEnrollmentStatus === 'cancelled') {
    return {
      state: 'ineligible',
      label: 'Non eligible',
      tone: 'neutral',
      canCreate: false,
      canLogin: false,
    }
  }

  if (normalizedEnrollmentStatus === 'waitlist') {
    return {
      state: 'waitlist',
      label: "Liste d'attente",
      tone: 'warning',
      canCreate: false,
      canLogin: false,
    }
  }

  if (!isEnrollmentPaymentSettled(input)) {
    return {
      state: 'awaiting_payment',
      label: 'En attente paiement',
      tone: 'warning',
      canCreate: false,
      canLogin: false,
    }
  }

  if (!student) {
    return {
      state: 'pending_creation',
      label: 'Compte a creer',
      tone: 'primary',
      canCreate: true,
      canLogin: false,
    }
  }

  if (student.status === 'ACTIVE') {
    return {
      state: 'active',
      label: 'Compte actif',
      tone: 'success',
      canCreate: false,
      canLogin: true,
    }
  }

  if (student.status === 'SUSPENDED') {
    return {
      state: 'suspended',
      label: 'Compte suspendu',
      tone: 'danger',
      canCreate: false,
      canLogin: false,
    }
  }

  return {
    state: 'created',
    label: 'Compte cree',
    tone: 'primary',
    canCreate: false,
    canLogin: false,
  }
}

export async function provisionStudentAccountFromEnrollment({
  enrollmentId,
  appBaseUrl,
  notifyStudent = true,
  source = 'system',
  request,
}: ProvisionParams): Promise<ProvisionResult> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
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
          location: true,
        },
      },
    },
  })

  if (!enrollment) {
    return {
      eligible: false,
      reason: 'not_found',
      accountCreated: false,
      accountActivated: false,
      credentials: null,
      student: null,
      enrollment: null,
      accountStatus: null,
      notifications: {
        credentialsEmailSent: false,
        credentialsEmailError: null,
      },
    }
  }

  const syncedPayment =
    enrollment.totalAmount > 0 ? await syncEnrollmentPaymentStatus(enrollment.id) : null
  const paymentStatus = syncedPayment?.paymentStatus || enrollment.paymentStatus
  const paidAmount = syncedPayment?.paidAmount ?? enrollment.paidAmount

  let currentEnrollment = {
    ...enrollment,
    paymentStatus,
    paidAmount,
  }

  const normalizedEmail = normalizeEmail(enrollment.email)
  const existingStudent = await prisma.student.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      username: true,
      status: true,
      firstName: true,
      lastName: true,
      password: true,
      phone: true,
      address: true,
    },
  })

  const initialAccountStatus = deriveEnrollmentAccountState({
    enrollmentStatus: currentEnrollment.status,
    paymentStatus: currentEnrollment.paymentStatus,
    paidAmount: currentEnrollment.paidAmount,
    totalAmount: currentEnrollment.totalAmount,
    student: existingStudent,
  })

  if (initialAccountStatus.state === 'waitlist') {
    return {
      eligible: false,
      reason: 'waitlist',
      accountCreated: false,
      accountActivated: false,
      credentials: null,
      student: existingStudent
        ? {
            id: existingStudent.id,
            email: existingStudent.email,
            username: existingStudent.username,
            status: existingStudent.status,
          }
        : null,
      enrollment: {
        id: currentEnrollment.id,
        status: currentEnrollment.status,
        paymentStatus: currentEnrollment.paymentStatus,
        paidAmount: currentEnrollment.paidAmount,
        totalAmount: currentEnrollment.totalAmount,
      },
      accountStatus: initialAccountStatus,
      notifications: {
        credentialsEmailSent: false,
        credentialsEmailError: null,
      },
    }
  }

  if (initialAccountStatus.state === 'awaiting_payment') {
    return {
      eligible: false,
      reason: 'payment_pending',
      accountCreated: false,
      accountActivated: false,
      credentials: null,
      student: existingStudent
        ? {
            id: existingStudent.id,
            email: existingStudent.email,
            username: existingStudent.username,
            status: existingStudent.status,
          }
        : null,
      enrollment: {
        id: currentEnrollment.id,
        status: currentEnrollment.status,
        paymentStatus: currentEnrollment.paymentStatus,
        paidAmount: currentEnrollment.paidAmount,
        totalAmount: currentEnrollment.totalAmount,
      },
      accountStatus: initialAccountStatus,
      notifications: {
        credentialsEmailSent: false,
        credentialsEmailError: null,
      },
    }
  }

  if (initialAccountStatus.state === 'ineligible') {
    return {
      eligible: false,
      reason: 'ineligible',
      accountCreated: false,
      accountActivated: false,
      credentials: null,
      student: existingStudent
        ? {
            id: existingStudent.id,
            email: existingStudent.email,
            username: existingStudent.username,
            status: existingStudent.status,
          }
        : null,
      enrollment: {
        id: currentEnrollment.id,
        status: currentEnrollment.status,
        paymentStatus: currentEnrollment.paymentStatus,
        paidAmount: currentEnrollment.paidAmount,
        totalAmount: currentEnrollment.totalAmount,
      },
      accountStatus: initialAccountStatus,
      notifications: {
        credentialsEmailSent: false,
        credentialsEmailError: null,
      },
    }
  }

  if (currentEnrollment.status === 'pending' || currentEnrollment.status === 'accepted') {
    currentEnrollment = await prisma.enrollment.update({
      where: { id: currentEnrollment.id },
      data: {
        status: 'confirmed',
      },
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
            location: true,
          },
        },
      },
    })
  }

  let student = existingStudent
  let plainPassword: string | null = null
  let accountCreated = false
  let accountActivated = false

  const shouldIssueFreshCredentials = !existingStudent || existingStudent.status !== 'ACTIVE' || !existingStudent.username

  if (!existingStudent) {
    plainPassword = generateSecurePassword()
    const hashedPassword = await hashPassword(plainPassword)
    const username = await ensureUniqueUsername(
      buildBaseUsername(currentEnrollment.firstName, currentEnrollment.lastName, normalizedEmail)
    )

    student = await prisma.student.create({
      data: {
        firstName: currentEnrollment.firstName,
        lastName: currentEnrollment.lastName,
        email: normalizedEmail,
        username,
        password: hashedPassword,
        phone: currentEnrollment.phone || null,
        address: currentEnrollment.address || null,
        studentNumber: generateStudentNumber(),
        status: 'ACTIVE',
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
        firstName: true,
        lastName: true,
        password: true,
        phone: true,
        address: true,
      },
    })

    accountCreated = true
    accountActivated = true
  } else {
    const updates: Record<string, unknown> = {}

    if (!existingStudent.username) {
      updates.username = await ensureUniqueUsername(
        buildBaseUsername(currentEnrollment.firstName, currentEnrollment.lastName, normalizedEmail)
      )
    }

    if (existingStudent.status !== 'ACTIVE') {
      updates.status = 'ACTIVE'
      accountActivated = true
    }

    if (shouldIssueFreshCredentials) {
      plainPassword = generateSecurePassword()
      updates.password = await hashPassword(plainPassword)
    }

    if (Object.keys(updates).length > 0) {
      student = await prisma.student.update({
        where: { id: existingStudent.id },
        data: updates,
        select: {
          id: true,
          email: true,
          username: true,
          status: true,
          firstName: true,
          lastName: true,
          password: true,
          phone: true,
          address: true,
        },
      })
    }
  }

  let credentialsEmailSent = false
  let credentialsEmailError: string | null = null

  if (notifyStudent && student?.username && (accountCreated || accountActivated || Boolean(plainPassword))) {
    try {
      await withEmailTimeout(
        sendStudentPortalAccessEmail({
          to: normalizedEmail,
          fullName: `${currentEnrollment.firstName} ${currentEnrollment.lastName}`.trim(),
          username: student.username,
          password: plainPassword || undefined,
          appBaseUrl: resolveAppBaseUrl(appBaseUrl || request?.url),
          sessionTitle: currentEnrollment.formation.title,
        })
      )
      credentialsEmailSent = true
    } catch (error) {
      credentialsEmailError = 'Unable to send credentials email automatically.'
      console.error('Automatic student credentials email failed:', error)
    }
  }

  if (student && (accountCreated || accountActivated)) {
    await writeAdminAuditLog({
      request,
      adminId: null,
      adminUsername: source,
      action: accountCreated ? 'student.account.auto_created' : 'student.account.activated',
      targetType: 'student',
      targetId: student.id,
      targetLabel: `${currentEnrollment.firstName} ${currentEnrollment.lastName}`.trim(),
      summary: accountCreated
        ? `Compte etudiant cree automatiquement pour ${normalizedEmail}.`
        : `Compte etudiant active pour ${normalizedEmail}.`,
      metadata: {
        source,
        enrollmentId: currentEnrollment.id,
        formationTitle: currentEnrollment.formation.title,
        sessionId: currentEnrollment.session?.id || null,
        paymentStatus: currentEnrollment.paymentStatus,
        paidAmount: currentEnrollment.paidAmount,
        totalAmount: currentEnrollment.totalAmount,
        username: student.username,
        credentialsEmailSent,
      },
    })
  }

  const accountStatus = deriveEnrollmentAccountState({
    enrollmentStatus: currentEnrollment.status,
    paymentStatus: currentEnrollment.paymentStatus,
    paidAmount: currentEnrollment.paidAmount,
    totalAmount: currentEnrollment.totalAmount,
    student,
  })

  return {
    eligible: true,
    reason: null,
    accountCreated,
    accountActivated,
    credentials:
      plainPassword && student?.username
        ? {
            username: student.username,
            password: plainPassword,
          }
        : null,
    student: student
      ? {
          id: student.id,
          email: student.email,
          username: student.username,
          status: student.status,
        }
      : null,
    enrollment: {
      id: currentEnrollment.id,
      status: currentEnrollment.status,
      paymentStatus: currentEnrollment.paymentStatus,
      paidAmount: currentEnrollment.paidAmount,
      totalAmount: currentEnrollment.totalAmount,
    },
    accountStatus,
    notifications: {
      credentialsEmailSent,
      credentialsEmailError,
    },
  }
}

