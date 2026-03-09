import { prisma } from '@/lib/prisma'

export type CanonicalPaymentStatus = 'pending' | 'success' | 'failed'

export function toCanonicalPaymentStatus(status?: string | null): CanonicalPaymentStatus {
  const normalized = (status || '').toLowerCase()

  if (
    normalized === 'completed' ||
    normalized === 'success' ||
    normalized === 'successful' ||
    normalized === 'paid'
  ) {
    return 'success'
  }

  if (normalized === 'failed' || normalized === 'error' || normalized === 'cancelled') {
    return 'failed'
  }

  return 'pending'
}

export async function syncEnrollmentPaymentStatus(enrollmentId: number) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, totalAmount: true, paymentDate: true },
  })

  if (!enrollment) return null

  const payments = await prisma.payment.findMany({
    where: { enrollmentId },
    select: {
      amount: true,
      status: true,
    },
  })

  const totalPaid = payments.reduce((sum, payment) => {
    return toCanonicalPaymentStatus(payment.status) === 'success' ? sum + payment.amount : sum
  }, 0)

  let paymentStatus = 'unpaid'
  if (totalPaid > 0 && totalPaid < enrollment.totalAmount) paymentStatus = 'partial'
  if (totalPaid >= enrollment.totalAmount && enrollment.totalAmount > 0) paymentStatus = 'paid'

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      paidAmount: totalPaid,
      paymentStatus,
      paymentDate: paymentStatus === 'paid' ? new Date() : enrollment.paymentDate,
    },
  })

  return {
    enrollmentId,
    paidAmount: totalPaid,
    paymentStatus,
  }
}
