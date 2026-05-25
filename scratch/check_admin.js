const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'admin' },
            select: { id: true, email: true, name: true, role: true }
        });
        console.log('Admins found:', users);
    } catch(e) {
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}
run();
