import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

const notificationSchema = z.object({
  title: z.string().trim().min(3).max(160),
  message: z.string().trim().min(5).max(2000),
  type: z.enum(['info', 'reminder', 'correction', 'announcement']).default('info'),
  target: z.enum(['all', 'student', 'session']).default('all'),
  studentEmail: z.string().email().optional().nullable(),
  sessionId: z.number().int().positive().optional().nullable(),
})

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { searchParams } = request.nextUrl
  const type = searchParams.get('type')
  const target = searchParams.get('target')
  const studentEmail = searchParams.get('studentEmail')
  const sessionId = searchParams.get('sessionId')
  const search = (searchParams.get('search') || '').trim()

  const where: any = {}
  if (type && type !== 'all') where.type = type
  if (target && target !== 'all') where.target = target
  if (studentEmail) where.studentEmail = studentEmail
  if (sessionId) where.sessionId = Number(sessionId)
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
      { studentEmail: { contains: search, mode: 'insensitive' } },
    ]
  }

  const notifications = await prisma.adminNotification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json({ notifications })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const parsed = notificationSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.target === 'student' && !parsed.data.studentEmail) {
    return NextResponse.json({ error: 'studentEmail is required for student target.' }, { status: 400 })
  }

  if (parsed.data.target === 'session' && !parsed.data.sessionId) {
    return NextResponse.json({ error: 'sessionId is required for session target.' }, { status: 400 })
  }

  const notification = await prisma.adminNotification.create({
    data: {
      title: parsed.data.title,
      message: parsed.data.message,
      type: parsed.data.type,
      target: parsed.data.target,
      studentEmail: parsed.data.studentEmail || null,
      sessionId: parsed.data.sessionId || null,
      createdBy: auth.admin.username,
    },
  })

  return NextResponse.json({ notification }, { status: 201 })
}
