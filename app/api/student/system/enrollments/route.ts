import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { buildRateLimitIdentifier, consumeRateLimit } from '@/lib/auth-portal/rate-limit'

const enrollSchema = z.object({
  formationId: z.number().int().positive(),
  sessionId: z.number().int().positive().optional(),
})

const ENROLL_LIMIT = 10
const ENROLL_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const enrollments = await prisma.enrollment.findMany({
    where: {
      OR: [
        { studentId: auth.student.id },
        { email: { equals: auth.student.email, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      createdAt: true,
      formation: {
        select: { id: true, title: true, slug: true, categorie: true, imageUrl: true },
      },
    },
  })

  return NextResponse.json({ enrollments })
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const rateLimitKey = buildRateLimitIdentifier(request, auth.student.id)
  const rateLimit = consumeRateLimit({
    bucket: 'student-enroll',
    identifier: rateLimitKey,
    limit: ENROLL_LIMIT,
    windowMs: ENROLL_WINDOW_MS,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Trop de demandes. Veuillez réessayer dans une heure.' },
      { status: 429 }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = enrollSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Formation invalide.' }, { status: 400 })
  }

  const { formationId, sessionId } = parsed.data

  const formation = await prisma.formation.findUnique({
    where: { id: formationId },
    select: { id: true, title: true, statut: true },
  })

  if (!formation) {
    return NextResponse.json({ error: 'Formation introuvable.' }, { status: 404 })
  }

  if (formation.statut !== 'publie') {
    return NextResponse.json({ error: 'Cette formation n\'est pas disponible.' }, { status: 422 })
  }

  let session: { id: number; formationId: number } | null = null
  if (sessionId) {
    session = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      select: { id: true, formationId: true },
    })

    if (!session || session.formationId !== formationId) {
      return NextResponse.json({ error: 'Session invalide pour cette formation.' }, { status: 400 })
    }
  }

  // Prevent duplicate active requests for the same formation from the same student account.
  const existing = await prisma.enrollment.findFirst({
    where: {
      formationId,
      OR: [
        { studentId: auth.student.id },
        { email: { equals: auth.student.email, mode: 'insensitive' } },
      ],
      status: { notIn: ['rejected', 'cancelled'] },
    },
    select: { id: true, status: true },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Vous êtes déjà inscrit à cette formation.', enrollmentId: existing.id },
      { status: 409 }
    )
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: auth.student.id,
      firstName: auth.student.firstName,
      lastName: auth.student.lastName,
      email: auth.student.email,
      phone: auth.student.phone || null,
      address: auth.student.address || null,
      formationId,
      sessionId: session?.id || null,
      startDate: new Date(),
      status: 'pending',
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      formation: { select: { id: true, title: true, slug: true } },
    },
  })

  return NextResponse.json({ success: true, enrollment }, { status: 201 })
}
