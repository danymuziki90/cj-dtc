# 🔧 Configuration Email Gmail - Guide Pas à Pas

## ⚠️ Prérequis

- Compte Gmail actif
- Authentification 2FA activée sur le compte
- Accès à https://myaccount.google.com

## 📝 Étapes de Configuration

### Étape 1: Activer la Vérification en 2 Étapes

1. Aller sur **https://myaccount.google.com/security**
2. Dans le menu de gauche, cliquer sur **"Sécurité"**
3. Chercher **"Vérification en 2 étapes"**
4. Cliquer sur **"Activer la vérification en 2 étapes"**
5. Suivre les étapes (SMS ou app Google Authenticator)

✅ La 2FA est maintenant activée

### Étape 2: Créer une "App Password"

1. Aller sur **https://myaccount.google.com/apppasswords**
2. En haut, sélectionner:
   - **Application:** Mail
   - **Appareil:** Windows (ou Mac/Linux selon votre OS)
3. Cliquer sur **"Générer"**
4. Google va générer un mot de passe de 16 caractères (format: `xxxx xxxx xxxx xxxx`)
5. **Copier ce mot de passe**

✅ Vous avez maintenant votre "App Password"

### Étape 3: Configurer le Fichier .env

Ouvrir le fichier `.env` à la racine du projet:

```env
# Avant (ou ligne vide):
# MAIL_HOST=...

# Après:
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com          # ← Votre email Gmail
MAIL_PASSWORD=xxxx xxxx xxxx xxxx       # ← App Password copié
MAIL_FROM=CJ DTC <your-email@gmail.com> # ← Email d'affichage
```

**Exemple réel:**
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=contact@cjdtc.com
MAIL_PASSWORD=abcd efgh ijkl mnop
MAIL_FROM=CJ DTC <contact@cjdtc.com>
```

⚠️ **Important:** Ne pas mettre de guillemets autour des valeurs!

### Étape 4: Tester la Configuration

1. Ouvrir un terminal
2. Aller dans le dossier du projet:
   ```bash
   cd e:\cj-dtc
   ```

3. Lancer le serveur:
   ```bash
   npm run dev
   ```

4. Ouvrir le navigateur: `http://localhost:3000/admin/enrollments`

5. Changer le statut d'une inscription à "accepté"

6. Regarder les logs du terminal, vous devriez voir:
   ```
   ✅ Email sent to student@example.com
   ```

✅ L'email a été envoyé!

## 📧 Vérifier que L'Email a Été Reçu

### Dans Gmail

1. Ouvrir Gmail avec l'adresse que vous avez mise dans `MAIL_FROM`
2. Vérifier le dossier **"Tous les messages"** ou **"Envoyés"**
3. L'email que vous avez envoyé devrait y être

### Dans une Autre Boîte Mail

1. L'étudiant reçoit l'email à son adresse
2. Il vérifier le dossier **"Courrier indésirable"** ou **"Spam"**
3. L'email devrait être marqué comme légitime

## 🔑 Où Trouver Ses Identifiants

### Votre Email Gmail
```
📧 Format: prenom.nom@gmail.com
    Ou: monentreprise@gmail.com
    Ou: contact@cjdtc.com (si email personnalisé)
```

### Votre App Password
```
🔑 Format: xxxx xxxx xxxx xxxx (16 caractères avec espaces)
   Exemple: abcd efgh ijkl mnop
```

**Où le trouver:**
- Généré automatiquement à https://myaccount.google.com/apppasswords
- Stocker en lieu sûr (notes, gestionnaire de mots de passe)
- Jamais partager ou committer dans Git!

## ❌ Erreurs Courantes

### "Invalid login credentials"
```
Cause: Mauvais MAIL_USER ou MAIL_PASSWORD
Solution:
  1. Vérifier l'email exactement (sans typo)
  2. Régénérer l'App Password
  3. Copier-coller le nouveau dans .env
  4. Redémarrer: npm run dev
```

### "Connect ECONNREFUSED 127.0.0.1:587"
```
Cause: Port SMTP bloqué par firewall
Solution:
  1. Essayer port 465: MAIL_PORT=465
  2. Mettre MAIL_SECURE=true
  3. Ou demander à l'administrateur réseau
```

### "Email arrived in Spam"
```
Cause: Gmail le considère comme potentiellement spam
Solution:
  1. Ajouter MAIL_FROM avec domaine vérifié
  2. Ou utiliser un service comme SendGrid/Brevo
  3. Ou configurer SPF/DKIM (avancé)
```

### "Error: 535 5.7.8 Username and Password not accepted"
```
Cause: App Password ne s'est pas bien copié (espaces manquants)
Solution:
  1. Aller sur https://myaccount.google.com/apppasswords
  2. Supprimer l'App Password créée
  3. En créer une nouvelle
  4. Copier exactement avec espaces: xxxx xxxx xxxx xxxx
```

## ✅ Checklist de Vérification

- [ ] 2FA activée sur le compte Google
- [ ] App Password généré depuis https://myaccount.google.com/apppasswords
- [ ] `.env` rempli avec:
  - [ ] `MAIL_HOST=smtp.gmail.com`
  - [ ] `MAIL_PORT=587`
  - [ ] `MAIL_SECURE=false`
  - [ ] `MAIL_USER=votre-email@gmail.com`
  - [ ] `MAIL_PASSWORD=xxxx xxxx xxxx xxxx` (App Password copié)
  - [ ] `MAIL_FROM=nom@gmail.com`
- [ ] Fichier `.env` sauvegardé
- [ ] Serveur redémarré après changement: `npm run dev`
- [ ] Test effectué: changement de statut → log "✅ Email sent"
- [ ] Email reçu dans la boîte de réception

## 🎯 Configuration pour Production

Si vous déployez sur **Vercel**:

1. Aller sur le dashboard Vercel
2. Sélectionner votre projet
3. **Settings** → **Environment Variables**
4. Ajouter toutes les variables:
   ```
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_SECURE=false
   MAIL_USER=contact@cjdtc.com
   MAIL_PASSWORD=abcd efgh ijkl mnop
   MAIL_FROM=CJ DTC <contact@cjdtc.com>
   ```
5. Redéployer: `git push` (Vercel redéploie automatiquement)

## 🔐 Sécurité

⚠️ **NE JAMAIS:**
- ❌ Committer `.env` dans Git
- ❌ Partager l'App Password
- ❌ Utiliser le mot de passe du compte Google (utiliser App Password)
- ❌ Modifier MAIL_USER/MAIL_PASSWORD dans le code source

✅ **À FAIRE:**
- ✅ Stocker les credentials dans `.env` local
- ✅ Ajouter `.env` dans `.gitignore` (déjà fait)
- ✅ Utiliser App Password au lieu du mot de passe du compte
- ✅ Régénérer l'App Password si compromis

## 📞 Alternatives à Gmail

Si Gmail ne fonctionne pas:

### Option 2: Mailtrap (Gratuit, Recommandé pour Test)
```env
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=xxxxx
MAIL_PASSWORD=xxxxx
MAIL_FROM=noreply@cjdtc.com
```
Voir [EMAIL_SETUP.md](./EMAIL_SETUP.md) pour détails

### Option 3: Brevo (Gratuit, Production Ready)
```env
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-brevo-email
MAIL_PASSWORD=xxxxx
MAIL_FROM=noreply@cjdtc.com
```

---

**Besoin d'aide?** Vérifiez la section "Erreurs Courantes" ci-dessus! 🚀
