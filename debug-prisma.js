
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to database...')
        const count = await prisma.formation.count()
        console.log(`Successfully connected. Found ${count} formations.`)

        console.log('Fetching formations...')
        const formations = await prisma.formation.findMany({ orderBy: { createdAt: 'desc' } })
        console.log('Fetched formations:', formations)
    } catch (e) {
        console.error('Error connecting or querying:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
