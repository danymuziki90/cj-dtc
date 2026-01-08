import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // TODO: Implémenter l'envoi d'email (ex: avec Resend, SendGrid, etc.)
    // Pour l'instant, on simule juste le succès
    // Exemple avec Resend:
    // await resend.emails.send({
    //   from: 'contact@cjdevelopmenttc.com',
    //   to: 'contact@cjdevelopmenttc.com',
    //   subject: `Contact: ${body.subject}`,
    //   html: `<p>De: ${body.name} (${body.email})</p><p>${body.message}</p>`
    // })

    // Log pour le développement
    console.log('Nouveau message de contact:', {
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message.substring(0, 100) + '...'
    })

    return NextResponse.json(
      { message: 'Message envoyé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}
