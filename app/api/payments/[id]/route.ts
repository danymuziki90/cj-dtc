import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toCanonicalPaymentStatus } from '@/lib/payments/status'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const paymentId = Number(id)

    if (!Number.isFinite(paymentId)) {
      return NextResponse.json({ error: 'Invalid payment id.' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        enrollment: {
          include: {
            formation: true,
            session: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })
    }

    return NextResponse.json({
      ...payment,
      status: toCanonicalPaymentStatus(payment.status),
    })
  } catch (error) {
    console.error('Payment details error:', error)
    return NextResponse.json({ error: 'Unable to fetch payment details.' }, { status: 500 })
  }
}
