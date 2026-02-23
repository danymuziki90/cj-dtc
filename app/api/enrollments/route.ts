import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { sendEmail } from '../../../lib/email'

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url, 'http://localhost')
    const formationId = url.searchParams.get('formationId')
    const sessionId = url.searchParams.get('sessionId')
    const status = url.searchParams.get('status')
    const paymentStatus = url.searchParams.get('paymentStatus')

    const where: any = {}
    if (formationId) where.formationId = parseInt(formationId)
    if (sessionId) where.sessionId = parseInt(sessionId)
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        formation: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        session: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            location: true,
            format: true,
            maxParticipants: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des inscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      motivationLetter,
      formationId,
      sessionId
    } = body

    // Validation
    if (!firstName || !lastName || !email || !formationId) {
      return NextResponse.json(
        { error: 'Données manquantes (prénom, nom, email, formation)' },
        { status: 400 }
      )
    }

    // Vérifier que la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id: parseInt(formationId) }
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    let status = 'pending'
    let onWaitlist = false

    // Vérifier la capacité de la session si sessionId est fourni
    if (sessionId) {
      const session = await prisma.trainingSession.findUnique({
        where: { id: parseInt(sessionId) },
        include: {
          enrollments: {
            where: { status: { not: 'rejected' } }
          }
        }
      })

      if (!session) {
        return NextResponse.json(
          { error: 'Session non trouvée' },
          { status: 404 }
        )
      }

      const currentEnrollments = session.enrollments.length
      const isFull = currentEnrollments >= session.maxParticipants

      if (isFull) {
        status = 'waitlist'
        onWaitlist = true
      }
    }

    // Créer l'inscription
    const enrollment = await prisma.enrollment.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        motivationLetter: motivationLetter || null,
        formationId: parseInt(formationId),
        sessionId: sessionId ? parseInt(sessionId) : null,
        startDate: new Date(),
        status
      },
      include: {
        formation: {
          select: {
            id: true,
            title: true
          }
        },
        session: {
          select: {
            id: true,
            startDate: true,
            location: true,
            maxParticipants: true
          }
        }
      }
    })

    return NextResponse.json(
      {
        ...enrollment,
        onWaitlist,
        message: onWaitlist ? 'Inscription en liste d\'attente (session complète)' : 'Inscription enregistrée avec succès'
      },
      { status: 201 })
  } catch (error: any) {
    console.error('Enrollment error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Une inscription avec cet email existe déjà pour cette formation' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'inscription' },
      { status: 500 }
    )
  }
}

// PATCH /api/enrollments - Mettre à jour le statut d'une inscription
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { enrollmentId, status, paymentStatus, notes } = body

    if (!enrollmentId || !status) {
      return NextResponse.json(
        { error: 'ID de l\'inscription et statut requis' },
        { status: 400 }
      )
    }

    // Récupérer l'inscription actuelle pour comparer les statuts
    const oldEnrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) },
      include: {
        formation: true,
        session: true
      }
    })

    if (!oldEnrollment) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    // Mettre à jour l'inscription
    const enrollment = await prisma.enrollment.update({
      where: { id: parseInt(enrollmentId) },
      data: {
        status,
        ...(paymentStatus && { paymentStatus }),
        ...(notes && { notes })
      },
      include: {
        formation: true,
        session: true
      }
    })

    // Envoyer un email si le statut a changé
    if (oldEnrollment.status !== status) {
      let emailContent = null

      switch (status) {
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
              </div>
              ` : ''}
              <p>Prochaines étapes:</p>
              <ul>
                <li>Confirmation de votre participation</li>
                <li>Effectuer le paiement si nécessaire</li>
                <li>Recevoir les détails d'accès à la plateforme</li>
              </ul>
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

        case 'waitlist':
          emailContent = {
            to: enrollment.email,
            subject: `Liste d'attente - ${enrollment.formation.title}`,
            html: `
              <h2>Liste d'attente</h2>
              <p>Bonjour ${enrollment.firstName},</p>
              <p>Votre inscription à la formation <strong>${enrollment.formation.title}</strong> a été ajoutée à la <strong>liste d'attente</strong> car la session est actuellement complète.</p>
              <p>Vous serez notifié dès qu'une place se libère ou qu'une nouvelle session est organisée.</p>
            `
          }
          break
      }

      // Envoyer l'email s'il y a du contenu
      if (emailContent) {
        try {
          await sendEmail(emailContent)
        } catch (error) {
          console.error('Erreur lors de l\'envoi de l\'email:', error)
          // Ne pas bloquer la mise à jour si l'email échoue
        }
      }
    }

    // Envoyer un rappel de paiement si le statut n'est pas 'paid' et que le paiement était défini
    if (paymentStatus === 'unpaid' && oldEnrollment.paymentStatus !== 'unpaid') {
      try {
        await sendEmail({
          to: enrollment.email,
          subject: `Rappel: Paiement requis pour ${enrollment.formation.title}`,
          html: `
            <h2>Rappel de paiement</h2>
            <p>Bonjour ${enrollment.firstName},</p>
            <p>Nous avons remarqué que le paiement pour votre inscription à <strong>${enrollment.formation.title}</strong> est requis.</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
              <p><strong>Montant à payer:</strong> $${(enrollment.totalAmount - enrollment.paidAmount).toLocaleString()}</p>
            </div>
            <p>Veuillez nous contacter pour effectuer le paiement.</p>
          `
        })
      } catch (error) {
        console.error('Erreur envoi rappel paiement:', error)
      }
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Update enrollment error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'inscription' },
      { status: 500 }
    )
  }
}
