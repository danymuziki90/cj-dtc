import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET /api/evaluations - Récupérer toutes les évaluations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const formationId = searchParams.get('formationId')
        const sessionId = searchParams.get('sessionId')

        const evaluations = await prisma.evaluation.findMany({
            where: {
                ...(formationId && { formationId: parseInt(formationId) }),
                ...(sessionId && { sessionId: parseInt(sessionId) })
            },
            include: {
                enrollment: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                formation: {
                    select: { id: true, title: true }
                },
                session: {
                    select: { id: true, startDate: true, location: true }
                }
            },
            orderBy: { submittedAt: 'desc' }
        })

        return NextResponse.json(evaluations)
    } catch (error) {
        console.error('Erreur lors de la récupération des évaluations:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des évaluations' },
            { status: 500 }
        )
    }
}

// POST /api/evaluations - Créer une nouvelle évaluation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            enrollmentId,
            sessionId,
            formationId,
            overallRating,
            overallComment,
            contentRating,
            instructorRating,
            materialRating,
            organizationRating,
            facilityRating,
            strengths,
            improvements,
            recommendations,
            isAnonymous
        } = body

        if (!enrollmentId || !formationId || !overallRating) {
            return NextResponse.json(
                { error: 'L\'ID d\'inscription, formation et note globale sont requis' },
                { status: 400 }
            )
        }

        // Vérifier que l'inscription existe et est terminée
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(enrollmentId) },
            include: { formation: true }
        })

        if (!enrollment) {
            return NextResponse.json(
                { error: 'Inscription non trouvée' },
                { status: 404 }
            )
        }

        if (enrollment.status !== 'completed') {
            return NextResponse.json(
                { error: 'L\'évaluation ne peut être soumise que pour une formation terminée' },
                { status: 400 }
            )
        }

        // Créer l'évaluation
        const evaluation = await prisma.evaluation.create({
            data: {
                enrollmentId: parseInt(enrollmentId),
                sessionId: sessionId ? parseInt(sessionId) : null,
                formationId: parseInt(formationId),
                overallRating: parseInt(overallRating),
                overallComment,
                contentRating: contentRating ? parseInt(contentRating) : null,
                instructorRating: instructorRating ? parseInt(instructorRating) : null,
                materialRating: materialRating ? parseInt(materialRating) : null,
                organizationRating: organizationRating ? parseInt(organizationRating) : null,
                facilityRating: facilityRating ? parseInt(facilityRating) : null,
                strengths,
                improvements,
                recommendations,
                isAnonymous: isAnonymous || false
            }
        })

        return NextResponse.json(evaluation, { status: 201 })
    } catch (error) {
        console.error('Erreur lors de la création de l\'évaluation:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la création de l\'évaluation' },
            { status: 500 }
        )
    }
}