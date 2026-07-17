# Checklist de déploiement production

## 1. Variables d'environnement
Renseigner les variables listées dans `/.env.production.example`.

Variables critiques :
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

Notes :
- Garder `ADMIN_ALLOW_EMERGENCY_LOGIN=false` en production.
- Pour la configuration SMTP actuelle, `MAIL_TLS_SERVERNAME=web-hosting.com` est requis.

## 2. Base de données
Le portail admin / étudiant dépend de ces tables :
- `Student`
- `AdminTrainingSession`
- `PasswordResetToken`
- `AdminNotification`
- `StudentSubmission`
- `StudentCertificate`
- `AdminAuditLog`

Pour appliquer ces tables en production en toute sécurité, exécutez simplement les migrations Prisma standard :
- `npx prisma migrate deploy`

> [!NOTE]
> L'initialisation non destructive de ces tables a été intégrée directement dans le système de migrations Prisma (migration `20260707120000_link_enrollments_to_students`). Il n'est plus nécessaire d'exécuter manuellement de script SQL sur votre console Supabase de production.

Important :
- Ne pas lancer `prisma db push --accept-data-loss` en production sur cette base actuelle.

## 3. Vérification avant mise en ligne
Vérifier :
- Login admin OK
- Création étudiant / inscription session OK
- Login étudiant automatique après inscription OK
- E-mail automatique des accès OK

## 4. Validation déjà faite localement
Validé sur cette branche :
- TypeScript cible : OK
- E2E critiques Playwright : OK
- SMTP réel : OK
