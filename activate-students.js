const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        // Activate a test student
        const result = await prisma.student.updateMany({
            where: {
                email: {
                    in: ['test@example.com', 'danymuziki90@gmail.com']
                }
            },
            data: {
                status: 'ACTIVE'
            }
        })
        console.log(`Activated ${result.count} students`)

        // Check updated students
        const students = await prisma.student.findMany({
            where: {
                email: {
                    in: ['test@example.com', 'danymuziki90@gmail.com']
                }
            },
            select: {
                email: true,
                status: true,
                role: true
            }
        })
        console.log('Updated students:')
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