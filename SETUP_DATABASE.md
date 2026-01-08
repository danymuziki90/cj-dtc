# Configuration de la Base de Données

## Option 1 : PostgreSQL avec Docker (Recommandé)

1. **Installer Docker Desktop** : https://www.docker.com/products/docker-desktop

2. **Démarrer PostgreSQL avec Docker** :
```bash
docker run --name cjdtc-postgres -e POSTGRES_USER=cjdtc -e POSTGRES_PASSWORD=cjdtc_password -e POSTGRES_DB=cjdtc -p 5432:5432 -d postgres:15-alpine
```

3. **Configurer `.env`** :
```env
DATABASE_URL="postgresql://cjdtc:cjdtc_password@localhost:5432/cjdtc?schema=public"
```

4. **Exécuter les migrations** :
```bash
npx prisma migrate dev --name add_enrollments
npx prisma generate
```

## Option 2 : PostgreSQL Local

1. **Installer PostgreSQL** : https://www.postgresql.org/download/windows/

2. **Créer la base de données** :
```sql
CREATE DATABASE cjdtc;
CREATE USER cjdtc WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cjdtc TO cjdtc;
```

3. **Configurer `.env`** :
```env
DATABASE_URL="postgresql://cjdtc:your_password@localhost:5432/cjdtc?schema=public"
```

4. **Exécuter les migrations** :
```bash
npx prisma migrate dev --name add_enrollments
npx prisma generate
```

## Option 3 : Base de Données en Ligne (Gratuit)

### Supabase (Recommandé)
1. Créer un compte sur https://supabase.com
2. Créer un nouveau projet
3. Copier la connection string depuis Settings > Database
4. Configurer `.env` avec cette URL

### Neon (Alternative)
1. Créer un compte sur https://neon.tech
2. Créer un nouveau projet
3. Copier la connection string
4. Configurer `.env` avec cette URL

## Après la Configuration

1. **Générer le client Prisma** :
```bash
npx prisma generate
```

2. **Exécuter les migrations** :
```bash
npx prisma migrate dev --name add_enrollments
```

3. **Remplir la base de données (optionnel)** :
```bash
npx ts-node prisma/seed.ts
```

## Baseline d'une base de données existante (Production)

Si votre base de données en production est déjà en production et contient des données, suivez ces étapes pour "baseliner" l'état actuel afin d'adopter le flux de migrations :

1. **Générer une migration initiale sans l'appliquer** (crée les fichiers de migration pour le contrôle de version) :
```bash
npx prisma migrate dev --create-only --name init
```

2. **Vérifier les fichiers de migration générés** et les committer dans votre dépôt (git).

3. **Marquer la base de données de production comme baselined** et appliquer les migrations avec :
```bash
npx prisma migrate deploy
```

4. **Notes importantes** :
- Pour une base de données déjà en production, **ne pas** exécuter `migrate dev` directement sur la prod sans revue.
- L'option `--create-only` permet de conserver l'historique des migrations sans modifier la base encore.

## Vérification

Pour vérifier que la connexion fonctionne :
```bash
npx prisma studio
```

Cela ouvrira une interface graphique pour voir vos données.

## Exemple CI (GitHub Actions)

Exemple de configuration GitHub Actions pour appliquer les migrations automatiquement lors d'un push sur `main` :

```yaml
name: Apply Prisma migrations

on:
  push:
    branches: [ main, master ]
  workflow_dispatch: {}

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Apply Prisma migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          npx prisma migrate deploy
          npx prisma generate

      - name: Verify migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npx prisma migrate status --schema=prisma/schema.prisma
```

**Note:** Configure `DATABASE_URL` as a secret in the repository settings and ensure the runner has network access to the production DB.

## Mitigation EPERM (Windows)

Sur Windows, vous pouvez rencontrer une erreur `EPERM` lors de la génération du client Prisma (ex: rename `query_engine-windows.dll.node.tmp...`). Conseils :

- Arrêter tous les processus Node :
```powershell
Get-Process node | Stop-Process -Force
```
- Supprimer les fichiers temporaires dans `node_modules/.prisma` si nécessaire.
- Ajouter une exclusion à Windows Defender / antivirus pour le dossier du projet `node_modules/.prisma`.
- Relancer `npx prisma generate` après avoir arrêté les processus.
- Si le problème persiste, redémarrer la machine pour relâcher les verrous de fichiers.
