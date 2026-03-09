import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { hashPassword, verifyPassword } from '@/lib/auth-portal/password'

const resetPasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8).max(128),
})

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  if (auth.admin.id === 'local-default-admin') {
    return NextResponse.json(
      { error: 'Password reset is unavailable for emergency login account.' },
      { status: 400 }
    )
  }

  const parsed = resetPasswordSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const admin = await prisma.admin.findUnique({
    where: { id: auth.admin.id },
    select: { id: true, password: true },
  })

  if (!admin) {
    return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 })
  }

  const validCurrentPassword = await verifyPassword(parsed.data.currentPassword, admin.password)
  if (!validCurrentPassword) {
    return NextResponse.json({ error: 'Current password is invalid.' }, { status: 401 })
  }

  const password = await hashPassword(parsed.data.newPassword)
  await prisma.admin.update({
    where: { id: admin.id },
    data: { password },
  })

  return NextResponse.json({ success: true })
}
