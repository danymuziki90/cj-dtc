import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { resolveAppBaseUrl, sendEmail } from '@/lib/email'
import { provisionStudentAccountFromEnrollment } from '@/lib/student/account-provisioning'

const STUDENT_PAYMENT_LOCK_MESSAGE =
  "Le compte etudiant ne peut etre cree qu'apres validation complete du paiement de la session souscrite."

function buildStudentAccountCreationError(reason: string | null) {
  if (reason === 'payment_pending') {
    return {
      status: 409,
      error: STUDENT_PAYMENT_LOCK_MESSAGE,
    }
  }

  if (reason === 'waitlist') {
    return {
      status: 409,
      error: "Le compte etudiant ne peut pas etre cree pour une inscription en liste d'attente.",
    }
  }

  if (reason === 'ineligible') {
    return {
      status: 409,
      error: "Le compte etudiant ne peut pas etre cree pour cette inscription.",
    }
  }

  return {
    status: 404,
    error: 'Inscription introuvable.',
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  try {
    const resolvedParams = await params
    const enrollmentId = Number(resolvedParams.id)
    const body = await req.json()
    const { status, reason, notes, paymentStatus, action, paymentMethod, amount, reference, transactionId } = body

    if (!Number.isFinite(enrollmentId)) {
      return NextResponse.json({ error: "Identifiant d'inscription invalide" }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        formation: true,
        session: true,
        payments: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Inscription non trouvee' }, { status: 404 })
    }

    if (action === 'createStudentAccount') {
      const provision = await provisionStudentAccountFromEnrollment({
        enrollmentId: enrollment.id,
        request: req,
        appBaseUrl: resolveAppBaseUrl(req.url),
        source: `admin:${auth.admin.username}:manual-account-create`,
      })

      if (!provision.eligible || !provision.student) {
        const failure = buildStudentAccountCreationError(provision.reason)
        return NextResponse.json({ error: failure.error }, { status: failure.status })
      }

      const updatedEnrollment = await prisma.enrollment.findUnique({
        where: { id: enrollment.id },
        include: {
          formation: true,
          session: true,
          payments: true,
        },
      })

      return NextResponse.json({
        success: true,
        enrollment: updatedEnrollment,
        student: provision.student,
        account: provision.accountStatus,
        accountCreated: provision.accountCreated,
        accountActivated: provision.accountActivated,
        credentials: provision.credentials,
        notifications: provision.notifications,
      })
    }

    if (action === 'confirmPayment') {
      const paidAmount = enrollment.totalAmount > 0 ? enrollment.totalAmount : enrollment.paidAmount || 0
      const now = new Date()
      const successPayments = enrollment.payments.filter((payment) =>
        ['success', 'completed'].includes(payment.status),
      )

      if (successPayments.length === 0) {
        await prisma.payment.create({
          data: {
            enrollmentId: enrollment.id,
            amount: amount !== undefined ? Number(amount) : paidAmount,
            method: paymentMethod || enrollment.paymentMethod || 'mobile_money',
            status: 'success',
            reference: reference || null,
            transactionId: transactionId || null,
            paidAt: now,
            notes: JSON.stringify({
              source: 'admin-confirmation',
              reason: reason || null,
            }),
          },
        })
      }

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          paymentStatus: 'paid',
          paidAmount,
          paymentDate: now,
          paymentMethod: paymentMethod || enrollment.paymentMethod || 'mobile_money',
          status:
            enrollment.status === 'pending' || enrollment.status === 'accepted'
              ? 'confirmed'
              : enrollment.status,
          ...(notes !== undefined ? { notes } : {}),
        },
      })

      const provision = await provisionStudentAccountFromEnrollment({
        enrollmentId: enrollment.id,
        request: req,
        appBaseUrl: resolveAppBaseUrl(req.url),
        source: `admin:${auth.admin.username}:payment-confirmation`,
      })

      if (!provision.eligible || !provision.student?.username) {
        return NextResponse.json(
          { error: 'Compte etudiant introuvable apres confirmation du paiement.' },
          { status: 500 },
        )
      }

      const updatedEnrollment = await prisma.enrollment.findUnique({
        where: { id: enrollment.id },
        include: {
          formation: true,
          session: true,
          payments: true,
        },
      })

      return NextResponse.json({
        success: true,
        enrollment: updatedEnrollment,
        student: provision.student,
        account: provision.accountStatus,
        accountCreated: provision.accountCreated,
        accountActivated: provision.accountActivated,
        credentials: provision.credentials,
        notifications: provision.notifications,
      })
    }

    if (
      status &&
      !['pending', 'accepted', 'rejected', 'cancelled', 'confirmed', 'completed', 'waitlist'].includes(status)
    ) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: { formation: true, session: true, payments: true },
    })

    if (status && status !== enrollment.status) {
      if (status === 'accepted') {
        await sendEmail(
          enrollment.email,
          `Inscription acceptee - ${enrollment.formation.title}`,
          `
            <h2>Bonjour ${enrollment.firstName},</h2>
            <p>Votre inscription a ete acceptee pour la session <strong>${enrollment.formation.title}</strong>.</p>
            <p>Prochaine etape: finaliser le paiement.</p>
          `,
        )
      } else if (status === 'rejected') {
        await sendEmail(
          enrollment.email,
          `Inscription non retenue - ${enrollment.formation.title}`,
          `
            <h2>Bonjour ${enrollment.firstName},</h2>
            <p>Votre inscription n'a pas ete retenue pour <strong>${enrollment.formation.title}</strong>.</p>
            ${reason ? `<p>Motif: ${reason}</p>` : ''}
          `,
        )
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise a jour' }, { status: 500 })
  }
}
