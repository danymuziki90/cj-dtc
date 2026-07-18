const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.emailTemplate.findMany();
  console.log('Email templates in DB:', templates.map(t => t.id));
}

main().finally(() => prisma.$disconnect());
