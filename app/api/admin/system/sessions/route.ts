import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

const sessionSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const sessions = await prisma.adminTrainingSession.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          students: true,
          submissions: true,
        },
      },
    },
  })

  return NextResponse.json({ sessions })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const payload = await request.json()
  const parsed = sessionSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const startDate = new Date(parsed.data.startDate)
  const endDate = new Date(parsed.data.endDate)
  if (endDate <= startDate) {
    return NextResponse.json({ error: 'endDate must be greater than startDate' }, { status: 400 })
  }

  const session = await prisma.adminTrainingSession.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      startDate,
      endDate,
    },
  })

  return NextResponse.json({ session }, { status: 201 })
}
