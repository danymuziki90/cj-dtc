const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.trainingSession.findMany({
    include: {
      formation: { select: { title: true } },
      formQuestions: true
    }
  });
  console.log(JSON.stringify(sessions, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
