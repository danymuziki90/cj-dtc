# Checklist de deploiement production

## 1. Variables d environnement
Renseigner les variables listees dans `/.env.production.example`.

Variables critiques:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_JWT_SECRET`
- `STUDENT_JWT_SECRET`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_SECURE`
- `MAIL_USER`
- `MAIL_PASSWORD`
- `MAIL_FROM`
- `MAIL_TLS_SERVERNAME`
- `NEXT_PUBLIC_APP_URL`
- `PAWAPAY_API_KEY`
- `PAWAPAY_CALLBACK_URL`

Notes:
- garder `ADMIN_ALLOW_EMERGENCY_LOGIN=false` en production
- pour la configuration SMTP actuelle, `MAIL_TLS_SERVERNAME=web-hosting.com` est requis
- si vous passez PawaPay en live, remplacer aussi `PAWAPAY_API_URL`

## 2. Base de donnees
Le portail admin / etudiant depend de ces tables:
- `Student`
- `AdminTrainingSession`
- `PasswordResetToken`
- `AdminNotification`
- `StudentSubmission`
- `StudentCertificate`
- `AdminAuditLog`

Si la base de production n a pas encore ces tables, executer une fois:
- `/scripts/sql/admin_student_portal_bootstrap.sql`

Important:
- ne pas lancer `prisma db push --accept-data-loss` en production sur cette base actuelle
- le projet a un historique Prisma derive; le bootstrap SQL additif est la voie sure ici

## 3. Verification avant mise en ligne
Verifier:
- login admin OK
- creation etudiant OK
- login etudiant OK
- email automatique des acces OK
- creation paiement session OK

## 4. Validation deja faite localement
Valide sur cette branche:
- TypeScript cible: OK
- E2E critiques Playwright: 3/3 OK
- SMTP reel: OK
