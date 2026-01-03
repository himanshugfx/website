
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Resetting orders and resetting auto-increment sequences...');

    try {
        // Delete all order items first to avoid foreign key violations
        await prisma.orderItem.deleteMany({});
        console.log('Deleted all order items.');

        // Delete all orders
        await prisma.order.deleteMany({});
        console.log('Deleted all orders.');

        // Reset the sequence for orderNumber
        // RESTART IDENTITY resets the sequence to its initial value (usually 1)
        await prisma.$executeRawUnsafe('ALTER SEQUENCE "Order_orderNumber_seq" RESTART WITH 1;');
        console.log('Reset Order_orderNumber_seq to 1.');

    } catch (error) {
        console.error('Error during reset:', error.message);

        // Try fallback sequence name if the above fails
        try {
            console.log('Trying fallback sequence name...');
            await prisma.$executeRawUnsafe('ALTER SEQUENCE "order_ordernumber_seq" RESTART WITH 1;');
            console.log('Successfully reset sequence with lowercase name.');
        } catch (innerError) {
            console.log('Failed to reset sequence automatically. You might need TRUNCATE.');
            try {
                // TRUNCATE is powerful and RESTART IDENTITY is supported in Postgres
                await prisma.$executeRawUnsafe('TRUNCATE TABLE "Order" RESTART IDENTITY CASCADE;');
                console.log('Used TRUNCATE TABLE "Order" RESTART IDENTITY CASCADE;');
            } catch (truncateError) {
                console.error('Final fallback failed:', truncateError.message);
            }
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
