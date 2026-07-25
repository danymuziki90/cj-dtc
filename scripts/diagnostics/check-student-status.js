const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        const students = await prisma.student.findMany({
            select: {
                email: true,
                status: true,
                role: true
            }
        })
        console.log('Students:')
        students.forEach(student => {
            console.log(`${student.email}: ${student.status} (${student.role})`)
        })
    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()