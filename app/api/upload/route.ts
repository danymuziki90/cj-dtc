import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File
        const folder: string = (data.get('folder') as string) || 'general'

        if (!file) {
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Seules les images sont autorisées' }, { status: 400 })
        }

        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Le fichier est trop volumineux (max 5MB)' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Créer le dossier s'il n'existe pas
        const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (error) {
            // Le dossier existe déjà, c'est ok
        }

        // Générer un nom de fichier unique
        const fileExtension = file.name.split('.').pop()
        const fileName = `${randomUUID()}.${fileExtension}`
        const filePath = join(uploadDir, fileName)

        // Écrire le fichier
        await writeFile(filePath, buffer)

        // Retourner l'URL publique du fichier
        const fileUrl = `/uploads/${folder}/${fileName}`

        return NextResponse.json({
            url: fileUrl,
            fileName,
            size: file.size,
            type: file.type
        })

    } catch (error) {
        console.error('Erreur lors de l\'upload:', error)
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload du fichier' },
            { status: 500 }
        )
    }
}