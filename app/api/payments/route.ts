import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncEnrollmentPaymentStatus, toCanonicalPaymentStatus } from '@/lib/payments/status'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function parseStatusFilter(status: string | null) {
  if (!status) return undefined
  const normalized = status.toLowerCase()

  if (normalized === 'success' || normalized === 'completed' || normalized === 'paid') {
    return { in: ['success', 'completed'] }
  }

  if (normalized === 'failed') {
    return { in: ['failed'] }
  }

  if (normalized === 'pending') {
    return { in: ['pending'] }
  }

  return undefined
}

function normalizeForApi(status: string) {
  return toCanonicalPaymentStatus(status)
}

function extractGateway(notes?: string | null) {
  if (!notes) return null
  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>
    return typeof parsed.gateway === 'string' ? parsed.gateway : null
  } catch {
    return null
  }
}

function toCsv(value: string | number | null | undefined) {
  const raw = value === null || value === undefined ? '' : String(value)
  return `"${raw.replace(/"/g, '""')}"`
}

function buildCsvReport(rows: Array<Record<string, string | number | null | undefined>>) {
  if (rows.length === 0) {
    return 'Payment ID,Student,Email,Session,Amount,Method,Gateway,Status,Reference,Transaction,Created At,Paid At'
  }

  const headers = Object.keys(rows[0])
  const csvRows = rows.map((row) => headers.map((header) => toCsv(row[header])).join(','))
  return [headers.join(','), ...csvRows].join('\n')
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url, 'http://localhost')
    const { searchParams } = url

    const enrollmentId = searchParams.get('enrollmentId')
    const status = searchParams.get('status')
    const sessionId = searchParams.get('sessionId')
    const method = searchParams.get('method')
    const gateway = searchParams.get('gateway')
    const format = searchParams.get('format')

    const where: any = {}
    if (enrollmentId) where.enrollmentId = Number(enrollmentId)
    if (method) where.method = method

    const statusFilter = parseStatusFilter(status)
    if (statusFilter) where.status = statusFilter

    if (sessionId) {
      where.enrollment = {
        is: {
          sessionId: Number(sessionId),
        },
      }
    }

    if (gateway) {
      where.notes = {
        contains: `"gateway":"${gateway}"`,
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        enrollment: {
          include: {
            formation: {
              select: {
                id: true,
                title: true,
              },
            },
            session: {
              select: {
                id: true,
                startDate: true,
                endDate: true,
                location: true,
                format: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const normalizedPayments = payments.map((payment) => ({
      ...payment,
      status: normalizeForApi(payment.status),
      gateway: extractGateway(payment.notes),
    }))

    if (format === 'csv') {
      const rows = normalizedPayments.map((payment) => ({
        'Payment ID': payment.id,
        Student: `${payment.enrollment.firstName} ${payment.enrollment.lastName}`,
        Email: payment.enrollment.email,
        Session: payment.enrollment.session
          ? `${new Date(payment.enrollment.session.startDate).toLocaleDateString('fr-FR')} - ${payment.enrollment.session.location}`
          : payment.enrollment.formation.title,
        Amount: payment.amount,
        Method: payment.method,
        Gateway: payment.gateway || '',
        Status: payment.status,
        Reference: payment.reference || '',
        Transaction: payment.transactionId || '',
        'Created At': new Date(payment.createdAt).toISOString(),
        'Paid At': payment.paidAt ? new Date(payment.paidAt).toISOString() : '',
      }))

      const csvContent = buildCsvReport(rows)
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="payments_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    return NextResponse.json(normalizedPayments)
  } catch (error) {
    console.error('Error while fetching payments:', error)
    return NextResponse.json({ error: 'Unable to fetch payments.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      enrollmentId,
      amount,
      method,
      status,
      transactionId,
      reference,
      notes,
      paidAt,
    } = body

    if (!enrollmentId || !amount || !method) {
      return NextResponse.json(
        { error: 'enrollmentId, amount and method are required.' },
        { status: 400 }
      )
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: Number(enrollmentId) },
      select: { id: true },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found.' }, { status: 404 })
    }

    const canonicalStatus = status ? toCanonicalPaymentStatus(status) : 'success'

    const payment = await prisma.payment.create({
      data: {
        enrollmentId: Number(enrollmentId),
        amount: Number(amount),
        method,
        transactionId: transactionId || null,
        reference: reference || null,
        notes: notes || null,
        status: canonicalStatus,
        paidAt: canonicalStatus === 'success' ? new Date(paidAt || Date.now()) : null,
      },
      include: {
        enrollment: {
          include: {
            formation: true,
            session: true,
          },
        },
      },
    })

    await syncEnrollmentPaymentStatus(enrollment.id)

    return NextResponse.json(
      {
        ...payment,
        status: canonicalStatus,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error while creating payment:', error)

    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'This transaction already exists.' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Unable to create payment.' }, { status: 500 })
  }
}
