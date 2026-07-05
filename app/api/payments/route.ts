import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncEnrollmentPaymentStatus, toCanonicalPaymentStatus } from '@/lib/payments/status'
import { provisionStudentAccountFromEnrollment } from '@/lib/student/account-provisioning'

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

function buildPaymentWhere(searchParams: URLSearchParams) {
  const enrollmentId = searchParams.get('enrollmentId')
  const status = searchParams.get('status')
  const sessionId = searchParams.get('sessionId')
  const method = searchParams.get('method')
  const gateway = searchParams.get('gateway')
  const search = searchParams.get('search')?.trim()

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

  if (search) {
    const searchFilters = [
      { reference: { contains: search, mode: 'insensitive' } },
      { transactionId: { contains: search, mode: 'insensitive' } },
      {
        enrollment: {
          is: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { formation: { title: { contains: search, mode: 'insensitive' } } },
            ],
          },
        },
      },
    ]

    if (where.AND) {
      where.AND.push({ OR: searchFilters })
    } else if (where.enrollment) {
      where.AND = [{ OR: searchFilters }]
    } else {
      where.OR = searchFilters
    }
  }

  if (gateway) {
    where.notes = {
      contains: `"gateway":"${gateway}"`,
    }
  }

  return where
}

function normalizePayments(payments: any[]) {
  return payments.map((payment) => ({
    ...payment,
    status: normalizeForApi(payment.status),
    gateway: extractGateway(payment.notes),
  }))
}

async function buildPaymentSummary(where: any) {
  const [totalCount, successCount, pendingCount, amountAggregate] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.count({
      where: {
        ...where,
        status: {
          in: ['success', 'completed'],
        },
      },
    }),
    prisma.payment.count({
      where: {
        ...where,
        status: {
          in: ['pending'],
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        ...where,
        status: {
          in: ['success', 'completed'],
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ])

  return {
    totalCount,
    successCount,
    pendingCount,
    successfulAmount: amountAggregate._sum.amount || 0,
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url, 'http://localhost')
    const { searchParams } = url
    const format = searchParams.get('format')
    const paginationRequested = searchParams.has('page') || searchParams.has('pageSize')
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 10)))
    const skip = (page - 1) * pageSize
    const where = buildPaymentWhere(searchParams)

    const include = {
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
    }

    if (format === 'csv') {
      const payments = await prisma.payment.findMany({
        where,
        include,
        orderBy: {
          createdAt: 'desc',
        },
      })

      const normalizedPayments = normalizePayments(payments)
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

    if (!paginationRequested) {
      const payments = await prisma.payment.findMany({
        where,
        include,
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json(normalizePayments(payments))
    }

    const [totalItems, payments, summary] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        include,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      buildPaymentSummary(where),
    ])

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    return NextResponse.json({
      payments: normalizePayments(payments),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary,
    })
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

    const autoProvisionResult =
      canonicalStatus === 'success'
        ? await provisionStudentAccountFromEnrollment({
            enrollmentId: enrollment.id,
            appBaseUrl: new URL(req.url).origin,
            source: 'payments-api-success',
          })
        : null

    return NextResponse.json(
      {
        ...payment,
        status: canonicalStatus,
        studentAccount: autoProvisionResult
          ? {
              state: autoProvisionResult.accountStatus?.state || null,
              accountCreated: autoProvisionResult.accountCreated,
              accountActivated: autoProvisionResult.accountActivated,
            }
          : null,
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




