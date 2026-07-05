# NOTE OPÉRATIONNELLE DE MODIFICATION DU SITE

## CJ DEVELOPMENT TRAINING CENTER

Document de travail destiné au développeur

### Objet
Préciser, section par section, les modifications à faire et le contenu exact à intégrer pour transformer le site actuel en plateforme de conversion, de crédibilité et de rayonnement.

### Finalité
Passer d'un site vitrine à un site institutionnel capable de rassurer, orienter, qualifier les visiteurs et faire agir.

### Ce document dit au développeur :
- ce qu'il faut corriger
- ce qu'il faut mettre concrètement
- ce qu'il faut supprimer
- les CTA à utiliser
- les composants et preuves à intégrer

### Référentiel stratégique
La logique proposée s'inspire de standards observés sur des sites institutionnels comme Harvard University, Harvard Business School et Harvard GSD : identité claire, hiérarchie forte, segmentation des publics, preuves visibles et chemins d'action simples.

### Règle centrale à imposer au développeur
Aucune section ne doit être décorative. Chaque bloc doit répondre à une fonction business précise : rassurer, clarifier l'offre, prouver la valeur, orienter le bon public ou déclencher une conversion.

---

## 0. Standards d'exécution transversaux

### À corriger partout

- **Retirer tous les contenus provisoires** : supprimer toute mention « À confirmer », « Modules à confirmer », champs vides ou cartes publiées sans informations complètes.
- **Réduire le générique** : chaque phrase doit dire soit un bénéfice, soit une preuve, soit une action. Pas de remplissage.
- **Uniformiser les composants** : boutons, badges, marges, cartes, rayons d'angle et états de survol doivent créer un système visuel cohérent et reconnaissable.

### À mettre partout

- **Nom complet institution visible** : « CJ DEVELOPMENT TRAINING CENTER » doit apparaître clairement sur chaque page (header, footer, hero).
- **Titres courts, forts et lisibles** : maximum 60 caractères pour H1, message direct et sans ambiguïté.
- **Paragraphes courts orientés bénéfices** : reformuler les descriptions générales en bénéfices concrets (ex. : plutôt « formation au leadership » → « devenir leader d'équipe en 3 mois »).
- **Photos réelles** : sessions actives, coaching live, soutenances, équipes, certificats, partenariats, participants. Aucun stock générique.
- **CTA visibles et cohérents** : même style desktop/mobile, même formulation, même position logique.

### CTA standards à utiliser partout

- « Voir les programmes »
- « Réserver sa place »
- « Demander un conseil »
- « Parler à un conseiller »
- « Télécharger le programme »
- « Découvrir les sessions »

Pas d'autres variantes (ex. : pas de « En savoir plus », « Cliquez ici », « Découvrir »).

### Composants obligatoires sur toute page clé

- **Bloc de preuves chiffrées** : statistiques crédibles (nombre d'apprenants, taux de placement, durée moyenne, réseau).
- **Cartes programmes/services complètes** : jamais sans objectif, durée, format, public cible, bénéfices et CTA.
- **FAQ** : répondre aux objections courantes, mettre en avant la valeur et les résultats attendus.
- **Témoignages crédibles** : avec nom, compagnie, résultat concret. Pas de témoignage générique.
- **Footer riche** : contacts (email, WhatsApp, téléphone), liens clés (pages principales, mentions légales), formulaire d'orientation ou newsletter.

---

## 1. Instructions générales

- **Largeur de contenu maîtrisée** : conserver la respiration du site actuel, mais limiter la largeur de lecture à un maximum confortable (max-w-7xl ou moins selon les pages).
- **Typographie ferme** : H1 clairement visible, H2/H3 hiérarchisés, paragraphes courts, interlignage cohérent.
- **Palette CTA** : primaire rouge, secondaire contour. Toujours utiliser les mêmes styles pour éviter la confusion.
- **Images** : seulement des photos authentiques ou des visuels factuels. Pas de visuel stock générique qui affaiblit la crédibilité.
- **Mobile first** : prioriser la lecture et l’action. Toute page clé doit pouvoir être comprise en moins de trois scrolls.
- **Accessibilité** : contraste suffisant, alt text sur toutes les images, boutons cliquables et accessibles.
- **Performance** : limiter les ressources et éviter les animations lourdes.
- **Suppression des contenus provisoires** : retirer toute mention « À confirmer ». Si une donnée n’est pas disponible, reformuler sans signaler l’incomplétude.
- **Ton éditorial** : net, sérieux, institutionnel, orienté bénéfice. Pas de formulations décoratives inutiles.

## 2. Header / Navigation

### Ce qu'il faut corriger
- Ne pas afficher un menu centré sur des rubriques internes uniquement.
- Retirer les libellés vagues ou redondants.

### Ce qu'il faut mettre
- Menu principal : Accueil / À propos / Formations / Entreprises / Nos sessions / Actualités / Contact.
- Ajouter une entrée visible pour `Espace étudiants` si elle existe.
- Menu mobile : mêmes items, accessible en un clic.
- Logo : afficher le nom complet `CJ DEVELOPMENT TRAINING CENTER` et une baseline courte.

### CTA à utiliser
- `Demander un conseil` (utilisé comme CTA secondaire sur la nav ou page Contact).
- `Voir nos programmes` / `Voir les formations`.

### Ce qu'il faut supprimer
- Rubriques non stratégiques ou trop internes.
- Texte de menu qui ne décrit pas une action ou un besoin.

## 3. Page Accueil

### 3.1 Hero section

Ce qu'il faut corriger
- Retirer toute logique « Bienvenue au CJ Development Training Center ».
- Supprimer le visuel générique de livres dans le hero.

Ce qu'il faut mettre concrètement
- Sur-titre : `Centre panafricain de formation, leadership et employabilité`
- Titre : `Formez des compétences solides. Ouvrez des opportunités réelles.`
- Sous-texte : `Programmes pratiques en RH, leadership et insertion professionnelle, avec accompagnement, certification et orientation vers l’impact terrain.`
- CTA primaire : `Voir les programmes`
- CTA secondaire : `Réserver un entretien d’orientation`
- Preuve immédiate : `2018 | 8500+ impacts | 10+ pays | sessions actives`

Composants à intégrer
- bandeau de preuve chiffrée sous le hero
- CTA rouge primaire et bouton contour secondaire
- image / visuel authentique, pas stock générique.

### 3.2 Bloc de preuve institutionnelle

Ce qu'il faut corriger
- supprimer les blocs peu profonds et décoratifs.

Ce qu'il faut mettre concrètement
- titre : `Pourquoi CJ Development ?`
- quatre piliers : pédagogie pratique, accompagnement, réseau panafricain, employabilité / application terrain.
- sous-textes courts et précis.
- preuve en chiffres ou indicateurs courts sur chaque pilier.

Composants à intégrer
- cartes de preuve ou cartes pilier
- badge / label de crédibilité
- iconographie discrète et cohérente

### 3.3 Programmes phares

Ce qu'il faut corriger
- supprimer tout programme avec des informations incomplètes.
- ne pas afficher un catalogue trop large sur l’accueil.

Ce qu'il faut mettre concrètement
- 3 à 5 programmes maximum.
- chaque carte doit contenir : objectif, durée, format, public cible, bénéfices, CTA.
- CTA standard : `Télécharger le programme` ou `Découvrir ce parcours`.

Composants à intégrer
- carte programme complète
- micro-copy de bénéfice métier
- pas de champ `À confirmer`

### 3.4 Bloc Entreprises

Ce qu'il faut corriger
- supprimer les messages trop généraux et les slides promotionnelles sans valeur.

Ce qu'il faut mettre concrètement
- titre : `Nous formons vos équipes, renforçons votre leadership et accompagnons vos enjeux RH.`
- description : `Des offres B2B pensées pour l’efficacité, la professionnalisation des talents et l’élévation du leadership.`
- 3 bullets : formation intra/inter, accompagnement RH, leadership & recrutement.
- CTA : `Découvrir nos solutions entreprises` et `Demander un conseil`.

Composants à intégrer
- bloc présentant l’offre B2B
- liste courte d’avantages
- bouton rouge + bouton contour

### 3.5 Résultats et crédibilité

Ce qu'il faut corriger
- éviter les sections de témoignage génériques sans contexte.

Ce qu'il faut mettre concrètement
- statistiques clés : satisfaction, placement, pays impactés, sessions réalisées.
- témoignages courts de participants ou responsables RH.
- logos partenaires ou mentions de partenaires si autorisé.
- mention d’un réseau panafricain / carte des pays.

Composants à intégrer
- chiffres en grands blocs
- témoignages en cartes compactes
- liste de logos partenaires

### 3.6 Closing footer

Ce qu'il faut corriger
- supprimer les CTA multiples et dispersés.

Ce qu'il faut mettre concrètement
- titre : `Choisissez votre parcours`
- 3 portes d’entrée : `Je veux me former`, `Je représente une entreprise`, `Je suis déjà étudiant`
- chaque porte doit pointer vers la page dédiée.

Composants à intégrer
- cartes de navigation claire
- CTA : `Voir`, `Explorer`, `Accéder`

## 4. Page À propos

Ce qu'il faut corriger
- supprimer les textes trop vagues ou décoratifs.
- ne pas présenter la page comme un simple « À propos », mais comme une page de preuve.

Ce qu'il faut mettre concrètement
- sections : vision, méthode, chiffres, pédagogie, leadership, présence panafricaine, gouvernance.
- contenus : chiffres clés (2018, 8500+, 10+ pays), méthodologie pratique, connectivité panafricaine, impact métiers.
- CTA : `Découvrir nos formations`, `Contactez-nous`.

Composants à intégrer
- bloc chiffres clés
- timeline ou preuve d’implantation
- listes de forces pédagogiques
- témoignages courts éventuellement

## 5. Page Formations

Ce qu'il faut corriger
- retirer toute mention `À confirmer` ou donnée provisoire.
- ne pas afficher de carte programme avec champ incomplet.

Ce qu'il faut mettre concrètement
- catalogue structuré avec filtres.
- fiches programmes riches : objectif, durée, contenu, format, public, avantages, certification incluse.
- comparatif si possible entre types de programmes.
- CTA : `Télécharger le programme`, `Demander un conseil`, `S’inscrire`.

Composants à intégrer
- filtre par thème / niveau / format
- carte programme standardisée
- badges de certification incluse
- bloc proof adjacent

## 6. Page Entreprises

Ce qu'il faut corriger
- retirer le discours trop marketing sans contenu.

Ce qu'il faut mettre concrètement
- services B2B : formation intra/inter, accompagnement RH, leadership, recrutement, diagnostic.
- focus sur la valeur business : performance, talents, transformation organisationnelle.
- CTA : `Voir nos programmes`, `Demander un conseil`.

Composants à intégrer
- section d’offres structurées
- bullets métiers
- case de contact / qualification B2B

## 7. Page Nos sessions

Ce qu'il faut corriger
- éviter les sessions présentées comme de simples événements.
- ne pas afficher uniquement des chiffres factuels sans récit.

Ce qu'il faut mettre concrètement
- calendrier actif, places disponibles, détail des cohortes, inscriptions ouvertes, urgence commerciale.
- sections : dates, format, cible, inclusions, preuve, FAQ.
- CTA : `Réserver ma place`, `Contacter un conseiller`.

Composants à intégrer
- timeline de sessions
- état des places restantes
- FAQ courte
- témoignage de cohorte ou réussite

## 8. Page Actualités & Insights

Ce qu'il faut corriger
- ne pas présenter une liste d’articles sans contexte institutionnel.

Ce qu'il faut mettre concrètement
- page clairement positionnée comme newsroom / blog institutionnel.
- catégories : articles, communiqués, activités, publications, vie du centre.
- CTA : `Lire l’article`, `S’abonner`, `Nous contacter`.

Composants à intégrer
- cartes d’articles avec date et catégorie
- section spotlight
- lien vers ressources et études

## 9. Page Contact / Orientation

Ce qu'il faut corriger
- éviter les formulaires trop généraux.
- ne pas mélanger conseils, inscriptions et partenariats sans orientation.

Ce qu'il faut mettre concrètement
- choix du bon canal : conseil, inscription, partenariat, support étudiant.
- courte introduction expliquant quel type de demande va où.
- CTA : `Demander un conseil`, `S’inscrire`, `Proposer un partenariat`.

Composants à intégrer
- carte de canal avec action directe
- formulaire simplifié
- infos de contact claires

## 10. Espace Étudiants

Ce qu'il faut corriger
- ne pas traiter l’espace étudiant comme une sous-rubrique ordinaire.

Ce qu'il faut mettre concrètement
- accès clair à la connexion / services / documents / support / calendrier / certificats.
- page ou section dédiée avec signaux de confiance et d’efficacité.

Composants à intégrer
- navigation étudiante claire
- boutons d’accès direct vers documents et certificats

## 11. Libellés et microcopy

Libellés à uniformiser sur tout le site :
- Formations
- Sessions
- Étudiants
- Certification incluse
- Demander un conseil
- Réserver sa place
- Télécharger le programme

Ton à appliquer :
- institutionnel
- factuel
- orienté bénéfice
- international

## 12. CTA standards

- Primaire : `Voir les programmes` / `Voir les formations` / `S'inscrire maintenant`
- Secondaire : `Réserver un entretien d’orientation` / `Demander un conseil` / `Contacter un conseiller`
- Parcours : `Je veux me former` / `Je représente une entreprise` / `Je suis déjà étudiant`

## 13. Composants et preuves à intégrer

- blocs chiffrés (impact, pays, satisfaction, sessions)
- cartes programmes complètes
- témoignages courts et crédibles
- logos partenaires (si autorisés)
- photo authentique de sessions, intervenants, remises de certificats, salles, community
- FAQ courte sur pages sessions / formations
- callouts clairs pour les actions

---

## Notes de vérification

- Toute section doit répondre à une fonction business claire.
- Pas de bloc décoratif sans valeur. Si un bloc ne rassure, ne clarifie pas, ne prouve pas, n’oriente pas ou ne convertit pas, il doit être supprimé.
- Pas de contenu provisoire ou de mention "À confirmer".
- Les pages clés doivent être lisibles et compréhensibles dès un premier passage.
