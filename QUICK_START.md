# Guide de Démarrage Rapide - CJ DEVELOPMENT TRAINING CENTER

## Configuration de la Base de Données

Votre fichier `.env` contient actuellement des valeurs placeholder. Voici comment le configurer :

### Option 1 : Supabase (Recommandé - Gratuit)

1. **Créer un compte Supabase** : https://supabase.com
2. **Créer un nouveau projet**
3. **Récupérer la connection string** :
   - Allez dans **Settings** > **Database**
   - Sous **Connection string**, copiez l'URI (format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
4. **Mettre à jour `.env`** :
```env
DATABASE_URL="postgresql://postgres:[VOTRE-MOT-DE-PASSE]@db.xxxxx.supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="générez-un-secret-aléatoire-ici"
JWT_SECRET="générez-un-secret-aléatoire-ici"
```

### Option 2 : SQLite (Pour développement rapide)

Si vous voulez tester rapidement sans configurer PostgreSQL :

```powershell
.\switch-to-sqlite.ps1
```

Cela modifiera automatiquement votre schéma Prisma pour utiliser SQLite.

### Option 3 : PostgreSQL Local

1. **Installer PostgreSQL** : https://www.postgresql.org/download/windows/
2. **Créer la base de données** :
   - Ouvrir pgAdmin ou psql
   - Exécuter : `CREATE DATABASE cjdtc;`
3. **Mettre à jour `.env`** :
```env
DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/cjdtc?schema=public"
```

## Après la Configuration

1. **Générer Prisma Client** (déjà fait) :
```bash
npx prisma generate
```

2. **Exécuter les migrations** :
```bash
npx prisma migrate dev --name add_enrollments
```

3. **Remplir la base de données** (optionnel) :
```bash
npx ts-node prisma/seed.ts
```

4. **Démarrer le serveur** :
```bash
npm run dev
```

## Générer des Secrets

Pour `NEXTAUTH_SECRET` et `JWT_SECRET`, vous pouvez générer des secrets aléatoires :

```bash
# Avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ou utilisez un générateur en ligne : https://generate-secret.vercel.app/32
