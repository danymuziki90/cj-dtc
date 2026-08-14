import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

/** GET /api/admin/heroes — Liste toutes les sections Hero */
export async function GET(request: NextRequest) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // L'espace étudiant utilise la même configuration que les autres bannières.
    // L'upsert rend cette section éditable immédiatement sur les installations
    // qui possèdent déjà les anciennes sections Hero.
    await prisma.heroSection.upsert({
      where: { pageKey: 'student_space' },
      update: {},
      create: {
        pageKey: 'student_space',
        defaultImageUrl: '/books-wood.jpg',
        imageAlt: 'Livres et salle de formation CJ Development',
        titleFr: 'Espace Étudiant',
        titleEn: 'Student Space',
      },
    })

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
