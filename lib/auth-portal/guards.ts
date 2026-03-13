import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  ADMIN_AUTH_COOKIE,
  STUDENT_AUTH_COOKIE,
  verifyAdminToken,
  verifyStudentToken,
} from '@/lib/auth-portal/jwt'
import { isEmergencyAdminLoginAllowed } from '@/lib/auth-portal/security'

export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const payload = await verifyAdminToken(token)
  if (!payload?.sub) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const prismaAny = prisma as any
  const allowEmergencyAccess = isEmergencyAdminLoginAllowed()

  try {
    if (prismaAny.admin?.findUnique) {
      const admin = await prismaAny.admin.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true },
      })

      if (admin) {
        return { admin }
      }
    }
  } catch (error) {
    console.error('requireAdmin DB lookup failed, using token fallback:', error)
  }

  if (!allowEmergencyAccess) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // Fallback mode for environments where Admin model/table is not ready.
  return {
    admin: {
      id: payload.sub,
      username: payload.username,
    },
  }
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
      status: true,
      phone: true,
      address: true,
      city: true,
      country: true,
      createdAt: true,
      adminSessionId: true,
    },
  })

  if (!student) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (student.status !== 'ACTIVE') {
    return {
      error: NextResponse.json(
        { error: 'Compte etudiant inactif. Veuillez contacter l administration.' },
        { status: 403 }
      ),
    }
  }

  return { student }
}
