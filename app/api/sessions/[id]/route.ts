import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET /api/sessions/[id] - Récupérer une session spécifique
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params
        const sessionId = parseInt(resolvedParams.id)

        if (isNaN(sessionId)) {
            return NextResponse.json(
                { error: 'ID de session invalide' },
                { status: 400 }
            )
        }

        const session = await prisma.trainingSession.findUnique({
            where: { id: sessionId },
            include: {
                formation: true,
                enrollments: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        status: true,
                        paymentStatus: true,
                        totalAmount: true,
                        paidAmount: true,
                        createdAt: true
                    }
                }
            }
        })

        if (!session) {
            return NextResponse.json(
                { error: 'Session non trouvée' },
                { status: 404 }
            )
        }

        return NextResponse.json(session)
    } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération de la session' },
            { status: 500 }
        )
    }
}

// PUT /api/sessions/[id] - Modifier une session
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params
        const sessionId = parseInt(resolvedParams.id)

        if (isNaN(sessionId)) {
            return NextResponse.json(
                { error: 'ID de session invalide' },
                { status: 400 }
            )
        }

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
            status,
            description,
            prerequisites,
            objectives
        } = body

        // Vérifier que la session existe
        const existingSession = await prisma.trainingSession.findUnique({
            where: { id: sessionId }
        })

        if (!existingSession) {
            return NextResponse.json(
                { error: 'Session non trouvée' },
                { status: 404 }
            )
        }

        // Mettre à jour la session
        const updatedSession = await prisma.trainingSession.update({
            where: { id: sessionId },
            data: {
                ...(formationId && { formationId: parseInt(formationId) }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(startTime && { startTime }),
                ...(endTime && { endTime }),
                ...(location && { location }),
                ...(format && { format }),
                ...(maxParticipants && { maxParticipants: parseInt(maxParticipants) }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(status && { status }),
                ...(description !== undefined && { description }),
                ...(prerequisites !== undefined && { prerequisites }),
                ...(objectives !== undefined && { objectives })
            },
            include: {
                formation: true
            }
        })

        return NextResponse.json(updatedSession)
    } catch (error) {
        console.error('Erreur lors de la modification de la session:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la modification de la session' },
            { status: 500 }
        )
    }
}

// DELETE /api/sessions/[id] - Supprimer une session
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params
        const sessionId = parseInt(resolvedParams.id)

        if (isNaN(sessionId)) {
            return NextResponse.json(
                { error: 'ID de session invalide' },
                { status: 400 }
            )
        }

        // Vérifier que la session existe
        const existingSession = await prisma.trainingSession.findUnique({
            where: { id: sessionId }
        })

        if (!existingSession) {
            return NextResponse.json(
                { error: 'Session non trouvée' },
                { status: 404 }
            )
        }

        // Supprimer la session (cette opération pourrait être restreinte selon les règles métier)
        await prisma.trainingSession.delete({
            where: { id: sessionId }
        })

        return NextResponse.json({ message: 'Session supprimée avec succès' })
    } catch (error) {
        console.error('Erreur lors de la suppression de la session:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la suppression de la session' },
            { status: 500 }
        )
    }
}