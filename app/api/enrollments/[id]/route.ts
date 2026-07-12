import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { resolveAppBaseUrl } from '@/lib/email'
import { provisionStudentAccountFromEnrollment } from '@/lib/student/account-provisioning'

// Refonte 2026 — Changements dans ce fichier :
// - action 'confirmPayment' supprimée (retourne HTTP 410)
// - emails 'accepted' / 'rejected' supprimés (pas de validation manuelle)
// - buildStudentAccountCreationError supprimée (gate paiement retirée)
// - STUDENT_PAYMENT_LOCK_MESSAGE supprimée

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
    const { status, reason, notes, paymentStatus, action } = body

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
      return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 })
    }

    // Créer ou activer le compte étudiant manuellement depuis l'admin
    if (action === 'createStudentAccount') {
      const provision = await provisionStudentAccountFromEnrollment({
        enrollmentId: enrollment.id,
        request: req,
        appBaseUrl: resolveAppBaseUrl(req.url),
        source: `admin:${auth.admin.username}:manual-account-create`,
      })

      if (!provision.eligible || !provision.student) {
        const statusCode = provision.reason === 'waitlist' ? 409 : 404
        const message =
          provision.reason === 'waitlist'
            ? "Le compte étudiant ne peut pas être créé pour une inscription en liste d'attente."
            : provision.reason === 'ineligible'
            ? "Le compte étudiant ne peut pas être créé pour cette inscription (statut inéligible)."
            : 'Inscription introuvable.'
        return NextResponse.json({ error: message }, { status: statusCode })
      }

      const updatedEnrollment = await prisma.enrollment.findUnique({
        where: { id: enrollment.id },
        include: { formation: true, session: true, payments: true },
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

    // confirmPayment supprimé — refonte 2026
    if (action === 'confirmPayment') {
      return NextResponse.json(
        {
          error:
            "L'action confirmPayment a été supprimée. La gestion des paiements n'est plus dans le périmètre admin.",
        },
        { status: 410 },
      )
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}
