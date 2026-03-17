'use client'

const pageDescriptions: Record<string, string> = {
  'Dashboard Admin': 'Interface claire pour lire les KPIs, les signaux de risque et les actions prioritaires.',
  'Gestion des sessions': 'Organisez le calendrier, les capacites et les operations de chaque cohorte.',
  Etudiants: 'Centralisez la creation de comptes, les statuts, les paiements et les acces etudiants.',
  'Gestion des inscriptions': 'Gardez une vision nette du pipeline de demandes, des validations et des actions de suivi.',
  'Gestion des paiements': 'Suivez les transactions, verifiez les ecarts et gerez les encaissements.',
  Submissions: 'Pilotez les livrables, les corrections et les validations.',
  'Travaux et corrections': 'Pilotez les livrables, les corrections et les validations.',
  'Notifications et messages': 'Diffusez les messages, relances et rappels depuis une interface claire.',
  'Centre de reporting': 'Lisez les KPIs reels, les alertes systeme et les conversions qui pilotent les decisions admin.',
  'Recherche admin': 'Retrouvez rapidement un etudiant, une session, une inscription ou un paiement depuis un point d entree unique.',
  'Gestion des actualites': 'Publiez, organisez et mettez a jour les contenus editoriaux.',
  'Gestion des actualités': 'Publiez, organisez et mettez a jour les contenus editoriaux.',
  'Parametres Admin': 'Pilotez la securite, les comptes admin et la configuration du portail.',
  'Supports pedagogiques': 'Centralisez les documents, les filtres et les droits d acces dans une vue plus lisible.',
  Facturation: 'Suivez les factures, les montants a encaisser et les statuts de reglement.',
  'Evaluations et satisfaction': 'Lisez les retours et reperez rapidement les signaux utiles sur la qualite des sessions.',
  'Gestion des formateurs': 'Gardez une vue claire sur les profils, les expertises et les disponibilites des intervenants.',
}

export default function AdminShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const description =
    pageDescriptions[title] ||
    'Interface admin claire pour piloter les operations, les priorites et les actions du quotidien.'

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/80 bg-white/92 px-6 py-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.4)] backdrop-blur md:px-7 md:py-6">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Administration</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-[15px]">{description}</p>
        </div>
      </section>

      <div className="space-y-6">{children}</div>
    </div>
  )
}

