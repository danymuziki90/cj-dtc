const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fixing session form questions...');

  // 1. Delete Question 1 (since name is already a system field)
  try {
    const q1 = await prisma.sessionFormQuestion.findUnique({ where: { id: 1 } });
    if (q1) {
      await prisma.sessionFormQuestion.delete({ where: { id: 1 } });
      console.log('Deleted Question ID 1 (votre nom)');
    }
  } catch (e) {
    console.error('Error deleting Q1:', e.message);
  }

  // 2. Update Question 2 (french level)
  try {
    const q2 = await prisma.sessionFormQuestion.findUnique({ where: { id: 2 } });
    if (q2) {
      await prisma.sessionFormQuestion.update({
        where: { id: 2 },
        data: {
          label: 'Niveau de compréhension du français',
          helpText: 'Indiquez votre niveau de maîtrise de la langue française',
          order: 0
        }
      });
      console.log('Updated Question ID 2');
    }
  } catch (e) {
    console.error('Error updating Q2:', e.message);
  }

  // 3. Update Question 3 (motivation / exact instructions)
  try {
    const q3 = await prisma.sessionFormQuestion.findUnique({ where: { id: 3 } });
    if (q3) {
      await prisma.sessionFormQuestion.update({
        where: { id: 3 },
        data: {
          label: 'Comment pouvez-vous faire pour acquérir des instructions exactes ?',
          helpText: '',
          order: 1
        }
      });
      console.log('Updated Question ID 3');
    }
  } catch (e) {
    console.error('Error updating Q3:', e.message);
  }

  console.log('Finished.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
