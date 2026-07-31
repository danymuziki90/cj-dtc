const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  const student = await prisma.student.findUnique({
    where: { email: 'danymuziki90@gmail.com' }
  })
  console.log(student)
}

check().catch(console.error).finally(() => prisma.$disconnect())
