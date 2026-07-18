const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      formation: { select: { title: true } },
      session: { select: { id: true } }
    }
  });
  console.log('Enrollments:');
  for (const e of enrollments) {
    console.log(`ID: ${e.id}, Student: ${e.firstName} ${e.lastName}, Email: ${e.email}, Status: ${e.status}, Session ID: ${e.sessionId}`);
  }
}

main().finally(() => prisma.$disconnect());
