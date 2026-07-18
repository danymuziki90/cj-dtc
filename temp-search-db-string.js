const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Searching SessionFormQuestion labels and helpText...');
  const questions = await prisma.sessionFormQuestion.findMany();
  for (const q of questions) {
    if (q.label?.includes('entreprise') || q.helpText?.includes('entreprise') || q.label?.includes('Informations') || q.helpText?.includes('Informations')) {
      console.log(`Question ID ${q.id}: label="${q.label}", helpText="${q.helpText}"`);
    }
  }

  console.log('Searching SessionFormTemplate...');
  const templates = await prisma.sessionFormTemplate.findMany();
  for (const t of templates) {
    if (t.name?.includes('entreprise') || t.description?.includes('entreprise')) {
      console.log(`Template ID ${t.id}: name="${t.name}", desc="${t.description}"`);
    }
  }

  console.log('Searching SessionFormAnswer...');
  const answers = await prisma.sessionFormAnswer.findMany();
  for (const a of answers) {
    if (a.textValue?.includes('entreprise')) {
      console.log(`Answer ID ${a.id}: textValue="${a.textValue}"`);
    }
  }

  console.log('Searching Enrollment notes...');
  const enrollments = await prisma.enrollment.findMany();
  for (const e of enrollments) {
    if (e.notes?.includes('entreprise')) {
      console.log(`Enrollment ID ${e.id}: notes="${e.notes}"`);
    }
  }
}

main().finally(() => prisma.$disconnect());
