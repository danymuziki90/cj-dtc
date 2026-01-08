# CJ DEVELOPMENT TRAINING CENTER — Next.js Starter

Scaffolded Next.js (App Router) + TypeScript + Tailwind project for CJ DEVELOPMENT TRAINING CENTER.

## What is included
- Next.js (App Router) TypeScript scaffold
- TailwindCSS configuration
- Basic pages: Home, About, Formations, Programmes, Services, Espace Etudiants, Partenaires, Actualites, Contact
- Components: Header, Footer, Hero, CTA, Layout
- Prisma schema + .env.example
- NextAuth stub (API route placeholder)
- Dockerfile + docker-compose (dev)
- i18n using `next-intl` (basic)
- README with startup steps

## How to use
1. Install dependencies:
```bash
npm install
```
2. Create `.env` from `.env.example` and set secrets.
3. Run the dev server:
```bash
npm run dev
```

Note: This scaffold is a starting point. You will need to:
- add real images and media assets (per the charter)
- configure Prisma DB and run `prisma migrate`
- configure NextAuth providers and secrets

**Security note:** The repo includes a seed that creates an admin user (`admin@cjdevelopmenttc.com` with a default password `AdminStrongPassword123!`) for local development. Please change this password immediately for any shared or production environment and store secrets like `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, and `DATABASE_URL` securely (e.g., environment variables, secret manager).
- set up CMS if desired (Sanity/Strapi)
- deploy to Vercel or your preferred hosting.

