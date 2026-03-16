# 📚 DOCUMENTATION COMPLÈTE - PLATEFORME CJ-DTC

**Document de présentation des fonctionnalités**  
*Destiné à l'équipe administrative et direction*  
*Date: Mars 2026*

---

## 📖 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Infrastructure technique](#infrastructure-technique)
3. [Architecture fonctionnelle](#architecture-fonctionnelle)
4. [Portail public](#portail-public)
5. [Espace étudiant](#espace-étudiant)
6. [Portail administrateur](#portail-administrateur)
7. [Gestion des formations](#gestion-des-formations)
8. [Système de paiement](#système-de-paiement)
9. [Système de certificats](#système-de-certificats)
10. [Authentification et sécurité](#authentification-et-sécurité)
11. [Intégrations externes](#intégrations-externes)
12. [Rapports et analytics](#rapports-et-analytics)

---

## 🎯 VUE D'ENSEMBLE

### Qu'est-ce que CJ-DTC ?

**CJ-DTC** est une **plateforme de gestion intégrée de formations professionnelles** permettant de :

✅ **Publier et gérer** des programmes de formation  
✅ **Organiser des sessions** de formation (présentiel, distanciel, hybride)  
✅ **Inscrire les étudiants** avec gestion des paiements  
✅ **Suivre les apprentissages** et évaluations  
✅ **Générer des certificats** vérifiables  
✅ **Administrer** la plateforme via un tableau de bord puissant  
✅ **Analyser** en temps réel les statistiques et rapports  

### Utilisateurs principaux

| Rôle | Accès | Fonctionnalités clés |
|------|-------|---------------------|
| **Public** | Portail Web | Consulter formations, sessions, actualités, s'inscrire |
| **Étudiant** | Espace Privé | Suivre formations, télécharger certificats, gérer profil |
| **Admin** | Dashboard | Gérer étudiants, formations, paiements, certificats |
| **Formateur** | Interface dédiée | Suivre sessions, évaluer, noter, gérer ressources |

---

## 🏗️ INFRASTRUCTURE TECHNIQUE

### Stack Technologique

**Frontend & Framework**
- Next.js 16.1.4 (React 18.2.0)
- TypeScript pour la robustesse du code
- Tailwind CSS pour le design responsive
- Radix UI pour composants accessibles

**Backend**
- API Routes Next.js
- Node.js runtime
- Système d'authentification: NextAuth.js + JWT

**Base de Données**
- PostgreSQL 
- Prisma ORM v5.8.0
- 45 modèles de données
- 101 routes API

**Fonctionnalités avancées**
- Internationalization (FR/EN) avec next-intl
- React Hook Form + Zod (validation)
- Recharts (visualisation de données)
- jsPDF (génération certificats)
- QR Code (vérification certificats)
- Zustand (gestion d'état)

**Déploiement**
- Hébergement Vercel (production)
- Docker (containerization)
- Configuration CI/CD

**Security**
- Chiffrement Bcrypt
- JWT tokens
- Middleware de protection
- Audit logging complet

---

## 🏢 ARCHITECTURE FONCTIONNELLE

### Trois portails intégré

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLATEFORME CJ-DTC                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  PORTAIL PUBLIC  │  │  ESPACE ÉTUDIANT │  │ TABLEAU BORD │  │
│  ├──────────────────┤  ├──────────────────┤  │ ADMINISTRATEUR  │
│  │                  │  │                  │  │              │  │
│  │ • Accueil        │  │ • Mon Tableau    │  │ • Dashboard  │  │
│  │ • Formations     │  │ • Mes Cours      │  │ • Analytics  │  │
│  │ • Sessions       │  │ • Certificats    │  │ • Gestion    │  │
│  │ • Actualités     │  │ • Évaluations    │  │ • Rapports   │  │
│  │ • À Propos       │  │ • Paiements      │  │ • Audit      │  │
│  │ • Contact        │  │ • Questions      │  │              │  │
│  │ • Authentif.     │  │ • Profil         │  │              │  │
│  │                  │  │                  │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         ↓                    ↓                       ↓
     POSTGRESQL                  API ROUTES        AUTHENTIFICATION
```

### Flux utilisateur type

```
1. DÉCOUVERTE
   Public Website → Consultation Formations/Sessions
   
2. INSCRIPTION
   Choix Formation → Choix Session → Paiement → Confirmation
   
3. APPRENTISSAGE
   Accès Espace Étudiant → Suivre Cours → Évaluation
   
4. CERTIFICATION
   Fin Formation → Génération Certificat → Téléchargement
```

---

## 🌐 PORTAIL PUBLIC

### Pages principales

#### 1. **Accueil** (`/`)
- Hero section avec call-to-action
- Formations destacadas (récentes)
- Sessions actuelles
- Actualités principales
- Footer avec contact

#### 2. **Catalogue de Formations** (`/formations`)
- Liste de toutes les formations actives
- Filtre par catégorie
- Filtres dynamiques
- Recherche (title, description, objectifs)
- Détails: durée, certification, modules
- Images et descriptions

#### 3. **Sessions de Formation** (`/sessions`)
- Calendrier interactif
- Détails session: dates, horaires, localisation
- Format: Présentiel / Distanciel / Hybride
- Capacité disponible
- Tarifs
- Instructeurs assignés
- Bouton inscription

#### 4. **Programmes Détaillés** (`/programmes`)
- Descriptions approfondies
- Objectifs pédagogiques
- Contenus détaillés
- Résultats escomptés
- Prérequis

#### 5. **Actualités** (`/actualites`)
- Blog/News articles
- Catégories thématiques
- Moteur de recherche
- Publication chronologique
- Articles feature

#### 6. **À Propos** (`/about`)
- Présentation organisation
- Mission et valeurs
- Équipe leadership
- Partenaires

#### 7. **Services** (`/services`)
- Liste des services offerts
- Descriptions
- Bénéfices

#### 8. **Partenaires** (`/partenaires`)
- Logos et descriptions
- Liens partenaires

#### 9. **Authentification Publique** (`/auth`)
- **Login** (`/login`): Connexion étudiants existants
- **Register** (`/register`): Inscription nouveaux étudiants
- **Mot de passe oublié** (`/forgot-password`): Récupération de code
- **Reset password** (`/reset-password`): Définir nouveau mot de passe

### Multilingue

- Interface disponible en **FRANÇAIS** et **ANGLAIS**
- Sélecteur de langue dans header
- Routing: `/fr/...` et `/en/...`
- Contenu translatable complet

---

## 👨‍🎓 ESPACE ÉTUDIANT

### Accès et authentification
- URL: `/espace-etudiants` (authentifié)
- Redirection auto pour utilisateurs non loggés
- Session JWT / NextAuth

### Fonctionnalités disponibles

#### 1. **Dashboard Personnel**
- Bienvenue personnalisée
- Formations actuelles
- Sessions en cours
- Dernières actualités
- Statuts à une glance
- Rappels paiements

#### 2. **Mes Inscriptions**
- Historique complet des formations
- Statut d'inscription actuel
- Dates de formation
- Formateurs assignés
- Accès aux ressources
- Statut de paiement

#### 3. **Mes Certificats**
- Liste des certificats obtenus
- Affichage certificat:
  - Code unique (vérifiable publiquement)
  - Informations holder
  - Date d'émission
  - Formation et session
- Téléchargement PDF
- Partage via QR code

#### 4. **Notes et Résultats**
- Évaluations reçues
- Feedback formatfs
- Progression
- Grille de notation

#### 5. **Mes Travaux**
- Liste des devoirs/TP/Examens
- État de soumission
- Deadlines
- Notes reçues si évaluées
- Retours des formateurs

#### 6. **Questions et Discussions**
- Forum ou système Q&A
- Poser des questions
- Réponses de formateurs
- Discussions de classe
-Historique des questions

#### 7. **Gestion de Profil**
- Informations personnelles
- Email
- Téléphone
- Photo profil
- Historique professionnel

#### 8. **Suivi Paiements**
- Historique paiements
- Moyens de paiement utilisés
- Factures PDF
- Preuves de paiement uploadées
- Statut des paiements

#### 9. **Soumissions**
- Devoirs à soumettre
- Upload fichiers
- Vérification format/taille
- Suivi - Noted/En attente
- Feedback

---

## 🎛️ PORTAIL ADMINISTRATEUR

### Accès et authentification
- URL: `/admin`
- Authentification sécurisée (Admin token)
- Session duration: 30 jours
- 2FA possible

### 📊 DASHBOARD PRINCIPAL

#### Vue d'ensemble KPIs

| Métrique | Description |
|----------|-------------|
| **Sessions actives** | Nombre de sessions en cours |
| **Étudiants inscrits** | Total inscrits + par session |
| **Places disponibles** | Capacité restante |
| **Paiements confirmés** | Montant total payé |
| **Paiements en attente** | Montant à recevoir |
| **Soumissions** | Total reçues, pending, validées |
| **Certificats émis** | Nombre certificats délivrés |
| **Actualités publiées** | Derniers articles |

#### Graphiques et visualisations

- **Inscriptions par mois**: Tendance données
- **Répartition paiements per status**: Pie chart
- **Sessions par type**: Complètes / Disponibles
- **Certificats par type**: Completion / Attendance / Excellence
- **Actualités récentes**: Timeline

---

### 👥 GESTION ÉTUDIANTS

#### Fonctionnalités principales

**Liste et Filtres**
- Affichage tabulaire complet
- Filtre par: nom, email, statut, date inscription
- Recherche full-text
- Pagination
- Export CSV

**Statuts gérés**
- **PENDING**: En attente d'activation
- **ACTIVE**: Compte actif
- **SUSPENDED**: Compte suspendu
- **COMPLETED**: Formation terminée

**Actions possibles**
- ✏️ Éditer profil
- 🔓 Activer compte
- 🔒 Suspendre compte
- 📧 Envoyer notification
- 🗑️ Supprimer étudiant
- 📋 Voir détails complets
- 📊 Voir tableau des inscriptions

**Données tractées par étudiant**
- Identité complète
- Email + Téléphone
- Date d'inscription
- Statut account
- Formations suivies
- Statut paiements
- Certificats obtenus

---

### 📝 GESTION INSCRIPTIONS

#### Affichage principal

Vue tableau avec colonnes:
- Étudiant (nom, email, téléphone)
- Formation
- Session (dates)
- Statut d'inscription
- Statut paiement
- Montant total
- Montant payé
- Date inscription
- Actions

#### Filtres avancés

```
✓ Formation (dropdown sélection)
✓ Session (choix multiples)
✓ Statut inscription:
  - pending (attente confirmation)
  - accepted (acceptée)
  - confirmed (confirmée)
  - rejected (rejetée)
  - cancelled (annulée)
  - completed (terminée)
✓ Statut paiement:
  - unpaid (impayé)
  - partial (partiellement payé)
  - paid (payé complet)
✓ Plage de dates
✓ Montant min/max
✓ Source inscription
```

#### Actions par inscription

**Actions immédiates**
- ✅ Accepter inscription
- ❌ Rejeter inscription
- ⏸️ Suspendre
- ✔️ Confirmer
- 📧 Envoyer notification personnalisée
- 📱 Relance automatique
- 🔙 Remboursement partiel
- 📊 Voir timeline

**Bulk Actions**
- Sélectionner multiples
- Changer statut en masse
- Envoyer email à sélection
- Export sélection CSV

#### Gestion paiements et relances

**Suivi paiement**
- Montant dû vs payé
- Historique transactoins
- Preuves de paiement uploads
- Moyens utilisés (Carte, Mobile, Virement, Chèque, Cash)

**Relances automatiques**
- Dernière relance envoyée
- Nombre de relances
- Prochaine date planifiée
- Personnalisation templates

**Gestion des arriérés**
- Identifier comptes non payés
- Envoyer relances
- Planifier paiements partiels
- Rembourser
- Résilier inscriptions

---

### 🎓 GESTION FORMATIONS

#### CRUD Complet

| Action | Description |
|--------|-------------|
| **Créer** | Nouvelle formation |
| **Lire** | Afficher détails |
| **Éditer** | Modifier informations |
| **Archiver** | Masquer sans supprimer |
| **Supprimer** | Supprimer définitivement |

#### Champs editables

- **Titre**: Nom de la formation
- **Slug**: URL friendly (auto-généré)
- **Description**: Longue description
- **Objectifs**: Objectifs pédagogiqss (WYSIWYG)
- **Durée**: Heures totales
- **Modules**: Contenu par module
- **Certification**: Oui/Non, type
- **Catégorie**: Classification
- **Image**: URL/upload
- **Statut**: Brouillon / Publié / Archivé

#### Associations

- 📚 Documents (ressources pédagogiques)
- 📅 Sessions (instances de la formation)
- ⭐ Évaluations (satisfactions)
- 🎖️ Certificats associés

#### Types de documents

```
📄 Syllabus           - Programme détaillé
📊 Presentation      - Slides / matériel
✏️ Exercise          - Exercices pratiques
📦 Resource          - Ressources additionnelles
🏅 Template          - Modèle certificat
```

---

### 🗓️ GESTION SESSIONS

#### Affichage principal table

Colonnes:
- Formation (lien)
- Date début - Date fin
- Horaire (debut - fin)
- Localisation
- Format (Présentiel / Distanciel / Hybride)
- Formateurs
- Capacité (actuels / max)
- Statut
- Actions

#### Statuts session

- **Ouverte**: Inscriptions actives
- **Fermée**: Inscriptions closes
- **Complète**: Capacité atteinte
- **Terminée**: Formation passée
- **Reportée**: Décalée
- **Annulée**: Non réalisée

#### Champs éditables

**Identité**
- Formation (lien requis)
- Numéro session
- Description

**Planning**
- Date début
- Date fin
- Heure début
- Heure fin
- Fuseau horaire

**Localisation**
- Format (Présentiel/Distanciel/Hybride)
- Lieu physique (si applicable)
- Lien Zoom/Teams (si applicable)
- Adresse complète

**Capacité**
- Max participants
- Attendus
- Nombre actuel

**Instructeurs**
- Sélection formateurs
- Rôles assignés
- Contact formateur

**Tarification**
- Prix unitaire
- Taxes (calculées auto)
- Total

**Contrôle**
- Statut
- Visible (public/private)
- Documents associés

#### Actions avancées

- **Dupliquer** session (copier configuraton)
- **Gérer waitlist** (liste d'attente automatique)
- **Voir inscriptions** associées
- **Envoyer notifications** à groupe
- **Générer attestations** fin de session
- **Exporter rapports** session
- **Copier parcours** vers autre session

---

### 💳 GESTION PAIEMENTS

#### Dashboard paiements

**Vue d'ensemble**
- Total à recevoir
- Total reçu ce mois
- Montant en attente
- Montant en retard
- Taux de paiement

**Filtres**
- Plage dates
- Statut paiement
- Méthode paiement
- Formation
- Session

**Moyens de paiement acceptés**

| Moyen | Détails | Vérification |
|------|---------|------------|
| **Carte bancaire** | Intégration Pawapay | Automatique |
| **Mobile Money** | Opérateurs locaux | Automatique |
| **Virement bancaire** | RIB fourni | Manuel |
| **Chèque** | Dépot | Manuel |
| **Espèces** | Reçu papier | Manuel |

#### Suivi par inscription

- Historique paiements complet
- Dates et montants
- Références transactions
- Preuves (documents uploadés)
- Moyens utilisés
- Notifications envoyées

#### Gestion factures

**Génération**
- Auto à l'inscription
- Manuel possible
- Format PDF avec logo
- Contient TVA

**Statuts factures**
- Draft (brouillon)
- Sent (envoyée)
- Paid (payée)
- Cancelled (annulée)
- Overdue (en retard)

**Actions**
- 📧 Renvoyer facture
- 🔙 Annuler / Rembouser
- 📊 Voir détails
- 📥 Télécharger

#### Preuves de paiement

- Upload par étudiant ou admin
- Types acceptés: PDF, Image
- Vérification manuelle
- Validation/Rejet

---

### 🎖️ GESTION CERTIFICATS

#### Types de certificats

1. **Completion**: Formation complétée
2. **Attendance**: Présence minimale
3. **Excellence**: Excellent résultats/Notes

#### Génération

**Automatique**
- Trigger: Fin formation + condition
- Template personnalisable
- Données insertées auto: nom, dates, formation

**Manuel**
- Sélectionner étudiants
- Générer certificat
- Aménagements additionnels

#### Mises en page/Templates

- **Template designs**: Personnalisables par formation
- **Éléments variables**: {{name}}, {{formation}}, {{date}}
- **QR code**: Généré auto pour vérification
- **Signature images**: Upload

#### Actions disponibles

| Action | Effet |
|--------|-------|
| **Générer** | Créer nouveau certificat |
| **Télécharger** | PDF ou image |
| **Envoyer email** | À étudiant |
| **Archiver** | Masquer liste |
| **Révoquer** | Invalider certificat |

#### Vérification publique

- Page vérification publique: `/verify?code=XXX`
- Scan QR code → vérification automatique
- Affiche: Titulaire, formation, date émission, validité

#### Métriques

- Certificats émis ce mois
- Par type
- Par formation
- Taux d'émission

---

### 📧 NOTIFICATIONS

#### Types de notifications

**Système automatiques**
- ✉️ Bienvenue inscription
- 🔐 Reset password
- ✅ Confirmation paiement
- 📅 Rappel formation (J-7, J-1)
- 🏁 Formation terminée
- 🎖️ Certificat ready
- ⚠️ Paiement en retard (relances)

**Admin manuelles**
- 📣 Annonce générale
- 📢 Annonce group (formation/session)
- 👤 Message individuel
- 🔔 Alertes admin

#### Templates personnalisables

```
Chaque notification peut avoir:
- Objet customisé
- Corps texte + HTML
- Variables dynamiques: {{name}}, {{formation}}, {{date}}
- Média attachés
```

#### Suivi

- Logs complets envois
- Status (envoyée, rejetée, bounced)
- Date/Heure
- Destinataires
- Contenu

---

### 📊 RAPPORTS ET ANALYTICS

#### Rapports disponibles

1. **Enrollment Report**
   - Par formation / Par session
   - Completeness chart
   - Status breakdown
   - Payment analysis

2. **Payment Report**
   - Revenue par mois
   - Par méthode
   - Arrérages
   - Prévisions

3. **Certificate Report**
   - Émis par période
   - Types distribution
   - Par formation
   - Vérifications QR

4. **Attendance Report**
   - Taux de présence
   - Absences justifiées
   - Par session

5. **Performance Report**
   - Notes moyennes
   - Distribution grades
   - Étudiants top/bottom

6. **Custom Reports**
   - Créer rapports personnalisées
   - Sélectionner colonnes
   - Filtres avancés
   - Export CSV/Excel/PDF

#### Visualisations

- Graphiques temps réel (Recharts)
- Pie charts (distributions)
- Bar charts (comparaisons)
- Line charts (tendances)
- Heatmaps (intensités)

---

### 🔐 AUDIT ET SÉCURITÉ

#### Audit Log (AdminAuditLog)

**Tracked actions**
- CREATE: Création de ressources
- UPDATE: Modification
- DELETE: Suppression
- EXPORT: Export données
- LOGIN: Connexion admin
- LOGOUT: Déconnexion

**Informations loggées**
- Admin responsable (ID)
- Action (type)
- Ressource affectée (type + ID)
- Métadonnées JSON (détails spécifiques)
- Timestamp exact
- Adresse IP
- User Agent (navigateur)

**Filtres audit**
- Par admin
- Par pattern (CREATE/UPDATE/DELETE)
- Par type ressource
- Plage dates
- Recherche full-text

**Rapports audit**
- Activité par admin
- Modifications par ressource
- Chronologie actions
- Export détaillé

#### Sécurité système

**Auth & Authorization**
- ✅ JWT tokens vérifié
- ✅ Session timeout (30j)
- ✅ Logout sécurisé (token invalidé)
- ✅ IP & User Agent tracked
- ✅ Credentials hachées (bcrypt)

**Data Protection**
- 🔒 Encryption en transit (HTTPS)
- 🔒 Secure session storage
- 🔒 CORS configuré
- 🔒 Rate limiting API

**Admin Only**
- ✏️ Restrictions d'accès strictes
- ✏️ Admins vérifiés avant actions sensibles
- ✏️ Tous les changements tracés
- ✏️ Possibilité d'audit complet

---

### ⚙️ PARAMÈTRES ADMIN

#### Global Configuration

**Email Settings**
- SMTP server (host, port)
- Credentials (user, password)
- Default from address
- TLS configuration

**Payment Methods**
- Pawapay API keys
- Flutterwave keys (optionnel)
- Commission rates
- Accepted methods

**System Settings**
- Timezone global
- Currency (CDF, USD, EUR, etc.)
- Language par défaut
- Maintenance mode

**Branding**
- Logo
- Couleurs primaires
- Templates email

**Intégrations**
- Google Analytics ID
- OAuth keys
- LMS provider config

**Notifications**
- Email reminders (actif/inactif)
- Reminder frequency
- Templates par défaut

---

## 🎓 GESTION DES FORMATIONS

### Modèle pédagogique

```
Formation (Programme)
    ├── Sessions (instances)
    │   ├── Dates/horaires
    │   ├── Instructeurs
    │   └── Étudiants inscrits
    ├── Documents
    │   ├── Syllabus
    │   ├── Présentations
    │   ├── Exercices
    │   └── Ressources
    ├── Évaluations
    │   ├── Tests intermédiaires
    │   ├── Examens
    │   └── Projets
    └── Certificats
        ├── Type certification
        └── Critères obtention
```

### Cycle de vie d'une formation

```
1. CRÉATION
   ├─ Définir objectifs pédagogiques
   ├─ Structurer modules
   ├─ Préparer contenus
   └─ Status: BROUILLON

2. PUBLICATION
   ├─ Review final
   ├─ Test lien inscription
   └─ Status: PUBLIÉ

3. SESSION ACTIVE
   ├─ Accepter inscriptions
   ├─ Gérer attendances
   ├─ Recueillir évaluations
   └─ Status: EN COURS

4. FINALISATION
   ├─ Générer certificats
   ├─ Archiver données
   ├─ Analyser feedback
   └─ Status: TERMINÉ

5. MAINTENANCE
   ├─ Archive accessible
   ├─ Mise à jour possible
   └─ Status: ARCHIVÉ
```

### Types de formats

| Format | Caractéristiques | Usages |
|--------|------------------|--------|
| **Présentiel** | Lieu physique | Formations immersives |
| **Distanciel** | 100% en ligne | Formations flexibles |
| **Hybride** | Mix présentiel + ligne | Flexibilité maximale |

### Durées types

- Micro-formation: 4-12h
- Courte formation: 1-3 jours
- Formation modulaire: 1-3 semaines
- Longue formation: 1-6 mois
- Cursus complets: 6-24 mois

---

## 💳 SYSTÈME DE PAIEMENT

### Flux de paiement

```
Étape 1: Inscription
├─ Confirmation formation + session
└─ Calcul prix (montant + taxes)

Étape 2: Initiation paiement
├─ Sélection moyen de paiement
├─ Redirection vers Pawapay/Flutterwave
└─ Mise en attente (status: PENDING)

Étape 3: Traitement
├─ Provider traite transaction
└─ Webhook callback à system

Étape 4: Confirmation/Rejet
├─ Status: SUCCESS → COMPLETED
├─ Status: FAILED → archivé
└─ Notifications envoyées

Étape 5: Suivi admin
├─ Vérification paiements
├─ Réconciliation comptes
└─ Rapports financiers
```

### Moyens acceptés

**Automatisés (paiement direct)**
- Carte de crédit/débit (Mastercard, Visa)
- Mobile Money (Orange Money, Airtel, Vodcom, etc.)

**Semi-automatisés**
- Virement bancaire (coordination manuelle)
- Chèque (dépôt + vérification)
- Espèces (reçu établi sur place)

### Gestion des arrérages

1. **Identification**
   - Query paiements overdue
   - Listing automatique

2. **Relances graduated**
   - J+3: Email rappel courtois
   - J+7: Email insistant
   - J+14: Avertissement dernier délai
   - J+21: Suspension provisoire

3. **Résolution**
   - Plan paiement partiel
   - Remboursement partiel
   - Annulation inscription (dernière option)

### Intégrités financières

- ✅ Chaque paiement loggé
- ✅ Totaux vérifiés vs BD
- ✅ Réconciliation régulière
- ✅ Rapports auditables
- ✅ Transactions reverses trackées

---

## 🎖️ SYSTÈME DE CERTIFICATS

### Architecture certificat

```
Formation réussite
    ↓
Critères atteints?
    ├─ Attendance ≥ 80% → Certificat présence
    ├─ Notes ≥ 70% → Certificat réussite
    └─ Notes ≥ 90% → Certificat excellence
    ↓
Génération automatique
    ├─ Code unique (UUID)
    ├─ PDF généré
    ├─ QR code embed
    └─ Email envoyé
    ↓
Archivage sécurisé
    ├─ Base de données
    ├─ Historique versioning
    └─ Backups externes
```

### Informations sur certificat

- **Titulaire**: Nom complet étudiant
- **Formation**: Nom + niveau
- **Session**: Dates et durée
- **Type**: Completion/Attendance/Excellence
- **Date d'émission**: Date officielle
- **Code unique**: Pour vérification QR
- **Signature**: Images signatures (admin/formateur)
- **Logos**: CJ-DTC + partenaires

### Vérification

**Ligne (Public)**
- URL: plateforme.com/verify
- Input: Code certificat
- Affich: Détails si valide, erreur sinon
- Scan QR: Redirection auto au verify

**Admin**
- Interface admin certificats
- Revoke option (en cas fraude)
- Reissue optio (en cas erreur)
- Bulk verify

### Cas spéciaux

**Certificats distinctifs**
- Avec mention/distinction
- Certificat praticien certifié
- Certificats combinés (multimodule)

**Conditions spéciales**
- Formation incomplète → attestation participation
- Audit course → certificat sans crédits
- Formation transversale → certificat additionnel

---

## 🔐 AUTHENTIFICATION ET SÉCURITÉ

### Système d'authentification

#### Flux NewAuth.js

```
User → Login Page
    ↓
NextAuth.js
    ├─ CredentialsProvider
    │   ├─ Validation email
    │   ├─ Vérif password (bcrypt)
    │   └─ JWT generation
    └─ JWT Token
        ├─ Session stored (cookie)
        ├─ Renewal auto
        └─ 30 jours duration
```

#### Roles & Permissions

```
Roles Système:
├─ PUBLIC: Lecture portail public
├─ STUDENT: Accès espace étudiant
└─ ADMIN: Accès administration complète
    ├─ Super Admin (global access)
    ├─ Formation Manager (formations only)
    ├─ Payment Manager (paiements only)
    └─ Content Manager (contenus only)
```

#### Middleware de protection

```typescript
Protections appliquées:
1. Locale redirection (/ → /fr)
2. Legacy routes mapping
3. JWT verification
4. Role-based access control
5. Public routes bypass
```

#### Récupération mot de passe

```
1. Utilisateur clique "Mot de passe oublié"
2. Email saisi → token généré (UUID)
3. Email envoyé avec lien reset
4. Token valid 24h
5. User créé nouveau password (haché)
6. Token invalidé
7. Redirection login
```

### Mesures de sécurité

**Hashage & Encryption**
- ✅ Passwords: bcrypt avec salt rounds
- ✅ Tokens: JWT signé
- ✅ Transit: HTTPS/TLS obligatoire
- ✅ Database: Encrypted at rest optionné

**Validation & Sanitization**
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (React sanitization)
- ✅ CSRF tokens (NextAuth)

**Session Management**
- ✅ Session timeout (30 jours)
- ✅ Automatic renewal
- ✅ Logout fonction
- ✅ Multi-device tracking optionné

**Rate Limiting**
- ✅ Login attempts limité
- ✅ API endpoints rate-limitéd
- ✅ Email sending rate-limited
- ✅ File uploads limité en taille/frequency

**Audit & Monitoring**
- ✅ Tous les logins loggés
- ✅ Actions admin auditées
- ✅ Violations tentées trackées
- ✅ Alertes sur comportements suspects

---

## 🔌 INTÉGRATIONS EXTERNES

### 1. Paiements en ligne

**Pawapay Integration**
- API REST pour paiements
- Support carte + mobile money
- Webhooks pour notifications
- Reconciliation automatique

**Flutterwave (Optionnel)**
- Alternative multimoyens
- Même webhook pattern
- Fallback en cas indisponibilité

### 2. Email

**SMTP Nodemailer**
- Configuration customisée
- Templates dynamiques
- Attachments support
- Retry mechanism

**Sécurité email**
- TLS obligatoire
- Authentication requis
- Rate limiting (pas spam)
- Bounce tracking

### 3. Stockage Images

**Cloudinary**
- CDN pour images formations
- Resizing automatique
- Cacheing optimisé
- Backup online

**Alternative: Unsplash**
- Stock images libres
- Pour illustrations

### 4. Analytics

**Google Analytics 4**
- Tracking utilisateurs
- Funnel conversions
- Comportement site
- Rapports RVA

**Structured Data (JSON-LD)**
- Sitemap XML
- Robots.txt
- Schema.org markup

### 5. Google OAuth2

- Connexion Google optionnaire
- Profil enrichissement auto
- Seamless UX

### 6. Map & Localisation

- Affichage lieux formations
- Intégration OpenStreetMap optionnelle

---

## 📊 RAPPORTS ET ANALYTICS

### Dashboard Temps Réel

**KPIs principaux**
- Taux conversion (visiteurs → inscrits)
- Taux inscription → paiement
- Taux complétion formation
- Satisfaction moyenne
- Revenue par formation

### Rapports périodiques

**Hebdomadaire**
- Nouvelles inscriptions
- Paiements reçus
- Certificats émis
- Questions non répondues

**Mensuel**
- Performance formations
- ROI par session
- Taux retention
- Feedback analyse
- Rapports financiers complets

**Annuel**
- Stratégie évaluation
- Planification année suivante
- Tendances globales
- Recommandations

### Exports disponibles

- CSV (import Excel)
- PDF (rapports formatted)
- JSON (API consommation)
- Excel (avec graphiques)

### Customization

**Que peut filtrer le user**
- Plage dates
- Formations
- Sessions
- Utilisateurs
- Statuts

**Que peut afficher**
- Toutes colonnes BD
- Grouper par (formation, date, status)
- Sorting ascendant/descendant
- Charts multi-axes

---

## 🚀 UTILISATION ET BONNES PRATIQUES

### Pour l'administrateur

**Démarrage quotidien**
1. Accès dashboard admin
2. Vérification KPIs jour
3. Processing paiements pending
4. Vérification notifications
5. Relance paiements en retard

**Tâches hebdomadaires**
- Activation comptes nouveaux
- Émission rappels avant formation
- Review évaluations
- Support étudiant

**Tâches mensuelles**
- Analyse performance
- Génération rapport
- Planification formations
- Réunion team

### Pour les étudiants

1. **S'inscrire**: Parcourir → Choisir formation → Payer
2. **Apprentissage**: Accès ressources → Suivi cours
3. **Certification**: Fin formation → Récupérer certificat

### Meilleurs pratiques

✅ **Sauvegardes régulières** du système  
✅ **Test formations** avant lancement  
✅ **Feedback étudiant** collecté après chaque session  
✅ **Mise à jour contenus** annuellement minimum  
✅ **Monitoring paiements** quotidien  
✅ **Support client** rapide (< 24h)  
✅ **Analytics review** mensuelle  

---

## 📞 SUPPORT ET MAINTENANCE

### Contacts utiles

- **Administrateur système**: Pour questions techniques
- **Support étudiant**: Pour issues utilisateurs
- **Finance**: Pour réconciliation paiements
- **Formateurs**: Pour problèmes contenus

### Interventions supportées

- Création comptes
- Reset passwords
- Activation certificats
- Ajustements paiements
- Upload documents
- Bug fixes

### En cas de problème

```
Étape 1: Identifier le problème
Étape 2: Vérifier logs + audit trail
Étape 3: Reproduction en environnement test
Étape 4: Fix application
Étape 5: Test validaton
Étape 6: Deploy production
Étape 7: User notification
Étape 8: Follow-up satisfaction
```

---

## 📋 CONCLUSION

CJ-DTC est une **plateforme complète et intégrée** pour la gestion end-to-end de formations professionnelles. Elle combine:

- 💪 **Puissance administrative** via un dashboard riche
- 🎓 **UX étudiant** conviviale et intuitive
- 💳 **Gestion financière** automatisée
- 🔒 **Sécurité** robuste et auditée
- 📊 **Analytics** en temps réel
- 🌍 **Scalabilité** et performance
- 🔌 **Extensibilité** via intégrations

Cette plateforme positionne votre organisation comme **leader** dans la livraison de formations de qualité, avec une **expérience utilisateur premium** et une **gestion administrative simplifiée**.

---

**Pour toute question supplémentaire, consultez votre développeur système ou visitez la documentation technique complète.**

*Document généré Mars 2026*
