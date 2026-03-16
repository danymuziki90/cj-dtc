import { randomUUID } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendEmail, withEmailTimeout } from '@/lib/email'
import { inferProgramSessionType } from '@/lib/programmes/session-types'
import { initiatePawaPayPayment, type GatewayInitStatus } from '@/lib/payments/gateways'
import { syncEnrollmentPaymentStatus } from '@/lib/payments/status'

export const createSessionPaymentSchema = z.object({
  sessionId: z.number().int().positive(),
  formType: z.enum(['MRH', 'IOP', 'CONFERENCE_FORUM']).optional(),
  personal: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    whatsapp: z.string().min(6),
    address: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
  }),
  answers: z.record(z.any()),
  payment: z.object({
    provider: z.literal('pawapay'),
    method: z.literal('mobile_money'),
    currency: z.string().min(3).max(3).default('USD'),
    phoneNumber: z.string().optional(),
    operator: z.string().optional(),
  }),
})

export type CreateSessionPaymentPayload = z.infer<typeof createSessionPaymentSchema>

function toPaymentRowStatus(status: GatewayInitStatus) {
  if (status === 'success') return 'success'
  if (status === 'failed') return 'failed'
  return 'pending'
}

function maskPhoneNumber(value?: string) {
  if (!value) return null
  const cleaned = value.replace(/[^\d+]/g, '')
  if (cleaned.length <= 4) return cleaned
  return `${cleaned.slice(0, 3)}****${cleaned.slice(-3)}`
}

function isSecurePublicUrl(value: string) {
  try {
    const parsed = new URL(value)
    return (
      parsed.protocol === 'https:' ||
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1'
    )
  } catch {
    return false
  }
}

export async function createSessionPayment(payload: CreateSessionPaymentPayload) {
  const callbackUrl = process.env.PAWAPAY_CALLBACK_URL || null

  if (callbackUrl && !isSecurePublicUrl(callbackUrl)) {
    return {
      status: 500,
      body: { error: 'PAWAPAY_CALLBACK_URL must be a public HTTPS URL.' },
    }
  }

  const session = await prisma.trainingSession.findUnique({
    where: { id: payload.sessionId },
    include: {
      formation: true,
      enrollments: {
        where: {
          status: {
            notIn: ['waitlist', 'rejected', 'cancelled'],
          },
        },
        select: { id: true },
      },
    },
  })

  if (!session) {
    return {
      status: 404,
      body: { error: 'Session not found.' },
    }
  }

  const inferredType = inferProgramSessionType({
    title: session.formation.title,
    description: session.description,
    format: session.format,
    formation: {
      title: session.formation.title,
      categorie: session.formation.categorie,
      description: session.formation.description,
    },
  })

  const formType = payload.formType || inferredType
  const activeEnrollmentsCount = session.enrollments.length
  const isFull = activeEnrollmentsCount >= session.maxParticipants
  const amount = Number(session.price || 0)
  const normalizedCurrency = payload.payment.currency.toUpperCase()
  const hasPayableAmount = amount > 0
  const requiresImmediatePayment = !isFull && hasPayableAmount
  const isFreeSession = amount <= 0
  const isFreeRegistration = !isFull && isFreeSession
  const registrationDate = new Date()

  if (requiresImmediatePayment && !payload.payment.phoneNumber) {
    return {
      status: 400,
      body: { error: 'Phone number is required for PawaPay mobile money payment.' },
    }
  }

  const notesPayload = {
    source: 'programmes-page',
    formType,
    answers: payload.answers,
    submittedAt: registrationDate.toISOString(),
  }

  const enrollmentStatus = isFull ? 'waitlist' : isFreeRegistration ? 'confirmed' : 'pending'

  const enrollment = await prisma.enrollment.create({
    data: {
      firstName: payload.personal.firstName.trim(),
      lastName: payload.personal.lastName.trim(),
      email: payload.personal.email.trim().toLowerCase(),
      phone: payload.personal.whatsapp.trim(),
      address: payload.personal.address || null,
      motivationLetter:
        (payload.answers.expectations as string | undefined) ||
        (payload.answers.reasonsToJoin as string | undefined) ||
        (payload.answers.professionalGoals as string | undefined) ||
        null,
      notes: JSON.stringify(notesPayload),
      formationId: session.formationId,
      sessionId: session.id,
      startDate: session.startDate,
      status: enrollmentStatus,
      paymentStatus: isFreeSession ? 'paid' : 'unpaid',
      paymentMethod: hasPayableAmount ? payload.payment.method : null,
      totalAmount: amount,
      paidAmount: 0,
      paymentDate: isFreeRegistration ? registrationDate : null,
    },
  })

  const reference = `CJ-${Date.now()}-${randomUUID().slice(0, 8)}`
  const paymentMethod = hasPayableAmount ? payload.payment.method : 'free'
  const maskedPhoneNumber = requiresImmediatePayment
    ? maskPhoneNumber(payload.payment.phoneNumber || payload.personal.whatsapp)
    : null

  let payment = await prisma.payment.create({
    data: {
      enrollmentId: enrollment.id,
      amount,
      method: paymentMethod,
      status: hasPayableAmount ? 'pending' : 'success',
      reference,
      paidAt: hasPayableAmount ? null : registrationDate,
      notes: JSON.stringify({
        gateway: requiresImmediatePayment ? 'pawapay' : hasPayableAmount ? 'deferred' : 'none',
        operator: requiresImmediatePayment ? payload.payment.operator || null : null,
        phoneNumberMasked: maskedPhoneNumber,
        formType,
        currency: normalizedCurrency,
        callbackUrl,
      }),
    },
  })

  let paymentAction: {
    requiresPhoneConfirmation?: boolean
    message: string
    provider: 'pawapay'
    status: GatewayInitStatus | 'pending'
  } = {
    provider: 'pawapay',
    status: hasPayableAmount ? 'pending' : 'success',
    message: isFull
      ? "La session est complete. Votre inscription a ete ajoutee a la liste d'attente. Le paiement est reporte."
      : isFreeRegistration
      ? "Inscription confirmee. Aucun paiement n'est requis pour cette session."
      : 'Paiement initialise.',
  }

  if (requiresImmediatePayment) {
    const pawaPayResult = await initiatePawaPayPayment({
      amount,
      currency: normalizedCurrency,
      phoneNumber: payload.payment.phoneNumber || payload.personal.whatsapp,
      operator: payload.payment.operator,
      externalReference: reference,
      fullName: `${payload.personal.firstName} ${payload.personal.lastName}`,
      email: payload.personal.email,
    })

    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: pawaPayResult.depositId,
        status: toPaymentRowStatus(pawaPayResult.status),
        paidAt: pawaPayResult.status === 'success' ? new Date() : null,
        notes: JSON.stringify({
          gateway: 'pawapay',
          operator: payload.payment.operator || null,
          phoneNumberMasked: maskedPhoneNumber,
          formType,
          currency: normalizedCurrency,
          callbackUrl,
          response: pawaPayResult.rawResponse || null,
          isMock: pawaPayResult.isMock,
        }),
      },
    })

    paymentAction = {
      provider: 'pawapay',
      status: pawaPayResult.status,
      requiresPhoneConfirmation: pawaPayResult.status === 'pending',
      message: pawaPayResult.message,
    }
  }

  const syncedPayment = await syncEnrollmentPaymentStatus(enrollment.id)

  if (isFreeRegistration) {
    try {
      await prisma.adminNotification.create({
        data: {
          title: 'Inscription confirmee',
          message: `Votre inscription a la session ${session.formation.title} est confirmee. Aucun paiement n'est requis.`,
          type: 'info',
          target: 'student',
          studentEmail: enrollment.email,
          sessionId: session.id,
          createdBy: 'system',
        },
      })
    } catch (error) {
      console.error('Free registration notification failed:', error)
    }
  }

  const registrationStatusLabel = isFull ? 'waitlist' : enrollmentStatus
  const paymentStatusLabel = isFull ? 'deferred' : syncedPayment?.paymentStatus || (isFreeRegistration ? 'paid' : payment.status)
  const emailBody = isFull
    ? `
        <h2>Bonjour ${enrollment.firstName}</h2>
        <p>Votre demande d'inscription pour la session <strong>${session.formation.title}</strong> a bien ete enregistree.</p>
        <p>La session est actuellement complete. Votre dossier a ete place en <strong>liste d'attente</strong>.</p>
        <p>Nous vous contacterons des qu'une place se libere.</p>
        <p>Statut inscription: <strong>${registrationStatusLabel}</strong></p>
        <p>Statut paiement: <strong>${paymentStatusLabel}</strong></p>
        <p>Montant de la session: <strong>${amount.toFixed(2)} ${normalizedCurrency}</strong></p>
      `
    : isFreeRegistration
    ? `
        <h2>Bonjour ${enrollment.firstName}</h2>
        <p>Votre inscription pour la session <strong>${session.formation.title}</strong> est <strong>confirmee</strong>.</p>
        <p>Cette session est gratuite. Aucun paiement n'est requis.</p>
        <p>Statut inscription: <strong>${registrationStatusLabel}</strong></p>
        <p>Statut paiement: <strong>${paymentStatusLabel}</strong></p>
        <p>Montant de la session: <strong>${amount.toFixed(2)} ${normalizedCurrency}</strong></p>
      `
    : `
        <h2>Bonjour ${enrollment.firstName}</h2>
        <p>Votre inscription pour la session <strong>${session.formation.title}</strong> a bien ete enregistree.</p>
        <p>Veuillez confirmer la demande de paiement Mobile Money pour finaliser votre place.</p>
        <p>Statut inscription: <strong>${registrationStatusLabel}</strong></p>
        <p>Statut paiement: <strong>${paymentStatusLabel}</strong></p>
        <p>Montant: <strong>${amount.toFixed(2)} ${normalizedCurrency}</strong></p>
      `

  try {
    await withEmailTimeout(
      sendEmail(enrollment.email, `Confirmation d'inscription - ${session.formation.title}`, emailBody)
    )
  } catch (error) {
    console.error('Registration confirmation email failed:', error)
  }

  return {
    status: 201,
    body: {
      success: true,
      enrollmentId: enrollment.id,
      status: enrollmentStatus,
      paymentStatus: syncedPayment?.paymentStatus || (isFreeRegistration ? 'paid' : 'unpaid'),
      onWaitlist: isFull,
      payment: {
        id: payment.id,
        status: payment.status,
        provider: 'pawapay',
        method: payment.method,
        amount: payment.amount,
        action: paymentAction,
        callbackUrl,
      },
    },
  }
}
