const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkApiExact() {
  try {
    const studentId = 'cmrxxc8r1000135nv5w78s2hg'; // danymuziki90@gmail.com

    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: studentId,
        status: { in: ['accepted', 'confirmed', 'completed'] }
      }
    })

    const formationIds = enrollments.map(e => e.formationId)
    const sessionIds = enrollments.map(e => e.sessionId).filter(Boolean)

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
          where: { studentId: studentId },
          include: { SubmissionFile: true }
        },
        AssignmentFile: true
      }
    })

    const formattedAssignments = assignments.map(a => ({
      ...a,
      formation: a.Formation,
      session: a.TrainingSession,
      submissions: a.Submission,
      files: a.AssignmentFile
    }))
    
    console.log("Success! Found:", formattedAssignments.length)
  } catch (err) {
    console.error("PRISMA ERROR:", err)
  }
}

checkApiExact().finally(() => prisma.$disconnect())
