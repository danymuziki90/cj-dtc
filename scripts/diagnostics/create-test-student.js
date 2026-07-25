const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10)

        const student = await prisma.student.create({
            data: {
                firstName: 'Test',
                lastName: 'Student',
                email: 'student@test.com',
                password: hashedPassword,
                phone: '+1234567890',
                studentNumber: 'TEST001',
                status: 'ACTIVE',
                role: 'STUDENT'
            }
        })

        console.log('Created test student:', student.email)

        // Also create user for consistency
        const user = await prisma.user.create({
            data: {
                name: 'Test Student',
                email: 'student@test.com',
                password: hashedPassword,
                role: 'STUDENT'
            }
        })

        console.log('Created test user:', user.email)
    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()