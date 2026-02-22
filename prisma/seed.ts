/**
 * Seed script for Prisma
 * Usage: npx ts-node prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('AdminStrongPassword123!', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cjdevelopmenttc.com' },
    update: { name: 'Admin CJ', password },
    create: {
      email: 'admin@cjdevelopmenttc.com',
      name: 'Admin CJ',
      password,
      role: 'ADMIN'
    }
  })

  const formation = await prisma.formation.upsert({
    where: { slug: 'iop-insertion' },
    update: {},
    create: {
      title: 'IOP – Insertion & Orientation Professionnelle',
      slug: 'iop-insertion',
      description: 'Programme phare destiné à rendre les jeunes immédiatement employables.'
    }
  })

  await prisma.article.upsert({
    where: { slug: 'lancement-fonio-2026' },
    update: {},
    create: {
      title: 'Lancement FONIOP 2026',
      slug: 'lancement-fonio-2026',
      excerpt: 'FONIOP 2026 : objectif 1000 emplois en 10 pays.',
      content: 'Contenu officiel du lancement FONIOP 2026.',
      published: true
    }
  })

  await prisma.certificate.upsert({
    where: { code: 'CJ-IOP-2025-0001' },
    update: {},
    create: {
      code: 'CJ-IOP-2025-0001',
      holderName: 'Amina K.',
      formationId: formation.id,
      issuedBy: 'CJ DEVELOPMENT TRAINING CENTER',
      verified: true
    }
  })

  await prisma.lMSConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      provider: 'moodle',
      apiUrl: 'https://moodle.example/api',
      apiKey: 'example_key_please_replace'
    }
  })

  console.log('Seed finished.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
