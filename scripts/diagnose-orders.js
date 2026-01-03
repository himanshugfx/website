
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.order.count();
    const orders = await prisma.order.findMany({
        orderBy: { orderNumber: 'asc' },
        select: { orderNumber: true, status: true, paymentStatus: true, paymentMethod: true }
    });
    console.log('ORDER_DIAGNOSTICS_START');
    console.log('Total Count:', count);
    console.log('Orders:', JSON.stringify(orders, null, 2));
    console.log('ORDER_DIAGNOSTICS_END');
}

main().catch(console.error).finally(() => prisma.$disconnect());
