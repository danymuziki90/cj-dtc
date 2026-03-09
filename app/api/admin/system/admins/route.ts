import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { hashPassword } from '@/lib/auth-portal/password'

const createAdminSchema = z.object({
  username: z.string().trim().min(3).max(80),
  password: z.string().min(8).max(128),
})

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ admins })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const parsed = createAdminSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const username = parsed.data.username.toLowerCase()
  const password = await hashPassword(parsed.data.password)

  try {
    const admin = await prisma.admin.create({
      data: {
        username,
        password,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ admin }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Username already exists.' }, { status: 409 })
    }

    throw error
  }
}
