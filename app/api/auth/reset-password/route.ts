
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export const runtime = "nodejs"

const resetSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(8)
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const result = resetSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }

        const { token, newPassword } = result.data

        // 1. Hash received token to check against DB
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

        // 2. Find token
        // We search by tokenHash directly since it's unique
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token: tokenHash },
            include: { student: true }
        })

        // 3. Verify validity
        if (!resetToken) {
            return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 400 })
        }

        if (new Date() > resetToken.expiresAt) {
            // Clean up expired token
            await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
            return NextResponse.json({ error: 'Token expiré' }, { status: 400 })
        }

        // 4. Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Transaction: Update password, delete ANY reset tokens for this student (security best practice)
        // Also, we should probably update the `User` model password if we are syncing them.
        // The previous implementation syncs Student and User.
        // So update BOTH.

        await prisma.$transaction([
            prisma.student.update({
                where: { id: resetToken.studentId },
                data: { password: hashedPassword }
            }),
            prisma.user.update({
                where: { email: resetToken.student.email },
                data: { password: hashedPassword }
            }),
            // Delete used token
            prisma.passwordResetToken.delete({
                where: { id: resetToken.id }
            })
        ])

        return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé avec succès' })

    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
    }
}
