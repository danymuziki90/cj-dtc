import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import {
  EMPLOIS_CATEGORY,
  emploiWriteSchema, sanitizeHtml, normalizeTags, resolvePublicationDate,
  handleImageUpload, tryDeleteImage, mapEmploi, generateSlug,
} from '@/lib/emplois/shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── GET /api/admin/system/emplois/[id] ───────────────────────────────────────
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const row = await prisma.news.findFirst({ where: { id, category: EMPLOIS_CATEGORY } })
  if (!row) return NextResponse.json({ error: 'Offre introuvable.' }, { status: 404 })

  return NextResponse.json({ emploi: mapEmploi(row) })
}

// ─── PUT /api/admin/system/emplois/[id] ───────────────────────────────────────
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const existing = await prisma.news.findFirst({ where: { id, category: EMPLOIS_CATEGORY } })
  if (!existing) return NextResponse.json({ error: 'Offre introuvable.' }, { status: 404 })

  const body   = await request.json()
  const parsed = emploiWriteSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Données invalides.', details: parsed.error.flatten().fieldErrors }, { status: 400 })

  const { title, content, tags, publicationDate, imageDataUrl, published, metadata } = parsed.data

  const sanitized = sanitizeHtml(content)
  if (sanitized.length < 10)
    return NextResponse.json({ error: 'Contenu trop court.' }, { status: 400 })

  let imageData: string | null = null
  try { imageData = await handleImageUpload(imageDataUrl) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }) }

  // Clean old image from R2 if replaced
  if (existing.imageData && existing.imageData !== imageData)
    await tryDeleteImage(existing.imageData)

  const isPublished = metadata?.status === 'published' ? true
    : metadata?.status === 'archived' ? false
    : (published ?? existing.published)

  try {
    const row = await prisma.news.update({
      where: { id },
      data: {
        title,
        content: sanitized,
        published: isPublished,
        author: (auth.admin as any).username || 'Admin',
        category: EMPLOIS_CATEGORY,
        tags: normalizeTags(tags),
        imageData,
        publicationDate: resolvePublicationDate(publicationDate),
        metadata: { ...metadata, status: metadata?.status ?? (isPublished ? 'published' : 'draft') },
      },
    })
    return NextResponse.json({ emploi: mapEmploi(row) })
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ error: 'Offre introuvable.' }, { status: 404 })
    throw e
  }
}

// ─── PATCH /api/admin/system/emplois/[id] — toggle publish / archive / duplicate
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const existing = await prisma.news.findFirst({ where: { id, category: EMPLOIS_CATEGORY } })
  if (!existing) return NextResponse.json({ error: 'Offre introuvable.' }, { status: 404 })

  const body: { action: string } = await request.json()

  if (body.action === 'publish') {
    const meta = (typeof existing.metadata === 'object' && !Array.isArray(existing.metadata) && existing.metadata !== null) ? existing.metadata : {}
    const row = await prisma.news.update({
      where: { id },
      data: { published: true, metadata: { ...meta, status: 'published' } },
    })
    return NextResponse.json({ emploi: mapEmploi(row) })
  }

  if (body.action === 'unpublish') {
    const meta = (typeof existing.metadata === 'object' && !Array.isArray(existing.metadata) && existing.metadata !== null) ? existing.metadata : {}
    const row = await prisma.news.update({
      where: { id },
      data: { published: false, metadata: { ...meta, status: 'draft' } },
    })
    return NextResponse.json({ emploi: mapEmploi(row) })
  }

  if (body.action === 'archive') {
    const meta = (typeof existing.metadata === 'object' && !Array.isArray(existing.metadata) && existing.metadata !== null) ? existing.metadata : {}
    const row = await prisma.news.update({
      where: { id },
      data: { published: false, metadata: { ...meta, status: 'archived' } },
    })
    return NextResponse.json({ emploi: mapEmploi(row) })
  }

  if (body.action === 'duplicate') {
    const meta = existing.metadata as any || {}
    const newRow = await prisma.news.create({
      data: {
        title: `[Copie] ${existing.title}`,
        content: existing.content,
        published: false,
        author: (auth.admin as any).username || 'Admin',
        category: EMPLOIS_CATEGORY,
        tags: existing.tags,
        imageData: existing.imageData,
        publicationDate: new Date(),
        metadata: { ...meta, status: 'draft' },
      },
    })
    return NextResponse.json({ emploi: mapEmploi(newRow) }, { status: 201 })
  }

  return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 })
}

// ─── DELETE /api/admin/system/emplois/[id] ────────────────────────────────────
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    const existing = await prisma.news.findFirst({ where: { id, category: EMPLOIS_CATEGORY } })
    if (!existing) return NextResponse.json({ error: 'Offre introuvable.' }, { status: 404 })
    if (existing.imageData) await tryDeleteImage(existing.imageData)
    await prisma.news.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ error: 'Offre introuvable.' }, { status: 404 })
    throw e
  }
}
