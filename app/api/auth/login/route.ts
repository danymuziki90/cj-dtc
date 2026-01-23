
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { signJWT } from '../../../../lib/auth-token'
import cookie from 'cookie'

export const runtime = "nodejs"

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const result = loginSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Données invalides' },
                { status: 400 }
            )
        }

        const { email, password } = result.data

        // 1. Find User (or Student directly if we separated them completely, 
        // but our register flow creates both. Let's check User for auth as it's standard)
        // Actually, prompt asked for "Secure Student Login". 
        // We should check the 'Student' model if that's where the password is, OR the User model.
        // Our register route synced them. Let's use Student model if possible to be specific 
        // or User if it has the password. 
        // Register route wrote password to BOTH. Let's use Student model to be precise about "Student Login".

        const student = await prisma.student.findUnique({
            where: { email }
        })

        if (!student) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            )
        }

        // 2. Validate Password
        const isValid = await bcrypt.compare(password, student.password)

        if (!isValid) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            )
        }

        // 3. Generate JWT
        const token = await signJWT({
            studentId: student.id,
            email: student.email,
            role: 'STUDENT' // Enforce student role
        })

        // 4. Set Cookie
        const serializedCookie = cookie.serialize('student-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/'
        })

        // 5. Return success
        return new NextResponse(
            JSON.stringify({ success: true, redirect: '/student/dashboard' }),
            {
                status: 200,
                headers: { 'Set-Cookie': serializedCookie, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la connexion' },
            { status: 500 }
        )
    }
}
