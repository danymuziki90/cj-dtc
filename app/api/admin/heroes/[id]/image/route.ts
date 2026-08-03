import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

/** DELETE /api/admin/heroes/[id]/image — Supprime l'image uploadée et revient au défaut */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const hero = await prisma.heroSection.update({
      where: { id },
      data: { imageUrl: null },
    })

    revalidateTag(`hero-${hero.pageKey}`)

    return NextResponse.json({
      success: true,
      fallbackImage: hero.defaultImageUrl,
    })
  } catch (error) {
    console.error('[DELETE /api/admin/heroes/[id]/image]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
