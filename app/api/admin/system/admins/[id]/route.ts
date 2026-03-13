import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { hashPassword } from '@/lib/auth-portal/password'

const updateAdminSchema = z.object({
  username: z.string().trim().min(3).max(80).optional(),
  password: z.string().min(8).max(128).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const parsed = updateAdminSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  if (!parsed.data.username && !parsed.data.password) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
    },
  })

  if (!existingAdmin) {
    return NextResponse.json({ error: 'Admin not found.' }, { status: 404 })
  }

  const data: { username?: string; password?: string } = {}

  if (parsed.data.username) {
    data.username = parsed.data.username.toLowerCase()
  }

  if (parsed.data.password) {
    data.password = await hashPassword(parsed.data.password)
  }

  try {
    const admin = await prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (parsed.data.username && parsed.data.username.toLowerCase() !== existingAdmin.username) {
      await writeAdminAuditLog({
        request,
        adminId: auth.admin.id,
        adminUsername: auth.admin.username,
        action: 'admin.rename',
        targetType: 'admin',
        targetId: admin.id,
        targetLabel: admin.username,
        summary: `Username admin modifie de ${existingAdmin.username} vers ${admin.username}.`,
      })
    }

    if (parsed.data.password) {
      await writeAdminAuditLog({
        request,
        adminId: auth.admin.id,
        adminUsername: auth.admin.username,
        action: 'admin.password_reset',
        targetType: 'admin',
        targetId: admin.id,
        targetLabel: admin.username,
        summary: `Mot de passe admin reinitialise pour ${admin.username}.`,
      })
    }

    return NextResponse.json({ admin })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Username already exists.' }, { status: 409 })
    }
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Admin not found.' }, { status: 404 })
    }

    throw error
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  if (auth.admin.id === id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id },
      select: { id: true, username: true },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found.' }, { status: 404 })
    }

    await prisma.admin.delete({ where: { id } })

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'admin.delete',
      targetType: 'admin',
      targetId: admin.id,
      targetLabel: admin.username,
      summary: `Compte administrateur supprime pour ${admin.username}.`,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Admin not found.' }, { status: 404 })
    }

    throw error
  }
}
