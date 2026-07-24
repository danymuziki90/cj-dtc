require('@next/env').loadEnvConfig(process.cwd())

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const duplicates = await prisma.submission.groupBy({
    by: ['assignmentId', 'studentEmail'],
    _count: { _all: true },
    having: { id: { _count: { gt: 1 } } },
  })
  console.log(JSON.stringify(duplicates))
}

main().finally(() => prisma.$disconnect())
