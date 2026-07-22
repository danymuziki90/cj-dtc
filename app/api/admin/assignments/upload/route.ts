import { NextRequest, NextResponse } from 'next/server'
import { extname } from 'path'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { uploadToR2 } from '@/lib/r2'

export const runtime = 'nodejs'

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.7z',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.txt', '.csv'
])

export async function POST(request: NextRequest) {
  try {
    console.log('[API Admin Assignment Upload] Requête reçue')
    const auth = await requireAdmin(request)
    if (auth.error) {
      console.warn('[API Admin Assignment Upload] Accès refusé (non admin)')
      return auth.error
    }

    const data = await request.formData()
    const file = data.get('file') as File | null

    if (!file) {
      console.warn('[API Admin Assignment Upload] Fichier manquant')
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 })
    }

    const extension = extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      console.warn(`[API Admin Assignment Upload] Format de fichier non autorisé: ${file.name}`)
      return NextResponse.json({ error: 'Format de fichier non autorisé.' }, { status: 400 })
    }

    // Max 20MB
    if (file.size > 20 * 1024 * 1024) {
      console.warn(`[API Admin Assignment Upload] Fichier trop volumineux: ${file.size} octets`)
      return NextResponse.json({ error: 'Fichier trop volumineux (max 20 Mo).' }, { status: 400 })
    }

    console.log(`[API Admin Assignment Upload] Traitement de ${file.name} (${file.size} octets)`)
    const fileName = `${Date.now()}-${randomUUID()}${extension}`
    const buffer = await file.arrayBuffer()
    
    console.log(`[API Admin Assignment Upload] Lancement upload R2. Clé: travaux/consignes/${fileName}`)
    const fileUrl = await uploadToR2(Buffer.from(buffer), fileName, 'travaux/consignes', file.type || 'application/octet-stream')
    console.log(`[API Admin Assignment Upload] Upload réussi. URL: ${fileUrl}`)

    return NextResponse.json({
      url: fileUrl,
      name: fileName,
      originalName: file.name,
      size: file.size,
    })
  } catch (error: any) {
    console.error('[API Admin Assignment Upload] Erreur critique lors du téléversement:', error)
    return NextResponse.json(
      { error: `Erreur interne lors du téléversement : ${error.message || error}` },
      { status: 500 }
    )
  }
}
