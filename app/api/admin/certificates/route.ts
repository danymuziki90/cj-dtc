import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { writeAdminAuditLog } from '@/lib/admin/audit'

export const runtime = "nodejs"

// GET /api/admin/certificates - Récupérer les certificats ou les métadonnées de création
export async function GET(request: NextRequest) {
    try {
        const auth = await requireAdmin(request)
        if (auth.error) return auth.error

        const { searchParams } = new URL(request.url)
        const meta = searchParams.get('meta') === 'true'

        if (meta) {
            // Métadonnées pour formulaires (étudiants, formations, sessions)
            const [students, formations, sessions] = await Promise.all([
                prisma.student.findMany({
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    },
                    orderBy: { lastName: 'asc' }
                }),
                prisma.formation.findMany({
                    select: {
                        id: true,
                        title: true
                    },
                    orderBy: { title: 'asc' }
                }),
                prisma.trainingSession.findMany({
                    select: {
                        id: true,
                        startDate: true,
                        endDate: true,
                        formationId: true,
                        format: true
                    },
                    orderBy: { startDate: 'desc' }
                })
            ])

            return NextResponse.json({ students, formations, sessions })
        }

        // Récupérer tous les certificats réels
        const certificates = await prisma.certificate.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                formation: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                },
                session: {
                    select: {
                        id: true,
                        startDate: true,
                        endDate: true,
                        location: true,
                        format: true
                    }
                }
            },
            orderBy: { issuedAt: 'desc' }
        })

        return NextResponse.json(certificates)
    } catch (error) {
        console.error('Erreur GET /api/admin/certificates:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// POST /api/admin/certificates - Créer un nouveau certificat
export async function POST(request: NextRequest) {
    try {
        const auth = await requireAdmin(request)
        if (auth.error) return auth.error

        const body = await request.json()
        let {
            code,
            studentId,
            formationId,
            sessionId,
            holderName,
            status = 'actif',
            fileUrl,
            type = 'completion',
            issuedAt
        } = body

        if (!studentId || !formationId) {
            return NextResponse.json({ error: 'L\'étudiant et la formation sont requis' }, { status: 400 })
        }

        // Valider l'étudiant
        const student = await prisma.student.findUnique({
            where: { id: studentId }
        })
        if (!student) {
            return NextResponse.json({ error: 'Étudiant introuvable' }, { status: 404 })
        }

        // Si le nom complet du titulaire n'est pas fourni, utiliser celui de l'étudiant
        if (!holderName || holderName.trim().length === 0) {
            holderName = `${student.firstName} ${student.lastName}`.trim()
        }

        // Générer un code unique s'il n'est pas fourni
        if (!code || code.trim().length === 0) {
            let uniqueCode = ''
            let attempts = 0
            do {
                const random = Math.random().toString(36).substring(2, 8).toUpperCase()
                uniqueCode = `CERT-${formationId}-${Date.now().toString().slice(-4)}-${random}`
                attempts++
                if (attempts > 10) {
                    return NextResponse.json({ error: 'Impossible de générer un code unique' }, { status: 500 })
                }
            } while (await prisma.certificate.findUnique({ where: { code: uniqueCode } }))
            code = uniqueCode
        } else {
            // Vérifier l'unicité du code fourni
            const existingCode = await prisma.certificate.findUnique({ where: { code } })
            if (existingCode) {
                return NextResponse.json({ error: 'Ce numéro de certificat existe déjà' }, { status: 400 })
            }
        }

        // Créer le certificat
        const certificate = await prisma.certificate.create({
            data: {
                code,
                type,
                holderName,
                formationId: parseInt(formationId),
                sessionId: sessionId ? parseInt(sessionId) : null,
                studentId,
                status,
                fileUrl,
                verified: true, // Les certificats ajoutés par l'admin sont marqués comme vérifiés
                issuedBy: auth.admin.username,
                issuedAt: issuedAt ? new Date(issuedAt) : new Date()
            }
        })

        // Journalisation de l'opération
        await writeAdminAuditLog({
            adminId: auth.admin.id,
            adminUsername: auth.admin.username,
            action: 'CREATE_CERTIFICATE',
            targetType: 'Certificate',
            targetId: String(certificate.id),
            targetLabel: code,
            summary: `Création du certificat ${code} pour l'étudiant ${holderName}`,
            status: 'success'
        })

        return NextResponse.json(certificate, { status: 201 })
    } catch (error) {
        console.error('Erreur POST /api/admin/certificates:', error)
        return NextResponse.json({ error: 'Erreur serveur lors de la création' }, { status: 500 })
    }
}
