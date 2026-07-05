import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth-portal/password'
import { buildRateLimitIdentifier, consumeRateLimit } from '@/lib/auth-portal/rate-limit'
import { ensurePortalSecretReady } from '@/lib/auth-portal/security'
import {
  STUDENT_AUTH_COOKIE,
  STUDENT_TOKEN_MAX_AGE,
  getAuthCookieOptions,
  signStudentToken,
} from '@/lib/auth-portal/jwt'

const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'Le prénom doit comporter au moins 2 caractères.'),
    lastName: z.string().trim().min(2, 'Le nom doit comporter au moins 2 caractères.'),
    email: z.string().trim().email('Adresse e-mail invalide.'),
    phone: z.string().trim().optional(),
    password: z
      .string()
      .min(8, 'Le mot de passe doit comporter au moins 8 caractères.')
      .max(128, 'Le mot de passe est trop long.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  })

const STUDENT_REGISTER_LIMIT = 5
const STUDENT_REGISTER_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function generateStudentNumber() {
  const time = Date.now().toString().slice(-8)
  const random = randomBytes(2).toString('hex')
  return `STU${time}${random}`
}

async function ensureUniqueUsername(base: string): Promise<string> {
  let candidate = base
  let suffix = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.student.findUnique({ where: { username: candidate } })
    if (!existing) return candidate
    candidate = `${base}${suffix}`
    suffix += 1
  }
}

function buildUsernameFromName(firstName: string, lastName: string) {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip accents
      .replace(/[^a-z0-9]/g, '')

  const base = `${clean(firstName)}.${clean(lastName)}`
  return base || `student.${randomBytes(2).toString('hex')}`
}

export async function POST(request: NextRequest) {
  try {
    ensurePortalSecretReady('STUDENT_JWT_SECRET')

    const body = await request.json().catch(() => null)

    // Rate-limit by IP + email to prevent mass account creation
    const rateLimitKey = buildRateLimitIdentifier(
      request,
      typeof body?.email === 'string' ? body.email : 'anonymous'
    )
    const rateLimit = consumeRateLimit({
      bucket: 'student-register',
      identifier: rateLimitKey,
      limit: STUDENT_REGISTER_LIMIT,
      windowMs: STUDENT_REGISTER_WINDOW_MS,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer dans une heure.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return NextResponse.json(
        { error: firstError?.message || 'Données invalides.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, phone, password } = parsed.data
    const normalizedEmail = email.toLowerCase()

    // Check for duplicate email
    const existing = await prisma.student.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cette adresse e-mail.' },
        { status: 409 }
      )
    }

    const usernameBase = buildUsernameFromName(firstName, lastName)
    const username = await ensureUniqueUsername(usernameBase)
    const hashedPassword = await hashPassword(password)
    const studentNumber = generateStudentNumber()

    const student = await prisma.student.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null,
        username,
        password: hashedPassword,
        studentNumber,
        status: 'ACTIVE', // self-registered students are immediately active
        role: 'STUDENT',
      },
    })

    // Issue JWT and log in the student immediately after registration
    const token = await signStudentToken({
      sub: student.id,
      studentId: student.id,
      username: student.username || student.email,
    })

    const response = NextResponse.json(
      {
        success: true,
        student: {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`.trim(),
          username: student.username,
        },
      },
      { status: 201 }
    )

    response.cookies.set(STUDENT_AUTH_COOKIE, token, getAuthCookieOptions(STUDENT_TOKEN_MAX_AGE))
    return response
  } catch (error) {
    console.error('Student registration error:', error)
    return NextResponse.json(
      { error: "L'inscription est temporairement indisponible. Veuillez réessayer." },
      { status: 503 }
    )
  }
}
