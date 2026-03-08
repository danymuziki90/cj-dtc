import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth-portal/password'
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

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 })
  }

  const student = await prisma.student.findUnique({
    where: { username: parsed.data.username },
  })

  if (!student) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const isValidPassword = await verifyPassword(parsed.data.password, student.password)
  if (!isValidPassword) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
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
}
