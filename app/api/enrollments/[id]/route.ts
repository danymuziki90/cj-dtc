import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { hashPassword } from '@/lib/auth-portal/password'

function buildBaseUsername(firstName: string, lastName: string, email: string) {
  const fromName = `${firstName}.${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '')
    .replace(/\.+/g, '.')
    .replace(/^\./, '')
    .replace(/\.$/, '')

  if (fromName.length >= 3) return fromName

  const localPart = email.split('@')[0] || `student${Date.now()}`
  return localPart.toLowerCase().replace(/[^a-z0-9.]/g, '') || `student${Date.now()}`
}

async function ensureUniqueUsername(baseUsername: string) {
  let candidate = baseUsername
  let suffix = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.student.findUnique({ where: { username: candidate } })
    if (!existing) return candidate
    candidate = `${baseUsername}${suffix}`
    suffix += 1
  }
}

function generateSecurePassword() {
  return `Std#${randomBytes(8).toString('hex')}`
}

function generateStudentNumber() {
  return `STU${Date.now().toString().slice(-8)}${randomBytes(2).toString('hex').toUpperCase()}`
}

function resolveAppBaseUrl(request: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_RES_URL
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  const url = new URL(request.url)
  return `${url.protocol}//${url.host}`
}

async function sendPaymentConfirmationCredentialsEmail(params: {
  to: string
  fullName: string
  formationTitle: string
  username: string
  password?: string
  appBaseUrl: string
}) {
  const loginLink = `${params.appBaseUrl}/student/login`
  const isNewAccount = Boolean(params.password)

  await sendEmail(
    params.to,
    `Paiement confirme - Acces etudiant ${params.formationTitle}`,
    `
      <h2>Bonjour ${params.fullName},</h2>
      <p>Votre paiement pour la session <strong>${params.formationTitle}</strong> a ete confirme.</p>
      ${
        isNewAccount
          ? `<p>Votre compte etudiant a ete cree automatiquement.</p>
             <p><strong>Nom d'utilisateur:</strong> ${params.username}</p>
             <p><strong>Mot de passe initial:</strong> ${params.password}</p>`
          : `<p>Votre compte etudiant existe deja.</p>
             <p><strong>Nom d'utilisateur:</strong> ${params.username}</p>`
      }
      <p>Connectez-vous ici: <a href="${loginLink}">${loginLink}</a></p>
      <p>Nous vous recommandons de modifier votre mot de passe apres la premiere connexion.</p>
    `
  )
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const enrollmentId = parseInt(resolvedParams.id)
    const body = await req.json()
    const { status, reason, notes, paymentStatus, action, paymentMethod, amount, reference, transactionId } = body

    if (Number.isNaN(enrollmentId)) {
      return NextResponse.json({ error: 'Identifiant d’inscription invalide' }, { status: 400 })
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

    if (action === 'confirmPayment') {
      const paidAmount = enrollment.totalAmount > 0 ? enrollment.totalAmount : enrollment.paidAmount || 0
      const now = new Date()

      const successPayments = enrollment.payments.filter((payment) =>
        ['success', 'completed'].includes(payment.status)
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

      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          paymentStatus: 'paid',
          paidAmount,
          paymentDate: now,
          paymentMethod: paymentMethod || enrollment.paymentMethod || 'mobile_money',
          status:
            enrollment.status === 'pending' || enrollment.status === 'accepted' || enrollment.status === 'waitlist'
              ? 'confirmed'
              : enrollment.status,
          ...(notes !== undefined ? { notes } : {}),
        },
        include: {
          formation: true,
          session: true,
          payments: true,
        },
      })

      const existingStudent = await prisma.student.findUnique({
        where: { email: enrollment.email },
      })

      let student = existingStudent
      let plainPassword: string | null = null

      if (!existingStudent) {
        plainPassword = generateSecurePassword()
        const hashedPassword = await hashPassword(plainPassword)
        const baseUsername = buildBaseUsername(enrollment.firstName, enrollment.lastName, enrollment.email)
        const username = await ensureUniqueUsername(baseUsername)

        student = await prisma.student.create({
          data: {
            firstName: enrollment.firstName,
            lastName: enrollment.lastName,
            email: enrollment.email,
            username,
            password: hashedPassword,
            phone: enrollment.phone || null,
            address: enrollment.address || null,
            studentNumber: generateStudentNumber(),
            status: 'ACTIVE',
            role: 'STUDENT',
          },
        })
      } else if (existingStudent.status !== 'ACTIVE') {
        student = await prisma.student.update({
          where: { id: existingStudent.id },
          data: { status: 'ACTIVE' },
        })
      }

      if (!student || !student.username) {
        return NextResponse.json(
          { error: 'Compte etudiant introuvable apres confirmation du paiement.' },
          { status: 500 }
        )
      }

      await sendPaymentConfirmationCredentialsEmail({
        to: enrollment.email,
        fullName: `${enrollment.firstName} ${enrollment.lastName}`.trim(),
        formationTitle: enrollment.formation.title,
        username: student.username,
        password: plainPassword || undefined,
        appBaseUrl: resolveAppBaseUrl(req),
      })

      return NextResponse.json({
        success: true,
        enrollment: updatedEnrollment,
        student: {
          id: student.id,
          email: student.email,
          username: student.username,
          status: student.status,
        },
        accountCreated: !existingStudent,
        credentials: plainPassword
          ? {
              username: student.username,
              password: plainPassword,
            }
          : null,
      })
    }

    if (status && !['pending', 'accepted', 'rejected', 'cancelled', 'confirmed', 'completed', 'waitlist'].includes(status)) {
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
          `
        )
      } else if (status === 'rejected') {
        await sendEmail(
          enrollment.email,
          `Inscription non retenue - ${enrollment.formation.title}`,
          `
            <h2>Bonjour ${enrollment.firstName},</h2>
            <p>Votre inscription n'a pas ete retenue pour <strong>${enrollment.formation.title}</strong>.</p>
            ${reason ? `<p>Motif: ${reason}</p>` : ''}
          `
        )
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}
