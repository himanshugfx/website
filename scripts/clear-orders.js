
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Deleting all order items...');
    await prisma.orderItem.deleteMany({});

    console.log('Deleting all orders...');
    await prisma.order.deleteMany({});

    console.log('Success: All orders and items have been deleted.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
