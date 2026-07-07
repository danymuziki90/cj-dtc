# Configuration des variables d'environnement Vercel

Les déploiements échouent car les variables d'environnement ne sont pas configurées dans Vercel.

## Étapes pour configurer les variables dans Vercel

1. Allez sur https://vercel.com/danymuziki90s-projects/cj-dtc-f58j/settings/environment-variables
2. Ajoutez les variables suivantes pour l'environnement **Production** :

### Variables requises (obligatoires)

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require
NEXTAUTH_URL=https://cjdevelopmenttc.org
NEXTAUTH_SECRET=votre-secret-long-aleatoire
JWT_SECRET=votre-secret-long-aleatoire
NEXT_PUBLIC_APP_URL=https://cjdevelopmenttc.org
NEXT_RES_URL=https://cjdevelopmenttc.org
```

### Variables Admin (obligatoires)

```
ADMIN_JWT_SECRET=votre-secret-admin-aleatoire
STUDENT_JWT_SECRET=votre-secret-student-aleatoire
ADMIN_ALLOW_EMERGENCY_LOGIN=false
ADMIN_DEFAULT_USERNAME=admincjtc
ADMIN_DEFAULT_PASSWORD=votre-mot-de-passe-admin
```

### Variables Email (optionnelles mais recommandées)

```
MAIL_HOST=mail.cjdevelopmenttc.org
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=contact@cjdevelopmenttc.org
MAIL_PASSWORD=votre-mot-de-passe-smtp
MAIL_FROM=CJ DTC <contact@cjdevelopmenttc.org>
MAIL_TLS_SERVERNAME=web-hosting.com
EMAIL_DELIVERY_TIMEOUT_MS=8000
CONTACT_EMAIL=contact@cjdevelopmenttc.org
```

### Variables Pawapay (optionnelles)

```
PAWAPAY_API_KEY=votre-cle-api-pawapay
PAWAPAY_API_URL=https://api.sandbox.pawapay.io
PAWAPAY_DEPOSIT_PATH=/v1/deposits
PAWAPAY_DEPOSIT_STATUS_PATH=/v1/deposits/{depositId}
PAWAPAY_PUBLIC_KEYS_PATH=/public-key/http
PAWAPAY_COUNTRY_CODE=COD
PAWAPAY_CALLBACK_URL=https://cjdevelopmenttc.org/pawapay/callback
PAWAPAY_REQUIRE_SIGNED_CALLBACKS=false
```

## Commande pour relancer le déploiement

Après avoir configuré les variables, relancez le déploiement :

```bash
vercel --prod
```

## Vérification

Vous pouvez vérifier les variables configurées avec :

```bash
vercel env ls
```
