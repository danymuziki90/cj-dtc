import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireStudent } from '@/lib/auth-portal/guards'
import { downloadFromR2 } from '@/lib/r2'

export const runtime = "nodejs"

// GET /api/certificates/download/file/[filename] - Téléchargement sécurisé par nom de fichier
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await context.params

        if (!filename || filename.trim().length === 0) {
            return NextResponse.json({ error: 'Nom de fichier requis' }, { status: 400 })
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

        // Rechercher le certificat correspondant à ce fichier en base de données
        const targetUrl = `/api/certificates/download/file/${filename}`
        const certificate = await prisma.certificate.findFirst({
            where: { fileUrl: targetUrl },
            include: { enrollment: true }
        })

        if (!certificate) {
            return NextResponse.json({ error: 'Certificat non trouvé pour ce fichier' }, { status: 404 })
        }

        // Vérifier les permissions de l'étudiant
        if (!isAdmin) {
            const isOwnerByEmail = studentEmail && certificate.enrollment?.email === studentEmail
            const isOwnerById = studentId && certificate.studentId === studentId

            if (!isOwnerByEmail && !isOwnerById) {
                return NextResponse.json({ error: 'Accès interdit à ce fichier' }, { status: 403 })
            }

            // Vérifier le statut du certificat (Actif requis pour l'étudiant)
            if (certificate.status !== 'actif') {
                return NextResponse.json({ error: 'Ce certificat n\'est plus actif' }, { status: 403 })
            }
        }

        let fileBuffer: Buffer
        try {
            fileBuffer = await downloadFromR2(`certificats/${filename}`)
        } catch (downloadError) {
            console.error('Download from R2 failed:', downloadError)
            return NextResponse.json({ error: 'Fichier physique introuvable sur R2' }, { status: 404 })
        }

        return new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${certificate.code}.pdf"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        })

    } catch (error) {
        console.error('Erreur lors du téléchargement par nom de fichier:', error)
        return NextResponse.json({ error: 'Erreur serveur lors du téléchargement' }, { status: 500 })
    }
}
