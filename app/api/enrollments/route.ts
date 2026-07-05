import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { deriveEnrollmentAccountState, provisionStudentAccountFromEnrollment } from '../../../lib/student/account-provisioning'
import { resolveAppBaseUrl, sendEmail } from '../../../lib/email'

export const runtime = 'nodejs'

type EnrollmentWhere = Record<string, any>

function buildEnrollmentWhere(url: URL): EnrollmentWhere {
  const formationId = url.searchParams.get('formationId')
  const sessionId = url.searchParams.get('sessionId')
  const status = url.searchParams.get('status')
  const paymentStatus = url.searchParams.get('paymentStatus')
  const startDateFrom = url.searchParams.get('startDateFrom')
  const startDateTo = url.searchParams.get('startDateTo')
  const search = url.searchParams.get('search')?.trim()

  const where: EnrollmentWhere = {}
  if (formationId) where.formationId = parseInt(formationId)
  if (sessionId) where.sessionId = parseInt(sessionId)
  if (status) where.status = status
  if (paymentStatus && paymentStatus !== 'all') where.paymentStatus = paymentStatus
  if (startDateFrom || startDateTo) {
    where.startDate = {}
    if (startDateFrom) where.startDate.gte = new Date(startDateFrom)
    if (startDateTo) where.startDate.lte = new Date(startDateTo)
  }
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { formation: { title: { contains: search, mode: 'insensitive' } } },
    ]
  }

  return where
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

async function findStudentsForEmails(emails: string[]) {
  const normalizedEmails = Array.from(new Set(emails.map((email) => normalizeEmail(email)).filter(Boolean)))
  if (normalizedEmails.length === 0) return []

  return prisma.student.findMany({
    where: {
      OR: normalizedEmails.map((email) => ({
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
}

async function attachEnrollmentAccountState<T extends { email: string; status: string; paymentStatus: string; paidAmount: number; totalAmount: number }>(
  enrollments: T[],
) {
  const students = await findStudentsForEmails(enrollments.map((enrollment) => enrollment.email))
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
        studentId: student?.id || null,
        username: student?.username || null,
      },
    }
  })
}

function buildEnrollmentStatsFromRows(
  rows: Array<{
    status: string
    paymentStatus: string
    paidAmount: number
    totalAmount: number
    formation: { id: number; title: string }
    account?: { state: string } | null
  }>,
) {
  const byStatus: Record<string, number> = {}
  const byPaymentStatus: Record<string, number> = {}
  const byAccountStatus: Record<string, number> = {}
  const byFormation = new Map<number, { id: number; title: string; count: number }>()
  let totalAmount = 0
  let paidAmount = 0

  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] || 0) + 1
    byPaymentStatus[row.paymentStatus] = (byPaymentStatus[row.paymentStatus] || 0) + 1
    if (row.account?.state) {
      byAccountStatus[row.account.state] = (byAccountStatus[row.account.state] || 0) + 1
    }

    totalAmount += row.totalAmount || 0
    paidAmount += row.paidAmount || 0

    const existingFormation = byFormation.get(row.formation.id)
    if (existingFormation) {
      existingFormation.count += 1
    } else {
      byFormation.set(row.formation.id, {
        id: row.formation.id,
        title: row.formation.title,
        count: 1,
      })
    }
  }

  return {
    total: rows.length,
    byStatus,
    byPaymentStatus,
    byAccountStatus,
    revenue: {
      totalAmount,
      paidAmount,
    },
    byFormation: Array.from(byFormation.values()).sort((left, right) => right.count - left.count),
  }
}

async function buildEnrollmentStats(where: EnrollmentWhere) {
  const rows = await prisma.enrollment.findMany({
    where,
    select: {
      status: true,
      paymentStatus: true,
      paidAmount: true,
      totalAmount: true,
      email: true,
      formation: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  const enrichedRows = await attachEnrollmentAccountState(rows)
  return buildEnrollmentStatsFromRows(enrichedRows)
}

const enrollmentInclude = {
  formation: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
  session: {
    select: {
      id: true,
      startDate: true,
      endDate: true,
      location: true,
      format: true,
      maxParticipants: true,
    },
  },
  payments: {
    select: {
      id: true,
      amount: true,
      method: true,
      status: true,
      reference: true,
      transactionId: true,
      paidAt: true,
      createdAt: true,
      notes: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url, 'http://localhost')
    const where = buildEnrollmentWhere(url)
    const accountStatusFilter = url.searchParams.get('accountStatus')?.trim() || ''
    const paginationRequested = url.searchParams.has('page') || url.searchParams.has('pageSize')
    const page = Math.max(1, Number(url.searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || 10)))
    const skip = (page - 1) * pageSize

    if (!paginationRequested) {
      const enrollments = await prisma.enrollment.findMany({
        where,
        include: enrollmentInclude,
        orderBy: { createdAt: 'desc' },
      })

      const enrichedEnrollments = await attachEnrollmentAccountState(enrollments)
      const filteredEnrollments = accountStatusFilter
        ? enrichedEnrollments.filter((enrollment) => enrollment.account.state === accountStatusFilter)
        : enrichedEnrollments

      return NextResponse.json(filteredEnrollments)
    }

    if (accountStatusFilter) {
      const allEnrollments = await prisma.enrollment.findMany({
        where,
        include: enrollmentInclude,
        orderBy: { createdAt: 'desc' },
      })

      const enrichedEnrollments = await attachEnrollmentAccountState(allEnrollments)
      const filteredEnrollments = enrichedEnrollments.filter(
        (enrollment) => enrollment.account.state === accountStatusFilter,
      )
      const totalItems = filteredEnrollments.length
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
      const paginatedEnrollments = filteredEnrollments.slice(skip, skip + pageSize)

      return NextResponse.json({
        enrollments: paginatedEnrollments,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        stats: buildEnrollmentStatsFromRows(filteredEnrollments),
      })
    }

    const [totalItems, enrollments, stats] = await Promise.all([
      prisma.enrollment.count({ where }),
      prisma.enrollment.findMany({
        where,
        include: enrollmentInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      buildEnrollmentStats(where),
    ])

    const enrichedEnrollments = await attachEnrollmentAccountState(enrollments)
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    return NextResponse.json({
      enrollments: enrichedEnrollments,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      stats,
    })
  } catch (error) {
    console.error('Enrollment GET error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation des inscriptions' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      motivationLetter,
      formationId,
      sessionId,
    } = body

    if (!firstName || !lastName || !email || !formationId) {
      return NextResponse.json(
        { error: 'Donnees manquantes (prenom, nom, email, formation)' },
        { status: 400 }
      )
    }

    const formation = await prisma.formation.findUnique({
      where: { id: parseInt(formationId) },
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvee' },
        { status: 404 }
      )
    }

    let status = 'pending'
    let onWaitlist = false
    let totalAmount = 0

    if (sessionId) {
      const session = await prisma.trainingSession.findUnique({
        where: { id: parseInt(sessionId) },
        include: {
          enrollments: {
            where: { status: { not: 'rejected' } },
          },
        },
      })

      if (!session) {
        return NextResponse.json(
          { error: 'Session non trouvee' },
          { status: 404 }
        )
      }

      const currentEnrollments = session.enrollments.length
      const isFull = currentEnrollments >= session.maxParticipants
      totalAmount = session.price || 0

      if (isFull) {
        status = 'waitlist'
        onWaitlist = true
      } else if (totalAmount <= 0) {
        status = 'confirmed'
      }
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const immediateAccessEnrollment = !onWaitlist && Boolean(sessionId) && totalAmount <= 0
    const registrationDate = new Date()

    const enrollment = await prisma.enrollment.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        phone: phone || null,
        address: address || null,
        motivationLetter: motivationLetter || null,
        formationId: parseInt(formationId),
        sessionId: sessionId ? parseInt(sessionId) : null,
        startDate: registrationDate,
        status,
        paymentStatus: immediateAccessEnrollment ? 'paid' : 'unpaid',
        totalAmount,
        paidAmount: 0,
        paymentDate: immediateAccessEnrollment ? registrationDate : null,
      },
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
            location: true,
            maxParticipants: true,
          },
        },
      },
    })

    const studentAccount = immediateAccessEnrollment
      ? await provisionStudentAccountFromEnrollment({
          enrollmentId: enrollment.id,
          appBaseUrl: resolveAppBaseUrl(req.url),
          source: 'public-enrollment-free',
        })
      : null

    return NextResponse.json(
      {
        ...enrollment,
        onWaitlist,
        studentAccount: studentAccount
          ? {
              state: studentAccount.accountStatus?.state || null,
              accountCreated: studentAccount.accountCreated,
              accountActivated: studentAccount.accountActivated,
            }
          : null,
        message: onWaitlist
          ? "Inscription en liste d'attente (session complete)"
          : immediateAccessEnrollment
          ? 'Inscription enregistree avec succes. Votre acces etudiant est en cours d activation.'
          : 'Inscription enregistree avec succes',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Enrollment POST error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Une inscription avec cet email existe deja pour cette formation' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Erreur lors de la creation de l'inscription" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { enrollmentId, status, paymentStatus, notes } = body

    if (!enrollmentId || !status) {
      return NextResponse.json(
        { error: "ID de l'inscription et statut requis" },
        { status: 400 }
      )
    }

    const oldEnrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) },
      include: {
        formation: true,
        session: true,
      },
    })

    if (!oldEnrollment) {
      return NextResponse.json(
        { error: 'Inscription non trouvee' },
        { status: 404 }
      )
    }

    const enrollment = await prisma.enrollment.update({
      where: { id: parseInt(enrollmentId) },
      data: {
        status,
        ...(paymentStatus && { paymentStatus }),
        ...(notes && { notes }),
      },
      include: {
        formation: true,
        session: true,
      },
    })

    if (oldEnrollment.status !== status) {
      let emailContent: { to: string; subject: string; html: string } | null = null

      switch (status) {
        case 'accepted':
          emailContent = {
            to: enrollment.email,
            subject: `Felicitations ! Votre inscription a ete acceptee - ${enrollment.formation.title}`,
            html: `
              <h2>Felicitations ${enrollment.firstName} ${enrollment.lastName} !</h2>
              <p>Votre inscription a la formation <strong>${enrollment.formation.title}</strong> a ete <strong>acceptee</strong>.</p>
              ${enrollment.session ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #0284c7;">
                <h3>Details de la session:</h3>
                <p><strong>Date:</strong> ${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')}</p>
                <p><strong>Lieu:</strong> ${enrollment.session.location}</p>
              </div>
              ` : ''}
              <p>Prochaines etapes:</p>
              <ul>
                <li>Confirmation de votre participation</li>
                <li>Effectuer le paiement si necessaire</li>
                <li>Recevoir les details d'acces a la plateforme</li>
              </ul>
            `,
          }
          break

        case 'rejected':
          emailContent = {
            to: enrollment.email,
            subject: `Votre inscription - ${enrollment.formation.title}`,
            html: `
              <h2>Bonjour ${enrollment.firstName} ${enrollment.lastName},</h2>
              <p>Malheureusement, votre inscription a la formation <strong>${enrollment.formation.title}</strong> n'a pas pu etre acceptee cette fois.</p>
              <p>Vous pouvez:</p>
              <ul>
                <li>Vous inscrire a une prochaine session</li>
                <li>Nous contacter pour discuter d'alternatives</li>
                <li>Consulter les autres formations disponibles</li>
              </ul>
            `,
          }
          break

        case 'confirmed':
          emailContent = {
            to: enrollment.email,
            subject: `Confirmation de participation - ${enrollment.formation.title}`,
            html: `
              <h2>Confirmation recue !</h2>
              <p>Nous avons bien recu la confirmation de votre participation a la formation <strong>${enrollment.formation.title}</strong>.</p>
              ${enrollment.session ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #16a34a;">
                <h3>Vous etes maintenant inscrit pour:</h3>
                <p><strong>Date:</strong> ${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')}</p>
                <p><strong>Lieu:</strong> ${enrollment.session.location}</p>
              </div>
              ` : ''}
              <p>Vous recevrez avant la date de la session:</p>
              <ul>
                <li>Les details d'acces a la plateforme</li>
                <li>Les ressources pedagogiques</li>
                <li>Un rappel de la date et heure</li>
              </ul>
            `,
          }
          break

        case 'waitlist':
          emailContent = {
            to: enrollment.email,
            subject: `Liste d'attente - ${enrollment.formation.title}`,
            html: `
              <h2>Liste d'attente</h2>
              <p>Bonjour ${enrollment.firstName},</p>
              <p>Votre inscription a la formation <strong>${enrollment.formation.title}</strong> a ete ajoutee a la <strong>liste d'attente</strong> car la session est actuellement complete.</p>
              <p>Vous serez notifie des qu'une place se liberera ou qu'une nouvelle session sera organisee.</p>
            `,
          }
          break
      }

      if (emailContent) {
        try {
          await sendEmail(emailContent)
        } catch (error) {
          console.error("Erreur lors de l'envoi de l'email:", error)
        }
      }
    }

    if (paymentStatus === 'unpaid' && oldEnrollment.paymentStatus !== 'unpaid') {
      try {
        await sendEmail({
          to: enrollment.email,
          subject: `Rappel: Paiement requis pour ${enrollment.formation.title}`,
          html: `
            <h2>Rappel de paiement</h2>
            <p>Bonjour ${enrollment.firstName},</p>
            <p>Nous avons remarque que le paiement pour votre inscription a <strong>${enrollment.formation.title}</strong> est requis.</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
              <p><strong>Montant a payer:</strong> $${(enrollment.totalAmount - enrollment.paidAmount).toLocaleString()}</p>
            </div>
            <p>Veuillez nous contacter pour effectuer le paiement.</p>
          `,
        })
      } catch (error) {
        console.error('Erreur envoi rappel paiement:', error)
      }
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Update enrollment error:', error)
    return NextResponse.json(
      { error: "Erreur lors de la mise a jour de l'inscription" },
      { status: 500 }
    )
  }
}





