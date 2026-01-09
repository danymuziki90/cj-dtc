# ✅ Résumé des Modifications - Système de Gestion des Inscriptions

## 🎯 Objective Atteint

✅ Ajout d'un champ d'**adresse** lors de l'inscription  
✅ Upload de **lettre de motivation** (optionnel, PDF/DOC/DOCX/TXT)  
✅ **Emails automatiques** envoyés lors de l'acceptation d'une inscription  
✅ **Interface admin** pour changer le statut des inscriptions  
✅ **Intégration complète** du système de notifications

---

## 📁 Fichiers Créés/Modifiés

### 📊 Base de Données (Prisma Schema)
**Fichier:** `prisma/schema.prisma`

Modifications au modèle `Enrollment`:
```prisma
model Enrollment {
  // ... existing fields
  address: String?                // ✨ NOUVEAU: Adresse de l'étudiant
  motivationLetter: String?       // ✨ NOUVEAU: Lettre de motivation (base64)
  // Status change: "pending" | "confirmed" | "cancelled" 
  // → "pending" | "accepted" | "rejected" | "cancelled"
}
```

**Statut:** ✅ Migré vers la base de données (via `npx prisma db push`)

---

### 📧 Service d'Email
**Fichier:** `lib/email.ts` (NOUVEAU)

Fonctions disponibles:
- `sendEmail(to, subject, html)` - Fonction générale d'envoi
- `sendAcceptanceEmail(enrollment)` - Email d'acceptation
- `sendRejectionEmail(enrollment, reason?)` - Email de rejet

Configuration via `.env`:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@cjdtc.com
```

**Dépendance:** `nodemailer` (installé ✅)

---

### 🔌 API Routes

#### 1. POST - Créer une Inscription
**Fichier:** `app/api/enrollments/route.ts` (MODIFIÉ)

**Changement:** JSON → FormData (pour les uploads de fichiers)

Paramètres acceptés:
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "address": "123 Rue de Paris, 75001 Paris",  // ✨ NOUVEAU
  "formationId": 1,
  "startDate": "2024-03-15",
  "notes": "Notes optionnelles",
  "motivation": File  // ✨ NOUVEAU - Fichier PDF/DOC/DOCX/TXT
}
```

Le fichier `motivation` est converti en base64 et stocké dans `motivationLetter`.

---

#### 2. PUT - Mettre à Jour le Statut
**Fichier:** `app/api/enrollments/[id]/route.ts` (NOUVEAU)

Endpoint: `PUT /api/enrollments/[id]`

Request body:
```json
{
  "status": "accepted|rejected|pending|cancelled",
  "reason": "Raison du rejet (optionnel)"
}
```

**Comportement:**
- Valide le nouveau statut
- Récupère les données d'inscription + formation
- Met à jour la base de données
- **Envoie automatiquement un email** selon le statut:
  - `"accepted"` → `sendAcceptanceEmail()`
  - `"rejected"` → `sendRejectionEmail()`
- Retourne l'inscription mise à jour

**Réponse (201):**
```json
{
  "id": 1,
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "status": "accepted",
  "formation": { "id": 1, "title": "..." }
}
```

---

### 🖼️ Interface Utilisateur

#### 1. Formulaire d'Inscription
**Fichier:** `app/[locale]/espace-etudiants/inscription/page.tsx` (MODIFIÉ)

**Nouveaux Champs:**
- ✨ **Adresse** (REQUIS)
  - Input: `<input type="text" name="address" />`
  - Placeholder: "Rue, numéro, ville, pays"

- ✨ **Lettre de Motivation** (OPTIONNEL)
  - Input: `<input type="file" name="motivation" accept=".pdf,.doc,.docx,.txt" />`
  - Affiche le nom du fichier sélectionné
  - Convertie en base64 avant envoi

**Soumission:**
- Utilise `FormData` au lieu de JSON
- Valide tous les champs requis côté client
- Message de succès: "Inscription réussie! Votre demande d'inscription a été enregistrée..."

---

#### 2. Composant de Gestion du Statut (Admin)
**Fichier:** `components/EnrollmentStatusChanger.tsx` (NOUVEAU)

Composant client interactif pour les admins:

**Props:**
```typescript
{
  enrollmentId: number;
  currentStatus: string;
  email: string;
  formationTitle: string;
  onStatusChanged?: () => void;
}
```

**Fonctionnalités:**
- 4 boutons de statut: "Accepter" (vert), "Rejeter" (rouge), "En attente" (jaune), "Annuler" (gris)
- Popup pour saisir une raison de rejet (optionnel)
- Appelle `PUT /api/enrollments/[id]`
- Affiche les messages de succès/erreur
- Callback optionnel quand le statut change

**Actions:**
1. Clic "Accepter" → Status = "accepted" → Email automatique envoyé
2. Clic "Rejeter" → Popup pour raison → Status = "rejected" → Email avec raison
3. Clic "En attente" → Status = "pending" (revenir à l'état initial)

---

#### 3. Table Admin des Inscriptions
**Fichier:** `components/AdminEnrollmentTable.tsx` (NOUVEAU)

Composant client pour afficher les inscriptions avec actions:

**Fonctionnalités:**
- Deux modes: Groupé par formation ou par date de début
- Table avec colonnes: Nom, Email, Téléphone, Adresse, Date début, Statut, Lettre motivation, Date inscription
- **Bouton de téléchargement** pour la lettre de motivation (si fournie)
- **Composant EnrollmentStatusChanger** pour chaque inscription

**Layout:**
- Vue Formation: Table structurée avec toutes les colonnes
- Vue Date: Liste avec statut interactif sur la droite

---

#### 4. Page Admin Simplifiée
**Fichier:** `app/admin/enrollments/page.tsx` (MODIFIÉ)

**Avant:**
- Composant serveur avec affichage statique des statuts
- Pas d'interaction possible

**Après:**
- Composant serveur qui charge les données
- Passe les données au composant client `AdminEnrollmentTable`
- Affiche les deux vues (par formation + par date)
- Toute l'interactivité dans le composant client

---

## 📋 Flux de Travail Complet

### Côté Étudiant (Inscription)

```
1. Remplir le formulaire d'inscription
   ├─ Prénom, Nom, Email, Téléphone
   ├─ ✨ Adresse (REQUIS)
   ├─ ✨ Lettre de motivation (OPTIONNEL - PDF/DOC/DOCX/TXT)
   ├─ Formation
   ├─ Date de début
   └─ Notes (optionnel)

2. Cliquer "S'inscrire"
   ├─ Validation côté client
   ├─ Création FormData + fichier en base64
   └─ POST /api/enrollments

3. Base de données
   ├─ Crée l'enregistrement
   ├─ Stocke adresse
   ├─ Stocke lettre motivation (base64)
   └─ Statut initial: "pending"

4. Confirmation
   └─ Message: "Inscription réussie!"
```

### Côté Admin (Gestion Statut)

```
1. Aller à /admin/enrollments
   └─ Voir la liste des inscriptions

2. Changer le statut
   ├─ Clic "Accepter"
   │  └─ Statut = "accepted"
   │     └─ 📧 Email d'acceptation envoyé automatiquement
   │
   ├─ Clic "Rejeter"
   │  ├─ Popup pour saisir raison (optionnel)
   │  ├─ Statut = "rejected"
   │  └─ 📧 Email de rejet envoyé automatiquement
   │
   ├─ Clic "En attente"
   │  └─ Statut = "pending" (revenir initial)
   │
   └─ Clic "Annuler"
      └─ Statut = "cancelled"

3. Télécharger la lettre
   └─ Clic sur "📄" ou "Télécharger"
      └─ PDF/DOC de la lettre téléchargée

4. Confirmation Admin
   └─ Message: "Status mis à jour! Email envoyé à jean@example.com"
```

---

## 🔧 Configuration Requise

### Variables d'Environnement à Ajouter

Éditer `.env` et ajouter:

```env
# Email Configuration (voir EMAIL_SETUP.md pour détails)
MAIL_HOST=smtp.gmail.com           # Ou votre serveur SMTP
MAIL_PORT=587                      # Ou 465 pour SSL
MAIL_SECURE=false                  # true si port 465, false si 587
MAIL_USER=your-email@gmail.com     # Votre email ou compte SMTP
MAIL_PASSWORD=your-app-password    # App Password (Gmail) ou mot de passe SMTP
MAIL_FROM=noreply@cjdtc.com        # Email d'envoi affichée aux destinataires
```

**Guide complet:** Voir [EMAIL_SETUP.md](./EMAIL_SETUP.md)

---

## 🧪 Test du Système

### Tester l'Inscription

```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "phone": "+33612345678",
    "address": "123 Rue, 75001 Paris",
    "formationId": 1,
    "startDate": "2024-03-15"
  }'
```

### Tester le Changement de Statut

```bash
curl -X PUT http://localhost:3000/api/enrollments/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'
```

### Utiliser l'Interface Admin

1. Aller à `http://localhost:3000/admin/enrollments`
2. Cliquer sur "Accepter" pour une inscription
3. Vérifier que l'email est envoyé (voir logs de la console)
4. Cliquer sur "Rejeter" et ajouter une raison
5. Télécharger la lettre de motivation

---

## 📚 Dépendances Installées

```bash
npm install nodemailer
npm install @types/nodemailer
```

**Version:** nodemailer ^6.9.7

---

## ✅ Checklist de Vérification

- [x] Prisma schema mis à jour (address, motivationLetter, new status)
- [x] Database migrated (`npx prisma db push`)
- [x] Nodemailer installé et configuré
- [x] Email service (`lib/email.ts`) créé
- [x] API PUT `/api/enrollments/[id]` créée
- [x] API POST `/api/enrollments` mise à jour (FormData)
- [x] Formulaire d'inscription mis à jour
- [x] Composant EnrollmentStatusChanger créé
- [x] Composant AdminEnrollmentTable créé
- [x] Page admin intégrée
- [x] Build réussit (`npm run build`)
- [ ] Variables d'environnement configurées (À FAIRE)
- [ ] Testées en développement (À FAIRE)
- [ ] Emails testées avec vrai compte SMTP (À FAIRE)

---

## 🚀 Prochaines Étapes

1. **Configurer l'email** (EMAIL_SETUP.md)
   ```bash
   # Mettre à jour MAIL_USER, MAIL_PASSWORD, etc. dans .env
   ```

2. **Démarrer le serveur dev**
   ```bash
   npm run dev
   ```

3. **Tester l'inscription**
   - Aller à `/espace-etudiants/inscription`
   - Remplir et soumettre

4. **Tester l'admin**
   - Aller à `/admin/enrollments`
   - Changer statut d'une inscription
   - Vérifier que l'email est envoyé (logs)

5. **Déployer** (Vercel)
   - Ajouter variables d'environnement email
   - Push vers Git
   - Vercel redéploie automatiquement

---

## 📞 Support & Dépannage

### "Email not sent" ou "SMTP Error"

1. Vérifier que `MAIL_HOST`, `MAIL_USER`, `MAIL_PASSWORD` sont configurés
2. Vérifier les logs: `npm run dev` affiche les erreurs
3. Vérifier le port SMTP (587 ou 465)
4. Pour Gmail: vérifier que "Accès des applications moins sûres" est activé

### "Address ou motivation fields not stored"

1. Vérifier que la migration Prisma a été exécutée: `npx prisma db push`
2. Vérifier que le formulaire envoie les données en FormData
3. Vérifier les types TypeScript du composant

### "Admin buttons not working"

1. Vérifier que le composant `EnrollmentStatusChanger` est chargé
2. Vérifier les logs de la console du navigateur
3. Vérifier que l'ID d'inscription est correct

---

## 📖 Documentation Additionnelle

- [EMAIL_SETUP.md](./EMAIL_SETUP.md) - Guide détaillé de configuration email
- [DEPLOYMENT_NOTES.md](./DEPLOYMENT_NOTES.md) - Guide de déploiement Vercel
- [README.md](./README.md) - Documentation générale du projet
