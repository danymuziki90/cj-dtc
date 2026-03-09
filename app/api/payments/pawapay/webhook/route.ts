import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toCanonicalPaymentStatus, syncEnrollmentPaymentStatus } from '@/lib/payments/status'

export const runtime = 'nodejs'

function parseNotes(notes: string | null) {
  if (!notes) return {}
  try {
    return JSON.parse(notes) as Record<string, unknown>
  } catch {
    return { raw: notes }
  }
}

function normalizeWebhookStatus(payload: Record<string, unknown>) {
  const candidates = [
    payload.status,
    payload.result,
    payload.paymentStatus,
    payload.depositStatus,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return toCanonicalPaymentStatus(candidate)
    }
  }

  return 'pending'
}

function extractDepositId(payload: Record<string, unknown>) {
  const candidates = [payload.depositId, payload.transactionId, payload.reference]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Record<string, unknown>
    const depositId = extractDepositId(payload)

    if (!depositId) {
      return NextResponse.json({ error: 'Missing deposit identifier.' }, { status: 400 })
    }

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ transactionId: depositId }, { reference: depositId }],
      },
      include: {
        enrollment: {
          select: { id: true },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })
    }

    const status = normalizeWebhookStatus(payload)
    const existingNotes = parseNotes(payment.notes)

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        paidAt: status === 'success' ? new Date() : payment.paidAt,
        notes: JSON.stringify({
          ...existingNotes,
          gateway: 'pawapay',
          webhookPayload: payload,
        }),
      },
    })

    await syncEnrollmentPaymentStatus(payment.enrollment.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PawaPay webhook error:', error)
    return NextResponse.json({ error: 'Unable to process webhook.' }, { status: 500 })
  }
}
