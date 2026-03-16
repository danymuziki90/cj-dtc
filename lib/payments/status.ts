import { prisma } from '@/lib/prisma'

export type CanonicalPaymentStatus = 'pending' | 'success' | 'failed'

export function toCanonicalPaymentStatus(status?: string | null): CanonicalPaymentStatus {
  const normalized = (status || '').toLowerCase().trim()

  if (!normalized) return 'pending'

  if (normalized === 'unpaid' || normalized === 'partial') {
    return 'pending'
  }

  if (
    normalized.includes('completed') ||
    normalized.includes('success') ||
    normalized.includes('successful') ||
    normalized === 'paid'
  ) {
    return 'success'
  }

  if (
    normalized.includes('partial') ||
    normalized.includes('unpaid') ||
    normalized.includes('accepted') ||
    normalized.includes('submitted') ||
    normalized.includes('processing') ||
    normalized.includes('pending') ||
    normalized.includes('queued')
  ) {
    return 'pending'
  }

  if (
    normalized.includes('failed') ||
    normalized.includes('error') ||
    normalized.includes('cancelled') ||
    normalized.includes('rejected') ||
    normalized.includes('declined') ||
    normalized.includes('not_approved') ||
    normalized.includes('approval') ||
    normalized.includes('not_found') ||
    normalized.includes('insufficient') ||
    normalized.includes('limit_reached')
  ) {
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
      paidAt: true,
      status: true,
    },
  })

  const successfulPayments = payments.filter((payment) => toCanonicalPaymentStatus(payment.status) === 'success')
  const totalPaid = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0)

  let paymentStatus = 'unpaid'
  if (enrollment.totalAmount <= 0) {
    paymentStatus = 'paid'
  } else if (totalPaid > 0 && totalPaid < enrollment.totalAmount) {
    paymentStatus = 'partial'
  } else if (totalPaid >= enrollment.totalAmount) {
    paymentStatus = 'paid'
  }

  const effectivePaymentDate =
    paymentStatus === 'paid'
      ? successfulPayments.find((payment) => payment.paidAt)?.paidAt || enrollment.paymentDate || new Date()
      : enrollment.paymentDate

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      paidAmount: totalPaid,
      paymentStatus,
      paymentDate: effectivePaymentDate,
    },
  })

  return {
    enrollmentId,
    paidAmount: totalPaid,
    paymentStatus,
  }
}
