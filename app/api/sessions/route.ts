import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { getPublishedSessions } from '@/lib/sessions/published'
import {
    serializeSessionMetadata,
    parseSessionMetadata,
    normalizeParticipationType,
    mapParticipationTypeToFormat,
    type ManagedSessionType,
    type ParticipationType,
} from '@/lib/sessions/metadata'

const sessionSchema = z.object({
  formationId: z.union([z.number(), z.string()]).transform(val => Number(val)).nullish().transform(v => v ?? undefined),
  formationType: z.string().trim().nullish().transform(v => v ?? undefined),
  startDate: z.string().trim().min(1, 'Date de début requise'),
  endDate: z.string().trim().min(1, 'Date de fin requise'),
  startTime: z.string().trim().nullish().transform(v => v ?? undefined),
  endTime: z.string().trim().nullish().transform(v => v ?? undefined),
  location: z.string().trim().min(1, 'Lieu requis'),
  format: z.string().trim().min(1, 'Format requis'),
  maxParticipants: z.union([z.number(), z.string()]).transform(val => Number(val)).nullish().transform(v => v ?? undefined),
  price: z.union([z.number(), z.string()]).transform(val => Number(val)).nullish().transform(v => v ?? undefined),
  description: z.string().trim().nullish().transform(v => v ?? undefined),
  prerequisites: z.string().trim().nullish().transform(v => v ?? undefined),
  objectives: z.string().trim().nullish().transform(v => v ?? undefined),
  imageUrl: z.string().trim().nullish().transform(v => v ?? undefined),
  sessionType: z.string().trim().nullish().transform(v => v ?? undefined),
  durationLabel: z.string().trim().nullish().transform(v => v ?? undefined),
  paymentInfo: z.string().trim().nullish().transform(v => v ?? undefined),
  customTitle: z.string().trim().nullish().transform(v => v ?? undefined),
  participationType: z.string().trim().nullish().transform(v => v ?? undefined),
  prerequisitesText: z.string().trim().nullish().transform(v => v ?? undefined),
  registrationDeadline: z.string().trim().nullish().transform(v => v ?? undefined),
  duplicateFromSessionId: z.union([z.number(), z.string()]).transform(val => Number(val)).nullish().transform(v => v ?? undefined),
  status: z.string().trim().nullish().transform(v => v ?? undefined),
})

export const runtime = "nodejs"
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/sessions - Récupérer toutes les sessions
export async function GET(request: NextRequest) {
    try {
        const adminAccess = await requireAdmin(request)
        const isAdmin = !adminAccess.error
        const now = new Date()
        const sessions = isAdmin
            ? await prisma.trainingSession.findMany({
                include: {
                    formation: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            categorie: true,
                            description: true,
                        },
                    },
                    enrollments: {
                        where: {
                            status: {
                                notIn: ['waitlist', 'rejected', 'cancelled'],
                            },
                        },
                        select: { id: true },
                    },
                },
                orderBy: { startDate: 'desc' },
            })
            : await getPublishedSessions(now)

        const sessionsWithCount = sessions.map((session: any) => {
            if (!isAdmin) return session

            const parsedMetadata = parseSessionMetadata(session.prerequisites)
            const resolvedImageUrl = parsedMetadata.metadata.imageUrl || session.imageUrl || null
            return {
                ...session,
                imageUrl: resolvedImageUrl,
                currentParticipants: Array.isArray(session.enrollments) ? session.enrollments.length : (session.currentParticipants || 0),
                prerequisitesText: parsedMetadata.prerequisitesText,
                adminMeta: {
                    customTitle: parsedMetadata.metadata.customTitle || null,
                    sessionType: parsedMetadata.metadata.sessionType || (session.formation?.categorie ?? null),
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
        const parsed = sessionSchema.safeParse(await request.json())
        if (!parsed.success) {
            const errorMsg = parsed.error.issues[0]?.message || 'Données invalides.'
            return NextResponse.json({ error: errorMsg }, { status: 400 })
        }

        const {
            formationId,
            formationType,
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
        } = parsed.data

        let resolvedFormationId = formationId ? parseInt(String(formationId)) : NaN

        if (isNaN(resolvedFormationId) || !resolvedFormationId) {
            const typeName = (formationType || sessionType || customTitle || 'Session').trim()
            let formation = await prisma.formation.findFirst({
                where: { title: { equals: typeName, mode: 'insensitive' } }
            })
            if (!formation) {
                const slugBase = typeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `session-${Date.now()}`
                formation = await prisma.formation.create({
                    data: {
                        title: typeName,
                        slug: `${slugBase}-${Date.now().toString(36)}`,
                        description: description || typeName,
                        categorie: typeName,
                        statut: 'publie',
                    }
                })
            }
            resolvedFormationId = formation.id
        }

        // Créer la session
        const session = await prisma.trainingSession.create({
            data: {
                formationId: resolvedFormationId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                startTime: startTime || '09:00',
                endTime: endTime || '17:00',
                location: location || 'À préciser',
                format:
                    (participationType
                        ? mapParticipationTypeToFormat(participationType as ParticipationType)
                        : format) || 'presentiel',
                maxParticipants: maxParticipants || 25,
                description,
                prerequisites: serializeSessionMetadata(
                    {
                        customTitle: customTitle || undefined,
                        sessionType: ((formationType || sessionType) as ManagedSessionType) || undefined,
                        durationLabel: durationLabel || undefined,
                        paymentInfo: paymentInfo || undefined,
                        participationType:
                            ((participationType as ParticipationType) || normalizeParticipationType(format)) ??
                            'presentiel',
                        imageUrl: imageUrl || undefined,
                        registrationDeadline: registrationDeadline || undefined,
                    },
                    prerequisitesText ?? prerequisites
                ),
                objectives,
                imageUrl,
                status: status && ['ouverte', 'fermee', 'complete', 'annulee', 'terminee'].includes(status) ? status : 'ouverte'
            },
            include: {
                formation: true
            }
        })

        if (duplicateFromSessionId && !isNaN(duplicateFromSessionId)) {
            const parsedDupId = duplicateFromSessionId
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
