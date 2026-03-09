import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyFlutterwaveTransaction } from '@/lib/payments/gateways'
import { syncEnrollmentPaymentStatus, toCanonicalPaymentStatus } from '@/lib/payments/status'

export const runtime = 'nodejs'

function safeRedirectUrl(returnUrl: string | null) {
  if (!returnUrl) return '/fr/programmes'
  if (returnUrl.startsWith('/')) return returnUrl
  return '/fr/programmes'
}

function appendPaymentStatus(url: string, status: string, paymentId: number) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}payment_status=${encodeURIComponent(status)}&payment_id=${paymentId}`
}

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
    const { searchParams } = request.nextUrl
    const paymentIdValue = searchParams.get('paymentId')
    const flutterStatus = searchParams.get('status')
    const transactionId = searchParams.get('transaction_id')
    const returnUrl = safeRedirectUrl(searchParams.get('returnUrl'))

    if (!paymentIdValue) {
      return NextResponse.redirect(new URL(appendPaymentStatus(returnUrl, 'failed', 0), request.url))
    }

    const paymentId = Number(paymentIdValue)
    if (!Number.isFinite(paymentId)) {
      return NextResponse.redirect(new URL(appendPaymentStatus(returnUrl, 'failed', 0), request.url))
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        enrollment: {
          select: { id: true },
        },
      },
    })

    if (!payment) {
      return NextResponse.redirect(new URL(appendPaymentStatus(returnUrl, 'failed', paymentId), request.url))
    }

    let canonicalStatus = toCanonicalPaymentStatus(flutterStatus)
    let verificationPayload: Record<string, unknown> | null = null
    const existingNotes = parseNotes(payment.notes)

    if (transactionId && canonicalStatus !== 'failed') {
      const verification = await verifyFlutterwaveTransaction(transactionId)
      canonicalStatus = verification.status
      verificationPayload = verification.rawResponse || null
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: canonicalStatus,
        transactionId: transactionId || payment.transactionId,
        paidAt: canonicalStatus === 'success' ? new Date() : payment.paidAt,
        notes: JSON.stringify({
          ...existingNotes,
          gateway: 'flutterwave',
          callbackStatus: flutterStatus || null,
          verification: verificationPayload,
        }),
      },
    })

    await syncEnrollmentPaymentStatus(payment.enrollment.id)

    return NextResponse.redirect(
      new URL(appendPaymentStatus(returnUrl, canonicalStatus, payment.id), request.url)
    )
  } catch (error) {
    console.error('Flutterwave callback error:', error)
    return NextResponse.redirect(new URL('/fr/programmes?payment_status=failed', request.url))
  }
}
