import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

// GET /api/student/testimonials
// Returns all testimonials submitted by the authenticated student
export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { studentId: auth.student.id },
      include: {
        formation: { select: { id: true, title: true, slug: true } },
        session: { select: { id: true, startDate: true, endDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('[GET /api/student/testimonials]', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des témoignages.' }, { status: 500 })
  }
}

// POST /api/student/testimonials
// Submit a new testimonial (status defaults to "pending")
export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { formationId, sessionId, rating, title, content } = body

    if (!content || typeof content !== 'string' || content.trim().length < 20) {
      return NextResponse.json(
        { error: 'Le contenu du témoignage doit contenir au moins 20 caractères.' },
        { status: 400 }
      )
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La note doit être comprise entre 1 et 5.' },
        { status: 400 }
      )
    }

    // Check for duplicate: one testimonial per student per formation
    if (formationId) {
      const existing = await prisma.testimonial.findFirst({
        where: {
          studentId: auth.student.id,
          formationId: Number(formationId),
        },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Vous avez déjà soumis un témoignage pour cette formation.' },
          { status: 409 }
        )
      }
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        studentId: auth.student.id,
        formationId: formationId ? Number(formationId) : null,
        sessionId: sessionId ? Number(sessionId) : null,
        rating: Number(rating),
        title: title?.trim() || null,
        content: content.trim(),
        status: 'pending',
      },
      include: {
        formation: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('[POST /api/student/testimonials]', error)
    return NextResponse.json({ error: 'Erreur lors de la soumission du témoignage.' }, { status: 500 })
  }
}
