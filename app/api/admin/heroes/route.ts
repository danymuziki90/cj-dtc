import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

/** GET /api/admin/heroes — Liste toutes les sections Hero */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const heroes = await prisma.heroSection.findMany({
      include: {
        slides: { orderBy: { order: 'asc' } },
      },
      orderBy: { pageKey: 'asc' },
    })

    return NextResponse.json({ heroes })
  } catch (error) {
    console.error('[GET /api/admin/heroes]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
