# Admin Dashboard Redesign

## Vision

Refonte du back-office CJ DTC vers une experience SaaS plus nette, plus premium et plus operationnelle, basee sur les couleurs du logo.

Principes directeurs:
- clarte immediate de l'information
- navigation stable et reutilisable
- hierarchie visuelle forte
- surfaces claires, contrastes precis, densite maitrisée
- responsive desktop / tablette / mobile

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
1. hero strategique
2. grille KPI
3. charts principaux
4. table d'activite recente
5. widgets lateraux de priorites

Charts proposes:
- bar chart: repartition des sessions
- pie chart: etat des paiements
- line chart: pulse operationnel
- trend chart: rythme des livrables recents

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
