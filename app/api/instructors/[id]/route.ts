import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET /api/instructors/[id] - Récupérer un instructeur
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const instructorId = parseInt(params.id)

        const instructor = await prisma.instructor.findUnique({
            where: { id: instructorId },
            include: {
                sessions: {
                    include: {
                        session: {
                            include: {
                                formation: true
                            }
                        }
                    }
                }
            }
        })

        if (!instructor) {
            return NextResponse.json(
                { error: 'Instructeur non trouvé' },
                { status: 404 }
            )
        }

        return NextResponse.json(instructor)
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'instructeur:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération de l\'instructeur' },
            { status: 500 }
        )
    }
}

// PUT /api/instructors/[id] - Modifier un instructeur
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const instructorId = parseInt(params.id)
        const body = await request.json()
        const { firstName, lastName, email, phone, bio, expertise, experience, photoUrl, status } = body

        const instructor = await prisma.instructor.update({
            where: { id: instructorId },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(email && { email }),
                ...(phone !== undefined && { phone }),
                ...(bio !== undefined && { bio }),
                ...(expertise !== undefined && { expertise }),
                ...(experience !== undefined && { experience }),
                ...(photoUrl !== undefined && { photoUrl }),
                ...(status && { status })
            }
        })

        return NextResponse.json(instructor)
    } catch (error) {
        console.error('Erreur lors de la modification de l\'instructeur:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la modification de l\'instructeur' },
            { status: 500 }
        )
    }
}

// DELETE /api/instructors/[id] - Supprimer un instructeur
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const instructorId = parseInt(params.id)

        // Vérifier si l'instructeur a des sessions actives
        const activeSessions = await prisma.sessionInstructor.count({
            where: {
                instructorId,
                session: {
                    status: { in: ['ouverte', 'complete'] }
                }
            }
        })

        if (activeSessions > 0) {
            return NextResponse.json(
                { error: 'Impossible de supprimer un instructeur avec des sessions actives' },
                { status: 400 }
            )
        }

        await prisma.instructor.delete({
            where: { id: instructorId }
        })

        return NextResponse.json({ message: 'Instructeur supprimé avec succès' })
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'instructeur:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la suppression de l\'instructeur' },
            { status: 500 }
        )
    }
}