import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { uploadToR2 } from '@/lib/r2'

export const runtime = "nodejs"

function normalizeFolder(folder: string): string {
  const f = folder.toLowerCase().trim()
  if (f.startsWith('formation')) return 'formations'
  if (f.startsWith('session')) return 'sessions'
  if (f.startsWith('travaux') || f.startsWith('submission') || f.startsWith('assignment')) return 'travaux'
  if (f.startsWith('certificat')) return 'certificats'
  if (f.startsWith('actualite') || f.startsWith('news') || f.startsWith('article')) return 'actualites'
  if (f.startsWith('galerie') || f.startsWith('gallery')) return 'galerie'
  if (f.startsWith('partenaire') || f.startsWith('partner')) return 'partenaires'
  if (f.startsWith('etudiant') || f.startsWith('student') || f.startsWith('communication') || f.startsWith('avatar') || f.startsWith('profile')) return 'etudiants'
  if (f.startsWith('logo') || f.startsWith('branding')) return 'logos'
  return 'formations' // default fallback
}

export async function POST(request: NextRequest) {
    try {
        console.log('[API Upload] Requête reçue')
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File
        const rawFolder: string = (data.get('folder') as string) || 'formations'

        if (!file) {
            console.warn('[API Upload] Fichier manquant dans la requête')
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
        }

        console.log(`[API Upload] Reçu: ${file.name} (${file.size} octets, type: ${file.type}) pour dossier: ${rawFolder}`)

        if (file.size > 10 * 1024 * 1024) {
            console.warn(`[API Upload] Fichier trop volumineux: ${file.size} octets`)
            return NextResponse.json({ error: 'Le fichier est trop volumineux (max 10MB)' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const fileExtension = file.name.split('.').pop() || 'bin'
        const fileName = `${randomUUID()}.${fileExtension}`
        const r2Folder = normalizeFolder(rawFolder)

        console.log(`[API Upload] Lancement de l'upload R2. Clé finale: ${r2Folder}/${fileName}`)
        const url = await uploadToR2(buffer, fileName, r2Folder, file.type)
        console.log(`[API Upload] Succès. URL renvoyée: ${url}`)

        return NextResponse.json({
            url,
            fileName,
            size: file.size,
            type: file.type
        })

    } catch (error: any) {
        console.error('[API Upload] Erreur critique lors de l\'upload:', error)
        return NextResponse.json(
            { error: `Erreur interne lors de l'upload : ${error.message || error}` },
            { status: 500 }
        )
    }
}