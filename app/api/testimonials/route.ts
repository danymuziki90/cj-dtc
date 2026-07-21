import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/testimonials
// Public route — returns only approved testimonials for the public site
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'approved' },
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        createdAt: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        formation: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const payload = testimonials.map((t) => ({
      id: t.id,
      rating: t.rating,
      title: t.title,
      content: t.content,
      createdAt: t.createdAt,
      name: `${t.student.firstName} ${t.student.lastName}`.trim(),
      quote: t.content,
      formation: t.formation?.title ?? null,
      // Public site compatibility fields
      role: t.formation?.title ? `Étudiant — ${t.formation.title}` : 'Étudiant CJ DTC',
      company: 'CJ Development TC',
      photoUrl: null,
    }))

    return NextResponse.json(payload)
  } catch (error) {
    console.error('[GET /api/testimonials]', error)
    return NextResponse.json([], { status: 200 }) // Graceful fallback for public site
  }
}
