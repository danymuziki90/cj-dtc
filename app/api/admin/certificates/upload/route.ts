import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { uploadToR2 } from '@/lib/r2'

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
    try {
        console.log('[API Certificates Upload] Requête reçue')
        const auth = await requireAdmin(request)
        if (auth.error) {
            console.warn('[API Certificates Upload] Accès refusé (non admin)')
            return auth.error
        }

        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            console.warn('[API Certificates Upload] Fichier manquant')
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
        }

        // Vérifier le type de fichier (PDF uniquement)
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (file.type !== 'application/pdf' && fileExtension !== 'pdf') {
            console.warn(`[API Certificates Upload] Fichier non PDF refusé: ${file.name} (type: ${file.type})`)
            return NextResponse.json({ error: 'Seuls les fichiers PDF sont autorisés' }, { status: 400 })
        }

        // Vérifier la taille du fichier (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            console.warn(`[API Certificates Upload] Fichier trop volumineux: ${file.size} octets`)
            return NextResponse.json({ error: 'Le fichier est trop volumineux (max 10MB)' }, { status: 400 })
        }

        console.log(`[API Certificates Upload] Traitement de ${file.name} (${file.size} octets)`)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const fileName = `${randomUUID()}.pdf`
        console.log(`[API Certificates Upload] Lancement upload R2. Clé: certificats/${fileName}`)
        const fileUrl = await uploadToR2(buffer, fileName, 'certificats', 'application/pdf')
        console.log(`[API Certificates Upload] Upload réussi. URL: ${fileUrl}`)

        return NextResponse.json({
            url: fileUrl,
            fileName,
            size: file.size,
            type: file.type
        })

    } catch (error: any) {
        console.error('[API Certificates Upload] Erreur critique lors du téléversement:', error)
        return NextResponse.json(
            { error: `Erreur interne lors du téléversement : ${error.message || error}` },
            { status: 500 }
        )
    }
}
