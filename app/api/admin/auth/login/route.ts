import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth-portal/password'
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 })
    }

    const { username, password } = parsed.data
    const admin = await prisma.admin.findUnique({ where: { username } })

    if (!admin) {
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
