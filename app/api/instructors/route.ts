import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { apiHandler, ApiError } from '@/lib/api-error'

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

export const GET = apiHandler(async (request: NextRequest) => {
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
    return NextResponse.json(instructors)
})

export const POST = apiHandler(async (request: NextRequest) => {
    const { firstName, lastName, email, phone, bio, expertise, experience, photoUrl } = instructorSchema.parse(await request.json())

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
    return NextResponse.json(instructor, { status: 201 })
})