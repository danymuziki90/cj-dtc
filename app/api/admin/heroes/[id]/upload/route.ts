import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin/auth'
import { uploadToR2 } from '@/lib/r2'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

/** POST /api/admin/heroes/[id]/upload — Upload une image hero vers R2 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminToken(request)
  if (!authResult.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Format non autorisé. Formats acceptés : ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5 MB)' },
        { status: 400 }
      )
    }

    const hero = await prisma.heroSection.findUnique({ where: { id }, select: { id: true, pageKey: true } })
    if (!hero) {
      return NextResponse.json({ error: 'Hero not found' }, { status: 404 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Générer un nom de fichier unique
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `hero-${hero.pageKey}-${Date.now()}.${ext}`

    const imageUrl = await uploadToR2(buffer, fileName, 'heroes', file.type)

    // Mettre à jour l'URL dans la DB
    await prisma.heroSection.update({
      where: { id },
      data: { imageUrl },
    })

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('[POST /api/admin/heroes/[id]/upload]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
