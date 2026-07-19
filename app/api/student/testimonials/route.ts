import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error
  const testimonials = await prisma.testimonial.findMany({
    where: { studentId: auth.student.id },
    include: { formation: { select: { title: true } }, session: { select: { id: true, startDate: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(testimonials)
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error
  const body = await request.json()
  const quote = String(body.quote || '').trim()
  const formationId = Number(body.formationId)
  const sessionId = Number(body.sessionId)
  const rating = Number(body.rating)
  if (!quote || !Number.isInteger(formationId) || !Number.isInteger(sessionId) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Le témoignage, la formation, la session et une note de 1 à 5 sont requis.' }, { status: 400 })
  }
  const enrollment = await prisma.enrollment.findFirst({
    where: { sessionId, formationId, OR: [{ studentId: auth.student.id }, { email: { equals: auth.student.email, mode: 'insensitive' } }] },
    select: { id: true },
  })
  if (!enrollment) return NextResponse.json({ error: 'Cette session ne fait pas partie de vos inscriptions.' }, { status: 403 })
  const testimonial = await prisma.testimonial.create({
    data: {
      name: `${auth.student.firstName} ${auth.student.lastName}`,
      title: String(body.title || '').trim() || null,
      quote,
      rating,
      formationId,
      sessionId,
      studentId: auth.student.id,
      photoUrl: String(body.photoUrl || '').trim() || null,
      showName: Boolean(body.showName),
      showPhoto: Boolean(body.showPhoto),
      status: 'pending',
      approved: false,
    },
  })
  return NextResponse.json(testimonial, { status: 201 })
}
