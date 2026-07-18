const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check sessions with questions
  const sessions = await prisma.trainingSession.findMany({
    include: {
      formQuestions: { orderBy: { order: 'asc' } },
      formation: { select: { title: true } }
    },
    take: 10
  });

  console.log('=== SESSIONS ===');
  console.log('Total sessions fetched:', sessions.length);
  for (const s of sessions) {
    console.log(`\nSession ID=${s.id} | "${s.formation?.title}" | status=${s.status} | questions=${s.formQuestions.length}`);
    for (const q of s.formQuestions) {
      console.log(`  Q[${q.id}] order=${q.order} label="${q.label}" type=${q.type} templateId=${q.templateId}`);
    }
  }

  // Check enrollments
  const enrollments = await prisma.sessionEnrollment.findMany({
    include: {
      session: { include: { formation: { select: { title: true } } } },
      student: { select: { email: true, firstName: true, lastName: true } },
      answers: { include: { question: { select: { label: true } } } }
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n=== ENROLLMENTS (last 5) ===');
  for (const e of enrollments) {
    console.log(`Enrollment ID=${e.id} | student=${e.student?.email} | session=${e.session?.formation?.title} | status=${e.status}`);
    console.log(`  Answers count: ${e.answers.length}`);
    for (const a of e.answers) {
      console.log(`    - "${a.question?.label}": "${a.textValue || a.fileUrl || '(empty)'}"`);
    }
  }

  // Check templates
  const templates = await prisma.sessionFormTemplate.findMany({
    include: { questions: { orderBy: { order: 'asc' } } }
  });

  console.log('\n=== TEMPLATES ===');
  console.log('Total templates:', templates.length);
  for (const t of templates) {
    console.log(`Template ID=${t.id}: "${t.name}" | questions=${t.questions.length}`);
    for (const q of t.questions) {
      console.log(`  Q[${q.id}] order=${q.order} label="${q.label}" type=${q.type} sessionId=${q.sessionId}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
