import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { sendAcceptanceEmail, sendRejectionEmail } from '../../../../lib/email'

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params
        const enrollmentId = parseInt(resolvedParams.id)
        const { status, reason } = await req.json()

        if (!status || !['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
            return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
        }

        // Fetch enrollment with formation details
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { formation: true }
        })

        if (!enrollment) {
            return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 })
        }

        // Update enrollment status
        const updated = await prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { status },
            include: { formation: true }
        })

        // Send email based on new status
        if (status === 'accepted' && enrollment.status !== 'accepted') {
            await sendAcceptanceEmail(updated)
        } else if (status === 'rejected' && enrollment.status !== 'rejected') {
            await sendRejectionEmail(updated, reason)
        }

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('Error updating enrollment:', error)
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }
}
