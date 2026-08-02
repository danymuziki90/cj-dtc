import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EMPLOIS_CATEGORY, mapEmploi } from '@/lib/emplois/shared'

export const runtime = 'nodejs'

/**
 * GET /api/emplois/[slug]
 * Public endpoint — returns a single published job offer by slug or id.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Try by id first (cuid), then by slug stored in title-derived field
  // Since News model has no slug column, we match by id or search title-derived slug in metadata
  let row = await prisma.news.findFirst({
    where: { id: slug, category: EMPLOIS_CATEGORY, published: true },
  })

  if (!row) {
    // Find by slug stored in metadata
    const all = await prisma.news.findMany({
      where: { category: EMPLOIS_CATEGORY, published: true },
    })
    row = all.find((r) => {
      const meta = r.metadata as any
      return meta?.slug === slug
    }) || null
  }

  if (!row) return NextResponse.json({ error: 'Offre introuvable.' }, { status: 404 })

  return NextResponse.json({ emploi: mapEmploi(row) })
}
