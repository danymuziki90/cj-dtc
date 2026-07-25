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

  const sessions = await prisma.trainingSession.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      formation: { select: { id: true, title: true } },
      _count: {
        select: {
          enrollments: true,
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

  // Ensure default formation exists or fetch first formation
  const formation = await prisma.formation.findFirst()
  if (!formation) {
    return NextResponse.json({ error: 'No formation available to attach session.' }, { status: 400 })
  }

  const session = await prisma.trainingSession.create({
    data: {
      formationId: formation.id,
      description: parsed.data.description,
      startDate,
      endDate,
      startTime: '09:00',
      endTime: '17:00',
      format: 'presentiel',
    },
  })

  return NextResponse.json({ session }, { status: 201 })
}
