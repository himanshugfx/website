import prisma from './prisma';
import { revalidatePath } from 'next/cache';

/**
 * Finalizes an order by updating its status, reducing product stock,
 * and incrementing the sold count.
 */
export async function finalizeOrder(orderId: string) {
    try {
        // 1. Fetch the order with its items
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            console.error(`Order ${orderId} not found`);
            return;
        }

        // If order is already processed, skip
        if (order.status !== 'PENDING') {
            console.log(`Order ${orderId} already in status ${order.status}`);
            return;
        }

        // 2. Perform updates in a transaction
        await prisma.$transaction(async (tx) => {
            // Update order status
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'PROCESSING' }
            });

            // Update each product's stock and sold count
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        },
                        sold: {
                            increment: item.quantity
                        }
                    }
                });
            }
        });

        // 3. Revalidate public paths
        revalidatePath('/');
        revalidatePath('/shop');
        console.log(`Successfully finalized order ${orderId}`);

    } catch (error) {
        console.error(`Error finalizing order ${orderId}:`, error);
        throw error;
    }
}
