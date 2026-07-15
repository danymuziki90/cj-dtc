const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Students ---');
  const students = await prisma.student.findMany();
  console.log(students.map(s => ({ id: s.id, firstName: s.firstName, lastName: s.lastName, email: s.email, status: s.status })));

  console.log('\n--- Formations ---');
  const formations = await prisma.formation.findMany();
  console.log(formations.map(f => ({ id: f.id, title: f.title, statut: f.statut })));

  console.log('\n--- Enrollments ---');
  const enrollments = await prisma.enrollment.findMany();
  console.log(enrollments.map(e => ({ id: e.id, studentId: e.studentId, email: e.email, formationId: e.formationId, sessionId: e.sessionId, status: e.status })));

  console.log('\n--- Assignments (TP) ---');
  const assignments = await prisma.assignment.findMany({
    include: {
      files: true,
      formation: { select: { title: true } }
    }
  });
  console.log(assignments.map(a => ({ id: a.id, title: a.title, formationId: a.formationId, sessionId: a.sessionId, status: a.status, publishDate: a.publishDate })));

  console.log('\n--- Submissions ---');
  const submissions = await prisma.submission.findMany();
  console.log(submissions);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
