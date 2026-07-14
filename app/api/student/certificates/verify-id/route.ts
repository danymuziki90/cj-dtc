import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

export const runtime = "nodejs"

// GET /api/student/certificates/verify-id?code=XYZ
export async function GET(request: NextRequest) {
    try {
        const auth = await requireStudent(request)
        if (auth.error) return auth.error

        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')?.trim()

        if (!code) {
            return NextResponse.json({ error: 'Code de certificat requis' }, { status: 400 })
        }

        const studentId = auth.student.id
        const studentEmail = auth.student.email

        // Rechercher le certificat en base de données
        const certificate = await prisma.certificate.findUnique({
            where: { code },
            include: {
                formation: {
                    select: {
                        id: true,
                        title: true,
                        categorie: true
                    }
                },
                session: {
                    select: {
                        id: true,
                        startDate: true,
                        endDate: true,
                        location: true
                    }
                },
                enrollment: {
                    select: {
                        email: true
                    }
                }
            }
        })

        if (!certificate) {
            return NextResponse.json({ error: 'Aucun certificat trouvé avec ce numéro.' }, { status: 404 })
        }

        // Vérifier si le certificat appartient bien à cet étudiant
        const isOwnerByEmail = studentEmail && certificate.enrollment?.email === studentEmail
        const isOwnerById = studentId && certificate.studentId === studentId

        if (!isOwnerByEmail && !isOwnerById) {
            return NextResponse.json({ error: 'Ce certificat ne correspond pas à votre compte étudiant.' }, { status: 403 })
        }

        // Vérifier si le certificat est actif
        if (certificate.status !== 'actif') {
            return NextResponse.json({ error: 'Ce certificat n\'est plus valide ou a été archivé/révoqué.' }, { status: 400 })
        }

        // Retourner les détails structurés
        return NextResponse.json({
            id: certificate.id,
            code: certificate.code,
            holderName: certificate.holderName,
            type: certificate.type,
            issuedAt: certificate.issuedAt.toISOString(),
            status: certificate.status,
            fileUrl: certificate.fileUrl,
            formationTitle: certificate.formation?.title || 'Formation Générale',
            formationCategorie: certificate.formation?.categorie || 'Autres',
            completionDate: certificate.session ? new Date(certificate.session.endDate).toISOString().split('T')[0] : certificate.issuedAt.toISOString().split('T')[0]
        })

    } catch (error) {
        console.error('Erreur lors de la récupération par ID Number:', error)
        return NextResponse.json({ error: 'Erreur serveur lors de la récupération' }, { status: 500 })
    }
}
