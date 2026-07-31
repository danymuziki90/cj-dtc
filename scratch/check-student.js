const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  const students = await prisma.student.findMany({
    select: { id: true, email: true, firstName: true }
  })
  console.log("=== STUDENTS ===")
  console.log(JSON.stringify(students, null, 2))

  const enrollments = await prisma.enrollment.findMany({
    select: { id: true, email: true, studentId: true, status: true, sessionId: true, formationId: true }
  })
  console.log("\n=== ENROLLMENTS ===")
  console.log(JSON.stringify(enrollments, null, 2))
}

check().catch(console.error).finally(() => prisma.$disconnect())
