const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const session = await prisma.trainingSession.findUnique({
    where: { id: 13 },
    include: { formation: true }
  });
  console.log('Session 13 details:', JSON.stringify(session, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
