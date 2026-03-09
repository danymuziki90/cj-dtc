import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth-portal/password'

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

export async function createStudentPasswordResetToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const student = await prisma.student.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true },
  })

  if (!student) {
    return {
      found: false as const,
      rawToken: null,
      studentId: null,
      email: normalizedEmail,
    }
  }

  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)

  await prisma.passwordResetToken.deleteMany({
    where: { studentId: student.id },
  })

  await prisma.passwordResetToken.create({
    data: {
      token: tokenHash,
      studentId: student.id,
      expiresAt,
    },
  })

  return {
    found: true as const,
    rawToken,
    studentId: student.id,
    email: student.email,
  }
}

export async function resetStudentPasswordFromToken(params: {
  token: string
  newPassword: string
  syncUserPassword?: boolean
}) {
  const tokenHash = crypto.createHash('sha256').update(params.token).digest('hex')
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
    include: {
      student: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  })

  if (!resetToken) {
    return { ok: false as const, reason: 'invalid' as const }
  }

  if (new Date() > resetToken.expiresAt) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
    return { ok: false as const, reason: 'expired' as const }
  }

  const hashedPassword = await hashPassword(params.newPassword)
  const operations: any[] = [
    prisma.student.update({
      where: { id: resetToken.studentId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { studentId: resetToken.studentId },
    }),
  ]

  if (params.syncUserPassword) {
    const user = await prisma.user.findUnique({
      where: { email: resetToken.student.email },
      select: { id: true },
    })

    if (user) {
      operations.push(
        prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        })
      )
    }
  }

  await prisma.$transaction(operations)
  return { ok: true as const, studentId: resetToken.studentId }
}
