import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { getPublishedSessions } from '@/lib/sessions/published'
import {
    mapParticipationTypeToFormat,
    normalizeParticipationType,
    parseSessionMetadata,
    serializeSessionMetadata,
    type ManagedSessionType,
    type ParticipationType,
} from '@/lib/sessions/metadata'

export const runtime = "nodejs"
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/sessions - Récupérer toutes les sessions
export async function GET(request: NextRequest) {
    try {
        const adminAccess = await requireAdmin(request)
        const isAdmin = !adminAccess.error
        const now = new Date()
        const sessions = isAdmin ? await prisma.trainingSession.findMany({
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
        }) : await getPublishedSessions(now)

        // Ajouter le nombre de participants actuels à chaque session
        const sessionsWithCount = sessions.map((session) => {
            const parsedMetadata = parseSessionMetadata(session.prerequisites)
            const resolvedImageUrl = parsedMetadata.metadata.imageUrl || session.imageUrl || null
            return {
                ...session,
                imageUrl: resolvedImageUrl,
                currentParticipants: Array.isArray((session as any).enrollments) ? (session as any).enrollments.length : ((session as any).currentParticipants || 0),
                prerequisitesText: parsedMetadata.prerequisitesText,
                adminMeta: {
                    customTitle: parsedMetadata.metadata.customTitle || null,
                    sessionType: parsedMetadata.metadata.sessionType || null,
                    durationLabel: parsedMetadata.metadata.durationLabel || null,
                    paymentInfo: parsedMetadata.metadata.paymentInfo || null,
                    participationType:
                        parsedMetadata.metadata.participationType || normalizeParticipationType(session.format),
                    imageUrl: resolvedImageUrl,
                    registrationDeadline: parsedMetadata.metadata.registrationDeadline || null,
                },
            }
        })

        return NextResponse.json(sessionsWithCount, { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } })
    } catch (error) {
        console.error('Erreur lors de la récupération des sessions:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des sessions' },
            { status: 500 }
        )
    }
}

// POST /api/sessions - Créer une nouvelle session
export async function POST(request: NextRequest) {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error
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
            registrationDeadline,
            duplicateFromSessionId,
            status,
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
                        registrationDeadline: registrationDeadline || null,
                    },
                    prerequisitesText ?? prerequisites
                ),
                objectives,
                imageUrl,
                status: ['ouverte', 'fermee', 'complete', 'annulee', 'terminee'].includes(status) ? status : 'fermee'
            },
            include: {
                formation: true
            }
        })

        // Duplication des questions si demandé
        if (duplicateFromSessionId) {
            const parsedDupId = parseInt(duplicateFromSessionId)
            if (!isNaN(parsedDupId)) {
                const originalQuestions = await prisma.sessionFormQuestion.findMany({
                    where: { sessionId: parsedDupId },
                    orderBy: { order: 'asc' }
                })
                if (originalQuestions.length > 0) {
                    await prisma.sessionFormQuestion.createMany({
                        data: originalQuestions.map(q => ({
                            sessionId: session.id,
                            label: q.label,
                            type: q.type,
                            helpText: q.helpText,
                            required: q.required,
                            order: q.order,
                            options: q.options,
                            fileTypes: q.fileTypes,
                        }))
                    })
                }
            }
        }

        return NextResponse.json(session, { status: 201 })
    } catch (error) {
        console.error('Erreur lors de la création de la session:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la création de la session' },
            { status: 500 }
        )
    }
}
