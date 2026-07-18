const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  let retries = 5;
  while (retries > 0) {
    try {
      console.log(`Connecting to database... (${retries} attempts left)`);
      const sessions = await prisma.trainingSession.findMany({
        include: {
          formation: { select: { title: true } },
          formQuestions: true
        }
      });
      console.log('SUCCESS: Loaded sessions');
      console.log(JSON.stringify(sessions, null, 2));
      return;
    } catch (e) {
      console.error('Connection failed:', e.message);
      retries--;
      if (retries === 0) {
        throw e;
      }
      await delay(2000);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
