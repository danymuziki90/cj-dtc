import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// GET /api/documents - Récupérer tous les documents
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const formationId = searchParams.get('formationId')
        const sessionId = searchParams.get('sessionId')
        const category = searchParams.get('category')
        const isPublic = searchParams.get('isPublic')

        const documents = await prisma.document.findMany({
            where: {
                ...(formationId && { formationId: parseInt(formationId) }),
                ...(sessionId && { sessionId: parseInt(sessionId) }),
                ...(category && { category }),
                ...(isPublic && { isPublic: isPublic === 'true' })
            },
            include: {
                formation: {
                    select: { id: true, title: true }
                },
                session: {
                    select: { id: true, startDate: true, location: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(documents)
    } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des documents' },
            { status: 500 }
        )
    }
}

// POST /api/documents - Upload d'un nouveau document
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const category = formData.get('category') as string
        const formationId = formData.get('formationId') as string
        const sessionId = formData.get('sessionId') as string
        const isPublic = formData.get('isPublic') === 'true'

        if (!file || !title || !category) {
            return NextResponse.json(
                { error: 'Fichier, titre et catégorie sont requis' },
                { status: 400 }
            )
        }

        // Créer le dossier uploads s'il n'existe pas
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents')
        try {
            await mkdir(uploadsDir, { recursive: true })
        } catch (error) {
            // Le dossier existe déjà
        }

        // Générer un nom de fichier unique
        const timestamp = Date.now()
        const fileExtension = file.name.split('.').pop()
        const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = join('uploads', 'documents', fileName)

        // Sauvegarder le fichier
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(join(process.cwd(), 'public', filePath), buffer)

        // Créer l'entrée en base de données
        const document = await prisma.document.create({
            data: {
                title,
                description,
                fileName: file.name,
                filePath,
                fileSize: file.size,
                mimeType: file.type,
                category,
                formationId: formationId ? parseInt(formationId) : null,
                sessionId: sessionId ? parseInt(sessionId) : null,
                isPublic
            }
        })

        return NextResponse.json(document, { status: 201 })
    } catch (error) {
        console.error('Erreur lors de l\'upload du document:', error)
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload du document' },
            { status: 500 }
        )
    }
}