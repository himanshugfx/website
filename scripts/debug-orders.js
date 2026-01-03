
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.order.findMany({
        where: { orderNumber: { lt: 10 } },
        orderBy: { orderNumber: 'asc' },
        include: { user: true }
    });
    console.log('DEBUG_ORDERS_START');
    console.log(JSON.stringify(orders, null, 2));
    console.log('DEBUG_ORDERS_END');
}

main().catch(console.error).finally(() => prisma.$disconnect());
