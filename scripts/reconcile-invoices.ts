import { createInvoiceFromOrder } from '../src/lib/invoicing';
import prisma from '../src/lib/prisma';

async function main() {
    console.log('--- Starting Invoice Reconciliation ---');
    try {
        // Find all COMPLETED orders that don't have an invoice
        const completedOrders = await prisma.order.findMany({
            where: {
                status: 'COMPLETED',
                NOT: {
                    id: {
                        in: (await prisma.invoice.findMany({
                            where: { orderId: { not: null } },
                            select: { orderId: true }
                        })).map(i => i.orderId as string)
                    }
                }
            },
            select: {
                id: true,
                orderNumber: true
            }
        });

        console.log(`Found ${completedOrders.length} COMPLETED orders missing invoices.`);

        for (const order of completedOrders) {
            console.log(`Generating invoice for Order #${order.orderNumber}...`);
            await createInvoiceFromOrder(order.id);
        }

        console.log('--- Finished Invoice Reconciliation ---');
    } catch (error) {
        console.error('Error during reconciliation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
