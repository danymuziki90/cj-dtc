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
  username: z.string().min(1, 'Identifiant requis.'),
  password: z.string().min(1, 'Mot de passe requis.'),
})

const STUDENT_LOGIN_LIMIT = 12
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
        { error: 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.' },
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
      return NextResponse.json({ error: "Nom d'utilisateur ou mot de passe obligatoire." }, { status: 400 })
    }

    const rawUsername = parsed.data.username.trim()
    const normalizedUsername = rawUsername.toLowerCase()

    let student = await prisma.student.findFirst({
      where: {
        OR: [
          { username: { equals: normalizedUsername, mode: 'insensitive' } },
          { email: { equals: normalizedUsername, mode: 'insensitive' } },
        ],
      },
    })

    // Si l'étudiant n'est pas encore dans la table Student mais existe dans la table User
    if (!student) {
      const user = await prisma.user.findFirst({
        where: { email: { equals: normalizedUsername, mode: 'insensitive' } },
      })
      if (user && user.password && (await verifyPassword(parsed.data.password, user.password))) {
        const nameParts = (user.name || 'Étudiant').trim().split(' ')
        const firstName = nameParts[0] || 'Étudiant'
        const lastName = nameParts.slice(1).join(' ') || firstName
        const studentNumber = `STU-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-6)}`

        student = await prisma.student.create({
          data: {
            firstName,
            lastName,
            email: user.email.toLowerCase(),
            username: user.email.toLowerCase().split('@')[0],
            password: user.password,
            studentNumber,
            status: 'ACTIVE',
            role: 'STUDENT',
          },
        })
      }
    }

    if (!student) {
      return NextResponse.json({ error: "Nom d'utilisateur ou mot de passe incorrect. Veuillez réessayer." }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(parsed.data.password, student.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Nom d'utilisateur ou mot de passe incorrect. Veuillez réessayer." }, { status: 401 })
    }

    if (student.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Votre compte étudiant est suspendu. Veuillez contacter l administration.' },
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
      token,
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`.trim(),
        username: student.username,
        email: student.email,
        role: student.role,
      },
    })

    response.cookies.set(STUDENT_AUTH_COOKIE, token, getAuthCookieOptions(STUDENT_TOKEN_MAX_AGE))
    return response
  } catch (error) {
    console.error('Student login error:', error)
    return NextResponse.json(
      { error: "Service de connexion temporairement indisponible. Veuillez réessayer." },
      { status: 500 }
    )
  }
}
