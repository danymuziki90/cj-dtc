const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const record = await prisma.formation.findFirst();
    console.log('Record details:', record);
  } catch (error) {
    console.error('Error querying formation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
