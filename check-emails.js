const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        const students = await prisma.student.findMany({
            select: { email: true }
        })
        console.log('Student emails:')
        students.forEach(student => {
            console.log(student.email)
        })
    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()