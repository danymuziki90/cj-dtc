import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
    try {
        const auth = await requireAdmin(request)
        if (auth.error) {
            return auth.error
        }

        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
        }

        // Vérifier le type de fichier (PDF uniquement)
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (file.type !== 'application/pdf' && fileExtension !== 'pdf') {
            return NextResponse.json({ error: 'Seuls les fichiers PDF sont autorisés' }, { status: 400 })
        }

        // Vérifier la taille du fichier (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Le fichier est trop volumineux (max 10MB)' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Créer le dossier sécurisé (hors dossier public) s'il n'existe pas
        const uploadDir = join(process.cwd(), 'uploads', 'certificates')
        await mkdir(uploadDir, { recursive: true })

        // Générer un nom de fichier unique sécurisé
        const fileName = `${randomUUID()}.pdf`
        const filePath = join(uploadDir, fileName)

        // Écrire le fichier
        await writeFile(filePath, buffer)

        // Retourner l'URL/chemin logique sécurisé du fichier
        const fileUrl = `/api/certificates/download/file/${fileName}`

        return NextResponse.json({
            url: fileUrl,
            fileName,
            size: file.size,
            type: file.type
        })

    } catch (error) {
        console.error('Erreur lors du téléversement du certificat:', error)
        return NextResponse.json(
            { error: 'Erreur serveur lors du téléversement' },
            { status: 500 }
        )
    }
}
