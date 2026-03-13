import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth-portal/password'
import { buildRateLimitIdentifier, consumeRateLimit } from '@/lib/auth-portal/rate-limit'
import { ensurePortalSecretReady } from '@/lib/auth-portal/security'
import {
  STUDENT_AUTH_COOKIE,
  STUDENT_TOKEN_MAX_AGE,
  getAuthCookieOptions,
  signStudentToken,
} from '@/lib/auth-portal/jwt'

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

const STUDENT_LOGIN_LIMIT = 8
const STUDENT_LOGIN_WINDOW_MS = 15 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    ensurePortalSecretReady('STUDENT_JWT_SECRET')

    const body = await request.json().catch(() => null)
    const rateLimitKey = buildRateLimitIdentifier(
      request,
      typeof body?.username === 'string' ? body.username : 'anonymous'
    )
    const rateLimit = consumeRateLimit({
      bucket: 'student-login',
      identifier: rateLimitKey,
      limit: STUDENT_LOGIN_LIMIT,
      windowMs: STUDENT_LOGIN_WINDOW_MS,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives de connexion. Veuillez reessayer plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        }
      )
    }

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Nom d'utilisateur ou mot de passe incorrect. Veuillez reessayer." }, { status: 400 })
    }

    const normalizedUsername = parsed.data.username.trim().toLowerCase()
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { username: { equals: normalizedUsername, mode: 'insensitive' } },
          { email: { equals: normalizedUsername, mode: 'insensitive' } },
        ],
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Nom d'utilisateur ou mot de passe incorrect. Veuillez reessayer." }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(parsed.data.password, student.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Nom d'utilisateur ou mot de passe incorrect. Veuillez reessayer." }, { status: 401 })
    }

    if (student.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error:
            student.status === 'SUSPENDED'
              ? 'Votre compte etudiant est suspendu. Contactez l administration.'
              : 'Votre compte etudiant est en attente d activation.',
        },
        { status: 403 }
      )
    }

    const token = await signStudentToken({
      sub: student.id,
      studentId: student.id,
      username: student.username || student.email,
    })

    const response = NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`.trim(),
        username: student.username,
      },
    })

    response.cookies.set(STUDENT_AUTH_COOKIE, token, getAuthCookieOptions(STUDENT_TOKEN_MAX_AGE))
    return response
  } catch (error) {
    console.error('Student login error:', error)
    return NextResponse.json(
      { error: "Authentification etudiant indisponible. Verifiez la configuration de securite." },
      { status: 503 }
    )
  }
}
