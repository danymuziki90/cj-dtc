const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = 'sebastienkarume86@gmail.com'
  const ENROLLMENT_STATUSES_WITH_ACCESS = ['accepted', 'confirmed', 'completed']

  try {
    const student = await prisma.student.findUnique({
      where: { email },
      select: { id: true, email: true }
    })
    if (!student) {
      console.error('Student not found')
      return
    }

    const studentEnrollments = await prisma.enrollment.findMany({
      where: {
        OR: [
          { studentId: student.id },
          { email: { equals: student.email, mode: 'insensitive' } },
        ],
        status: { in: ENROLLMENT_STATUSES_WITH_ACCESS }
      },
      select: {
        formationId: true,
        sessionId: true
      }
    })

    console.log('Enrollments found for student:', studentEnrollments)

    const formationIds = studentEnrollments.map(e => e.formationId)
    const sessionIds = studentEnrollments.map(e => e.sessionId).filter(Boolean)

    console.log('Formation IDs:', formationIds)
    console.log('Session IDs:', sessionIds)

    const assignments = await prisma.assignment.findMany({
      where: {
        formationId: { in: formationIds },
        OR: [
          { sessionId: null },
          { sessionId: { in: sessionIds } }
        ],
        status: 'publie',
        publishDate: { lte: new Date() }
      },
      include: {
        formation: true,
        files: true,
        submissions: {
          where: {
            studentEmail: { equals: student.email, mode: 'insensitive' },
          },
          include: {
            files: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: { deadline: 'asc' },
    })

    console.log('Assignments fetched:', assignments.map(a => ({
      id: a.id,
      title: a.title,
      status: a.status,
      sessionId: a.sessionId,
      formationId: a.formationId
    })))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
