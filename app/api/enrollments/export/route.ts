import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { deriveEnrollmentAccountState } from '../../../../lib/student/account-provisioning'

export const dynamic = 'force-dynamic'

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

async function enrichEnrollmentsWithAccount(enrollments: Array<any>) {
  const emails = Array.from(new Set(enrollments.map((enrollment) => normalizeEmail(enrollment.email)).filter(Boolean)))
  const students = emails.length
    ? await prisma.student.findMany({
        where: {
          OR: emails.map((email) => ({
            email: {
              equals: email,
              mode: 'insensitive',
            },
          })),
        },
        select: {
          id: true,
          email: true,
          username: true,
          status: true,
        },
      })
    : []

  const studentByEmail = new Map(students.map((student) => [normalizeEmail(student.email), student]))

  return enrollments.map((enrollment) => {
    const student = studentByEmail.get(normalizeEmail(enrollment.email)) || null
    const account = deriveEnrollmentAccountState({
      enrollmentStatus: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      paidAmount: enrollment.paidAmount,
      totalAmount: enrollment.totalAmount,
      student,
    })

    return {
      ...enrollment,
      account: {
        ...account,
        username: student?.username || '',
      },
    }
  })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status')
    const formationId = searchParams.get('formationId')
    const paymentStatus = searchParams.get('paymentStatus')
    const startDateFrom = searchParams.get('startDateFrom')
    const startDateTo = searchParams.get('startDateTo')
    const search = searchParams.get('search')
    const accountStatus = searchParams.get('accountStatus')

    const where: any = {}
    if (status) where.status = status
    if (formationId) where.formationId = parseInt(formationId)
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (startDateFrom || startDateTo) {
      where.startDate = {}
      if (startDateFrom) where.startDate.gte = new Date(startDateFrom)
      if (startDateTo) where.startDate.lte = new Date(startDateTo)
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        formation: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    let filteredEnrollments = enrollments
    if (search) {
      const searchLower = search.toLowerCase()
      filteredEnrollments = enrollments.filter(
        (enrollment) =>
          enrollment.firstName.toLowerCase().includes(searchLower) ||
          enrollment.lastName.toLowerCase().includes(searchLower) ||
          enrollment.email.toLowerCase().includes(searchLower) ||
          enrollment.formation.title.toLowerCase().includes(searchLower),
      )
    }

    const enrichedEnrollments = await enrichEnrollmentsWithAccount(filteredEnrollments)
    const exportRows = accountStatus
      ? enrichedEnrollments.filter((enrollment) => enrollment.account.state === accountStatus)
      : enrichedEnrollments

    const headers = [
      'ID',
      'Prenom',
      'Nom',
      'Email',
      'Telephone',
      'Adresse',
      'Formation',
      'Date de debut',
      'Statut',
      'Statut paiement',
      'Statut compte',
      'Identifiant compte',
      'Montant total',
      'Montant paye',
      'Date inscription',
    ]

    const rows = exportRows.map((enrollment) => [
      enrollment.id.toString(),
      enrollment.firstName,
      enrollment.lastName,
      enrollment.email,
      enrollment.phone || '',
      enrollment.address || '',
      enrollment.formation.title,
      new Date(enrollment.startDate).toLocaleDateString('fr-FR'),
      enrollment.status,
      enrollment.paymentStatus,
      enrollment.account.label,
      enrollment.account.username || '',
      enrollment.totalAmount.toString(),
      enrollment.paidAmount.toString(),
      new Date(enrollment.createdAt).toLocaleDateString('fr-FR'),
    ])

    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="inscriptions_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    const tsvContent = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n')

    return new NextResponse(tsvContent, {
      headers: {
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': `attachment; filename="inscriptions_${new Date().toISOString().split('T')[0]}.xls"`,
      },
    })
  } catch (error: any) {
    console.error("Erreur lors de l'export:", error)
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 })
  }
}
