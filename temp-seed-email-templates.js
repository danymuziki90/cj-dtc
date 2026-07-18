const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
];

async function main() {
  console.log('Seeding email templates...');
  for (const t of DEFAULT_TEMPLATES) {
    const upserted = await prisma.emailTemplate.upsert({
      where: { id: t.id },
      update: {},
      create: t
    });
    console.log(`Upserted email template: ${upserted.id}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
