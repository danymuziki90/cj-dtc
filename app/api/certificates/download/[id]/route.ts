import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireStudent } from '@/lib/auth-portal/guards'
import { downloadFromR2, getCertificateStorageKey } from '@/lib/r2'
import { studentOwnsCertificate } from '@/lib/certificates/access'

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
        let student: { id: string; email: string } | null = null

        const adminAuth = await requireAdmin(request)
        if (!adminAuth.error) {
            isAdmin = true
        } else {
            const studentAuth = await requireStudent(request)
            if (studentAuth.error) {
                return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
            }
            student = studentAuth.student
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
            if (!student || !studentOwnsCertificate(certificate, student)) {
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

        const storageKey = getCertificateStorageKey(certificate.fileUrl)
        if (!storageKey) {
            return NextResponse.json({ error: 'Chemin de fichier invalide' }, { status: 400 })
        }

        let fileBuffer: Buffer
        try {
            fileBuffer = await downloadFromR2(storageKey)
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
        console.error('Erreur lors du téléchargement sécurisé du certificat:', error)
        return NextResponse.json({ error: 'Erreur serveur lors du téléchargement' }, { status: 500 })
    }
}
