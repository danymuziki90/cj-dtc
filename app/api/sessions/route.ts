import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export const runtime = "nodejs"

// GET /api/sessions - Récupérer toutes les sessions
export async function GET() {
    try {
        const sessions = await prisma.trainingSession.findMany({
            include: {
                formation: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                },
                enrollments: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { startDate: 'desc' }
        })

        return NextResponse.json(sessions)
    } catch (error) {
        console.error('Erreur lors de la récupération des sessions:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des sessions' },
            { status: 500 }
        )
    }
}

// POST /api/sessions - Créer une nouvelle session
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            formationId,
            startDate,
            endDate,
            startTime,
            endTime,
            location,
            format,
            maxParticipants,
            price,
            description,
            prerequisites,
            objectives
        } = body

        // Validation des données
        if (!formationId || !startDate || !endDate || !location || !format) {
            return NextResponse.json(
                { error: 'Données manquantes' },
                { status: 400 }
            )
        }

        // Vérifier que la formation existe
        const formation = await prisma.formation.findUnique({
            where: { id: parseInt(formationId) }
        })

        if (!formation) {
            return NextResponse.json(
                { error: 'Formation non trouvée' },
                { status: 404 }
            )
        }

        // Créer la session
        const session = await prisma.trainingSession.create({
            data: {
                formationId: parseInt(formationId),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                startTime,
                endTime,
                location,
                format,
                maxParticipants: parseInt(maxParticipants) || 25,
                price: parseFloat(price) || 0,
                description,
                prerequisites,
                objectives,
                status: 'ouverte'
            },
            include: {
                formation: true
            }
        })

        return NextResponse.json(session, { status: 201 })
    } catch (error) {
        console.error('Erreur lors de la création de la session:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la création de la session' },
            { status: 500 }
        )
    }
}