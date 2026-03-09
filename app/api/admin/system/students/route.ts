import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { hashPassword } from '@/lib/auth-portal/password'

const createStudentSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  sessionId: z.string().optional().nullable(),
})

function splitName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, ' ')
  const [firstName, ...rest] = cleaned.split(' ')
  return {
    firstName: firstName || 'Student',
    lastName: rest.join(' ') || 'Account',
  }
}

function generatePassword() {
  return `std-${randomBytes(4).toString('hex')}`
}

function buildCandidateUsername(name: string) {
  const candidate = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.')

  return candidate || `student.${randomBytes(2).toString('hex')}`
}

async function ensureUniqueUsername(baseUsername: string) {
  let candidate = baseUsername
  let suffix = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.student.findUnique({ where: { username: candidate } })
    if (!existing) return candidate
    candidate = `${baseUsername}${suffix}`
    suffix += 1
  }
}

function generateStudentNumber() {
  const time = Date.now().toString().slice(-8)
  const random = randomBytes(2).toString('hex')
  return `STU${time}${random}`
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      status: true,
      createdAt: true,
      adminSession: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  })

  const emails = Array.from(new Set(students.map((student) => student.email)))
  const latestEnrollments = emails.length
    ? await prisma.enrollment.findMany({
        where: {
          email: {
            in: emails,
          },
        },
        include: {
          session: {
            select: {
              id: true,
              startDate: true,
              location: true,
            },
          },
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
    : []

  const latestByEmail = latestEnrollments.reduce<Record<string, (typeof latestEnrollments)[number]>>(
    (acc, enrollment) => {
      if (!acc[enrollment.email]) acc[enrollment.email] = enrollment
      return acc
    },
    {}
  )

  const enrichedStudents = students.map((student) => {
    const enrollment = latestByEmail[student.email]
    return {
      ...student,
      latestEnrollment: enrollment
        ? {
            id: enrollment.id,
            status: enrollment.status,
            paymentStatus: enrollment.paymentStatus,
            paidAmount: enrollment.paidAmount,
            totalAmount: enrollment.totalAmount,
            formationTitle: enrollment.formation.title,
            session: enrollment.session,
          }
        : null,
    }
  })

  return NextResponse.json({ students: enrichedStudents })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const parsed = createStudentSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, email, sessionId } = parsed.data
  const { firstName, lastName } = splitName(name)
  const plainPassword = generatePassword()
  const hashedPassword = await hashPassword(plainPassword)

  const baseUsername = buildCandidateUsername(name)
  const username = await ensureUniqueUsername(baseUsername)

  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      studentNumber: generateStudentNumber(),
      status: 'ACTIVE',
      role: 'STUDENT',
      adminSessionId: sessionId || null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      createdAt: true,
      adminSessionId: true,
    },
  })

  return NextResponse.json(
    {
      student,
      credentials: {
        username,
        password: plainPassword,
      },
    },
    { status: 201 }
  )
}
