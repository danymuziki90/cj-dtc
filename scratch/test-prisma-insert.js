const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const pubDate = new Date("") // Invalid Date
    console.log('Date object created:', pubDate, 'IsValid:', !isNaN(pubDate.getTime()))

    console.log('Trying to create assignment with invalid publishDate...')
    const result = await prisma.assignment.create({
      data: {
        title: 'Test Temp',
        description: 'Test description',
        type: 'tp',
        formationId: 4,
        sessionId: 13,
        deadline: new Date(),
        publishDate: pubDate
      }
    })
    console.log('Success! Result:', result)
    
    // Clean up
    await prisma.assignment.delete({ where: { id: result.id } })
  } catch (e) {
    console.error('Error occurred as expected:')
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
