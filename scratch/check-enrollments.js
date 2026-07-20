const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const students = await prisma.student.findMany({
      include: {
        enrollments: {
          include: {
            formation: true,
            session: true
          }
        }
      }
    })
    console.log('--- Students & Enrollments ---')
    console.log(JSON.stringify(students, null, 2))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
