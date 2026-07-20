import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const testimonials = await prisma.testimonial.findMany({
    where: {
      OR: [
        { studentId: auth.student.id },
        { student: { email: { equals: auth.student.email, mode: 'insensitive' } } },
      ]
    },
    include: {
      formation: { select: { id: true, title: true } },
      session: { select: { id: true, startDate: true, location: true } }
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(testimonials)
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const body = await request.json().catch(() => ({}))
  const quote = String(body.quote || '').trim()
  const title = String(body.title || '').trim() || null
  const photoUrl = String(body.photoUrl || '').trim() || null
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 5))

  const rawFormationId = body.formationId ? Number(body.formationId) : null
  const rawSessionId = body.sessionId ? Number(body.sessionId) : null

  if (!quote) {
    return NextResponse.json({ error: 'Le contenu du témoignage est obligatoire.' }, { status: 400 })
  }

  let validFormationId = rawFormationId
  let validSessionId = rawSessionId

  if (rawSessionId && !Number.isNaN(rawSessionId)) {
    const session = await prisma.trainingSession.findUnique({
      where: { id: rawSessionId },
      select: { id: true, formationId: true }
    })
    if (session) {
      validSessionId = session.id
      validFormationId = session.formationId
    }
  }

  // If no formationId specified, grab the student's primary enrolled formation
  if (!validFormationId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        OR: [
          { studentId: auth.student.id },
          { email: { equals: auth.student.email, mode: 'insensitive' } }
        ]
      },
      select: { formationId: true, sessionId: true },
      orderBy: { createdAt: 'desc' }
    })

    if (enrollment) {
      validFormationId = enrollment.formationId
      if (!validSessionId && enrollment.sessionId) {
        validSessionId = enrollment.sessionId
      }
    }
  }

  const studentName = `${auth.student.firstName} ${auth.student.lastName}`.trim() || 'Étudiant DTC'

  const testimonial = await prisma.testimonial.create({
    data: {
      name: studentName,
      title,
      quote,
      rating,
      formationId: validFormationId,
      sessionId: validSessionId,
      studentId: auth.student.id,
      photoUrl,
      showName: Boolean(body.showName),
      showPhoto: Boolean(body.showPhoto),
      status: 'pending',
      approved: false,
    },
    include: {
      formation: { select: { id: true, title: true } },
      session: { select: { id: true, startDate: true } }
    }
  })

  // Create notification for admin
  try {
    await prisma.adminNotification.create({
      data: {
        title: '⭐ Nouveau témoignage soumis',
        message: `L'étudiant ${studentName} (${auth.student.email}) a soumis un témoignage pour la formation. En attente de modération.`,
        type: 'info',
        target: 'all',
        createdBy: auth.student.email
      }
    })
  } catch (err) {
    console.error('Failed to create admin notification for testimonial:', err)
  }

  return NextResponse.json(testimonial, { status: 201 })
}
