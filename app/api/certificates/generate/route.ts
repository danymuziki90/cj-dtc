import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Fonction pour générer un code de certificat unique
function generateCertificateCode(type: string, formationId: number, enrollmentId: number): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const typePrefix = type === 'completion' ? 'COMP' : type === 'attendance' ? 'ATT' : 'EXC'
    return `${typePrefix}-${formationId}-${enrollmentId}-${random}`
}

// POST /api/certificates/generate - Générer un nouveau certificat
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            enrollmentId,
            type = 'completion',
            issuedBy
        } = body

        if (!enrollmentId) {
            return NextResponse.json(
                { error: 'L\'ID d\'inscription est requis' },
                { status: 400 }
            )
        }

        // Récupérer les informations de l'inscription
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(enrollmentId) },
            include: {
                formation: true,
                session: true
            }
        })

        if (!enrollment) {
            return NextResponse.json(
                { error: 'Inscription non trouvée' },
                { status: 404 }
            )
        }

        // Vérifier que la formation est terminée pour les certificats de completion
        if (type === 'completion' && enrollment.status !== 'completed') {
            return NextResponse.json(
                { error: 'La formation doit être terminée pour générer un certificat de completion' },
                { status: 400 }
            )
        }

        // Vérifier qu'un certificat n'existe pas déjà pour cette inscription et ce type
        const existingCertificate = await prisma.certificate.findFirst({
            where: {
                enrollmentId: parseInt(enrollmentId),
                type
            }
        })

        if (existingCertificate) {
            return NextResponse.json(
                { error: `Un certificat de type ${type} existe déjà pour cette inscription` },
                { status: 400 }
            )
        }

        // Générer un code unique
        let code: string
        let attempts = 0
        do {
            code = generateCertificateCode(type, enrollment.formationId, enrollment.id)
            attempts++
            if (attempts > 10) {
                return NextResponse.json(
                    { error: 'Impossible de générer un code unique' },
                    { status: 500 }
                )
            }
        } while (await prisma.certificate.findUnique({ where: { code } }))

        // Créer le certificat
        const certificate = await prisma.certificate.create({
            data: {
                code,
                type,
                holderName: `${enrollment.firstName} ${enrollment.lastName}`,
                formationId: enrollment.formationId,
                sessionId: enrollment.sessionId,
                enrollmentId: enrollment.id,
                issuedBy,
                verified: true // Les certificats générés automatiquement sont vérifiés
            }
        })

        // Mettre à jour l'inscription pour indiquer qu'un certificat a été délivré
        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: {
                certificateIssued: true,
                certificateId: certificate.id
            }
        })

        return NextResponse.json(certificate, { status: 201 })
    } catch (error) {
        console.error('Erreur lors de la génération du certificat:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la génération du certificat' },
            { status: 500 }
        )
    }
}