import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

const updateSessionSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const session = await prisma.adminTrainingSession.findUnique({
    where: { id },
    include: { _count: { select: { students: true, submissions: true } } },
  })

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json({ session })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const parsed = updateSessionSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const startDate = new Date(parsed.data.startDate)
  const endDate = new Date(parsed.data.endDate)
  if (endDate <= startDate) {
    return NextResponse.json({ error: 'endDate must be greater than startDate' }, { status: 400 })
  }

  const session = await prisma.adminTrainingSession.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      startDate,
      endDate,
    },
  })

  return NextResponse.json({ session })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  await prisma.adminTrainingSession.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
