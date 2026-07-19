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
    const { status, reason, notes, action } = body

    if (!Number.isFinite(enrollmentId)) {
      return NextResponse.json({ error: "Identifiant d'inscription invalide" }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        formation: true,
        session: true,
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
        include: { formation: true, session: true },
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

    // Helper function to parse notes — robust against malformed JSON
    function parseNotes(notesStr?: string | null) {
      if (!notesStr || typeof notesStr !== 'string') {
        return { answers: {}, formType: null, adminComment: '', history: [] }
      }
      if (!notesStr.startsWith('{')) {
        // Plain string comment — not JSON
        return { answers: {}, formType: null, adminComment: notesStr, history: [] }
      }
      try {
        const parsed = JSON.parse(notesStr)
        return {
          answers: parsed.answers || {},
          formType: parsed.formType || null,
          adminComment: typeof parsed.adminComment === 'string' ? parsed.adminComment : '',
          history: Array.isArray(parsed.history) ? parsed.history : [],
        }
      } catch (err) {
        console.error('[enrollment PUT] Notes JSON parse error, using plain text fallback:', err)
        return { answers: {}, formType: null, adminComment: notesStr, history: [] }
      }
    }

    const notesObj = parseNotes(notes !== undefined ? notes : enrollment.notes)
    let updatedNotes = enrollment.notes || ''
    let emailSent = false

    if (status && status !== enrollment.status) {
      // Load email template
      const template = await prisma.emailTemplate.findUnique({ where: { id: status } })
      
      const datesText = enrollment.session
        ? `${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')} au ${new Date(enrollment.session.endDate).toLocaleDateString('fr-FR')}`
        : new Date(enrollment.startDate).toLocaleDateString('fr-FR')

      const sessionMeta = enrollment.session
        ? (enrollment.session.prerequisites?.startsWith('{')
            ? JSON.parse(enrollment.session.prerequisites)
            : null)
        : null
      const sessionTitle = sessionMeta?.customTitle || (enrollment.session ? `#${enrollment.session.id}` : `#${enrollment.sessionId || ''}`)
      
      const variables: Record<string, string> = {
        Nom_etudiant: `${enrollment.firstName} ${enrollment.lastName}`,
        Formation: enrollment.formation.title,
        Session: sessionTitle,
        Dates: datesText,
        Lieu: enrollment.session?.location || 'À distance',
        Coordonnees_contact: process.env.CONTACT_EMAIL || 'contact@cjdevelopmenttc.org',
        Signature: 'CJ Development Training Center',
        Justification: reason || "Aucune justification fournie."
      }

      const replaceVars = (text: string) => {
        return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || variables[key.toLowerCase()] || '')
      }

      let emailSubject = `Suivi de votre inscription - ${enrollment.formation.title}`
      let emailBody = `Bonjour ${variables.Nom_etudiant},\n\nLe statut de votre inscription a changé pour : ${status}.`

      if (template) {
        emailSubject = replaceVars(template.subject)
        emailBody = replaceVars(template.body)
      }

      const { sendEmail, renderBrandedEmailLayout } = await import('@/lib/email')
      const eyebrowLabel = ({
        accepted: 'Admission',
        rejected: 'Candidature',
        waitlist: 'Liste d\'attente',
        cancelled: 'Annulation'
      } as Record<string, string>)[status] || 'Suivi Inscription'

      const htmlContent = renderBrandedEmailLayout({
        eyebrow: eyebrowLabel,
        title: emailSubject,
        introHtml: emailBody.replace(/\n/g, '<br />'),
        bodyHtml: ''
      })

      try {
        await sendEmail({
          to: enrollment.email,
          subject: emailSubject,
          html: htmlContent,
          text: emailBody
        })
        emailSent = true
      } catch (err) {
        console.error("Erreur lors de l'envoi de l'email de notification :", err)
      }

      // Log in AdminAuditLog
      await prisma.adminAuditLog.create({
        data: {
          adminId: auth.admin.id,
          adminUsername: auth.admin.username,
          action: `change_enrollment_status:${status}`,
          targetType: 'Enrollment',
          targetId: String(enrollmentId),
          targetLabel: `${enrollment.firstName} ${enrollment.lastName}`,
          summary: `Statut modifié de ${enrollment.status} à ${status}. Email envoyé: ${emailSent}`,
          metadata: { reason, emailSent }
        }
      })

      // Update history array
      const historyEntry = {
        timestamp: new Date().toISOString(),
        adminUsername: auth.admin.username,
        fromStatus: enrollment.status,
        toStatus: status,
        reason: reason || '',
        emailSent,
        emailType: status
      }
      notesObj.history = [...notesObj.history, historyEntry]
      
      updatedNotes = JSON.stringify({
        answers: notesObj.answers,
        formType: notesObj.formType,
        adminComment: notes !== undefined ? (typeof notes === 'string' && notes.startsWith('{') ? JSON.parse(notes).adminComment : notes) : notesObj.adminComment,
        history: notesObj.history
      })
    } else if (notes !== undefined) {
      let commentVal: string
      if (typeof notes === 'string' && notes.startsWith('{')) {
        try {
          commentVal = JSON.parse(notes).adminComment ?? ''
        } catch {
          commentVal = notes
        }
      } else {
        commentVal = typeof notes === 'string' ? notes : ''
      }
      updatedNotes = JSON.stringify({
        answers: notesObj.answers,
        formType: notesObj.formType,
        adminComment: commentVal,
        history: notesObj.history,
      })
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        ...(status ? { status } : {}),
        notes: updatedNotes,
      },
      include: { formation: true, session: true },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    // Log complet pour diagnostics Vercel
    console.error('[enrollment PUT] Erreur inattendue:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    })
    const userMessage =
      error?.code === 'P2025'
        ? 'Inscription introuvable (ID invalide ou supprimée).'
        : error?.code === 'P2002'
        ? 'Conflit de données — veuillez réessayer.'
        : `Erreur interne : ${error?.message || 'Erreur lors de la mise à jour'}`
    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}
