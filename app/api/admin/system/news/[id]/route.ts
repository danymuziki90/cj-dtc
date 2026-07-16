import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { uploadToR2, deleteFromR2 } from '@/lib/r2'
import { randomUUID } from 'crypto'

const DEFAULT_CATEGORY = 'General'
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/
const MIME_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const updateNewsSchema = z.object({
  title: z.string({
    required_error: "Le titre est obligatoire",
    invalid_type_error: "Le titre doit être une chaîne de caractères"
  }).trim().min(3, "Le titre doit contenir au moins 3 caractères").max(180, "Le titre ne doit pas dépasser 180 caractères"),
  content: z.string({
    required_error: "Le contenu est obligatoire",
    invalid_type_error: "Le contenu doit être une chaîne de caractères"
  }).trim().min(10, "Le contenu doit contenir au moins 10 caractères"),
  category: z.string().trim().max(80, "La catégorie ne doit pas dépasser 80 caractères").optional().nullable().or(z.literal('')),
  tags: z.array(z.string().trim().min(1, "Un tag ne peut pas être vide").max(40, "Un tag ne doit pas dépasser 40 caractères")).max(15, "Vous ne pouvez pas ajouter plus de 15 tags").optional(),
  publicationDate: z.string().optional().nullable().or(z.literal('')),
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

function resolvePublicationDate(rawDate?: string | null) {
  if (!rawDate) {
    return new Date()
  }
  const dateStr = rawDate.trim()
  if (!dateStr) {
    return new Date()
  }
  if (DATE_INPUT_REGEX.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00.000Z`)
  }
  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) {
    return new Date()
  }
  return parsed
}

function estimateBase64Size(base64: string) {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.floor((base64.length * 3) / 4) - padding
}

async function tryDeleteImage(url: string | null | undefined) {
  if (!url) return
  
  let key: string | null = null
  if (url.includes('/actualites/')) {
    const parts = url.split('/actualites/')
    if (parts.length > 1) {
      key = `actualites/${parts[parts.length - 1]}`
    }
  }
  
  if (key) {
    try {
      await deleteFromR2(key)
      console.log(`[R2 Image Delete] Deleted key: ${key}`)
    } catch (err) {
      console.error(`[R2 Image Delete Error] Failed to delete key: ${key}`, err)
    }
  }
}

async function handleImageUpload(imageDataUrl?: string | null): Promise<string | null> {
  const value = imageDataUrl?.trim()
  if (!value) return null

  // If it's already an uploaded URL, keep it
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/uploads/') ||
    value.startsWith('/api/r2/file/')
  ) {
    return value
  }

  // If it's a data URL, upload to R2
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/)
  if (!match) {
    throw new Error("Le format de l'image est invalide.")
  }

  const mimeType = match[1].toLowerCase()
  if (!ACCEPTED_IMAGE_TYPES.has(mimeType)) {
    throw new Error("Le type de l'image n'est pas autorisé (JPEG, PNG, WEBP, GIF uniquement).")
  }

  const base64 = match[2].replace(/\s/g, '')
  const bytes = estimateBase64Size(base64)
  if (bytes > MAX_IMAGE_BYTES) {
    throw new Error("L'image est trop volumineuse (maximum 2 Mo).")
  }

  const buffer = Buffer.from(base64, 'base64')
  const ext = MIME_MAP[mimeType] || 'jpg'
  const fileName = `${randomUUID()}.${ext}`

  try {
    const url = await uploadToR2(buffer, fileName, 'actualites', mimeType)
    return url
  } catch (error: any) {
    console.error('[R2 Image Upload Error]:', error)
    throw new Error(`Échec de l'envoi de l'image vers Cloudflare R2: ${error.message || error}`)
  }
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
  const existing = await (prisma as any).news.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Actualité introuvable.' }, { status: 404 })
  }

  const parsed = updateNewsSchema.safeParse(await request.json())
  if (!parsed.success) {
    const errorDetails = parsed.error.flatten().fieldErrors
    const formattedErrors = Object.entries(errorDetails)
      .map(([field, msgs]) => {
        const fieldName = field === 'title' ? 'Titre' :
                          field === 'content' ? 'Contenu' :
                          field === 'category' ? 'Catégorie' :
                          field === 'publicationDate' ? 'Date de publication' :
                          field === 'imageDataUrl' ? 'Image' :
                          field === 'published' ? 'Statut de publication' : field
        return `${fieldName} : ${msgs?.join(', ')}`
      })
      .join(' ; ')
    return NextResponse.json({
      error: `Champs invalides - ${formattedErrors}`,
      details: errorDetails
    }, { status: 400 })
  }

  const sanitizedContent = sanitizeRichText(parsed.data.content)
  if (sanitizedContent.length < 10) {
    return NextResponse.json({ error: 'Le contenu est trop court après nettoyage.' }, { status: 400 })
  }

  let imageData: string | null = null
  try {
    imageData = await handleImageUpload(parsed.data.imageDataUrl)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image invalide.' },
      { status: 400 }
    )
  }

  try {
    // Si l'image a été modifiée ou supprimée, nettoyer l'ancienne de R2
    if (existing.imageData && existing.imageData !== imageData) {
      await tryDeleteImage(existing.imageData)
    }

    const finalCategory = parsed.data.category?.trim() || DEFAULT_CATEGORY

    const article = await (prisma as any).news.update({
      where: { id },
      data: {
        title: parsed.data.title,
        content: sanitizedContent,
        published: parsed.data.published ?? false,
        category: finalCategory,
        tags: normalizeTags(parsed.data.tags),
        imageData,
        publicationDate: resolvePublicationDate(parsed.data.publicationDate),
        author: auth.admin.username || 'Admin',
      },
    })

    return NextResponse.json({ article: mapNewsItem(article) })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Actualité introuvable.' }, { status: 404 })
    }

    throw error
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params

  try {
    const existing = await (prisma as any).news.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Actualité introuvable.' }, { status: 404 })
    }

    // Nettoyer l'image associée sur R2
    if (existing.imageData) {
      await tryDeleteImage(existing.imageData)
    }

    await (prisma as any).news.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Actualité introuvable.' }, { status: 404 })
    }

    throw error
  }
}
