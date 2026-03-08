import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { hashPassword } from '@/lib/auth-portal/password'

const updateStudentSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  username: z.string().min(3),
  sessionId: z.string().optional().nullable(),
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const parsed = updateStudentSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const { firstName, lastName } = splitName(parsed.data.name)
  const updateData: Record<string, unknown> = {
    firstName,
    lastName,
    email: parsed.data.email,
    username: parsed.data.username,
    adminSessionId: parsed.data.sessionId || null,
  }

  let generatedPassword: string | null = null
  if (parsed.data.resetPassword) {
    generatedPassword = `std-reset-${Math.random().toString(36).slice(2, 8)}`
    updateData.password = await hashPassword(generatedPassword)
  }

  const student = await prisma.student.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      adminSessionId: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ student, generatedPassword })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  await prisma.student.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
