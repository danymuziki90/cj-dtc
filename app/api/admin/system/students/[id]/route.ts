import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { hashPassword } from '@/lib/auth-portal/password'
import { resolveAppBaseUrl, sendStudentPortalAccessEmail, withEmailTimeout } from '@/lib/email'

const updateStudentSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  username: z.string().min(3),
  sessionId: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']).optional(),
  resetPassword: z.boolean().optional(),
})

function splitName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, ' ')
  const [firstName, ...rest] = cleaned.split(' ')
  return {
    firstName: firstName || 'Student',
    lastName: rest.join(' ') || 'Account',
  }
}

function generateResetPassword() {
  return `std-reset-${randomBytes(4).toString('hex')}`
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const parsed = updateStudentSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const existingStudent = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      status: true,
      adminSessionId: true,
    },
  })

  if (!existingStudent) {
    return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
  }

  const assignedSession = parsed.data.sessionId
    ? await prisma.adminTrainingSession.findUnique({
        where: { id: parsed.data.sessionId },
        select: { id: true, title: true },
      })
    : null

  if (parsed.data.sessionId && !assignedSession) {
    return NextResponse.json({ error: 'Selected session was not found.' }, { status: 400 })
  }

  const { firstName, lastName } = splitName(parsed.data.name)
  const updateData: Record<string, unknown> = {
    firstName,
    lastName,
    email: parsed.data.email.trim().toLowerCase(),
    username: parsed.data.username,
    adminSessionId: assignedSession?.id || null,
  }

  if (parsed.data.status) {
    updateData.status = parsed.data.status
  }

  let generatedPassword: string | null = null
  if (parsed.data.resetPassword) {
    generatedPassword = generateResetPassword()
    updateData.password = await hashPassword(generatedPassword)
  }

  let student: {
    id: string
    firstName: string
    lastName: string
    email: string
    username: string | null
    status: string
    adminSessionId: string | null
    updatedAt: Date
  }

  try {
    student = await prisma.student.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        status: true,
        adminSessionId: true,
        updatedAt: true,
      },
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email or username already exists.' }, { status: 409 })
    }

    throw error
  }

  let credentialsEmailSent = false
  let credentialsEmailError: string | null = null

  if (generatedPassword && student.username) {
    try {
      await withEmailTimeout(
        sendStudentPortalAccessEmail({
          to: student.email,
          fullName: `${student.firstName} ${student.lastName}`.trim(),
          username: student.username,
          password: generatedPassword,
          appBaseUrl: resolveAppBaseUrl(request.url),
          sessionTitle: assignedSession?.title || null,
        })
      )
      credentialsEmailSent = true
    } catch (error) {
      credentialsEmailError = 'Unable to send credentials email automatically.'
      console.error('Student reset credentials email failed:', error)
    }
  }

  const fullName = `${student.firstName} ${student.lastName}`.trim()
  const metadata = {
    previousEmail: existingStudent.email,
    nextEmail: student.email,
    previousUsername: existingStudent.username,
    nextUsername: student.username,
    previousStatus: existingStudent.status,
    nextStatus: student.status,
    previousAdminSessionId: existingStudent.adminSessionId,
    nextAdminSessionId: student.adminSessionId,
    credentialsEmailSent,
  }

  if (parsed.data.resetPassword) {
    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'student.password_reset',
      targetType: 'student',
      targetId: student.id,
      targetLabel: fullName,
      summary: `Mot de passe reinitialise pour ${student.email}.`,
      metadata,
    })
  }

  if (parsed.data.status && parsed.data.status !== existingStudent.status) {
    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'student.status_change',
      targetType: 'student',
      targetId: student.id,
      targetLabel: fullName,
      summary: `Statut etudiant modifie de ${existingStudent.status} vers ${student.status}.`,
      metadata,
    })
  }

  if (
    student.email !== existingStudent.email ||
    student.username !== existingStudent.username ||
    student.adminSessionId !== existingStudent.adminSessionId ||
    student.firstName !== existingStudent.firstName ||
    student.lastName !== existingStudent.lastName
  ) {
    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'student.update',
      targetType: 'student',
      targetId: student.id,
      targetLabel: fullName,
      summary: `Profil etudiant mis a jour pour ${student.email}.`,
      metadata,
    })
  }

  return NextResponse.json({
    student,
    generatedPassword,
    notifications: {
      credentialsEmailSent,
      credentialsEmailError,
    },
  })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const student = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      status: true,
    },
  })

  if (!student) {
    return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
  }

  await prisma.student.delete({ where: { id } })

  await writeAdminAuditLog({
    request,
    adminId: auth.admin.id,
    adminUsername: auth.admin.username,
    action: 'student.delete',
    targetType: 'student',
    targetId: student.id,
    targetLabel: `${student.firstName} ${student.lastName}`.trim(),
    summary: `Compte etudiant supprime pour ${student.email}.`,
    metadata: {
      email: student.email,
      username: student.username,
      status: student.status,
    },
  })

  return NextResponse.json({ success: true })
}
