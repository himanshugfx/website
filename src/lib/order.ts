import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { sendAdminPushNotification } from './notifications';

/**
 * Finalizes an order by updating its status, reducing product stock,
 * and incrementing sold count.
 */
export async function finalizeOrder(orderId: string): Promise<void> {
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
            // Use updateMany for atomic check
            const updateResult = await tx.order.updateMany({
                where: { 
                    id: orderId,
                    status: 'PENDING'
                },
                data: {
                    status: 'PROCESSING',
                    paymentStatus: 'SUCCESSFUL'
                }
            });

            // If no records updated, it means status was no longer PENDING
            if (updateResult.count === 0) {
                console.log(`Order ${orderId} status changed during transaction, skipping stock update.`);
                return;
            }

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

        // Send push notification to admin devices
        sendAdminPushNotification(
            '💰 Order Paid',
            `Order #${order.orderNumber} — ₹${order.total.toLocaleString('en-IN')} is now PAID`,
            { type: 'order_paid', orderId: order.id, orderNumber: order.orderNumber }
        ).catch(err => console.error('Failed to send order paid push notification:', err));

    } catch (error) {
        console.error(`Error finalizing order ${orderId}:`, error);
        throw error;
    }
}
