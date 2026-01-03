
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const targetDate = new Date('2024-01-01T00:00:00Z');
    console.log(`Updating all orders to date: ${targetDate.toISOString()}`);

    const result = await prisma.order.updateMany({
        data: {
            createdAt: targetDate
        }
    });

    console.log(`Successfully updated ${result.count} orders.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
