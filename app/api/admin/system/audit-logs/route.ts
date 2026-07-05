import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const searchParams = request.nextUrl.searchParams
  const requestedLimit = Number(searchParams.get('limit') || '30')
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 30

  const logs = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      adminId: true,
      adminUsername: true,
      action: true,
      targetType: true,
      targetId: true,
      targetLabel: true,
      summary: true,
      status: true,
      ipAddress: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ logs })
}
