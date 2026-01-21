import { NextResponse } from 'next/server'
import { sendEmail } from '../../../lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Send email using existing email service
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #002D72;">Nouveau message de contact</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nom :</strong> ${body.name}</p>
          <p><strong>Email :</strong> ${body.email}</p>
          <p><strong>Sujet :</strong> ${body.subject}</p>
        </div>
        <div style="background-color: white; padding: 20px; border-left: 4px solid #E30613; margin: 20px 0;">
          <p style="white-space: pre-wrap;">${body.message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          Centre Panafricain de Formation Professionnelle<br>
          CJ DEVELOPMENT TRAINING CENTER
        </p>
      </div>
    `

    const emailSent = await sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.MAIL_USER || 'contact@cjdevelopmenttc.com',
      subject: `Contact: ${body.subject}`,
      html: emailHtml
    })

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Message envoyé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}
