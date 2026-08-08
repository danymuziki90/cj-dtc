import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { tmpdir } from 'os'

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const accountId = sanitizeEnv(process.env.CLOUDFLARE_R2_ACCOUNT_ID) || sanitizeEnv(process.env.R2_ACCOUNT_ID)
const accessKeyId = sanitizeEnv(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) || sanitizeEnv(process.env.R2_ACCESS_KEY_ID)
const secretAccessKey = sanitizeEnv(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) || sanitizeEnv(process.env.R2_SECRET_ACCESS_KEY)
const bucketName = sanitizeEnv(process.env.CLOUDFLARE_R2_BUCKET_NAME) || sanitizeEnv(process.env.R2_BUCKET_NAME) || 'cjdevelopmenttc-storage'
const publicUrl = sanitizeEnv(process.env.CLOUDFLARE_R2_PUBLIC_URL) || sanitizeEnv(process.env.R2_PUBLIC_URL) || ''

export const isR2Configured = !!(accountId && accessKeyId && secretAccessKey)

export class R2StorageError extends Error {
  readonly code = 'R2_STORAGE_ERROR'

  constructor(message: string) {
    super(message)
    this.name = 'R2StorageError'
  }
}

const r2Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    })
  : null

function getWritableBaseDir(cleanFolder: string, isPrivate: boolean): string {
  const isServerless = !!process.env.VERCEL || process.env.NODE_ENV === 'production'
  if (isServerless) {
    return join(tmpdir(), 'uploads', cleanFolder)
  }
  return isPrivate
    ? join(process.cwd(), 'uploads', cleanFolder)
    : join(process.cwd(), 'public', 'uploads', cleanFolder)
}

/**
 * Uploads a file to Cloudflare R2 or local filesystem fallback.
 * @param buffer The file buffer
 * @param fileName The unique file name (can contain subdirectories)
 * @param folder The R2 folder/prefix (e.g., 'formations', 'travaux', 'certificats', etc.)
 * @param mimeType The file MIME type
 * @returns The public URL of the uploaded file, or a local path/API download endpoint
 */
export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  folder: string,
  mimeType: string,
  privateStorage = false,
): Promise<string> {
  const cleanFolder = folder.replace(/\/$/, '')
  const key = `${cleanFolder}/${fileName}`

  console.log(`[R2 Upload] key: ${key}, size: ${buffer.length} bytes, mimeType: ${mimeType}, R2 Configured: ${isR2Configured}`)

  if (!isR2Configured && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
    console.error('[R2 Upload] Configuration R2 absente en production.')
    throw new R2StorageError("Le stockage des fichiers n'est pas configure. Contactez l'administration.")
  }

  if (isR2Configured && r2Client) {
    console.log(`[R2 Upload] Envoi vers bucket R2: ${bucketName}...`)
    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        })
      )
      console.log(`[R2 Upload] Réussi pour la clé R2: ${key}`)
      
      if (privateStorage) {
        return key
      }

      if (cleanFolder === 'certificats') {
        return `/api/certificates/download/file/${fileName}`
      }

      if (publicUrl) {
        const normalizedPublicUrl = publicUrl.replace(/\/$/, '')
        const finalUrl = `${normalizedPublicUrl}/${key}`
        console.log(`[R2 Upload] URL publique R2 générée: ${finalUrl}`)
        return finalUrl
      }
      
      const fallbackUrl = `/api/r2/file/${key}`
      console.log(`[R2 Upload] Utilisation de la route proxy R2: ${fallbackUrl}`)
      return fallbackUrl
    } catch (error: any) {
      console.error(`[R2 Upload] Échec PutObjectCommand R2 pour ${key}:`, error)
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        // /tmp is ephemeral on serverless deployments: do not return a URL
        // that will later fail with a 404.
        throw new R2StorageError("Le fichier n'a pas pu etre enregistre dans le stockage securise. Veuillez reessayer.")
      }
      try {
        const baseDir = getWritableBaseDir(cleanFolder, privateStorage || cleanFolder === 'certificats')
        await mkdir(baseDir, { recursive: true })
        const filePath = join(baseDir, fileName)
        await writeFile(filePath, buffer)
        console.log(`[R2 Upload Fallback /tmp] Fichier sauvegardé: ${filePath}`)
        return `/api/r2/file/${key}`
      } catch (diskError: any) {
        console.error(`[R2 Fallback Error] Disk error:`, diskError)
        throw new Error(`Stockage Cloudflare R2 échoué: ${error?.message || error}`)
      }
    }
  } else {
    console.log(`[R2 Upload] Mode local fallback actif. Écriture disque...`)
    try {
      const isPrivate = privateStorage || cleanFolder === 'certificats'
      const baseDir = getWritableBaseDir(cleanFolder, isPrivate)
      await mkdir(baseDir, { recursive: true })
      
      const filePath = join(baseDir, fileName)
      const fileDir = join(filePath, '..')
      await mkdir(fileDir, { recursive: true })

      await writeFile(filePath, buffer)
      console.log(`[R2 Local Fallback] Écrit sur disque: ${filePath}`)

      const finalPath = privateStorage
        ? key
        : isPrivate
        ? `/api/certificates/download/file/${fileName}`
        : `/api/r2/file/${key}`
      return finalPath
    } catch (error: any) {
      console.error(`[R2 Local Fallback Error] Échec écriture:`, error)
      throw new Error(`Échec du stockage local du fichier : ${error?.message || error}`)
    }
  }
}

/**
 * Cleans and normalizes R2 keys, stripping hostnames, leading slashes, and route prefixes.
 */
export function sanitizeR2Key(rawKey: string): string {
  if (!rawKey) return ''
  let cleanKey = rawKey.trim()
  if (cleanKey.startsWith('http://') || cleanKey.startsWith('https://')) {
    try {
      const urlObj = new URL(cleanKey)
      cleanKey = decodeURIComponent(urlObj.pathname)
    } catch (e) {}
  }
  cleanKey = cleanKey.replace(/^\/api\/r2\/file\//, '')
  cleanKey = cleanKey.replace(/^\/api\/certificates\/download\/file\//, 'certificats/')
  cleanKey = cleanKey.replace(/^\/uploads\//, '')
  cleanKey = cleanKey.replace(/^\//, '')
  return cleanKey
}

/** Resolves the private storage key used for a certificate file URL. */
export function getCertificateStorageKey(fileUrl: string): string | null {
  const key = sanitizeR2Key(fileUrl)
  if (!key || key.includes('..')) return null
  return key.startsWith('certificats/') ? key : `certificats/${key.split('/').pop()}`
}

/**
 * Resolves exact MIME types for all supported file formats.
 */
export function getMimeTypeFromKey(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase() || ''
  const mimeMap: Record<string, string> = {
    // Spreadsheets & Documents
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    csv: 'text/csv; charset=utf-8',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    pdf: 'application/pdf',
    txt: 'text/plain; charset=utf-8',
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',

    // Archives
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    gz: 'application/gzip',
    tar: 'application/x-tar',

    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',

    // Audio / Video
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    wav: 'audio/wav',
    webm: 'video/webm',
  }
  return mimeMap[ext] || 'application/octet-stream'
}

/**
 * Downloads a file from Cloudflare R2 or local filesystem fallback.
 * @param key The R2 key (e.g., 'certificats/filename.pdf' or '/api/r2/file/...')
 * @returns The file buffer
 */
export async function downloadFromR2(key: string): Promise<Buffer> {
  const cleanKey = sanitizeR2Key(key)
  console.log(`[R2] Début downloadFromR2 - rawKey: ${key}, cleanKey: ${cleanKey}`)

  if (isR2Configured && r2Client) {
    try {
      console.log(`[R2] Récupération depuis le bucket: ${bucketName} pour la clé: ${cleanKey}...`)
      const response = await r2Client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: cleanKey,
        })
      )
      if (!response.Body) {
        throw new Error(`Aucun contenu renvoyé pour la clé ${cleanKey} sur R2`)
      }
      const bytes = await response.Body.transformToByteArray()
      return Buffer.from(bytes)
    } catch (error: any) {
      console.warn(`[R2] Échec du téléchargement S3 pour la clé: ${cleanKey}. Tentative fallback local. Erreur:`, error?.message || error)
    }
  }

  // Local fallback
  console.log(`[R2] Recherche sur le disque local pour la clé: ${cleanKey}...`)
  try {
    const parts = cleanKey.split('/')
    const folder = parts[0]
    const fileName = parts.slice(1).join('/')

    const isPrivate = folder === 'certificats'
    const baseDir = isPrivate
      ? join(process.cwd(), 'uploads', folder)
      : join(process.cwd(), 'public', 'uploads', folder)
    const filePath = join(baseDir, fileName)

    if (!existsSync(filePath)) {
      const tmpPath = join(tmpdir(), 'uploads', folder, fileName)
      if (existsSync(tmpPath)) {
        const { readFile } = await import('fs/promises')
        return await readFile(tmpPath)
      }
      throw new Error(`Fichier introuvable sur R2 ni localement (${filePath})`)
    }
    const { readFile } = await import('fs/promises')
    return await readFile(filePath)
  } catch (error: any) {
    console.error(`[R2 downloadFromR2] Échec de la lecture du fichier:`, error)
    throw new Error(`Échec du téléchargement du fichier : ${error.message || error}`)
  }
}

/**
 * Deletes a file from Cloudflare R2 or local filesystem fallback.
 * @param key The R2 key (e.g., 'formations/filename.jpg')
 */
export async function deleteFromR2(key: string): Promise<void> {
  const cleanKey = sanitizeR2Key(key)
  console.log(`[R2] Début deleteFromR2 - rawKey: ${key}, cleanKey: ${cleanKey}`)
  if (isR2Configured && r2Client) {
    try {
      console.log(`[R2] Suppression dans le bucket: ${bucketName}...`)
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: cleanKey,
        })
      )
      console.log(`[R2] Fichier supprimé avec succès: ${cleanKey}`)
    } catch (error: any) {
      console.error(`[R2] Échec de la suppression pour la clé ${cleanKey}. Erreur:`, error)
    }
  } else {
    // Local fallback
    console.log(`[R2] Mode local fallback actif. Suppression sur le disque local...`)
    const parts = cleanKey.split('/')
    const folder = parts[0]
    const fileName = parts.slice(1).join('/')
    
    const isPrivate = folder === 'certificats'
    const baseDir = isPrivate
      ? join(process.cwd(), 'uploads', folder)
      : join(process.cwd(), 'public', 'uploads', folder)
    const filePath = join(baseDir, fileName)

    try {
      if (existsSync(filePath)) {
        await unlink(filePath)
        console.log(`[R2 fallback] Fichier local supprimé: ${filePath}`)
      }
    } catch (e) {
      console.warn(`[R2 fallback] Échec de la suppression locale du fichier ${filePath}:`, e)
    }
  }
}
