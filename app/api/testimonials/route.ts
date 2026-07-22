import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/testimonials
// Public route — returns only approved testimonials for the public site
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'approved' },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        formation: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        session: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
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
      quote: t.content,
      createdAt: t.createdAt,
      name: `${t.student.firstName} ${t.student.lastName}`.trim(),
      formation: t.formation?.title ?? 'Formation CJ DTC',
      sessionDate: t.session?.startDate
        ? new Date(t.session.startDate).toLocaleDateString('fr-FR')
        : null,
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
