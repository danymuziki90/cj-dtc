const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkApi(studentEmail) {
  const student = await prisma.student.findUnique({ where: { email: studentEmail } })
  if (!student) {
    console.log(`Student ${studentEmail} not found.`)
    return
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: student.id,
      status: { in: ['accepted', 'confirmed', 'completed'] }
    }
  })

  const formationIds = enrollments.map(e => e.formationId)
  const sessionIds = enrollments.map(e => e.sessionId).filter(Boolean)

  console.log('Formation IDs:', formationIds)
  console.log('Session IDs:', sessionIds)

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
        where: { studentId: student.id }
      }
    }
  })

  console.log('Assignments found:', assignments.length)
  console.log(JSON.stringify(assignments, null, 2))
}

checkApi('danymuziki90@gmail.com').catch(console.error).finally(() => prisma.$disconnect())
