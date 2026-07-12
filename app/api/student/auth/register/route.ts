import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
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
    fullName: z.string().trim().min(2, 'Le nom complet doit comporter au moins 2 caracteres.'),
    email: z.string().trim().email('Adresse e-mail invalide.'),
    username: z
      .string()
      .trim()
      .min(3, 'Le nom d utilisateur doit comporter au moins 3 caracteres.')
      .max(40, 'Le nom d utilisateur est trop long.')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Utilisez uniquement lettres, chiffres, point, tiret ou underscore.'),
    phone: z.string().trim().optional(),
    city: z.string().trim().optional(),
    country: z.string().trim().optional(),
    password: z
      .string()
      .min(8, 'Le mot de passe doit comporter au moins 8 caracteres.')
      .max(128, 'Le mot de passe est trop long.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  })

const STUDENT_REGISTER_LIMIT = 5
const STUDENT_REGISTER_WINDOW_MS = 60 * 60 * 1000

function generateStudentNumber() {
  const time = Date.now().toString().slice(-8)
  const random = randomBytes(2).toString('hex')
  return `STU${time}${random}`
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().replace(/\s+/g, ' ').split(' ')
  const firstName = parts.shift() || fullName.trim()
  const lastName = parts.join(' ') || firstName
  return { firstName, lastName }
}

function logStudentRegistrationError(error: unknown, context: Record<string, unknown> = {}) {
  console.error('Student registration failed:', {
    scope: 'student-registration',
    ...context,
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : String(error),
  })
}

export async function POST(request: NextRequest) {
  try {
    ensurePortalSecretReady('STUDENT_JWT_SECRET')

    const body = await request.json().catch(() => null)
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
        { error: 'Trop de tentatives. Veuillez reessayer dans une heure.' },
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
        { error: firstError?.message || 'Donnees invalides.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { fullName, email, username, phone, city, country, password } = parsed.data
    const normalizedEmail = email.toLowerCase()
    const normalizedUsername = username.trim().toLowerCase()
    const { firstName, lastName } = splitFullName(fullName)

    const existing = await prisma.student.findFirst({
      where: {
        OR: [
          { email: { equals: normalizedEmail, mode: 'insensitive' } },
          { username: { equals: normalizedUsername, mode: 'insensitive' } },
        ],
      },
      select: { id: true, email: true, username: true },
    })

    if (existing) {
      const isEmailMatch = existing.email.toLowerCase() === normalizedEmail
      return NextResponse.json(
        {
          error: isEmailMatch
            ? 'Un compte existe deja avec cette adresse e-mail.'
            : 'Ce nom d utilisateur est deja utilise.',
        },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const studentNumber = generateStudentNumber()

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        phone: phone?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || null,
        username: normalizedUsername,
        password: hashedPassword,
        studentNumber,
        status: 'ACTIVE',
        role: 'STUDENT',
      },
    })

    const token = await signStudentToken({
      sub: student.id,
      studentId: student.id,
      username: student.username || student.email,
    })

    const response = NextResponse.json(
      {
        success: true,
        token,
        message: 'Compte cree avec succes. Vous etes connecte.',
        student: {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`.trim(),
          username: student.username,
          email: student.email,
          role: student.role,
        },
      },
      { status: 201 }
    )

    response.cookies.set(STUDENT_AUTH_COOKIE, token, getAuthCookieOptions(STUDENT_TOKEN_MAX_AGE))
    return response
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      logStudentRegistrationError(error, {
        phase: 'create-student',
        target: error.meta?.target,
      })

      return NextResponse.json(
        { error: 'Un compte existe deja avec cette adresse e-mail ou ce nom d utilisateur.' },
        { status: 409 }
      )
    }

    logStudentRegistrationError(error)
    return NextResponse.json(
      { error: "L'inscription est temporairement indisponible. Veuillez reessayer." },
      { status: 503 }
    )
  }
}
