import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

const updateNotificationSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  message: z.string().trim().min(5).max(2000).optional(),
  type: z.enum(['info', 'reminder', 'correction', 'announcement']).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const parsed = updateNotificationSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  if (!parsed.data.title && !parsed.data.message && !parsed.data.type) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
  }

  try {
    const notification = await prisma.adminNotification.update({
      where: { id },
      data: parsed.data,
    })
    return NextResponse.json({ notification })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Notification not found.' }, { status: 404 })
    }

    throw error
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params

  try {
    await prisma.adminNotification.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Notification not found.' }, { status: 404 })
    }

    throw error
  }
}
