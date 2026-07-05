
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const runtime = "nodejs"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
        }

        // Find token in DB
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { token }
        })

        if (!verificationToken) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 400 })
        }

        if (new Date() > verificationToken.expires) {
            return NextResponse.json({ error: 'Token expiré' }, { status: 400 })
        }

        // Update Student status
        const student = await prisma.student.update({
            where: { email: verificationToken.identifier },
            data: { status: 'ACTIVE' }
        })

        // Update User emailVerified
        // Only if a user exists with this email (which should be true)
        await prisma.user.updateMany({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() }
        })

        // Delete token
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: verificationToken.identifier,
                    token: verificationToken.token
                }
            }
        })

        // Redirect to login or success page
        return NextResponse.redirect(new URL('/auth/login?verified=true', req.url))

    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 })
    }
}
