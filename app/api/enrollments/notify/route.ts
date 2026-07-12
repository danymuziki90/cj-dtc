import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { sendEmail } from '../../../../lib/email'

export const runtime = 'nodejs'

// POST /api/enrollments/notify
// Types supportés depuis la refonte 2026 :
//   - "welcome"   : bienvenue envoyé à la création du compte étudiant
//   - "confirmed" : confirmation de participation à une session
//   - "waitlist"  : notification liste d'attente
//
// Types SUPPRIMÉS (logique paiement / validation manuelle retirée) :
//   - "accepted"         → supprimé, plus de validation admin
//   - "rejected"         → supprimé, plus de validation admin
//   - "payment_reminder" → supprimé, pas de flux paiement dans l'admin
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { enrollmentId, notificationType } = body

    if (!enrollmentId || !notificationType) {
      return NextResponse.json(
        { error: 'enrollmentId et notificationType requis' },
        { status: 400 }
      )
    }

    // Bloquer explicitement les types supprimés pour éviter tout appel résiduel
    const removedTypes = ['accepted', 'rejected', 'payment_reminder']
    if (removedTypes.includes(notificationType)) {
      return NextResponse.json(
        {
          error: `Le type de notification "${notificationType}" a été supprimé. Les flux de validation manuelle et de paiement admin ne sont plus actifs.`,
        },
        { status: 410 }
      )
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) },
      include: { formation: true, session: true },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 })
    }

    let emailContent: { to: string; subject: string; html: string } | null = null

    switch (notificationType) {
      case 'welcome':
        emailContent = {
          to: enrollment.email,
          subject: `Bienvenue chez CJ Development Training Center — ${enrollment.formation.title}`,
          html: `
            <h2>Bienvenue, ${enrollment.firstName} ${enrollment.lastName} !</h2>
            <p>Votre inscription à la formation <strong>${enrollment.formation.title}</strong> est enregistrée et votre compte étudiant est actif.</p>
            ${enrollment.session ? `
            <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #0284c7;">
              <h3>Détails de votre session :</h3>
              <p><strong>Date :</strong> ${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>Lieu :</strong> ${enrollment.session.location}</p>
              <p><strong>Format :</strong> ${enrollment.session.format}</p>
            </div>
            ` : ''}
            <p>Vous pouvez dès maintenant accéder à votre espace étudiant. Vous recevrez les ressources pédagogiques avant le début de la session.</p>
            <p>Pour toute question, contactez-nous.</p>
          `,
        }
        break

      case 'confirmed':
        emailContent = {
          to: enrollment.email,
          subject: `Confirmation de participation — ${enrollment.formation.title}`,
          html: `
            <h2>Confirmation reçue !</h2>
            <p>Nous avons bien enregistré votre participation à la formation <strong>${enrollment.formation.title}</strong>.</p>
            ${enrollment.session ? `
            <div style="margin: 20px 0; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #16a34a;">
              <h3>Vous êtes inscrit pour :</h3>
              <p><strong>Date :</strong> ${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>Lieu :</strong> ${enrollment.session.location}</p>
            </div>
            ` : ''}
            <p>Vous recevrez avant la date de la session les détails d'accès à la plateforme, les ressources pédagogiques et un rappel.</p>
          `,
        }
        break

      case 'waitlist':
        emailContent = {
          to: enrollment.email,
          subject: `Liste d'attente — ${enrollment.formation.title}`,
          html: `
            <h2>Liste d'attente</h2>
            <p>Bonjour ${enrollment.firstName},</p>
            <p>Votre inscription à la formation <strong>${enrollment.formation.title}</strong> a été ajoutée à la <strong>liste d'attente</strong> car la session est actuellement complète.</p>
            <p>Vous serez notifié dès qu'une place se libère ou qu'une nouvelle session est organisée.</p>
            <p>Merci de votre intérêt pour cette formation.</p>
          `,
        }
        break

      default:
        return NextResponse.json(
          { error: `Type de notification inconnu : "${notificationType}"` },
          { status: 400 }
        )
    }

    let emailSent = false
    if (emailContent) {
      try {
        await sendEmail(emailContent)
        emailSent = true
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error)
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent ? 'Email envoyé avec succès' : 'Notification créée mais email non envoyé',
    })
  } catch (error) {
    console.error('Erreur notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    )
  }
}
