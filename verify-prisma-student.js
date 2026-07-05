
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        if (prisma.student) {
            console.log('✅ prisma.student exists')
            const count = await prisma.student.count()
            console.log(`Current student count: ${count}`)
        } else {
            console.error('❌ prisma.student is UNDEFINED')
            console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')))
        }
    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
