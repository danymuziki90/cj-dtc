import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const status   = searchParams.get('status') || 'all'   // all | pending | approved | rejected
  const search   = searchParams.get('search') || ''
  const sortBy   = searchParams.get('sortBy') || 'createdAt' // createdAt | rating
  const sortDir  = searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc'
  const page     = Math.max(1, Number(searchParams.get('page') || 1))
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || 20)))

  // Build where clause
  const where: any = {}
  if (status !== 'all') where.status = status
  if (search.trim()) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { quote: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { formation: { title: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const orderBy: any =
    sortBy === 'rating'
      ? [{ rating: sortDir }, { createdAt: 'desc' }]
      : [{ createdAt: sortDir }]

  const [total, items] = await Promise.all([
    prisma.testimonial.count({ where }),
    prisma.testimonial.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        formation: { select: { id: true, title: true } },
        session:   { select: { id: true, startDate: true, location: true } },
        student:   { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ])

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  })
}
