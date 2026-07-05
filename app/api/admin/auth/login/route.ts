import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth-portal/password'
import { buildRateLimitIdentifier, consumeRateLimit } from '@/lib/auth-portal/rate-limit'
import { ensurePortalSecretReady, isEmergencyAdminLoginAllowed } from '@/lib/auth-portal/security'
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_TOKEN_MAX_AGE,
  getAuthCookieOptions,
  signAdminToken,
} from '@/lib/auth-portal/jwt'

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_DEFAULT_USERNAME || 'admincjtc'
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'admin@123'
const ADMIN_LOGIN_LIMIT = 5
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    ensurePortalSecretReady('ADMIN_JWT_SECRET')

    const body = await request.json().catch(() => null)
    const rateLimitKey = buildRateLimitIdentifier(
      request,
      typeof body?.username === 'string' ? body.username : 'anonymous'
    )
    const rateLimit = consumeRateLimit({
      bucket: 'admin-login',
      identifier: rateLimitKey,
      limit: ADMIN_LOGIN_LIMIT,
      windowMs: ADMIN_LOGIN_WINDOW_MS,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives de connexion admin. Veuillez reessayer plus tard.' },
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
      return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 })
    }

    const { username, password } = parsed.data
    const prismaAny = prisma as any
    let admin: { id: string; username: string; password: string } | null = null
    let dbUnavailable = false

    // Primary source: dedicated Admin table.
    try {
      if (prismaAny.admin?.findUnique) {
        const adminRecord = await prismaAny.admin.findUnique({ where: { username } })
        if (adminRecord?.password) {
          admin = {
            id: adminRecord.id,
            username: adminRecord.username,
            password: adminRecord.password,
          }
        }
      }
    } catch (error) {
      dbUnavailable = true
      console.error('Admin login lookup (admin table) failed:', error)
    }

    // Compatibility fallback: legacy User table admin account.
    if (!admin) {
      try {
        if (prismaAny.user?.findFirst) {
          const legacyUser = await prismaAny.user.findFirst({
            where: {
              role: 'ADMIN',
              OR: [{ email: username }, { name: username }],
            },
          })

          if (legacyUser?.password) {
            admin = {
              id: legacyUser.id,
              username: legacyUser.email || legacyUser.name || username,
              password: legacyUser.password,
            }
          }
        }
      } catch (error) {
        dbUnavailable = true
        console.error('Admin login lookup (legacy user table) failed:', error)
      }
    }

    if (!admin) {
      // Controlled emergency fallback when DB/models are unavailable.
      if (
        isEmergencyAdminLoginAllowed() &&
        dbUnavailable &&
        username === DEFAULT_ADMIN_USERNAME &&
        password === DEFAULT_ADMIN_PASSWORD
      ) {
        const token = await signAdminToken({
          sub: 'local-default-admin',
          username: DEFAULT_ADMIN_USERNAME,
        })

        const response = NextResponse.json({
          success: true,
          admin: { id: 'local-default-admin', username: DEFAULT_ADMIN_USERNAME },
          fallback: true,
        })
        response.cookies.set(ADMIN_AUTH_COOKIE, token, getAuthCookieOptions(ADMIN_TOKEN_MAX_AGE))
        return response
      }

      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, admin.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const token = await signAdminToken({
      sub: admin.id,
      username: admin.username,
    })

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, username: admin.username },
    })

    response.cookies.set(ADMIN_AUTH_COOKIE, token, getAuthCookieOptions(ADMIN_TOKEN_MAX_AGE))
    return response
  } catch (error) {
    console.error('Admin login error:', error)

    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return NextResponse.json(
        { error: 'Authentification admin indisponible. Verifiez les secrets JWT.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Server error: admin login temporarily unavailable. Check database/migrations.' },
      { status: 500 }
    )
  }
}
