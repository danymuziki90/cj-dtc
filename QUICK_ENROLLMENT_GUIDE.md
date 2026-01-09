# 🚀 Guide de Démarrage Rapide - Système d'Inscriptions Amélioré

## ⚡ Installation Rapide (5 minutes)

### 1️⃣ Configurer l'Email

Éditer le fichier `.env` et remplir les variables email:

```env
# Utiliser Gmail (le plus simple pour dev)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App Password (voir EMAIL_SETUP.md)
MAIL_FROM=CJ DTC <your-email@gmail.com>
```

**⏱️ Temps:** 3 minutes (voir [EMAIL_SETUP.md](./EMAIL_SETUP.md) pour guide complet)

### 2️⃣ Tester en Local

```bash
npm run dev
```

Aller à `http://localhost:3000`

---

## 📝 Utilisation - Côté Étudiant

### Formulaire d'Inscription Amélioré

**URL:** `http://localhost:3000/[locale]/espace-etudiants/inscription`

**Nouveaux Champs:**
- ✨ **Adresse** - Rue, numéro, ville, pays (REQUIS)
- ✨ **Lettre de Motivation** - Fichier PDF/DOC/DOCX/TXT (OPTIONNEL)

**Exemple de remplissage:**
```
Prénom: Jean
Nom: Dupont
Email: jean@example.com
Téléphone: +33612345678
Adresse: 123 Rue de Paris, 75001 Paris  ← NOUVEAU
Lettre: [Sélectionner fichier motivation.pdf]  ← NOUVEAU
Formation: Développement Web Avancé
Date de début: 2024-03-15
Notes: Intéressé par les technologies modernes
```

Cliquer **"S'inscrire"** → Confirmation: "Inscription réussie!"

---

## 🔐 Utilisation - Côté Admin

### Gérer les Inscriptions

**URL:** `http://localhost:3000/admin/enrollments`

### Interface

La page affiche **2 vues**:

#### 📊 Vue 1: Par Formation
- Table avec toutes les inscriptions groupées par formation
- Colonnes: Nom, Email, Téléphone, **Adresse**, Date, Statut, **Lettre**, Date inscription
- **Clic sur "Télécharger"** pour avoir la lettre de motivation

#### 📅 Vue 2: Par Date de Début
- Groupée par date avec les statuts interactifs
- Affichage complet de chaque inscription
- **Bouton 📄** pour télécharger la lettre

### Actions Admin (Nouvelle Interaction!)

**Pour chaque inscription, 4 boutons:**

#### ✅ Bouton "Accepter" (Vert)
```
Clic → Statut change à "accepted"
     → 📧 Email d'acceptation envoyé automatiquement
     → Message admin: "Statut mis à jour! Email envoyé à jean@example.com"
```

**Contenu du mail:**
```
Objet: Acceptation de votre inscription - Développement Web Avancé

Félicitations, Jean!

Nous avons le plaisir de vous informer que votre inscription
pour la formation suivante a été ACCEPTÉE:

Formation: Développement Web Avancé
Date de début: 15 mars 2024

[HTML formaté avec détails...]
```

#### ❌ Bouton "Rejeter" (Rouge)
```
Clic → Popup pour entrer une raison (optionnel)
     ↓
Raison: "Trop de candidatures pour cette session"
     ↓
Clic "Confirmer" → Statut change à "rejected"
               → 📧 Email de rejet envoyé avec raison
               → Message admin: "Inscription rejetée! Email envoyé à jean@example.com"
```

**Contenu du mail:**
```
Objet: Votre inscription - Développement Web Avancé

Bonjour Jean,

Nous vous remercions pour votre intérêt envers notre formation
"Développement Web Avancé".

Malheureusement, nous ne pouvons pas accepter votre candidature.

Raison: Trop de candidatures pour cette session

N'hésitez pas à nous contacter pour plus d'informations...
```

#### ⏳ Bouton "En attente" (Jaune)
```
Clic → Statut revient à "pending"
     → Pas d'email envoyé
```

Utile pour revenir à l'état initial avant un rejet.

#### 🚫 Bouton "Annuler" (Gris)
```
Clic → Statut change à "cancelled"
     → Pas d'email envoyé
```

Pour annuler l'inscription complètement.

---

## 📧 Comment les Emails Sont Envoyés

### Flux Automatique

```
Admin change statut
    ↓
Clic bouton "Accepter" ou "Rejeter"
    ↓
API /api/enrollments/[id] reçoit PUT
    ↓
Base de données mise à jour
    ↓
✨ Fonction email appelée automatiquement
    ├─ sendAcceptanceEmail() si status = "accepted"
    └─ sendRejectionEmail() si status = "rejected"
    ↓
Email envoyé via SMTP (Gmail/Mailtrap/Brevo/...)
    ↓
Étudiant reçoit le message
    ↓
Admin voit confirmation: "Email envoyé ✓"
```

### Logs de Test

En développement, les logs affichent:
```
✅ Email sent to jean@example.com
Subject: Acceptation de votre inscription - Développement Web Avancé
```

---

## 🎯 Cas d'Usage Complets

### Cas 1: Accepter une Inscription

```
1. Aller à /admin/enrollments
2. Trouver "Jean Dupont" pour "Développement Web Avancé"
3. Clic sur bouton vert "Accepter"
4. Voir confirmation: "Statut mis à jour! Email envoyé"
5. Jean reçoit email: "Félicitations, votre inscription est acceptée!"
6. Jean voit le statut "Acceptée" dans sa session (future feature)
```

### Cas 2: Rejeter avec Raison

```
1. Aller à /admin/enrollments
2. Trouver "Marie Martin" pour "UI/UX Design"
3. Clic sur bouton rouge "Rejeter"
4. Popup apparaît: "Raison du rejet?"
5. Taper: "Prérequis insuffisants - niveau débutant requis"
6. Clic "Confirmer rejet"
7. Voir confirmation: "Inscription rejetée! Email envoyé"
8. Marie reçoit email avec la raison précise
```

### Cas 3: Télécharger la Lettre de Motivation

```
1. Aller à /admin/enrollments
2. Trouver une inscription avec une lettre
3. Clic sur "Télécharger" ou "📄"
4. Fichier téléchargé: Jean_Dupont_motivation.pdf
5. Ouvrir et consulter la lettre
```

---

## 🧪 Tests Recommandés

### Test 1: S'inscrire avec Adresse et Lettre

```bash
# 1. Créer un fichier de test
echo "Je suis passionné par le dev web!" > motivation.txt

# 2. Utiliser le formulaire web à /espace-etudiants/inscription
# OU faire un test API:

curl -X POST http://localhost:3000/api/enrollments \
  -F "firstName=Jean" \
  -F "lastName=Dupont" \
  -F "email=jean@example.com" \
  -F "phone=+33612345678" \
  -F "address=123 Rue de Paris, 75001" \
  -F "formationId=1" \
  -F "startDate=2024-03-15" \
  -F "motivation=@motivation.txt"
```

### Test 2: Accepter une Inscription

```bash
curl -X PUT http://localhost:3000/api/enrollments/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'

# Réponse attendue (201):
# {
#   "id": 1,
#   "firstName": "Jean",
#   "status": "accepted",
#   "formation": { "title": "..." }
# }

# Dans les logs: "✅ Email sent to jean@example.com"
```

### Test 3: Rejeter avec Raison

```bash
curl -X PUT http://localhost:3000/api/enrollments/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "reason": "Trop de candidatures pour cette session"
  }'

# Email reçu avec la raison
```

---

## 🔍 Vérifier que Tout Fonctionne

### Checklist

- [ ] `.env` a les variables `MAIL_*` configurées
- [ ] Page `/admin/enrollments` charge sans erreur
- [ ] Boutons "Accepter", "Rejeter" visibles
- [ ] Clic sur "Accepter" montre popup ou confirmation
- [ ] Logs affichent "✅ Email sent"
- [ ] Formulaire d'inscription a champs "Adresse" et "Lettre de motivation"
- [ ] File upload fonctionne (affiche le nom du fichier)
- [ ] Build réussit: `npm run build` ✓

---

## 📊 Structure des Données Stockées

### Inscription Complète (DB)

```json
{
  "id": 1,
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "address": "123 Rue de Paris, 75001 Paris",
  "formationId": 1,
  "startDate": "2024-03-15",
  "status": "accepted",
  "notes": "Intéressé par technologies modernes",
  "motivationLetter": "data:application/pdf;base64,JVBERi0xLjQ=...",
  "createdAt": "2024-02-15T10:30:00Z",
  "updatedAt": "2024-02-15T14:45:00Z"
}
```

**Champs Clés:**
- `address` - Adresse de l'étudiant
- `motivationLetter` - Fichier en base64 (peut être null)
- `status` - "pending" | "accepted" | "rejected" | "cancelled"

---

## 🐛 Dépannage Rapide

| Problème | Solution |
|----------|----------|
| Emails ne s'envoient pas | Vérifier MAIL_USER/MAIL_PASSWORD dans .env |
| "Connection refused" | Vérifier MAIL_HOST et MAIL_PORT |
| Gmail dit "App Password" incorrect | Générer nouvelle App Password |
| Formulaire d'inscription vide | Vérifier prisma/schema.prisma a les champs |
| Build échoue | Lancer `npm run build` pour voir l'erreur |
| Aucun email dans Mailtrap | Vérifier adresse MAIL_FROM valide |

---

## 📞 Besoin d'Aide?

1. Consulter [EMAIL_SETUP.md](./EMAIL_SETUP.md) pour configuration email
2. Consulter [ENROLLMENT_SYSTEM_SUMMARY.md](./ENROLLMENT_SYSTEM_SUMMARY.md) pour détails techniques
3. Vérifier les logs: `npm run dev` affiche tous les messages

---

## ✨ Récapitulatif des Nouvelles Fonctionnalités

| Feature | Côté | Description |
|---------|------|-------------|
| Champ Adresse | Étudiant | Adresse requise au formulaire |
| Upload Lettre | Étudiant | Fichier PDF/DOC pour motivation |
| Statut Interactif | Admin | Boutons pour changer le statut |
| Email Auto | Admin | Email envoyé quand accepté/rejeté |
| Raison de Rejet | Admin | Texte optionnel pour justifier rejet |
| Télécharger Lettre | Admin | Récupérer PDF/DOC de la lettre |
| 2 Vues Admin | Admin | Par formation ET par date de début |

---

## 🎉 Vous Êtes Prêt!

1. ✅ Configurer `.env`
2. ✅ Lancer `npm run dev`
3. ✅ Aller à `http://localhost:3000`
4. ✅ Tester l'inscription + admin

Amusez-vous! 🚀
