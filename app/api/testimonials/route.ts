import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { OR: [{ approved: true }, { status: 'approved' }] },
      include: {
        formation: { select: { title: true } },
        session: { select: { startDate: true } },
      },
      orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }]
    })
    return NextResponse.json(testimonials.map((testimonial) => ({
      ...testimonial,
      name: testimonial.showName ? testimonial.name : 'Ancien participant',
      photoUrl: testimonial.showPhoto ? testimonial.photoUrl : null,
    })))
  } catch (error) {
    console.error('Error GET /api/testimonials:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
