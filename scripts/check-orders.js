
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.order.count();
    console.log('ORDER_COUNT_START');
    console.log(count);
    console.log('ORDER_COUNT_END');

    if (count > 0) {
        const sample = await prisma.order.findMany({ take: 5 });
        console.log('SAMPLE_ORDERS:');
        console.log(JSON.stringify(sample, null, 2));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
