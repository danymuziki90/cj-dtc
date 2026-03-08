import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  ADMIN_AUTH_COOKIE,
  STUDENT_AUTH_COOKIE,
  verifyAdminToken,
  verifyStudentToken,
} from '@/lib/auth-portal/jwt'

export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const payload = await verifyAdminToken(token)
  if (!payload?.sub) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const admin = await prisma.admin.findUnique({
    where: { id: payload.sub },
    select: { id: true, username: true },
  })

  if (!admin) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { admin }
}

export async function requireStudent(request: NextRequest) {
  const token = request.cookies.get(STUDENT_AUTH_COOKIE)?.value
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const payload = await verifyStudentToken(token)
  if (!payload?.studentId) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const student = await prisma.student.findUnique({
    where: { id: payload.studentId },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      adminSessionId: true,
    },
  })

  if (!student) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { student }
}
