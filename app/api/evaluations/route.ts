import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

const evaluationSchema = z.object({
  enrollmentId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  sessionId: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? Number(val) : null),
  formationId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  overallRating: z.union([z.number(), z.string()]).transform(val => Number(val)),
  overallComment: z.string().optional().nullable(),
  contentRating: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? Number(val) : null),
  instructorRating: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? Number(val) : null),
  materialRating: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? Number(val) : null),
  organizationRating: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? Number(val) : null),
  facilityRating: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? Number(val) : null),
  strengths: z.string().optional().nullable(),
  improvements: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  isAnonymous: z.boolean().optional().nullable()
})

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
        const parsed = evaluationSchema.safeParse(await request.json())
        if (!parsed.success) {
            const errorMsg = parsed.error.issues[0]?.message || 'Données invalides.'
            return NextResponse.json({ error: errorMsg }, { status: 400 })
        }

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
        } = parsed.data

        // Vérifier que l'inscription existe et est terminée
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
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
                enrollmentId: enrollmentId,
                sessionId: sessionId,
                formationId: formationId,
                overallRating: overallRating,
                overallComment,
                contentRating: contentRating,
                instructorRating: instructorRating,
                materialRating: materialRating,
                organizationRating: organizationRating,
                facilityRating: facilityRating,
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