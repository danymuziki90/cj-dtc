import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req)
    if (auth.error) {
      return auth.error
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (Math.max(page, 1) - 1) * limit

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { company: { contains: q, mode: 'insensitive' } },
        { contactName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { needType: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [requests, total] = await Promise.all([
      prisma.b2BRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.b2BRequest.count({ where }),
    ])

    return NextResponse.json({
      requests: Array.isArray(requests) ? requests : [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    console.error('Error GET /api/admin/marketing/b2b:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des demandes B2B' },
      { status: 500 }
    )
  }
}
