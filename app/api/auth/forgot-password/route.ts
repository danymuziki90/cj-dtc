
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '../../../../lib/email'

export const runtime = "nodejs"

const forgotSchema = z.object({
    email: z.string().email()
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const result = forgotSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
        }

        const { email } = result.data

        // 1. Check if student exists
        const student = await prisma.student.findUnique({
            where: { email }
        })

        // Anti-enumeration: Return success even if user not found
        if (!student) {
            return NextResponse.json({ success: true, message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' })
        }

        // 2. Generate Token
        const rawToken = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // 3. Store in DB (hashed)
        // Invalidate existing tokens for this student
        await prisma.passwordResetToken.deleteMany({
            where: { studentId: student.id }
        })

        await prisma.passwordResetToken.create({
            data: {
                token: tokenHash,
                studentId: student.id,
                expiresAt
            }
        })

        // 4. Send Email (raw token)
        await sendPasswordResetEmail(email, rawToken)

        return NextResponse.json({ success: true, message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' })

    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
    }
}
