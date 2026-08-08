import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '../../../lib/email'
import { prisma } from '@/lib/prisma'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().trim().email('Format d\'email invalide.'),
  subject: z.string().trim().min(5, 'Le sujet doit contenir au moins 5 caractères.'),
  message: z.string().trim().min(10, 'Le message doit contenir au moins 10 caractères.'),
})

import { NextRequest } from 'next/server'
import { apiHandler, ApiError } from '@/lib/api-error'

export const POST = apiHandler(async (req: NextRequest) => {
  const { name, email, subject, message } = contactSchema.parse(await req.json())

  // Save contact message in DB
  await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject,
      message,
      status: 'unread'
    }
  })

  // Send email using existing email service
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0A4FB3;">Nouveau message de contact</h2>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
      </div>
      <div style="background-color: white; padding: 20px; border-left: 4px solid #E53935; margin: 20px 0;">
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        Centre Panafricain de Formation Professionnelle<br>
        CJ DEVELOPMENT TRAINING CENTER
      </p>
    </div>
  `

  const emailSent = await sendEmail({
    to: process.env.CONTACT_EMAIL || process.env.MAIL_USER || 'contact@cjdevelopmenttc.org',
    replyTo: email,
    subject: `Contact: ${subject}`,
    html: emailHtml
  })

  if (!emailSent) {
    throw new ApiError(500, 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.')
  }

  return NextResponse.json(
    { message: 'Message envoyé avec succès' },
    { status: 200 }
  )
})
