import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
        }

        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email requis' }, { status: 400 })
        }

        const student = await prisma.student.update({
            where: { email },
            data: { status: 'ACTIVE' }
        })

        return NextResponse.json({
            success: true,
            message: 'Étudiant activé',
            student: {
                email: student.email,
                status: student.status
            }
        })
    } catch (error: any) {
        console.error('Error activating student:', error)
        return NextResponse.json(
            { error: 'Erreur lors de l\'activation' },
            { status: 500 }
        )
    }
}