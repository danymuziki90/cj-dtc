const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const sessions = await prisma.trainingSession.findMany({
      include: {
        formation: {
          select: { id: true, title: true }
        }
      }
    })
    console.log('--- Sessions ---')
    console.log(sessions.map(s => ({
      id: s.id,
      formationId: s.formationId,
      formationTitle: s.formation?.title,
      startDate: s.startDate,
      endDate: s.endDate,
      format: s.format,
      status: s.status
    })))

    const assignments = await prisma.assignment.findMany({
      include: {
        files: true,
        session: true
      }
    })
    console.log('--- Assignments ---')
    console.log(assignments)
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
