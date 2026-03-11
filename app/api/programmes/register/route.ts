import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { inferProgramSessionType } from '@/lib/programmes/session-types'
import {
  initiateFlutterwavePayment,
  initiatePawaPayPayment,
  type GatewayInitStatus,
} from '@/lib/payments/gateways'
import { syncEnrollmentPaymentStatus } from '@/lib/payments/status'

export const runtime = 'nodejs'

const registrationSchema = z.object({
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
    provider: z.enum(['pawapay', 'flutterwave']),
    method: z.enum(['mobile_money', 'card', 'bank_transfer']),
    amount: z.number().positive().optional(),
    currency: z.string().min(3).max(3).default('USD'),
    phoneNumber: z.string().optional(),
    operator: z.string().optional(),
    returnUrl: z.string().optional(),
  }),
})

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

function buildAbsoluteCallbackUrl(request: NextRequest, paymentId: number, returnUrl: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return `${normalizedBase}/api/payments/flutterwave/callback?paymentId=${paymentId}&returnUrl=${encodeURIComponent(
    returnUrl
  )}`
}

function sanitizeReturnUrl(value: string | undefined, locale: string) {
  if (!value) return `/${locale}/programmes`
  if (value.startsWith('/')) return value
  return `/${locale}/programmes`
}

export async function POST(request: NextRequest) {
  try {
    const payload = registrationSchema.parse(await request.json())

    if (payload.payment.provider === 'pawapay' && !payload.payment.phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required for PawaPay mobile money payment.' },
        { status: 400 }
      )
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
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
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
    const amount = payload.payment.amount || session.price || 0
    const normalizedCurrency = payload.payment.currency.toUpperCase()

    const notesPayload = {
      source: 'programmes-page',
      formType,
      answers: payload.answers,
      submittedAt: new Date().toISOString(),
    }

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
        status: isFull ? 'waitlist' : 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: payload.payment.method,
        totalAmount: amount,
        paidAmount: 0,
      },
    })

    const reference = `CJ-${Date.now()}-${randomUUID().slice(0, 8)}`

    let payment = await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        amount,
        method: payload.payment.method,
        status: 'pending',
        reference,
        notes: JSON.stringify({
          gateway: payload.payment.provider,
          operator: payload.payment.operator || null,
          phoneNumberMasked: maskPhoneNumber(payload.payment.phoneNumber),
          formType,
          currency: normalizedCurrency,
        }),
      },
    })

    let paymentAction: {
      requiresRedirect?: boolean
      redirectUrl?: string
      requiresPhoneConfirmation?: boolean
      message: string
      provider: 'pawapay' | 'flutterwave'
      status: GatewayInitStatus | 'pending'
    } = {
      provider: payload.payment.provider,
      status: 'pending',
      message: isFull
        ? 'Session is full. Registration has been added to waitlist. Payment is deferred.'
        : 'Payment initialized.',
    }

    if (!isFull) {
      if (payload.payment.provider === 'pawapay') {
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
              phoneNumberMasked: maskPhoneNumber(payload.payment.phoneNumber),
              formType,
              currency: normalizedCurrency,
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
      } else {
        const locale = (payload.answers.locale as string | undefined) || 'fr'
        const returnUrl = sanitizeReturnUrl(payload.payment.returnUrl, locale)
        const callbackUrl = buildAbsoluteCallbackUrl(request, payment.id, returnUrl)

        const flutterwaveResult = await initiateFlutterwavePayment({
          amount,
          currency: normalizedCurrency,
          email: payload.personal.email,
          fullName: `${payload.personal.firstName} ${payload.personal.lastName}`,
          txRef: reference,
          redirectUrl: callbackUrl,
          narration: `Session payment - ${session.formation.title}`,
        })

        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            reference: flutterwaveResult.txRef,
            status: toPaymentRowStatus(flutterwaveResult.status),
            notes: JSON.stringify({
              gateway: 'flutterwave',
              formType,
              currency: normalizedCurrency,
              response: flutterwaveResult.rawResponse || null,
              isMock: flutterwaveResult.isMock,
            }),
          },
        })

        paymentAction = {
          provider: 'flutterwave',
          status: flutterwaveResult.status,
          requiresRedirect: true,
          redirectUrl: flutterwaveResult.paymentLink,
          message: flutterwaveResult.message,
        }
      }
    }

    await syncEnrollmentPaymentStatus(enrollment.id)

    await sendEmail(
      enrollment.email,
      `Confirmation d'inscription - ${session.formation.title}`,
      `
        <h2>Bonjour ${enrollment.firstName},</h2>
        <p>Votre inscription pour la session <strong>${session.formation.title}</strong> a bien ete enregistree.</p>
        <p>Statut inscription: <strong>${isFull ? 'waitlist' : 'pending'}</strong></p>
        <p>Statut paiement: <strong>${payment.status}</strong></p>
        <p>Montant: <strong>${amount.toFixed(2)} ${normalizedCurrency}</strong></p>
      `
    )

    return NextResponse.json(
      {
        success: true,
        enrollmentId: enrollment.id,
        status: enrollment.status,
        onWaitlist: isFull,
        payment: {
          id: payment.id,
          status: payment.status,
          provider: payload.payment.provider,
          method: payment.method,
          amount: payment.amount,
          action: paymentAction,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Program registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', details: error.flatten() },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Unable to register for this session.' }, { status: 500 })
  }
}
