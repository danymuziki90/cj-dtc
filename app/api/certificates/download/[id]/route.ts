import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireStudent } from '@/lib/auth-portal/guards'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const runtime = "nodejs"

// GET /api/certificates/download/[id] - Téléchargement sécurisé d'un certificat par son ID DB
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const certificateId = parseInt(id)

        if (isNaN(certificateId)) {
            return NextResponse.json({ error: 'ID de certificat invalide' }, { status: 400 })
        }

        // Déterminer les droits d'accès
        let isAdmin = false
        let studentEmail: string | null = null
        let studentId: string | null = null

        const adminAuth = await requireAdmin(request)
        if (!adminAuth.error) {
            isAdmin = true
        } else {
            const studentAuth = await requireStudent(request)
            if (studentAuth.error) {
                return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
            }
            studentEmail = studentAuth.student.email
            studentId = studentAuth.student.id
        }

        // Récupérer le certificat en base de données
        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId },
            include: {
                enrollment: true
            }
        })

        if (!certificate) {
            return NextResponse.json({ error: 'Certificat introuvable' }, { status: 404 })
        }

        // Vérifier les permissions de l'étudiant
        if (!isAdmin) {
            const isOwnerByEmail = studentEmail && certificate.enrollment?.email === studentEmail
            const isOwnerById = studentId && certificate.studentId === studentId

            if (!isOwnerByEmail && !isOwnerById) {
                return NextResponse.json({ error: 'Accès interdit à ce certificat' }, { status: 403 })
            }

            // Vérifier le statut du certificat (Actif requis pour l'étudiant)
            if (certificate.status !== 'actif') {
                return NextResponse.json({ error: 'Ce certificat n\'est plus disponible (archivé ou révoqué)' }, { status: 403 })
            }
        }

        if (!certificate.fileUrl) {
            return NextResponse.json({ error: 'Fichier PDF non disponible pour ce certificat' }, { status: 404 })
        }

        // Extraire le nom physique du fichier
        const fileName = certificate.fileUrl.split('/').pop()
        if (!fileName) {
            return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 })
        }

        const filePath = join(process.cwd(), 'uploads', 'certificates', fileName)
        if (!existsSync(filePath)) {
            return NextResponse.json({ error: 'Fichier physique introuvable sur le serveur' }, { status: 404 })
        }

        const fileBuffer = await readFile(filePath)

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${certificate.code}.pdf"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        })

    } catch (error) {
        console.error('Erreur lors du téléchargement sécurisé du certificat:', error)
        return NextResponse.json({ error: 'Erreur serveur lors du téléchargement' }, { status: 500 })
    }
}
