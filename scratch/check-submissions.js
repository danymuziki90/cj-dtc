const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const submissions = await prisma.submission.findMany({
      include: {
        student: true,
        assignment: true,
        files: true,
      }
    })
    console.log('=== TOTAL SUBMISSIONS ===', submissions.length)
    console.log(JSON.stringify(submissions, null, 2))

    const enrollments = await prisma.enrollment.findMany({
      take: 20
    })
    console.log('=== SAMPLE ENROLLMENTS ===', enrollments.length)
    console.log(JSON.stringify(enrollments.map(e => ({
      id: e.id,
      studentId: e.studentId,
      email: e.email,
      sessionId: e.sessionId,
      formationId: e.formationId,
      status: e.status
    })), null, 2))

    const students = await prisma.student.findMany({
      take: 20
    })
    console.log('=== SAMPLE STUDENTS ===', students.length)
    console.log(JSON.stringify(students.map(s => ({
      id: s.id,
      email: s.email,
      firstName: s.firstName,
      lastName: s.lastName,
      status: s.status
    })), null, 2))

  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
