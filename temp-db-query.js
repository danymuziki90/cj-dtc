const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.emailTemplate.findMany();
  console.log('Email Templates Count:', templates.length);
  console.log('Email Templates:', JSON.stringify(templates, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
