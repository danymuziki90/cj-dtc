import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req)
    if (auth.error) return auth.error

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'all', 'pending', 'approved', 'rejected'
    const search = searchParams.get('search') || ''

    // Construction du filtre Prisma
    const whereClause: any = {}

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        {
          student: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        {
          formation: {
            title: { contains: search, mode: 'insensitive' }
          }
        },
        {
          title: { contains: search, mode: 'insensitive' }
        },
        {
          content: { contains: search, mode: 'insensitive' }
        }
      ]
    }

    const testimonials = await prisma.testimonial.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        formation: {
          select: {
            id: true,
            title: true,
          }
        },
        session: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('[GET /api/admin/testimonials]', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des témoignages.' }, { status: 500 })
  }
}
