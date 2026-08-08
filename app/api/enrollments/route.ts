import { NextRequest, NextResponse } from 'next/server'
import { apiHandler, ApiError } from '@/lib/api-error'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { deriveEnrollmentAccountState, provisionStudentAccountFromEnrollment } from '../../../lib/student/account-provisioning'
import { resolveAppBaseUrl, sendEmail } from '../../../lib/email'
import { signStudentToken, STUDENT_AUTH_COOKIE, STUDENT_TOKEN_MAX_AGE, getAuthCookieOptions } from '../../../lib/auth-portal/jwt'
import { requireAdmin } from '@/lib/auth-portal/guards'

const publicEnrollmentSchema = z.object({
  firstName: z.string().trim().min(2, 'Le prénom est requis.'),
  lastName: z.string().trim().min(2, 'Le nom est requis.'),
  email: z.string().trim().email('Format d\'email invalide.'),
  phone: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  motivationLetter: z.string().trim().optional().nullable(),
  formationId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  sessionId: z.union([z.number(), z.string()]).transform(val => val ? Number(val) : null).optional().nullable(),
})

const adminEnrollmentUpdateSchema = z.object({
  enrollmentId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  status: z.string().trim().min(2, 'Le statut est requis.'),
  notes: z.string().trim().optional().nullable(),
})

export const runtime = 'nodejs'

type EnrollmentWhere = Record<string, any>

function buildEnrollmentWhere(url: URL): EnrollmentWhere {
  const formationId = url.searchParams.get('formationId')
  const sessionId = url.searchParams.get('sessionId')
  const status = url.searchParams.get('status')
  const startDateFrom = url.searchParams.get('startDateFrom')
  const startDateTo = url.searchParams.get('startDateTo')
  const search = url.searchParams.get('search')?.trim()

  const where: EnrollmentWhere = {}
  if (formationId) where.formationId = parseInt(formationId)
  if (sessionId) where.sessionId = parseInt(sessionId)
  if (status) where.status = status
  if (startDateFrom || startDateTo) {
    where.createdAt = {}
    if (startDateFrom) where.createdAt.gte = new Date(startDateFrom)
    if (startDateTo) where.createdAt.lte = new Date(startDateTo)
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

async function attachEnrollmentAccountState(enrollments: any[]) {
  const students = await findStudentsForEmails(enrollments.map((enrollment) => enrollment.email))
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
        studentId: student?.id || null,
        username: student?.username || null,
      },
    }
  })
}

function buildEnrollmentStatsFromRows(rows: any[]) {
  const byStatus: Record<string, number> = {}
  const byAccountStatus: Record<string, number> = {}
  const byFormation = new Map<number, { id: number; title: string; count: number }>()

  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] || 0) + 1
    if (row.account?.state) {
      byAccountStatus[row.account.state] = (byAccountStatus[row.account.state] || 0) + 1
    }

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
    byAccountStatus,
    byFormation: Array.from(byFormation.values()).sort((left, right) => right.count - left.count),
  }
}

async function buildEnrollmentStats(where: EnrollmentWhere) {
  const rows = await prisma.enrollment.findMany({
    where,
    select: {
      status: true,
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
}

export const GET = apiHandler(async (req: NextRequest) => {
  const auth = await requireAdmin(req)
  if (auth.error) throw new ApiError(403, "Accès non autorisé")

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
})

export const POST = apiHandler(async (req: NextRequest) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    motivationLetter,
    formationId,
    sessionId,
  } = publicEnrollmentSchema.parse(await req.json())

    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvee' },
        { status: 404 }
      )
    }

    // Depuis la refonte 2026 : tout étudiant qui s'inscrit est immédiatement actif.
    let status = 'confirmed'
    let onWaitlist = false

    if (sessionId) {
      const session = await prisma.trainingSession.findUnique({
        where: { id: sessionId },
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

      if (isFull) {
        status = 'waitlist'
        onWaitlist = true
      }
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const immediateAccessEnrollment = !onWaitlist && Boolean(sessionId)
    const registrationDate = new Date()

    const enrollment = await prisma.enrollment.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        phone: phone || null,
        address: address || null,
        motivationLetter: motivationLetter || null,
        formationId,
        sessionId,
        startDate: registrationDate,
        status,
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
          source: 'public-enrollment-auto',
        })
      : null

    const response = NextResponse.json(
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
          ? "Inscription en liste d'attente (session complète)"
          : immediateAccessEnrollment
          ? "Inscription enregistrée avec succès. Redirection..."
          : 'Inscription enregistree avec succes',
      },
      { status: 201 }
    )

    if (studentAccount?.student?.id) {
      try {
        const token = await signStudentToken({
          sub: studentAccount.student.id,
          studentId: studentAccount.student.id,
          username: studentAccount.student.username || studentAccount.student.email,
        })
        response.cookies.set(STUDENT_AUTH_COOKIE, token, getAuthCookieOptions(STUDENT_TOKEN_MAX_AGE))
      } catch (tokenError) {
        console.error('Error signing auto-login token:', tokenError)
      }
    }

  return response
})

export const PATCH = apiHandler(async (req: NextRequest) => {
  const auth = await requireAdmin(req)
  if (auth.error) throw new ApiError(403, "Accès non autorisé")

  const { enrollmentId, status, notes } = adminEnrollmentUpdateSchema.parse(await req.json())

    const oldEnrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
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
      where: { id: enrollmentId },
      data: {
        status,
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

  return NextResponse.json(enrollment)
})
