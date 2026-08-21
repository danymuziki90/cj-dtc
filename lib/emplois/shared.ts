/**
 * Shared utilities for the Emplois (Job Offers) module.
 * Both admin API routes and the public API use this file.
 */
import { uploadToR2, deleteFromR2 } from '@/lib/r2'
import { randomUUID } from 'crypto'
import { z } from 'zod'

// ─── Constants ────────────────────────────────────────────────────────────────
export const EMPLOIS_CATEGORY = 'Emplois'
export const DEFAULT_PAGE_SIZE = 9
export const MAX_PAGE_SIZE = 50
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024
export const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/

const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
])
const MIME_MAP: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg',
  'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────
export const emploiMetadataSchema = z.object({
  // Job details
  company:          z.string().max(120).optional().default(''),
  contractType:     z.string().max(80).optional().default(''),
  location:         z.string().max(120).optional().default(''),
  remote:           z.enum(['non', 'oui', 'hybride']).optional().default('non'),
  domain:           z.string().max(80).optional().default(''),
  educationLevel:   z.string().max(80).optional().default(''),
  experience:       z.string().max(80).optional().default(''),
  salary:           z.string().max(80).optional().default(''),
  positions:        z.number().int().min(1).optional().default(1),
  deadline:         z.string().optional().default(''),
  // Application
  applyUrl:         z.string().max(500).optional().default(''),
  contactEmail:     z.string().max(120).optional().default(''),
  whereToApply:     z.string().max(500).optional().default(''),
  howToApply:       z.string().optional().default(''),
  // Rich sections (HTML stored as strings)
  missions:         z.string().optional().default(''),
  profile:          z.string().optional().default(''),
  skills:           z.string().optional().default(''),
  // Status extensions
  status:           z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  // Legacy compat
  excerpt:          z.string().max(400).optional().default(''),
})

export type EmploiMetadata = z.infer<typeof emploiMetadataSchema>

export const emploiWriteSchema = z.object({
  title:           z.string().trim().min(3).max(180),
  content:         z.string().trim().min(10),
  tags:            z.array(z.string().trim().min(1).max(40)).max(15).optional(),
  publicationDate: z.string().optional().nullable().or(z.literal('')),
  imageDataUrl:    z.string().trim().optional().nullable(),
  published:       z.boolean().optional(),
  metadata:        emploiMetadataSchema.optional(),
})

export type EmploiWriteInput = z.infer<typeof emploiWriteSchema>

// ─── Slug generation ──────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

export function generateSlug(title: string): string {
  return `${slugify(title)}-${Date.now().toString(36)}`
}

// ─── HTML sanitizer ───────────────────────────────────────────────────────────
export function sanitizeHtml(value: string): string {
  return value
    .replace(/<\s*(script|style|iframe|object|embed|meta|link)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|meta|link)[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .trim()
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
export function normalizeTags(tags?: string[]): string {
  if (!tags?.length) return ''
  const seen = new Set<string>()
  return tags
    .map((t) => t.trim())
    .filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()))
    .join(',')
}

export function parseTags(value?: string | null): string[] {
  if (!value) return []
  return value.split(',').map((t) => t.trim()).filter(Boolean)
}

// ─── Dates ────────────────────────────────────────────────────────────────────
export function resolvePublicationDate(rawDate?: string | null): Date {
  if (!rawDate?.trim()) return new Date()
  if (DATE_INPUT_REGEX.test(rawDate.trim())) return new Date(`${rawDate.trim()}T00:00:00.000Z`)
  const d = new Date(rawDate)
  return isNaN(d.getTime()) ? new Date() : d
}

export function parsePositiveInt(value: string | null, fallback: number): number {
  const n = parseInt(value || '', 10)
  return isNaN(n) || n < 1 ? fallback : n
}

// ─── Image upload / delete ────────────────────────────────────────────────────
function estimateBase64Size(b64: string): number {
  const pad = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0
  return Math.floor((b64.length * 3) / 4) - pad
}

export async function handleImageUpload(imageDataUrl?: string | null): Promise<string | null> {
  const value = imageDataUrl?.trim()
  if (!value) return null

  // Already an uploaded URL
  if (/^https?:\/\//.test(value) || value.startsWith('/uploads/') || value.startsWith('/api/r2/')) {
    return value
  }

  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/)
  if (!match) throw new Error("Format d'image invalide.")

  const mimeType = match[1].toLowerCase()
  if (!ACCEPTED_IMAGE_TYPES.has(mimeType))
    throw new Error("Type d'image non autorisé (JPEG, PNG, WEBP, GIF).")

  const base64 = match[2].replace(/\s/g, '')
  if (estimateBase64Size(base64) > MAX_IMAGE_BYTES)
    throw new Error("Image trop volumineuse (max 2 Mo).")

  const ext = MIME_MAP[mimeType] || 'jpg'
  const url = await uploadToR2(Buffer.from(base64, 'base64'), `${randomUUID()}.${ext}`, 'emplois', mimeType)
  return url
}

export async function tryDeleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return
  const match = url.match(/\/emplois\/(.+)$/) || url.match(/\/actualites\/(.+)$/)
  if (!match) return
  const folder = url.includes('/emplois/') ? 'emplois' : 'actualites'
  try {
    await deleteFromR2(`${folder}/${match[1]}`)
  } catch (err) {
    console.error('[R2 Delete Error]', err)
  }
}

// ─── Map DB row → API shape ───────────────────────────────────────────────────
export function mapEmploi(item: any) {
  const meta = (item.metadata as EmploiMetadata) || {}
  return {
    id:              item.id,
    slug:            item.slug || generateSlug(item.title),
    title:           item.title,
    content:         item.content,
    published:       item.published,
    author:          item.author || 'Admin',
    tags:            parseTags(item.tags),
    publicationDate: (item.publicationDate || item.createdAt).toISOString?.() ?? item.publicationDate,
    createdAt:       item.createdAt,
    updatedAt:       item.updatedAt,
    imageDataUrl:    item.imageData || null,
    metadata: {
      company:        meta.company        ?? '',
      contractType:   meta.contractType   ?? '',
      location:       meta.location       ?? '',
      remote:         meta.remote         ?? 'non',
      domain:         meta.domain         ?? '',
      educationLevel: meta.educationLevel ?? '',
      experience:     meta.experience     ?? '',
      salary:         meta.salary         ?? '',
      positions:      meta.positions      ?? 1,
      deadline:       meta.deadline       ?? '',
      applyUrl:       meta.applyUrl       ?? '',
      contactEmail:   meta.contactEmail   ?? '',
      whereToApply:   meta.whereToApply   ?? '',
      howToApply:     meta.howToApply     ?? '',
      missions:       meta.missions       ?? '',
      profile:        meta.profile        ?? '',
      skills:         meta.skills         ?? '',
      status:         meta.status         ?? (item.published ? 'published' : 'draft'),
      excerpt:        meta.excerpt        ?? '',
    },
  }
}
