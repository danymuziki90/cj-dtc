import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { unlink } from 'fs/promises'
import { join } from 'path'

export const runtime = "nodejs"

// PUT /api/admin/certificates/[id] - Mettre à jour un certificat
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdmin(request)
        if (auth.error) return auth.error

        const { id } = await context.params
        const certificateId = parseInt(id)

        if (isNaN(certificateId)) {
            return NextResponse.json({ error: 'ID de certificat invalide' }, { status: 400 })
        }

        const body = await request.json()
        let {
            code,
            studentId,
            formationId,
            sessionId,
            holderName,
            status,
            fileUrl,
            type,
            issuedAt
        } = body

        // Vérifier l'existence
        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId }
        })

        if (!certificate) {
            return NextResponse.json({ error: 'Certificat introuvable' }, { status: 404 })
        }

        // Valider l'étudiant s'il a changé
        if (studentId && studentId !== certificate.studentId) {
            const student = await prisma.student.findUnique({
                where: { id: studentId }
            })
            if (!student) {
                return NextResponse.json({ error: 'Étudiant introuvable' }, { status: 404 })
            }
            if (!holderName || holderName.trim().length === 0) {
                holderName = `${student.firstName} ${student.lastName}`.trim()
            }
        }

        // Vérifier l'unicité du code s'il a changé
        if (code && code !== certificate.code) {
            const existingCode = await prisma.certificate.findUnique({ where: { code } })
            if (existingCode) {
                return NextResponse.json({ error: 'Ce numéro de certificat est déjà utilisé' }, { status: 400 })
            }
        }

        // Si un nouveau fichier est fourni et qu'un ancien existait, nous pourrions supprimer l'ancien
        // Mais pour simplifier et éviter les erreurs de suppression, nous mettons simplement à jour le chemin.

        const updated = await prisma.certificate.update({
            where: { id: certificateId },
            data: {
                code: code ?? undefined,
                type: type ?? undefined,
                holderName: holderName ?? undefined,
                formationId: formationId ? parseInt(formationId) : undefined,
                sessionId: sessionId ? parseInt(sessionId) : (sessionId === null ? null : undefined),
                studentId: studentId ?? undefined,
                status: status ?? undefined,
                fileUrl: fileUrl !== undefined ? fileUrl : undefined,
                issuedAt: issuedAt ? new Date(issuedAt) : undefined
            }
        })

        // Journalisation de l'opération
        await writeAdminAuditLog({
            adminId: auth.admin.id,
            adminUsername: auth.admin.username,
            action: 'UPDATE_CERTIFICATE',
            targetType: 'Certificate',
            targetId: String(certificate.id),
            targetLabel: updated.code,
            summary: `Modification du certificat ${updated.code} pour l'étudiant ${updated.holderName}`,
            status: 'success'
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Erreur PUT /api/admin/certificates/[id]:', error)
        return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour' }, { status: 500 })
    }
}

// DELETE /api/admin/certificates/[id] - Supprimer un certificat
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdmin(request)
        if (auth.error) return auth.error

        const { id } = await context.params
        const certificateId = parseInt(id)

        if (isNaN(certificateId)) {
            return NextResponse.json({ error: 'ID de certificat invalide' }, { status: 400 })
        }

        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId }
        })

        if (!certificate) {
            return NextResponse.json({ error: 'Certificat introuvable' }, { status: 404 })
        }

        // Optionnel : Supprimer le fichier PDF physique associé s'il est local
        if (certificate.fileUrl && certificate.fileUrl.startsWith('/api/certificates/download/file/')) {
            const fileName = certificate.fileUrl.split('/').pop()
            if (fileName) {
                try {
                    const filePath = join(process.cwd(), 'uploads', 'certificates', fileName)
                    await unlink(filePath)
                } catch (e) {
                    console.warn(`Impossible de supprimer le fichier PDF physique: ${fileName}`, e)
                }
            }
        }

        await prisma.certificate.delete({
            where: { id: certificateId }
        })

        // Journalisation de l'opération
        await writeAdminAuditLog({
            adminId: auth.admin.id,
            adminUsername: auth.admin.username,
            action: 'DELETE_CERTIFICATE',
            targetType: 'Certificate',
            targetId: String(certificateId),
            targetLabel: certificate.code,
            summary: `Suppression définitive du certificat ${certificate.code} de ${certificate.holderName}`,
            status: 'success'
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erreur DELETE /api/admin/certificates/[id]:', error)
        return NextResponse.json({ error: 'Erreur serveur lors de la suppression' }, { status: 500 })
    }
}
