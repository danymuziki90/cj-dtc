import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { sendEmail } from '../../../../lib/email'

export const runtime = "nodejs"

// POST /api/enrollments/notify - Envoyer une notification par email
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

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: parseInt(enrollmentId) },
            include: {
                formation: true,
                session: true
            }
        })

        if (!enrollment) {
            return NextResponse.json(
                { error: 'Inscription non trouvée' },
                { status: 404 }
            )
        }

        let emailSent = false
        let emailContent: any = null

        // Définir le contenu du email selon le type de notification
        switch (notificationType) {
            case 'accepted':
                emailContent = {
                    to: enrollment.email,
                    subject: `Félicitations ! Votre inscription a été acceptée - ${enrollment.formation.title}`,
                    html: `
                        <h2>Félicitations ${enrollment.firstName} ${enrollment.lastName} !</h2>
                        <p>Votre inscription à la formation <strong>${enrollment.formation.title}</strong> a été <strong>acceptée</strong>.</p>
                        ${enrollment.session ? `
                        <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #0284c7;">
                            <h3>Détails de la session:</h3>
                            <p><strong>Date:</strong> ${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')}</p>
                            <p><strong>Lieu:</strong> ${enrollment.session.location}</p>
                            <p><strong>Format:</strong> ${enrollment.session.format}</p>
                        </div>
                        ` : ''}
                        <p>Prochaines étapes:</p>
                        <ul>
                            <li>Confirmation de votre participation</li>
                            <li>Effectuer le paiement si nécessaire</li>
                            <li>Recevoir les détails d'accès à la plateforme</li>
                        </ul>
                        <p>Pour toute question, contactez-nous.</p>
                    `
                }
                break

            case 'rejected':
                emailContent = {
                    to: enrollment.email,
                    subject: `Votre inscription - ${enrollment.formation.title}`,
                    html: `
                        <h2>Bonjour ${enrollment.firstName} ${enrollment.lastName},</h2>
                        <p>Malheureusement, votre inscription à la formation <strong>${enrollment.formation.title}</strong> n'a pas pu être acceptée cette fois.</p>
                        <p>Vous pouvez:</p>
                        <ul>
                            <li>Vous inscrire à une prochaine session</li>
                            <li>Nous contacter pour discuter d'alternatives</li>
                            <li>Consulter les autres formations disponibles</li>
                        </ul>
                        <p>Pour toute question, n'hésitez pas à nous contacter.</p>
                    `
                }
                break

            case 'confirmed':
                emailContent = {
                    to: enrollment.email,
                    subject: `Confirmation de participation - ${enrollment.formation.title}`,
                    html: `
                        <h2>Confirmation reçue !</h2>
                        <p>Nous avons bien reçu la confirmation de votre participation à la formation <strong>${enrollment.formation.title}</strong>.</p>
                        ${enrollment.session ? `
                        <div style="margin: 20px 0; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #16a34a;">
                            <h3>Vous êtes maintenant inscrit pour:</h3>
                            <p><strong>Date:</strong> ${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')}</p>
                            <p><strong>Lieu:</strong> ${enrollment.session.location}</p>
                        </div>
                        ` : ''}
                        <p>Vous recevrez avant la date de la session:</p>
                        <ul>
                            <li>Les détails d'accès à la plateforme</li>
                            <li>Les ressources pédagogiques</li>
                            <li>Un rappel de la date et heure</li>
                        </ul>
                    `
                }
                break

            case 'payment_reminder':
                emailContent = {
                    to: enrollment.email,
                    subject: `Rappel: Paiement requis pour ${enrollment.formation.title}`,
                    html: `
                        <h2>Rappel de paiement</h2>
                        <p>Bonjour ${enrollment.firstName},</p>
                        <p>Nous avons remarqué que le paiement pour votre inscription à <strong>${enrollment.formation.title}</strong> n'est pas encore reçu.</p>
                        <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
                            <p><strong>Montant à payer:</strong> $${(enrollment.totalAmount - enrollment.paidAmount).toLocaleString()}</p>
                            <p><strong>Montant total:</strong> $${enrollment.totalAmount.toLocaleString()}</p>
                        </div>
                        <p><a href="https://example.com/payment" style="display: inline-block; padding: 10px 20px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 5px;">Effectuer le paiement</a></p>
                        <p>Pour toute question, veuillez nous contacter.</p>
                    `
                }
                break

            case 'waitlist':
                emailContent = {
                    to: enrollment.email,
                    subject: `Liste d'attente - ${enrollment.formation.title}`,
                    html: `
                        <h2>Liste d'attente</h2>
                        <p>Bonjour ${enrollment.firstName},</p>
                        <p>Votre inscription à la formation <strong>${enrollment.formation.title}</strong> a été ajoutée à la <strong>liste d'attente</strong> car la session est actuellement complète.</p>
                        <p>Vous serez notifié dès qu'une place se libère ou qu'une nouvelle session est organisée.</p>
                        <p>Merci de votre intérêt pour cette formation.</p>
                    `
                }
                break
        }

        // Envoyer l'email
        if (emailContent) {
            try {
                await sendEmail(emailContent)
                emailSent = true
            } catch (error) {
                console.error('Erreur lors de l\'envoi de l\'email:', error)
            }
        }

        return NextResponse.json({
            success: true,
            emailSent,
            message: emailSent ? 'Email envoyé avec succès' : 'Notification créée mais email non envoyé'
        })
    } catch (error) {
        console.error('Erreur notification:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la création de la notification' },
            { status: 500 }
        )
    }
}
