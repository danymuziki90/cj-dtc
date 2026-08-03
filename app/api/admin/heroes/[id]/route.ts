import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'
import { revalidatePath, revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

/** Mapping pageKey → chemins à revalider */
const REVALIDATE_PATHS: Record<string, string[]> = {
  home:        ['/fr', '/en', '/'],
  about:       ['/fr/about', '/en/about'],
  sessions:    ['/fr/sessions', '/en/sessions'],
  entreprises: ['/fr/entreprises', '/en/entreprises'],
  actualites:  ['/fr/actualites', '/en/actualites'],
  contact:     ['/fr/contact', '/en/contact'],
  emplois:     ['/fr/emplois', '/en/emplois'],
  galerie:     ['/fr/galerie', '/en/galerie'],
  partenaires: ['/fr/partenaires', '/en/partenaires'],
}

/** GET /api/admin/heroes/[id] — Détail d'un hero */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const hero = await prisma.heroSection.findUnique({
      where: { id },
      include: { slides: { orderBy: { order: 'asc' } } },
    })

    if (!hero) {
      return NextResponse.json({ error: 'Hero not found' }, { status: 404 })
    }

    return NextResponse.json({ hero })
  } catch (error) {
    console.error('[GET /api/admin/heroes/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/admin/heroes/[id] — Mise à jour d'un hero */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const {
      isActive,
      imageUrl,
      imageAlt,
      eyebrowFr, titleFr, descriptionFr,
      eyebrowEn, titleEn, descriptionEn,
      ctasFr, ctasEn,
      badgesFr, badgesEn,
      overlayOpacity,
      compact,
    } = body

    const hero = await prisma.heroSection.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imageAlt !== undefined && { imageAlt }),
        ...(eyebrowFr !== undefined && { eyebrowFr }),
        ...(titleFr !== undefined && { titleFr }),
        ...(descriptionFr !== undefined && { descriptionFr }),
        ...(eyebrowEn !== undefined && { eyebrowEn }),
        ...(titleEn !== undefined && { titleEn }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(ctasFr !== undefined && { ctasFr }),
        ...(ctasEn !== undefined && { ctasEn }),
        ...(badgesFr !== undefined && { badgesFr }),
        ...(badgesEn !== undefined && { badgesEn }),
        ...(overlayOpacity !== undefined && { overlayOpacity }),
        ...(compact !== undefined && { compact }),
      },
      include: { slides: { orderBy: { order: 'asc' } } },
    })

    // Invalider le cache pour les pages concernées
    const paths = REVALIDATE_PATHS[hero.pageKey] ?? []
    for (const path of paths) {
      revalidatePath(path)
    }
    revalidateTag(`hero-${hero.pageKey}`)

    return NextResponse.json({ hero })
  } catch (error) {
    console.error('[PUT /api/admin/heroes/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
