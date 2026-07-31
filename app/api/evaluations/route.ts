import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { apiHandler, ApiError } from '@/lib/api-error'

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
export const GET = apiHandler(async (request: NextRequest) => {
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
})

// POST /api/evaluations - Créer une nouvelle évaluation
export const POST = apiHandler(async (request: NextRequest) => {
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
    } = evaluationSchema.parse(await request.json())

        // Vérifier que l'inscription existe et est terminée
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { formation: true }
        })

    if (!enrollment) {
        throw new ApiError(404, 'Inscription non trouvée')
    }

    if (enrollment.status !== 'completed') {
        throw new ApiError(400, "L'évaluation ne peut être soumise que pour une formation terminée")
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
})