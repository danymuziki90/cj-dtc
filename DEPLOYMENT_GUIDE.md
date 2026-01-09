# 🚀 Plan de Déploiement - Production

## 📋 Préparation (Avant Déploiement)

### ✅ Checklist Locale

```
□ npm run build réussit sans erreur
□ npm run dev fonctionne localement
□ Inscription test réussit
□ Admin peut changer les statuts
□ Emails reçus en local (avec config dev)
□ Pas de secrets en dur dans le code
□ .env en .gitignore
□ Tous les fichiers committés
```

### ✅ Vérifier les Fichiers Clés

```bash
# Config database
✓ DATABASE_URL configurée

# Config email
✓ MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASSWORD, MAIL_FROM

# Auth
✓ NEXTAUTH_URL, NEXTAUTH_SECRET, JWT_SECRET
✓ GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Build
npm run build
✓ Output: .next/
✓ Aucune erreur TypeScript
```

---

## 🌐 Déploiement sur Vercel (Recommandé)

### Étape 1: Préparer le Dépôt Git

```bash
# Vérifier que tout est commité
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "feat: Système d'inscriptions amélioré avec adresse, motivation, emails automatiques"

# Push vers main
git push origin main
```

### Étape 2: Configurer Vercel

#### Option A: Via Dashboard Vercel

1. Aller sur **https://vercel.com/dashboard**
2. Cliquer sur **"Add New"** → **"Project"**
3. Importer le repo `cj-dtc`
4. Vercel détecte automatiquement:
   - ✅ Framework: Next.js
   - ✅ Build command: `next build`
   - ✅ Start command: `next start`

#### Option B: Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Deployer
vercel --prod
```

### Étape 3: Configurer les Variables d'Environnement

**Dans Vercel Dashboard:**

1. Aller à **Settings** → **Environment Variables**
2. Ajouter TOUTES les variables:

```env
# Database
DATABASE_URL=postgresql://...

# Email (IMPORTANT!)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
MAIL_FROM=CJ DTC <your-email@gmail.com>

# Auth
NEXTAUTH_URL=https://votre-domaine.vercel.app
NEXTAUTH_SECRET=votre-secret-prod
JWT_SECRET=votre-secret-prod
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

⚠️ **Important:** Utiliser des secrets de production, pas les mêmes qu'en dev!

### Étape 4: Redéployer

```bash
# Après avoir ajouté les env vars, Vercel redéploie automatiquement
# OU manuellement:
git push origin main
# Vercel redéploie automatiquement
```

---

## 🧪 Test en Production

### 1️⃣ Vérifier la Page

```
https://votre-domaine.vercel.app/admin/enrollments
✅ Page charge sans erreur
✅ Inscriptions visibles
```

### 2️⃣ Tester l'Inscription

```
1. Aller à: https://votre-domaine.vercel.app/espace-etudiants/inscription
2. Remplir le formulaire
3. Vérifier que l'inscription est créée
```

### 3️⃣ Tester l'Email

```
1. Admin: Changer statut à "accepté"
2. Vérifier que l'email est reçu
3. Vérifier que les templates sont corrects
```

### 4️⃣ Vérifier les Logs

```
Vercel Dashboard → Functions
Voir les logs des API routes:
✅ /api/enrollments POST
✅ /api/enrollments/[id] PUT
✅ Email logs
```

---

## 📊 Architecture Production

```
┌─────────────────────────────────────┐
│         Client Browser              │
│  http://votre-domaine.vercel.app    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Vercel Edge Network            │
│      (CDN + Caching)                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Next.js Server (Vercel)          │
│  ├─ Pages statiques (prerendered)   │
│  ├─ API routes (serverless)         │
│  └─ Dynamic pages                   │
└──────────────┬──────────────────────┘
               │
        ┌──────┴─────┐
        │             │
        ▼             ▼
   ┌─────────┐   ┌─────────────────┐
   │  Neon   │   │  SMTP Provider  │
   │ (DB)    │   │ (Gmail/Mailtrap)│
   └─────────┘   └─────────────────┘
```

---

## 🔒 Sécurité Production

### ✅ Vérifications

```
□ HTTPS activé (Vercel par défaut)
□ Env vars pas exposées en client
□ API routes sécurisées
□ Pas de secrets en dur
□ JWT_SECRET unique (production)
□ Database password complexe
□ MAIL_PASSWORD stocké en secure
```

### ⚠️ Bonnes Pratiques

```
✅ Utiliser variables d'env pour secrets
✅ Différents secrets dev vs prod
✅ Logs monitorer pour erreurs
✅ Backups réguliers DB (Neon)
✅ Monitoring email delivery
✅ Rate limiting sur API (optionnel)
```

---

## 📈 Monitoring Post-Déploiement

### Dashboard Vercel

```
1. Real-time logs
   Vercel → Project → Deployments → Logs

2. Function logs
   Vercel → Project → Functions

3. Error tracking
   Voir les 5xx errors

4. Performance
   Voir les response times
```

### Notifier en Cas de Problème

```
Erreurs courantes en prod:
- ❌ SMTP auth failed → Vérifier MAIL_PASSWORD
- ❌ Database connection failed → Vérifier DATABASE_URL
- ❌ Email not sent → Vérifier MAIL_* vars
- ❌ Timeout → Vérifier fonction lambda limits

Résolutions:
→ Vérifier logs Vercel
→ Vérifier .env vars
→ Tester localement
→ Contacter support (si problème service tiers)
```

---

## 🔄 Déploiements Futurs

### Pour Chaque Mise à Jour

```bash
# 1. Développement local
npm run dev
npm run build  # Vérifier que ça compile

# 2. Commit
git add .
git commit -m "Description des changements"

# 3. Push
git push origin main

# 4. Vercel redéploie automatiquement
# Monitoring: Dashboard Vercel

# 5. Tester en production
# https://votre-domaine.vercel.app
```

---

## 📋 Checklist Déploiement

### Avant Deploy

```
□ npm run build sans erreur
□ Toutes les variables d'env préparées
□ Database URL correcte (production)
□ Email config correcte
□ Tests locaux réussis
□ Commit final pushé
```

### After Deploy

```
□ Page home charge
□ Admin page charge
□ Inscription form fonctionne
□ Admin peut changer statuts
□ Emails envoyés et reçus
□ Aucune erreur dans logs
□ Performance acceptable
```

### Maintenance Régulière

```
□ Vérifier les logs hebdos
□ Surveiller les erreurs
□ Tester les emails mensuellement
□ Backups DB (Neon automatic)
□ Updates de dépendances (npm updates)
```

---

## 🆘 Troubleshooting Production

### "Email not sending in production"

```
Causes possibles:
1. MAIL_PASSWORD incorrect
2. MAIL_HOST/PORT incorrect
3. Firewall bloquant SMTP
4. SMTP rate limiting

Solutions:
→ Vérifier Vercel env vars
→ Tester connexion SMTP
→ Augmenter délai entre emails
→ Changer de provider email (Sendgrid, etc)
```

### "Database connection timeout"

```
Causes possibles:
1. DATABASE_URL incorrect
2. Neon down
3. Firewall/Network issue

Solutions:
→ Vérifier DATABASE_URL exacte
→ Tester depuis local
→ Vérifier statut Neon dashboard
→ Contacter Neon support
```

### "Build fails on Vercel"

```
Causes:
- TypeScript errors
- Missing env vars
- Module not found

Solutions:
→ npm run build local pour reproduire
→ Vérifier Vercel logs
→ Ajouter env vars manquantes
→ Redéployer
```

---

## 📞 Support & Ressources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Docs](https://neon.tech/docs)
- [Nodemailer Docs](https://nodemailer.com/)

---

## 🎯 Résumé Déploiement

```
1. ✅ Préparer git repo
2. ✅ Configurer Vercel
3. ✅ Ajouter env vars
4. ✅ Vercel redéploie auto
5. ✅ Tester en production
6. ✅ Monitor logs
7. ✅ Maintenance régulière
```

**Votre application est prête pour la production!** 🚀

Tous les fichiers et configurations sont en place.
Il suffit de configurer les env vars et de déployer! 🎉
