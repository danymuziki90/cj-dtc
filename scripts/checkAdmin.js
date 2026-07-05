const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@cjdevelopmenttc.com' } })
    console.log('Admin user:', admin ? `${admin.email} (role=${admin.role})` : 'Not found')
    await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
