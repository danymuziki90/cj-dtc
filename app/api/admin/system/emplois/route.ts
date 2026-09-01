import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import {
  EMPLOIS_CATEGORY, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, DATE_INPUT_REGEX,
  emploiWriteSchema, sanitizeHtml, normalizeTags, resolvePublicationDate,
  parsePositiveInt, handleImageUpload, mapEmploi, generateSlug,
} from '@/lib/emplois/shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── GET /api/admin/system/emplois ────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const url = new URL(request.url)
  const page     = parsePositiveInt(url.searchParams.get('page'), 1)
  const pageSize = Math.min(parsePositiveInt(url.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
  const search   = url.searchParams.get('search')?.trim() || ''
  const status   = url.searchParams.get('status')?.trim() || ''  // published|draft|archived
  const date     = url.searchParams.get('date')?.trim() || ''
  const sortBy   = url.searchParams.get('sortBy') || 'date'      // date|title|deadline

  const where: any = { category: EMPLOIS_CATEGORY }

  if (search) {
    where.OR = [
      { title:   { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status === 'published') where.published = true
  if (status === 'draft')     where.published = false

  if (date && DATE_INPUT_REGEX.test(date)) {
    const start = new Date(`${date}T00:00:00.000Z`)
    const end   = new Date(start)
    end.setUTCDate(end.getUTCDate() + 1)
    where.publicationDate = { gte: start, lt: end }
  }

  const orderBy = sortBy === 'title'
    ? [{ title: 'asc' as const }]
    : [{ publicationDate: 'desc' as const }, { createdAt: 'desc' as const }]

  const [total, rows] = await Promise.all([
    prisma.news.count({ where }),
    prisma.news.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({
    emplois: rows.map(mapEmploi),
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.max(Math.ceil(total / pageSize), 1),
    },
  })
}

// ─── POST /api/admin/system/emplois ───────────────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const body   = await request.json()
  const parsed = emploiWriteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides.', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { title, titleEn, content, contentEn, tags, publicationDate, imageDataUrl, published, metadata } = parsed.data

  const sanitized = sanitizeHtml(content)
  if (sanitized.length < 10)
    return NextResponse.json({ error: 'Contenu trop court.' }, { status: 400 })

  let imageData: string | null = null
  try { imageData = await handleImageUpload(imageDataUrl) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }) }

  // Determine published flag from metadata.status or explicit field
  const isPublished = metadata?.status === 'published' ? true : (published ?? false)

  const row = await prisma.news.create({
    data: {
      title,
      titleEn: titleEn || null,
      content: sanitized,
      contentEn: contentEn ? sanitizeHtml(contentEn) : null,
      published: isPublished,
      author: (auth.admin as any).username || 'Admin',
      category: EMPLOIS_CATEGORY,
      tags: normalizeTags(tags),
      imageData,
      publicationDate: resolvePublicationDate(publicationDate),
      metadata: { ...metadata, status: isPublished ? 'published' : (metadata?.status ?? 'draft') },
    },
  })

  return NextResponse.json({ emploi: mapEmploi(row) }, { status: 201 })
}
