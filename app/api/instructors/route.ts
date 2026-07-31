import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

const instructorSchema = z.object({
    firstName: z.string().trim().min(2, 'Le prénom est requis'),
    lastName: z.string().trim().min(2, 'Le nom est requis'),
    email: z.string().trim().email('Format d\'email invalide'),
    phone: z.string().trim().nullish().transform(v => v ?? undefined),
    bio: z.string().trim().nullish().transform(v => v ?? undefined),
    expertise: z.string().trim().nullish().transform(v => v ?? undefined),
    experience: z.string().trim().nullish().transform(v => v ?? undefined),
    photoUrl: z.string().trim().nullish().transform(v => v ?? undefined),
})

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
        const parsed = instructorSchema.safeParse(await request.json())
        if (!parsed.success) {
            const errorMsg = parsed.error.issues[0]?.message || 'Données invalides.'
            return NextResponse.json({ error: errorMsg }, { status: 400 })
        }

        const { firstName, lastName, email, phone, bio, expertise, experience, photoUrl } = parsed.data

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