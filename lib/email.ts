import nodemailer from 'nodemailer'

// Créer un transporteur Mailtrap ou Gmail
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
})

export async function sendEmail({
    to,
    subject,
    html
}: {
    to: string
    subject: string
    html: string
}) {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM || 'noreply@cjdtc.com',
            to,
            subject,
            html
        })
        console.log('Email sent:', info.messageId)
        return true
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

export async function sendAcceptanceEmail(enrollment: any) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #002D72;">Félicitations, ${enrollment.firstName}!</h2>
      <p>Nous avons le plaisir de vous informer que votre inscription à la formation <strong>${enrollment.formation.title}</strong> a été <span style="color: #E30613; font-weight: bold;">ACCEPTÉE</span>.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #002D72; margin-top: 0;">Détails de votre inscription :</h3>
        <p><strong>Formation :</strong> ${enrollment.formation.title}</p>
        <p><strong>Date de début :</strong> ${new Date(enrollment.startDate).toLocaleDateString('fr-FR')}</p>
        <p><strong>Votre email :</strong> ${enrollment.email}</p>
      </div>

      <p>Bienvenue chez CJ DTC ! Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        Centre Panafricain de Formation Professionnelle<br>
        CJ DEVELOPMENT TRAINING CENTER
      </p>
    </div>
  `

    return sendEmail({
        to: enrollment.email,
        subject: `Acceptation de votre inscription - ${enrollment.formation.title}`,
        html
    })
}

export async function sendRejectionEmail(enrollment: any, reason?: string) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #002D72;">Votre inscription</h2>
      <p>Nous avons bien reçu votre demande d'inscription pour la formation <strong>${enrollment.formation.title}</strong>.</p>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E30613;">
        <p style="color: #333; margin: 0;">
          Malheureusement, nous regrettons de vous informer que votre inscription n'a pas pu être acceptée cette fois-ci.
        </p>
        ${reason ? `<p style="margin: 10px 0 0 0; color: #666;"><strong>Raison :</strong> ${reason}</p>` : ''}
      </div>

      <p>Nous vous encourageons à postuler à nouveau ou à nous contacter pour discuter d'autres formations qui pourraient vous intéresser.</p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        Centre Panafricain de Formation Professionnelle<br>
        CJ DEVELOPMENT TRAINING CENTER
      </p>
    </div>
  `

    return sendEmail({
        to: enrollment.email,
        subject: `Votre inscription - ${enrollment.formation.title}`,
        html
    })
}
