import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

const emailTemplateSchema = z.object({
    id: z.string().trim().min(1, 'ID requis'),
    subject: z.string().trim().min(1, 'Sujet requis'),
    body: z.string().trim().min(1, 'Contenu requis'),
})

const DEFAULT_TEMPLATES = [
  {
    id: 'accepted',
    subject: "Félicitations - Inscription validée pour la formation {{Formation}}",
    body: `Bonjour {{Nom_etudiant}},

Nous avons le plaisir de vous informer que votre inscription à la session {{Session}} de la formation {{Formation}} a été validée avec succès.

Informations pratiques de votre session :
- Dates : {{Dates}}
- Lieu : {{Lieu}}

Prochaines étapes :
Votre compte étudiant est désormais actif. Vous pouvez vous connecter à votre espace personnel pour accéder à vos supports pédagogiques, aux travaux à réaliser et au calendrier.

Si vous avez des questions, n'hésitez pas à nous contacter à l'adresse suivante : {{Coordonnees_contact}}.

Bien cordialement,
L'équipe pédagogique
{{Signature}}`
  },
  {
    id: 'rejected',
    subject: "Candidature - Session {{Session}} - Formation {{Formation}}",
    body: `Bonjour {{Nom_etudiant}},

Nous vous remercions de l'intérêt que vous portez à notre centre de formation.

Après examen approfondi de votre dossier de candidature pour la session {{Session}} de la formation {{Formation}}, nous avons le regret de vous informer que nous ne pouvons pas y donner suite favorable pour le moment.

Justification :
{{Justification}}

Nous encourageons vivement votre persévérance et serions ravis de recevoir votre candidature pour d'autres programmes de formation ou pour une session ultérieure.

Pour toute information ou conseil d'orientation, n'hésitez pas à nous écrire : {{Coordonnees_contact}}.

Cordialement,
L'équipe pédagogique
{{Signature}}`
  },
  {
    id: 'waitlist',
    subject: "Candidature en liste d'attente - Session {{Session}}",
    body: `Bonjour {{Nom_etudiant}},

Nous avons bien examiné votre dossier pour la session {{Session}} de la formation {{Formation}}.

En raison du nombre élevé de candidatures et de nos places limitées, nous avons placé votre dossier sur notre liste d'attente active.

Justification :
{{Justification}}

Dès qu'une place se libère, nous vous contacterons immédiatement.

Pour toute question : {{Coordonnees_contact}}.

Cordialement,
L'équipe pédagogique
{{Signature}}`
  },
  {
    id: 'cancelled',
    subject: "Annulation de votre inscription - Session {{Session}}",
    body: `Bonjour {{Nom_etudiant}},

Nous vous informons que votre inscription à la session {{Session}} de la formation {{Formation}} a été annulée.

Justification :
{{Justification}}

Pour en savoir plus ou demander des détails sur les modalités d'annulation, veuillez nous contacter à : {{Coordonnees_contact}}.

Cordialement,
L'équipe pédagogique
{{Signature}}`
  }
]

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  try {
    const existing = await prisma.emailTemplate.findMany()
    const existingIds = new Set(existing.map(t => t.id))

    // Seed missing default templates
    const missing = DEFAULT_TEMPLATES.filter(t => !existingIds.has(t.id))
    if (missing.length > 0) {
      await Promise.all(
        missing.map(async (t) => {
          const created = await prisma.emailTemplate.create({
            data: t
          })
          existing.push(created)
        })
      )
    }

    return NextResponse.json(existing)
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'Erreur lors du chargement des modèles' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  try {
    const parsed = emailTemplateSchema.safeParse(await req.json())
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Données invalides.'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { id, subject, body: templateBody } = parsed.data

    const updated = await prisma.emailTemplate.upsert({
      where: { id },
      update: { subject, body: templateBody },
      create: { id, subject, body: templateBody }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du modèle' }, { status: 500 })
  }
}
