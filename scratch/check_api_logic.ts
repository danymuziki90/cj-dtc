import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const studentId = 'cmrxxc8r1000135nv5w78s2hg'; // danymuziki90
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: { in: ['accepted', 'confirmed', 'completed'] }
    }
  })

  console.log("Found Enrollments:", enrollments.map(e => ({ formationId: e.formationId, sessionId: e.sessionId })));

  const formationIds = enrollments.map(e => e.formationId)
  const sessionIds = enrollments.map(e => e.sessionId).filter(Boolean) as number[]
  console.log("formationIds:", formationIds);
  console.log("sessionIds:", sessionIds);

  const assignments = await prisma.assignment.findMany({
    where: {
      published: true,
      OR: [
        { sessionId: { in: sessionIds } },
        { formationId: { in: formationIds }, sessionId: null }
      ]
    },
    include: {
      Formation: { select: { title: true } },
      TrainingSession: { select: { id: true, startDate: true } },
      Submission: {
        where: { studentId },
        include: { SubmissionFile: true }
      },
      AssignmentFile: true
    }
  })

  console.log("Assignments Query Result:", assignments.length);
  if (assignments.length > 0) {
    console.log(JSON.stringify(assignments, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
