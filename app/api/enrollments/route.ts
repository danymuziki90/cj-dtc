import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { sendEmail } from '../../../lib/email'

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

async function buildEnrollmentStats(where: EnrollmentWhere) {
  const [statusGroups, paymentGroups, revenue, formationGroups] = await Promise.all([
    prisma.enrollment.groupBy({
      by: ['status'],
      _count: { _all: true },
      where,
    }),
    prisma.enrollment.groupBy({
      by: ['paymentStatus'],
      _count: { _all: true },
      where,
    }),
    prisma.enrollment.aggregate({
      where,
      _sum: {
        totalAmount: true,
        paidAmount: true,
      },
    }),
    prisma.enrollment.groupBy({
      by: ['formationId'],
      _count: { _all: true },
      where,
    }),
  ])

  const formations = formationGroups.length
    ? await prisma.formation.findMany({
        where: {
          id: { in: formationGroups.map((group) => group.formationId) },
        },
        select: {
          id: true,
          title: true,
        },
      })
    : []

  const formationMap = new Map(formations.map((formation) => [formation.id, formation.title]))

  return {
    total: statusGroups.reduce((sum, group) => sum + group._count._all, 0),
    byStatus: statusGroups.reduce<Record<string, number>>((acc, group) => {
      acc[group.status] = group._count._all
      return acc
    }, {}),
    byPaymentStatus: paymentGroups.reduce<Record<string, number>>((acc, group) => {
      acc[group.paymentStatus] = group._count._all
      return acc
    }, {}),
    revenue: {
      totalAmount: revenue._sum.totalAmount || 0,
      paidAmount: revenue._sum.paidAmount || 0,
    },
    byFormation: formationGroups
      .map((group) => ({
        id: group.formationId,
        title: formationMap.get(group.formationId) || `Formation ${group.formationId}`,
        count: group._count._all,
      }))
      .sort((left, right) => right.count - left.count),
  }
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

      return NextResponse.json(enrollments)
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

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    return NextResponse.json({
      enrollments,
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
      { status: 500 }
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
      }
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        motivationLetter: motivationLetter || null,
        formationId: parseInt(formationId),
        sessionId: sessionId ? parseInt(sessionId) : null,
        startDate: new Date(),
        status,
        totalAmount,
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

    return NextResponse.json(
      {
        ...enrollment,
        onWaitlist,
        message: onWaitlist
          ? "Inscription en liste d'attente (session complete)"
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
