import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const students = await prisma.student.findMany()
  const enrollments = await prisma.enrollment.findMany()
  const assignments = await prisma.assignment.findMany()
  
  console.log("Students:", students.map(s => ({ id: s.id, email: s.email })))
  console.log("Enrollments:", enrollments.map(e => ({ studentId: e.studentId, formationId: e.formationId, sessionId: e.sessionId, status: e.status })))
  console.log("Assignments:", assignments.map(a => ({ id: a.id, formationId: a.formationId, sessionId: a.sessionId, published: a.published, status: a.status })))
}

main().catch(console.error).finally(() => prisma.$disconnect())
