import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cjdtc-bucket'
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || ''

export const isR2Configured = !!(accountId && accessKeyId && secretAccessKey)

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
  // Normalize folder prefix to fit the strategy (remove trailing slash)
  const cleanFolder = folder.replace(/\/$/, '')
  const key = `${cleanFolder}/${fileName}`

  console.log(`[R2] Début uploadToR2 - key: ${key}, size: ${buffer.length} bytes, mimeType: ${mimeType}`)

  if (isR2Configured && r2Client) {
    console.log(`[R2] Client configuré. Envoi vers le bucket R2: ${bucketName}...`)
    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        })
      )
      console.log(`[R2] Upload réussi pour la clé R2: ${key}`)
      
      // Private assets must never receive a public R2 URL. Their key is kept in
      // the database and the application authorizes every download.
      if (privateStorage) {
        return key
      }

      // For certificates, they should always be downloaded securely via API
      if (cleanFolder === 'certificats') {
        return `/api/certificates/download/file/${fileName}`
      }

      // For other files, return public URL if configured
      if (publicUrl) {
        const normalizedPublicUrl = publicUrl.replace(/\/$/, '')
        const finalUrl = `${normalizedPublicUrl}/${key}`
        console.log(`[R2] URL publique générée: ${finalUrl}`)
        return finalUrl
      }
      
      // No public URL: serve via internal proxy route
      const fallbackUrl = `/api/r2/file/${key}`
      console.log(`[R2] Pas d'URL publique configurée. Utilisation de la route proxy: ${fallbackUrl}`)
      return fallbackUrl
    } catch (error: any) {
      console.error(`[R2] Échec du PutObjectCommand pour la clé: ${key}. Erreur détaillée:`, error)
      throw new Error(`Échec du stockage Cloudflare R2 : ${error.message || error} (Code: ${error.Code || error.name || 'Inconnu'})`)
    }
  } else {
    console.log(`[R2] Mode local fallback actif. Stockage local temporaire...`)
    try {
      // Local filesystem fallback
      // Private files (e.g., certificates) are stored outside public/ directory
      const isPrivate = privateStorage || cleanFolder === 'certificats'
      const baseDir = isPrivate
        ? join(process.cwd(), 'uploads', cleanFolder)
        : join(process.cwd(), 'public', 'uploads', cleanFolder)

      await mkdir(baseDir, { recursive: true })
      
      // Extract subdirectories from fileName if any (e.g., student-id/filename.pdf)
      const filePath = join(baseDir, fileName)
      const fileDir = join(filePath, '..')
      await mkdir(fileDir, { recursive: true })

      await writeFile(filePath, buffer)
      console.log(`[R2 fallback] Fichier écrit sur disque: ${filePath}`)

      const finalPath = privateStorage
        ? key
        : isPrivate
        ? `/api/certificates/download/file/${fileName}`
        : `/uploads/${key}`
      console.log(`[R2 fallback] URL générée: ${finalPath}`)
      return finalPath
    } catch (error: any) {
      console.error(`[R2 fallback] Échec d'écriture disque:`, error)
      throw new Error(`Échec du stockage local : ${error.message || error}`)
    }
  }
}

/**
 * Downloads a file from Cloudflare R2 or local filesystem fallback.
 * @param key The R2 key (e.g., 'certificats/filename.pdf')
 * @returns The file buffer
 */
export async function downloadFromR2(key: string): Promise<Buffer> {
  console.log(`[R2] Début downloadFromR2 - key: ${key}`)
  if (isR2Configured && r2Client) {
    try {
      console.log(`[R2] Récupération depuis le bucket: ${bucketName}...`)
      const response = await r2Client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      )
      if (!response.Body) {
        throw new Error(`Aucun contenu renvoyé pour la clé ${key} sur R2`)
      }
      const bytes = await response.Body.transformToByteArray()
      return Buffer.from(bytes)
    } catch (error: any) {
      console.error(`[R2] Échec du téléchargement pour la clé: ${key}. Erreur:`, error)
      throw new Error(`Échec du téléchargement Cloudflare R2 : ${error.message || error}`)
    }
  } else {
    // Local fallback
    console.log(`[R2] Mode local fallback actif. Récupération sur le disque local...`)
    try {
      const parts = key.split('/')
      const folder = parts[0]
      const fileName = parts.slice(1).join('/')
      
      const isPrivate = folder === 'certificats'
      const baseDir = isPrivate
        ? join(process.cwd(), 'uploads', folder)
        : join(process.cwd(), 'public', 'uploads', folder)
      const filePath = join(baseDir, fileName)

      if (!existsSync(filePath)) {
        throw new Error(`Fichier introuvable localement : ${filePath}`)
      }
      const { readFile } = await import('fs/promises')
      return await readFile(filePath)
    } catch (error: any) {
      console.error(`[R2 fallback] Échec de la lecture locale du fichier:`, error)
      throw error
    }
  }
}

/**
 * Deletes a file from Cloudflare R2 or local filesystem fallback.
 * @param key The R2 key (e.g., 'formations/filename.jpg')
 */
export async function deleteFromR2(key: string): Promise<void> {
  console.log(`[R2] Début deleteFromR2 - key: ${key}`)
  if (isR2Configured && r2Client) {
    try {
      console.log(`[R2] Suppression dans le bucket: ${bucketName}...`)
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      )
      console.log(`[R2] Fichier supprimé avec succès: ${key}`)
    } catch (error: any) {
      console.error(`[R2] Échec de la suppression pour la clé ${key}. Erreur:`, error)
      // On ne lève pas d'exception pour ne pas bloquer les suppressions cascade, mais on logue.
    }
  } else {
    // Local fallback
    console.log(`[R2] Mode local fallback actif. Suppression sur le disque local...`)
    const parts = key.split('/')
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
