import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const testimonials = await prisma.testimonial.findMany({
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        formation: { select: { title: true } },
        session: { select: { id: true, startDate: true } },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Error GET /api/admin/marketing/testimonials:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await req.json()
    const { name, location, quote, approved, order } = body

    if (!name || !quote) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const created = await prisma.testimonial.create({
      data: {
        name,
        location: location || null,
        quote,
        approved: approved ?? false,
        order: order ?? 0
      }
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error POST /api/admin/marketing/testimonials:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
