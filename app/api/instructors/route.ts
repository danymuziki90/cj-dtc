import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export const runtime = "nodejs"

// GET /api/instructors - Récupérer tous les instructeurs
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const status = searchParams.get('status')

        const instructors = await prisma.instructor.findMany({
            where: status ? { status } : {},
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
            },
            orderBy: { lastName: 'asc' }
        })

        return NextResponse.json(instructors)
    } catch (error) {
        console.error('Erreur lors de la récupération des instructeurs:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des instructeurs' },
            { status: 500 }
        )
    }
}

// POST /api/instructors - Créer un nouvel instructeur
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { firstName, lastName, email, phone, bio, expertise, experience, photoUrl } = body

        if (!firstName || !lastName || !email) {
            return NextResponse.json(
                { error: 'Le prénom, nom et email sont requis' },
                { status: 400 }
            )
        }

        const instructor = await prisma.instructor.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                bio,
                expertise,
                experience,
                photoUrl
            }
        })

        return NextResponse.json(instructor, { status: 201 })
    } catch (error) {
        console.error('Erreur lors de la création de l\'instructeur:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la création de l\'instructeur' },
            { status: 500 }
        )
    }
}