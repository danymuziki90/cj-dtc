import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formationId = searchParams.get('formationId')
    const slug = searchParams.get('slug')

    const where: any = {
      OR: [{ approved: true }, { status: 'approved' }]
    }

    if (formationId && !Number.isNaN(Number(formationId))) {
      where.formationId = Number(formationId)
    } else if (slug) {
      where.formation = { slug }
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      include: {
        formation: { select: { id: true, title: true, slug: true } },
        session: { select: { id: true, startDate: true } },
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
