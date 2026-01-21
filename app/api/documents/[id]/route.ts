import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    log: ['error'],
})

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params
        const documentId = parseInt(resolvedParams.id)

        if (isNaN(documentId)) {
            return NextResponse.json(
                { error: 'ID de document invalide' },
                { status: 400 }
            )
        }

        // Récupérer le document pour obtenir le chemin du fichier
        const document = await prisma.document.findUnique({
            where: { id: documentId }
        })

        if (!document) {
            return NextResponse.json(
                { error: 'Document non trouvé' },
                { status: 404 }
            )
        }

        // Supprimer le fichier physique
        try {
            const filePath = path.join(process.cwd(), 'public', document.filePath)
            await fs.unlink(filePath)
        } catch (fileError) {
            console.warn('Erreur lors de la suppression du fichier:', fileError)
            // Ne pas échouer si le fichier n'existe pas
        }

        // Supprimer le document de la base de données
        await prisma.document.delete({
            where: { id: documentId }
        })

        return NextResponse.json({ message: 'Document supprimé avec succès' })

    } catch (error) {
        console.error('Erreur lors de la suppression du document:', error)
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        )
    }
}