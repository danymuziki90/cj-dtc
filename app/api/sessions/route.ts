import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import {
    mapParticipationTypeToFormat,
    normalizeParticipationType,
    parseSessionMetadata,
    serializeSessionMetadata,
    type ManagedSessionType,
    type ParticipationType,
} from '@/lib/sessions/metadata'

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
                        slug: true,
                        categorie: true,
                        description: true,
                    }
                },
                enrollments: {
                    where: {
                        status: {
                            notIn: ['waitlist', 'rejected', 'cancelled']
                        }
                    },
                    select: {
                        id: true
                    }
                }
            },
            orderBy: { startDate: 'desc' }
        })

        // Ajouter le nombre de participants actuels à chaque session
        const sessionsWithCount = sessions.map((session) => {
            const parsedMetadata = parseSessionMetadata(session.prerequisites)
            return {
                ...session,
                currentParticipants: session.enrollments.length,
                prerequisitesText: parsedMetadata.prerequisitesText,
                adminMeta: {
                    customTitle: parsedMetadata.metadata.customTitle || null,
                    sessionType: parsedMetadata.metadata.sessionType || null,
                    durationLabel: parsedMetadata.metadata.durationLabel || null,
                    paymentInfo: parsedMetadata.metadata.paymentInfo || null,
                    participationType:
                        parsedMetadata.metadata.participationType || normalizeParticipationType(session.format),
                    imageUrl: parsedMetadata.metadata.imageUrl || session.imageUrl || null,
                },
            }
        })

        return NextResponse.json(sessionsWithCount)
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
            objectives,
            imageUrl,
            sessionType,
            durationLabel,
            paymentInfo,
            customTitle,
            participationType,
            prerequisitesText,
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
                format:
                    (participationType
                        ? mapParticipationTypeToFormat(participationType as ParticipationType)
                        : format) || 'presentiel',
                maxParticipants: parseInt(maxParticipants) || 25,
                price: parseFloat(price) || 0,
                description,
                prerequisites: serializeSessionMetadata(
                    {
                        customTitle: customTitle || null,
                        sessionType: (sessionType as ManagedSessionType) || undefined,
                        durationLabel: durationLabel || null,
                        paymentInfo: paymentInfo || null,
                        participationType:
                            ((participationType as ParticipationType) || normalizeParticipationType(format)) ??
                            'presentiel',
                        imageUrl: imageUrl || null,
                    },
                    prerequisitesText ?? prerequisites
                ),
                objectives,
                imageUrl,
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
