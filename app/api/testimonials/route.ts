import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Error GET /api/testimonials:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
