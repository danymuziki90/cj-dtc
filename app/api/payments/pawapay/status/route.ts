import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPawaPayPayment } from '@/lib/payments/gateways'
import { syncEnrollmentPaymentStatus } from '@/lib/payments/status'
import { provisionStudentAccountFromEnrollment } from '@/lib/student/account-provisioning'

export const runtime = 'nodejs'

function parseNotes(notes: string | null) {
  if (!notes) return {}
  try {
    return JSON.parse(notes) as Record<string, unknown>
  } catch {
    return { raw: notes }
  }
}

export async function GET(request: NextRequest) {
  try {
    const paymentIdValue = request.nextUrl.searchParams.get('paymentId')
    if (!paymentIdValue) {
      return NextResponse.json({ error: 'paymentId is required.' }, { status: 400 })
    }

    const paymentId = Number(paymentIdValue)
    if (!Number.isFinite(paymentId)) {
      return NextResponse.json({ error: 'paymentId is invalid.' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        enrollment: { select: { id: true } },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })
    }

    if (!payment.transactionId) {
      return NextResponse.json({
        paymentId: payment.id,
        status: payment.status,
        message: 'No transactionId linked to this payment yet.',
      })
    }

    const verification = await verifyPawaPayPayment(payment.transactionId)
    const existingNotes = parseNotes(payment.notes)

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: verification.status,
        paidAt: verification.status === 'success' ? new Date() : payment.paidAt,
        notes: JSON.stringify({
          ...existingNotes,
          gateway: 'pawapay',
          verification: verification.rawResponse || null,
          isMock: verification.isMock,
        }),
      },
    })

    await syncEnrollmentPaymentStatus(payment.enrollment.id)

    const autoProvisionResult =
      verification.status === 'success'
        ? await provisionStudentAccountFromEnrollment({
            enrollmentId: payment.enrollment.id,
            appBaseUrl: new URL(request.url).origin,
            source: 'pawapay-status-check',
          })
        : null

    return NextResponse.json({
      paymentId: updated.id,
      status: updated.status,
      transactionId: updated.transactionId,
      studentAccount: autoProvisionResult
        ? {
            state: autoProvisionResult.accountStatus?.state || null,
            accountCreated: autoProvisionResult.accountCreated,
            accountActivated: autoProvisionResult.accountActivated,
          }
        : null,
    })
  } catch (error) {
    console.error('PawaPay status check error:', error)
    return NextResponse.json({ error: 'Unable to check payment status.' }, { status: 500 })
  }
}
