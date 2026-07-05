# Admin Dashboard Redesign

## Vision

Refonte du back-office CJ DTC vers une experience SaaS plus nette, plus premium et plus operationnelle, basee sur les couleurs du logo.
L'objectif est de dépasser l'effet "site vitrine" pour incarner une institution panafricaine de référence : claire, crédible et performante.

Principes directeurs:
- clarté immédiate de l'information
- navigation stable et réutilisable
- hiérarchie visuelle forte
- surfaces claires, contrastes précis, densité maîtrisée
- responsive desktop / tablette / mobile
- identité institutionnelle affirmée
- architecture de contenu rigoureuse : preuve, offre, action
- parcours décisionnel clair pour chaque public

## Constats stratégiques

Zone: Hero / première impression
- Constat: visuel générique et slogan trop long.
- Impact business: confiance différenciée faible, valeur CJ insuffisamment explicite.
- Décision attendue: promesse institutionnelle forte, appuyée par chiffres, audience, témoignages et CTA conversion.

## Leçons Harvard
- institution identifiable sur chaque page : nom complet, marque clairement affichée, rubriques hiérarchisées.
- offre structurée par types de programmes et bénéfices pédagogiques, pas seulement par catégories internes.
- UX et lisibilité prioritaires : organisation de l’information avant l’habillage visuel.
- parcours clairs et compréhensibles même pour un visiteur arrivant sur une page interne.
- objectif : rassurer, orienter, prouver, convertir plutôt que « faire joli ». 

Zone: Navigation
- Constat: menu trop centré sur la marque et les rubriques informatives.
- Impact: parcours utilisateur dilué, segmentation par intention absente.
- Décision attendue: simplifier la navigation autour des grandes intentions business (Candidat, Entreprise, Étudiant, Partenaire, Presse) et des actions clés.

Zone: Bloc À propos
- Constat: base sérieuse mais preuves superficielles.
- Impact: crédibilité perçue insuffisante pour une institution structurée.
- Décision attendue: enrichir avec méthode, employabilité, réseau, résultats concrets, cas d’usage et chiffres vérifiables.

Zone: Page Programmes
- Constat: cartes programmes avec données provisoires "À confirmer".
- Impact: signal commercial destructeur, offre perçue comme inachevée.
- Décision attendue: ne publier que des programmes avec informations finales et claires sur durée, modules, format, et bénéfices.

Zone: Page Sessions
- Constat: indicateurs présents mais récit faible.
- Impact: pas d’urgence ni de projection, décision de conversion retardée.
- Décision attendue: transformer en page de closing avec dates, format, cible, prix, inclusions, preuve, FAQ et CTA précis.

Zone: Microcopies / wording
- Constat: ton neutre, projection vers un projet en construction.
- Impact: manque de stature académique et premium.
- Décision attendue: homogénéiser le langage vers une tonalité premium, académique, précise et orientée décision.

## Principes directeurs pour la nouvelle mise en page

- Passer d’un site-vitrine à un site de conviction. Chaque section doit répondre à une objection du visiteur : qui êtes-vous, pourquoi vous croire, quelle offre choisir, comment s’inscrire, que vais-je obtenir ?
- Hiérarchiser le contenu par intensité de décision : promesse -> preuve -> offres -> résultats -> CTA.
- Segmenter les parcours : futur participant, entreprise, étudiant actuel, partenaire / institution, média.
- Remplacer les images trop génériques par des preuves réelles : sessions, intervenants, salles, soutenances, communauté, remise de certificats, coaching.
- Ne jamais afficher une offre incomplète. Une carte formation doit toujours contenir au minimum : objectif, durée, format, public cible, bénéfices, éléments inclus, CTA.
- Donner au site une gravité institutionnelle : typographie plus ferme, espaces plus maîtrisés, moins de décor, plus de structure.

## Palette

Couleur principale:
- `--cj-blue`: `#002D72`
- `--admin-primary`: `#0030A0`

Accent:
- `--cj-red`: `#E30613`
- `--admin-accent`: `#FF0000`

Secondaires recommandees:
- fond froid clair: `#F6F9FF`
- fond elevated: `rgba(255,255,255,0.86)`
- bordure douce: `#E2E8F0`
- texte principal: `#0F172A`
- texte secondaire: `#64748B`

## Typographie

Titres:
- `Montserrat`
- fort contraste et tracking serre pour les titres de pages

Texte courant:
- `Open Sans`
- lisibilite prioritaire pour tables, formulaires et commentaires

Hierarchie:
- page title: 32-44px
- section title: 20-24px
- card title: 14-16px
- supporting copy: 13-15px
- micro labels: 11-12px uppercase

## Layout global

### Shell admin
- sidebar collapsible avec icones + labels + statut actif visible
- topbar sticky avec contexte de page, quick actions et zone command center
- fond compose de gradients subtils + grille legere pour donner de la profondeur
- contenus dans des panneaux blancs translucides avec ombre douce

### Responsive
- mobile: drawer lateral plein ecran partiel
- tablette: shell conserve, densite reduite
- desktop: sidebar fixe, topbar sticky, contenu scrollable

## Composants du design system

### Cards KPI
- radius fort (`28px` a `34px`)
- fond blanc / gradient tres leger
- icone dans tuile secondaire
- valeur tres lisible
- helper text sous la metrique
### Cartes programmes / offres
- titre clair et promesse ciblée
- informations complètes : public, durée, format, bénéfice, preuve
- design différencié pour renforcer la stature institutionnelle
- CTA précis et actionnable pour chaque segment d'utilisateur
### Tables
- entetes sobres
- hover state legere
- badges harmonises
- pagination dans un container dedie, plus premium

### Formulaires
- champs grands et respirants
- focus ring base sur le bleu du logo
- feedback erreur avec accent rouge clair
- actions primaires en bleu, secondaires en surface blanche

### Modals et alertes
- glass panel blanc avec border fine
- hierarchy claire entre confirmation, danger et information

## Dashboard principal

Structure recommandee:
1. hero stratégique avec identité institutionnelle
2. grille KPI
3. charts principaux
4. table d'activité récente
5. widgets latéraux de priorités

Principes clés:
- hero : message fort, preuve académique ou d'impact visible, promesse ciblée
- contenu : hiérarchie entre image, preuve, offre et action
- parcours : cheminements simples, segmentation par public / rôle
- cartes : informations complètes et conversion directe

Charts proposes:
- bar chart: repartition des sessions
- pie chart: etat des paiements
- line chart: pulse operationnel
- trend chart: rythme des livrables recents

## Nouvelle architecture recommandée du site

| Rubrique | Rôle stratégique |
| --- | --- |
| Accueil | Page de persuasion. Promesse forte, preuves, programmes phares, résultats, témoignages, CTA. |
| À propos | Vision, méthode, chiffres, pédagogie, leadership, présence panafricaine, gouvernance. |
| Formations | Catalogue structuré avec filtres, pages programmes riches, comparatif, fiches complètes. |
| Entreprises | Offres B2B : formation intra/inter, accompagnement RH, leadership, recrutement, diagnostic. |
| Nos sessions | Calendrier actif, places disponibles, détail des cohortes, inscriptions ouvertes, urgence commerciale. |
| Espace étudiants | Connexion / services / documents / support / calendrier / certificats. |
| Actualités & Insights | Articles, communiqués, activités, publications, vie du centre. |
| Contact / Orientation | Choix du bon canal : conseil, inscription, partenariat, support étudiant. |

## Refonte détaillée de la page Accueil

### 6.1 Hero section

Supprimer la logique actuelle “Bienvenue au CJ Development Training Center” comme message principal. Le hero doit porter une promesse de transformation crédible et immédiate.

Structure recommandée :
- Sur-titre : Centre panafricain de formation, leadership et employabilité
- Titre : Formez des compétences solides. Ouvrez des opportunités réelles.
- Sous-texte : Programmes pratiques en RH, leadership et insertion professionnelle, avec accompagnement, certification et orientation vers l’impact terrain.
- CTA primaire : Voir les programmes
- CTA secondaire : Réserver un entretien d’orientation
- Preuve immédiate sous le hero : 2018 | 8500+ impacts | 10+ pays | sessions actives

### 6.2 Bloc de preuve institutionnelle

Installer immédiatement après le hero un bloc “Pourquoi CJ Development ?” avec 4 piliers :
- pédagogie pratique
- accompagnement
- réseau panafricain
- employabilité / application terrain

### 6.3 Programmes phares

Afficher 3 à 5 programmes maximum, pas un catalogue confus. Chaque carte doit être complète, sans champ provisoire, avec un bénéfice clair.

### 6.4 Bloc Entreprises

Insérer une section dédiée B2B : nous formons vos équipes, renforçons votre leadership, accompagnons vos enjeux RH et professionnalisons vos talents.

### 6.5 Résultats et crédibilité

Ajouter :
- statistiques
- témoignages
- logos partenaires si autorisés
- photos réelles
- carte des pays touchés
- chiffres des promotions
- sessions réalisées
- certifications délivrées

### 6.6 Closing footer

Finir la page par un bloc de conversion : “Choisissez votre parcours” avec 3 portes d’entrée :
- Je veux me former
- Je représente une entreprise
- Je suis déjà étudiant

## Normes de mise en page à imposer au développeur

- Largeur de contenu maîtrisée. Le site doit conserver une bonne respiration visuelle tout en densifiant l’information utile.
- Échelle typographique plus ferme : H1 très lisible, sous-titres mieux hiérarchisés, paragraphes plus courts, interlignage cohérent.
- Système de composants unifié : cartes, badges, boutons, sections, métriques, témoignages, FAQ, callouts.
- CTA cohérents sur tout le site : un primaire rouge, un secondaire contour, jamais de multiplication confuse.
- Photos authentiques et traitées de manière cohérente ; éviter les banques d’images trop visibles.
- Mode mobile pensé dès le départ : prioriser lecture, preuve et action en moins de trois scrolls majeurs.
- Accessibilité et performance : contraste, alt text, temps de chargement, boutons clairement cliquables, pages programmes indexables.

## Corrections de contenu immédiates

- Retirer tous les “A confirmer”. Tant qu’une donnée n’est pas disponible, la carte ne doit pas être publiée ou doit être reformulée proprement.
- Remplacer les phrases trop générales par des promesses précises : résultats, méthode, accompagnement, débouchés, niveau, public cible.
- Uniformiser les libellés : Formations, Sessions, Étudiants, Certification incluse, Demander un conseil, Réserver sa place, Télécharger le programme.
- Créer une ligne éditoriale institutionnelle : moins de formules décoratives, plus de formulations nettes, crédibles, internationales.

## Priorités de développement

| Priorité | Élément à développer | But business |
| --- | --- | --- |
| P1 | Refonte complète de l’Accueil | Corriger la première impression et la conversion. |
| P1 | Finalisation des fiches programmes | Supprimer tout signal d’incomplétude commerciale. |
| P1 | Refonte navigation et architecture des CTA | Mieux orienter chaque type de visiteur. |
| P2 | Création de la page Entreprises | Ouvrir le pipeline B2B premium. |
| P2 | Refonte de la page Sessions | Transformer la page en page de closing. |
| P2 | Preuves / témoignages / résultats | Renforcer la confiance et la crédibilité. |
| P3 | Centre de ressources / actualités | Asseoir le positionnement intellectuel du centre. |

## Instruction finale au développeur

L’objectif n’est pas de rendre le site “plus joli”. L’objectif est de lui donner le niveau d’une institution crédible, lisible et désirable. Chaque section doit augmenter une variable business précise : confiance, compréhension de l’offre, projection du visiteur, passage à l’action, ou perception de marque. Tant que le site ne fait pas cela, la refonte n’est pas terminée.

## Annexe - Sources de benchmark utilisées

- Harvard University - structure institutionnelle, navigation, programmes, news, identification de marque.
- Harvard Business School - structuration immédiate de l’offre par type de programme et par promesse pédagogique.
- Harvard Graduate School of Design - logique de discovery, grid system, priorité à la recherche de contenu et à la lisibilité.
- Nielsen Norman Group - principes UX pour les sites universitaires : identification claire de l’institution, compréhension rapide, parcours simples.

## Recommandations de contenu par section

### Hero institutionnel
- remplace le visuel générique par une image réelle ou une composition éditoriale authentique.
- slogan court et précis, centré sur l’impact transformateur : pourquoi CJ est une institution fiable et structurée.
- éléments de preuve visibles : nombre d’apprenants, taux d’employabilité, partenariats, réussite métier.
- CTA orientés conversion : "Découvrir les parcours", "Postuler à la session", "Parler à un conseiller".
- éviter le message d’accueil « bienvenue » ; remplacer par une promesse métier claire.

### Navigation segmentée par intention
- menu principal simple centré sur les grandes intentions : Candidats, Entreprises, Étudiants, Partenaires, Presse.
- sous-menu contextuel pour chaque public avec parcours clés et offres associées.
- liens action : Programmes, Sessions, Contact, Témoignages.
- éviter les rubriques trop descriptives et les labels trop internes.

### Bloc À propos et preuve
- structurer le bloc en trois niveaux : raison d’être, méthode, résultats.
- chiffres clés : cohortes formées, taux de placement, partenariats, durée moyenne des parcours.
- preuve qualitative : cas d’usage, témoignages, accréditations, support pédagogique.
- photo réelle ou visuel d’équipe / salle authentique.
- étendre la logique de preuve à l’ensemble du site : chaque section doit contenir un signal de crédibilité.

### Page Programmes
- ne publier que des programmes avec données finalisées.
- cartes programmes complètes : durée, modules, modalités, objectifs, public, certificats, bénéfices.
- signaler la valeur commerciale plutôt que l’offre générique.
- CTA direct : "Voir le programme", "S’inscrire", "Demander une brochure".
- insérer un bloc de preuve à proximité : alumni, entreprises clientes, résultats.

### Page Sessions
- transformer en page de closing : dates, format, public cible, tarifs, inclusions et prise de décision rapide.
- narrative : enjeu métier, ce que l’apprenant gagne, pourquoi cette session est unique.
- indicateurs enrichis : places restantes, date de démarrage, lieu/format, niveau, prérequis.
- ajouter FAQ courte, témoignage rapide et éléments de preuve.
- CTA visible et ancré : "Réserver ma place", "Contacter un conseiller".

### Microcopies et tonalité
- adopter un langage premium et académique.
- éviter les formulations projet / en construction.
- privilégier des phrases actives, précises et orientées bénéfice.
- uniformiser les CTA vers la décision et le passage à l’acte.

## Layouts types pour sous-pages

### Pages listes
Exemples:
- etudiants
- inscriptions
- paiements
- notifications
- articles

Pattern:
1. bandeau de page
2. stats / filtres
3. table ou cartes
4. pagination / actions globales
5. detail panel ou modal

### Pages edition / creation
Exemples:
- nouvelle session
- nouvel article
- parametres

Pattern:
1. header de contexte
2. formulaire en carte principale
3. panneau lateral de conseils / resume / aides
4. sticky actions en bas sur mobile si necessaire

### Pages detail
Exemples:
- session detail
- promo detail

Pattern:
1. hero detail
2. resume KPI
3. tabs ou sections verticales
4. activity feed / documents / historique

## Maquette de reference

```text
+--------------------------------------------------------------------------------+
| Topbar: contexte page | command center | quick actions | profil / status       |
+----------------------+---------------------------------------------------------+
| Sidebar              | Hero page / intro                                         |
| - Dashboard          +---------------------+----------------------+------------+
| - Sessions           | KPI card            | KPI card             | KPI card   |
| - Etudiants          +---------------------+----------------------+------------+
| - Inscriptions       | Bar chart                          | Pie chart            |
| - Paiements          +------------------------------------+----------------------+
| - Travaux            | Line chart                         | Priority widgets      |
| - Certificats        +------------------------------------+----------------------+
| - Notifications      | Recent activity table                                    |
| - Actualites         +----------------------------------------------------------+
| - Parametres         | Pagination / footer actions                               |
+----------------------+-----------------------------------------------------------+
```

## Priorites d'implementation

Phase 1:
- shell admin unifie
- topbar + sidebar collapsible
- dashboard premium
- pagination / cards / tables harmonisees

Phase 2:
- pages data-heavy: etudiants, inscriptions, paiements
- formulaires avancés: sessions, contenus, parametres
- modals standardises

Phase 3:
- micro interactions, empty states, onboarding visuel
- analytics plus pousses et vues detaillees

## Notes techniques

- conserver React + Tailwind deja en place
- exploiter `recharts` deja disponible pour les visualisations
- centraliser les nav items et les tokens admin
- privilegier des composants reutilisables plutot que des styles copies page par page
- viser un rendu premium sans surcharger le DOM ni la logique
