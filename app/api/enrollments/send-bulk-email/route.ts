import { prisma } from '../../../../lib/prisma'
import { sendEmail } from '../../../../lib/email'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { recipientIds, subject, message } = await req.json()

        if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
            return NextResponse.json(
                { error: 'Invalid recipient IDs' },
                { status: 400 }
            )
        }

        if (!subject || !message) {
            return NextResponse.json(
                { error: 'Subject and message are required' },
                { status: 400 }
            )
        }

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

                await sendEmail({
                    to: enrollment.email,
                    subject,
                    html: personalizedMessage
                })

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
