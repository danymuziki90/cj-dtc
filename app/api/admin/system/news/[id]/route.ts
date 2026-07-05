import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

const DEFAULT_CATEGORY = 'General'
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/

const updateNewsSchema = z.object({
  title: z.string().trim().min(3).max(180),
  content: z.string().trim().min(10),
  category: z.string().trim().min(2).max(80).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(15).optional(),
  publicationDate: z.string().regex(DATE_INPUT_REGEX).optional(),
  imageDataUrl: z.string().trim().optional().nullable(),
  published: z.boolean().optional(),
})

function sanitizeRichText(value: string) {
  return value
    .replace(/<\s*(script|style|iframe|object|embed|meta|link)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|meta|link)[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .trim()
}

function normalizeTags(tags?: string[]) {
  if (!tags?.length) return ''

  const seen = new Set<string>()
  const cleaned: string[] = []

  for (const rawTag of tags) {
    const tag = rawTag.trim()
    if (!tag) continue
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    cleaned.push(tag)
  }

  return cleaned.join(',')
}

function parseTags(value?: string | null) {
  if (!value) return []
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function resolvePublicationDate(rawDate?: string) {
  const value = rawDate && DATE_INPUT_REGEX.test(rawDate) ? rawDate : new Date().toISOString().slice(0, 10)
  return new Date(`${value}T00:00:00.000Z`)
}

function estimateBase64Size(base64: string) {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.floor((base64.length * 3) / 4) - padding
}

function normalizeImageDataUrl(value?: string | null) {
  const normalized = value?.trim()
  if (!normalized) return null

  const match = normalized.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/)
  if (!match) throw new Error('Image format is invalid.')

  const mimeType = match[1].toLowerCase()
  if (!ACCEPTED_IMAGE_TYPES.has(mimeType)) {
    throw new Error('Image type is not allowed.')
  }

  const base64 = match[2].replace(/\s/g, '')
  const bytes = estimateBase64Size(base64)
  if (bytes > MAX_IMAGE_BYTES) {
    throw new Error('Image size exceeds 2 MB.')
  }

  return `data:${mimeType};base64,${base64}`
}

function mapNewsItem(item: any) {
  return {
    ...item,
    author: item.author || 'Admin',
    category: item.category || DEFAULT_CATEGORY,
    tags: parseTags(item.tags),
    publicationDate: item.publicationDate || item.createdAt,
    imageDataUrl: item.imageData || null,
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const parsed = updateNewsSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const sanitizedContent = sanitizeRichText(parsed.data.content)
  if (sanitizedContent.length < 10) {
    return NextResponse.json({ error: 'Content is too short after sanitization.' }, { status: 400 })
  }

  let imageData: string | null = null
  try {
    imageData = normalizeImageDataUrl(parsed.data.imageDataUrl)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image is invalid.' },
      { status: 400 }
    )
  }

  try {
    const article = await (prisma as any).news.update({
      where: { id },
      data: {
        title: parsed.data.title,
        content: sanitizedContent,
        published: parsed.data.published ?? false,
        category: parsed.data.category || DEFAULT_CATEGORY,
        tags: normalizeTags(parsed.data.tags),
        imageData,
        publicationDate: resolvePublicationDate(parsed.data.publicationDate),
        author: auth.admin.username || 'Admin',
      },
    })

    return NextResponse.json({ article: mapNewsItem(article) })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'News item not found.' }, { status: 404 })
    }

    throw error
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params

  try {
    await (prisma as any).news.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'News item not found.' }, { status: 404 })
    }

    throw error
  }
}
