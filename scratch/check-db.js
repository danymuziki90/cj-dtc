const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  console.log("=== ENROLLMENTS ===")
  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: { select: { email: true, firstName: true, lastName: true, status: true } },
      formation: { select: { title: true } }
    }
  })
  console.log(JSON.stringify(enrollments, null, 2))

  console.log("\n=== ASSIGNMENTS ===")
  const assignments = await prisma.assignment.findMany()
  console.log(JSON.stringify(assignments, null, 2))
}

check().catch(console.error).finally(() => prisma.$disconnect())
