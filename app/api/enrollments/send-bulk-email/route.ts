import { prisma } from '../../../../lib/prisma'
import { sendEmail } from '../../../../lib/email'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const bulkEmailSchema = z.object({
    recipientIds: z.array(z.union([z.number(), z.string()]).transform(val => Number(val))).min(1, 'Destinataires requis'),
    subject: z.string().trim().min(1, 'Sujet requis'),
    message: z.string().trim().min(1, 'Message requis'),
})

export async function POST(req: Request) {
    try {
        const parsed = bulkEmailSchema.safeParse(await req.json())
        if (!parsed.success) {
            const errorMsg = parsed.error.issues[0]?.message || 'Données invalides.'
            return NextResponse.json({ error: errorMsg }, { status: 400 })
        }

        const { recipientIds, subject, message } = parsed.data

        const enrollments = await prisma.enrollment.findMany({
            where: {
                id: { in: recipientIds },
                status: 'accepted'
            },
            include: {
                formation: {
                    select: {
                        title: true
                    }
                }
            }
        })

        if (enrollments.length === 0) {
            return NextResponse.json(
                { error: 'No accepted enrollments found' },
                { status: 404 }
            )
        }

        let sentCount = 0
        const errors: string[] = []

        for (const enrollment of enrollments) {
            try {
                const personalizedMessage = message
                    .replace(/{firstName}/g, enrollment.firstName)
                    .replace(/{lastName}/g, enrollment.lastName)
                    .replace(/{email}/g, enrollment.email)
                    .replace(/{formationTitle}/g, enrollment.formation.title)

                await sendEmail(
                    enrollment.email,
                    subject,
                    personalizedMessage
                )

                sentCount++
                console.log(`✅ Email sent to ${enrollment.email}`)
            } catch (error: any) {
                errors.push(`Failed to send to ${enrollment.email}: ${error.message}`)
                console.error(`Error sending email to ${enrollment.email}:`, error)
            }
        }

        return NextResponse.json(
            {
                success: true,
                sent: sentCount,
                total: enrollments.length,
                errors: errors.length > 0 ? errors : undefined
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Bulk email error:', error)
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        )
    }
}
