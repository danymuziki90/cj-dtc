const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Let's search all models
  const models = [
    'sessionFormQuestion',
    'sessionFormTemplate',
    'sessionFormAnswer',
    'enrollment',
    'student',
    'user',
    'trainingSession',
    'formation',
  ];

  for (const model of models) {
    try {
      const records = await prisma[model].findMany();
      const recordsStr = JSON.stringify(records);
      if (recordsStr.toLowerCase().includes('entreprise')) {
        console.log(`Found "entreprise" in model ${model}:`);
        // Filter records containing "entreprise"
        const matches = records.filter(r => JSON.stringify(r).toLowerCase().includes('entreprise'));
        console.log(JSON.stringify(matches, null, 2));
      }
    } catch (e) {
      console.log(`Failed to query model ${model}:`, e.message);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
