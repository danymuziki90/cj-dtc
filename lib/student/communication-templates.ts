export const communicationTemplateOptions = [
  {
    key: 'payment_follow_up',
    label: 'Relance paiement',
    message:
      'Nous avons bien recu votre demande. Merci de verifier votre paiement ou de joindre votre preuve de paiement afin que nous puissions finaliser votre dossier.',
  },
  {
    key: 'attendance_follow_up',
    label: 'Suivi presence',
    message:
      'Nous avons note votre message. Merci de nous transmettre votre justificatif d\'absence pour mettre a jour votre dossier de presence.',
  },
  {
    key: 'resource_guidance',
    label: 'Orientation ressources',
    message:
      'Les ressources demandees sont disponibles dans votre bibliotheque etudiante. Si un document manque encore, nous allons le publier ou vous indiquer le bon support.',
  },
  {
    key: 'technical_support',
    label: 'Support technique',
    message:
      'Merci pour votre retour. Notre equipe verifie actuellement le probleme signale et reviendra vers vous des que possible avec une resolution claire.',
  },
] as const

export function resolveCommunicationTemplate(key?: string | null) {
  return communicationTemplateOptions.find((item) => item.key === key) || null
}
