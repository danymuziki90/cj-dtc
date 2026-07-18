const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SessionFormTemplates ---');
  const templates = await prisma.sessionFormTemplate.findMany({
    include: { questions: true }
  });
  console.log(JSON.stringify(templates, null, 2));

  console.log('\n--- SessionFormQuestions ---');
  const questions = await prisma.sessionFormQuestion.findMany();
  console.log(JSON.stringify(questions, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
