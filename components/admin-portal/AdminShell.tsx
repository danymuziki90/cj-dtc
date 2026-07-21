'use client'

// Descriptions contextuelles associées à chaque page admin.
// Elles apparaissent sous le titre de page pour orienter l'action dès l'arrivée sur l'écran.
const pageDescriptions: Record<string, { eyebrow: string; description: string }> = {
  Pilotage: {
    eyebrow: 'Centre de commandement',
    description:
      "Vue instantanée des KPI opérationnels, des alertes critiques et des actions à traiter en priorité aujourd'hui.",
  },
  'Dashboard Admin': {
    eyebrow: 'Centre de commandement',
    description:
      "Vue instantanée des KPI opérationnels, des alertes critiques et des actions à traiter en priorité aujourd'hui.",
  },
  Sessions: {
    eyebrow: 'Calendrier & cohortes',
    description:
      'Organisez le calendrier, gérez les capacités et supervisez le déroulement opérationnel de chaque session.',
  },
  'Gestion des sessions': {
    eyebrow: 'Calendrier & cohortes',
    description:
      'Organisez le calendrier, gérez les capacités et supervisez le déroulement opérationnel de chaque session.',
  },
  Étudiants: {
    eyebrow: 'Comptes & accès',
    description:
      'Centralisez les profils étudiants, les statuts de compte, les accès au portail et les historiques de formation.',
  },
  Etudiants: {
    eyebrow: 'Comptes & accès',
    description:
      'Centralisez les profils étudiants, les statuts de compte, les accès au portail et les historiques de formation.',
  },
  Inscriptions: {
    eyebrow: 'Demandes & validations',
    description:
      "Traitez le pipeline des demandes d'inscription, validez ou refusez chaque dossier et assurez le suivi des relances.",
  },
  'Gestion des inscriptions': {
    eyebrow: 'Demandes & validations',
    description:
      "Traitez le pipeline des demandes d'inscription, validez ou refusez chaque dossier et assurez le suivi des relances.",
  },

  Certificats: {
    eyebrow: 'Délivrance & vérification',
    description:
      'Identifiez les dossiers éligibles, émettez les certificats et assurez la traçabilité des preuves de formation.',
  },
  Notifications: {
    eyebrow: 'Messages & relances',
    description:
      'Diffusez les communications, programmez les relances et gérez les messages destinés aux étudiants depuis un point unique.',
  },
  'Notifications et messages': {
    eyebrow: 'Messages & relances',
    description:
      'Diffusez les communications, programmez les relances et gérez les messages destinés aux étudiants depuis un point unique.',
  },
  Actualités: {
    eyebrow: 'Contenus & annonces',
    description:
      'Publiez les actualités du centre, gérez les articles et maintenez la visibilité éditoriale de CJ Development.',
  },
  'Gestion des actualités': {
    eyebrow: 'Contenus & annonces',
    description:
      'Publiez les actualités du centre, gérez les articles et maintenez la visibilité éditoriale de CJ Development.',
  },
  'Gestion des actualites': {
    eyebrow: 'Contenus & annonces',
    description:
      'Publiez les actualités du centre, gérez les articles et maintenez la visibilité éditoriale de CJ Development.',
  },
  Paramètres: {
    eyebrow: 'Sécurité & configuration',
    description:
      'Gérez les comptes administrateurs, les accès sécurisés et la configuration opérationnelle du portail.',
  },
  Parametres: {
    eyebrow: 'Sécurité & configuration',
    description:
      'Gérez les comptes administrateurs, les accès sécurisés et la configuration opérationnelle du portail.',
  },
  'Paramètres Admin': {
    eyebrow: 'Sécurité & configuration',
    description:
      'Gérez les comptes administrateurs, les accès sécurisés et la configuration opérationnelle du portail.',
  },
  Reporting: {
    eyebrow: 'Analyse & indicateurs',
    description:
      "Lisez les indicateurs clés de performance, les tendances de conversion et les signaux d'alerte du centre.",
  },
  'Centre de reporting': {
    eyebrow: 'Analyse & indicateurs',
    description:
      "Lisez les indicateurs clés de performance, les tendances de conversion et les signaux d'alerte du centre.",
  },
  Recherche: {
    eyebrow: 'Navigation globale',
    description:
      "Retrouvez rapidement un étudiant, une session, une inscription ou un document depuis un point d'entrée unique.",
  },
  'Recherche admin': {
    eyebrow: 'Navigation globale',
    description:
      "Retrouvez rapidement un étudiant, une session, une inscription ou un document depuis un point d'entrée unique.",
  },
  Formations: {
    eyebrow: 'Catalogue & programmes',
    description:
      'Gérez le catalogue de formations publiées, leurs contenus, objectifs et paramètres de session.',
  },
  Documents: {
    eyebrow: 'Supports pédagogiques',
    description:
      "Centralisez les supports de formation, gérez les droits d'accès et assurez la disponibilité des ressources.",
  },
  Facturation: {
    eyebrow: 'Facturation & règlements',
    description:
      'Suivez les factures émises, les montants à encaisser et les statuts de règlement par inscription.',
  },
  Facturation: {
    eyebrow: 'Facturation & règlements',
    description:
      'Suivez les factures émises, les montants à encaisser et les statuts de règlement par inscription.',
  },
  Évaluations: {
    eyebrow: 'Retours & satisfaction',
    description:
      "Consultez les évaluations des formations, identifiez les signaux de satisfaction et repérez les axes d'amélioration.",
  },
  Formateurs: {
    eyebrow: 'Intervenants & expertises',
    description:
      'Gérez les profils des formateurs, leurs expertises déclarées et leurs affectations aux sessions.',
  },
  Travaux: {
    eyebrow: 'TP, examens & projets',
    description:
      'Créez et gérez les travaux pratiques, examens et projets. Publiez-les pour les étudiants inscrits aux sessions concernées et suivez les remises.',
  },
  'Gestion des Travaux & TP': {
    eyebrow: 'TP, examens & projets',
    description:
      'Créez et gérez les travaux pratiques, examens et projets. Publiez-les pour les étudiants inscrits aux sessions concernées et suivez les remises.',
  },
}

const DEFAULT_ENTRY = {
  eyebrow: 'Administration',
  description:
    "Interface d'administration CJ Development — pilotez les opérations, les priorités et les décisions du quotidien.",
}

export default function AdminShell({
  title,
  children,
  compact = false,
}: {
  title: string
  children: React.ReactNode
  compact?: boolean
}) {
  const entry = pageDescriptions[title] ?? DEFAULT_ENTRY

  return (
    <div className="space-y-6">
      <section
        className={[
          'rounded-[28px] border border-white/80 bg-white/92 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.4)] backdrop-blur',
          compact ? 'px-5 py-4 md:px-6 md:py-5' : 'px-6 py-5 md:px-7 md:py-6',
        ].join(' ')}
      >
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {entry.eyebrow}
          </p>
          <h1
            className={[
              'mt-2 font-bold tracking-tight text-slate-950',
              compact ? 'text-2xl' : 'text-3xl md:text-4xl',
            ].join(' ')}
          >
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-[15px]">
            {entry.description}
          </p>
        </div>
      </section>

      <div className="space-y-6">{children}</div>
    </div>
  )
}
