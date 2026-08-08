import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { deriveEnrollmentAccountState } from '../../../../lib/student/account-provisioning'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { exportFilePart, formatSessionFormAnswer } from '@/lib/enrollment/session-export'
import * as XLSX from 'xlsx'

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
    const auth = await requireAdmin(req)
    if (auth.error) return auth.error

    const { searchParams } = req.nextUrl
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status')
    const formationId = searchParams.get('formationId')
    const sessionId = searchParams.get('sessionId')
    const paymentStatus = searchParams.get('paymentStatus')
    const startDateFrom = searchParams.get('startDateFrom')
    const startDateTo = searchParams.get('startDateTo')
    const search = searchParams.get('search')
    const accountStatus = searchParams.get('accountStatus')

    const where: any = {}
    if (status) where.status = status
    if (formationId) where.formationId = parseInt(formationId)
    if (sessionId) where.sessionId = parseInt(sessionId)
    if (startDateFrom || startDateTo) {
      where.createdAt = {}
      if (startDateFrom) where.createdAt.gte = new Date(startDateFrom)
      if (startDateTo) where.createdAt.lte = new Date(startDateTo)
    }

    if (format === 'excel' && !sessionId) {
      return NextResponse.json({ error: 'Veuillez sélectionner une session avant d’exporter Excel.' }, { status: 400 })
    }

    if (format === 'excel' && sessionId) {
      const selectedSessionId = parseInt(sessionId)
      if (Number.isNaN(selectedSessionId)) {
        return NextResponse.json({ error: 'Session invalide.' }, { status: 400 })
      }

      const [session, questions, sessionEnrollments] = await Promise.all([
        prisma.trainingSession.findUnique({
          where: { id: selectedSessionId },
          include: { formation: { select: { title: true } } },
        }),
        prisma.sessionFormQuestion.findMany({
          where: { sessionId: selectedSessionId },
          orderBy: { order: 'asc' },
        }),
        prisma.enrollment.findMany({
          where,
          include: {
            formation: { select: { title: true } },
            formAnswers: {
              where: { question: { sessionId: selectedSessionId } },
              include: { question: { select: { id: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ])

      if (!session) return NextResponse.json({ error: 'Session introuvable.' }, { status: 404 })

      const enriched = await enrichEnrollmentsWithAccount(sessionEnrollments)
      const searchedRows = search
        ? enriched.filter((enrollment) => {
            const query = search.toLowerCase()
            return enrollment.firstName.toLowerCase().includes(query)
              || enrollment.lastName.toLowerCase().includes(query)
              || enrollment.email.toLowerCase().includes(query)
              || enrollment.formation.title.toLowerCase().includes(query)
          })
        : enriched
      const exportRows = accountStatus
        ? searchedRows.filter((enrollment) => enrollment.account.state === accountStatus)
        : searchedRows

      const headers = [
        'Prénom', 'Nom', 'E-mail', 'Téléphone', 'Adresse', 'Ville', 'Pays',
        'Date d’inscription', 'Statut de l’inscription',
        ...questions.map((question) => question.label),
      ]

      const rows = exportRows.map((enrollment) => {
        const answersByQuestion = new Map(enrollment.formAnswers.map((answer: any) => [answer.questionId, answer]))
        return [
          enrollment.firstName || '',
          enrollment.lastName || '',
          enrollment.email || '',
          enrollment.phone || '',
          enrollment.address || '',
          enrollment.city || '',
          enrollment.country || '',
          enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleString('fr-FR') : '',
          enrollment.status || '',
          ...questions.map((question) => formatSessionFormAnswer(answersByQuestion.get(question.id))),
        ]
      })

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
      worksheet['!freeze'] = { xSplit: 0, ySplit: 1 }
      worksheet['!cols'] = headers.map((header, index) => ({ wch: Math.min(60, Math.max(14, header.length + (index < 9 ? 4 : 8))) }))
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscriptions')

      const formationPart = exportFilePart(session.formation.title)
      const sessionPart = exportFilePart(`Session-${new Date(session.startDate).toLocaleDateString('fr-FR')}`)
      const filename = `Inscriptions_${formationPart}_${sessionPart}.xlsx`
      const file = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

      return new NextResponse(file, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
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
      enrollment.id ? String(enrollment.id) : '',
      enrollment.firstName || '',
      enrollment.lastName || '',
      enrollment.email || '',
      enrollment.phone || '',
      enrollment.address || '',
      enrollment.formation?.title || 'Formation',
      enrollment.startDate ? new Date(enrollment.startDate).toLocaleDateString('fr-FR') : '',
      enrollment.status || '',
      enrollment.paymentStatus || '',
      enrollment.account?.label || '',
      enrollment.account?.username || '',
      enrollment.totalAmount != null ? String(enrollment.totalAmount) : '0',
      enrollment.paidAmount != null ? String(enrollment.paidAmount) : '0',
      enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString('fr-FR') : '',
    ])

    const BOM = '\uFEFF'

    if (format === 'csv') {
      const csvContent = BOM + [
        headers.join(';'),
        ...rows.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(';')),
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="inscriptions_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    const tsvContent = BOM + [headers.join('\t'), ...rows.map((row) => row.map((cell) => String(cell || '').replace(/[\t\r\n]/g, ' ')).join('\t'))].join('\n')

    return new NextResponse(tsvContent, {
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="inscriptions_${new Date().toISOString().split('T')[0]}.xls"`,
      },
    })
  } catch (error: any) {
    console.error("Erreur lors de l'export des inscriptions:", error)
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 })
  }
}
