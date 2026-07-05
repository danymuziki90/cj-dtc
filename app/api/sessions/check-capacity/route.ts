import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { sendEmail } from '../../../../lib/email'

export const dynamic = 'force-dynamic'

// POST /api/sessions/check-capacity - Vérifier les sessions complètes et notifier
export async function POST(req: NextRequest) {
  try {
    // Récupérer toutes les sessions ouvertes
    const sessions = await prisma.trainingSession.findMany({
      where: {
        status: 'ouverte'
      },
      include: {
        formation: {
          select: {
            title: true
          }
        },
        waitlist: {
          include: {
            enrollment: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    })

    const notifications = []

    for (const session of sessions) {
      // Vérifier si la session est complète
      if (session.currentParticipants >= session.maxParticipants) {
        // Mettre à jour le statut si nécessaire
        if (session.status !== 'complete') {
          await prisma.trainingSession.update({
            where: { id: session.id },
            data: { status: 'complete' }
          })
        }

        // Notifier les personnes en liste d'attente qu'une place pourrait se libérer
        for (const waitlistItem of session.waitlist) {
          if (!waitlistItem.notifiedAt) {
            try {
              await sendEmail({
                to: waitlistItem.enrollment.email,
                subject: 'Place disponible - Liste d\'attente',
                html: `
                  <h2>Bonjour ${waitlistItem.enrollment.firstName},</h2>
                  <p>La session "${session.formation.title}" est maintenant complète.</p>
                  <p>Vous êtes en liste d'attente à la position ${waitlistItem.position}.</p>
                  <p>Nous vous contacterons dès qu'une place se libérera.</p>
                  <p>Cordialement,<br>CJ Development Training Center</p>
                `
              })

              await prisma.waitlist.update({
                where: { id: waitlistItem.id },
                data: { notifiedAt: new Date() }
              })

              notifications.push({
                sessionId: session.id,
                email: waitlistItem.enrollment.email,
                status: 'notified'
              })
            } catch (error) {
              console.error(`Erreur notification pour ${waitlistItem.enrollment.email}:`, error)
            }
          }
        }
      }

      // Vérifier si une place s'est libérée et promouvoir depuis la liste d'attente
      if (session.currentParticipants < session.maxParticipants && session.waitlist.length > 0) {
        const nextInWaitlist = session.waitlist[0]
        
        try {
          // Promouvoir la première personne de la liste
          await prisma.enrollment.update({
            where: { id: nextInWaitlist.enrollmentId },
            data: {
              sessionId: session.id,
              status: 'confirmed'
            }
          })

          await prisma.trainingSession.update({
            where: { id: session.id },
            data: {
              currentParticipants: session.currentParticipants + 1
            }
          })

          // Notifier la personne promue
          await sendEmail({
            to: nextInWaitlist.enrollment.email,
            subject: 'Place disponible - Inscription confirmée',
            html: `
              <h2>Félicitations ${nextInWaitlist.enrollment.firstName}!</h2>
              <p>Une place s'est libérée pour la session "${session.formation.title}".</p>
              <p>Votre inscription est maintenant confirmée!</p>
              <p>Date de début: ${new Date(session.startDate).toLocaleDateString('fr-FR')}</p>
              <p>Nous avons hâte de vous accueillir!</p>
              <p>Cordialement,<br>CJ Development Training Center</p>
            `
          })

          // Supprimer de la liste d'attente
          await prisma.waitlist.delete({
            where: { id: nextInWaitlist.id }
          })

          notifications.push({
            sessionId: session.id,
            email: nextInWaitlist.enrollment.email,
            status: 'promoted'
          })
        } catch (error) {
          console.error(`Erreur promotion pour ${nextInWaitlist.enrollment.email}:`, error)
        }
      }
    }

    return NextResponse.json({
      message: 'Vérification terminée',
      sessionsChecked: sessions.length,
      notificationsSent: notifications.length,
      notifications
    })
  } catch (error: any) {
    console.error('Erreur lors de la vérification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
