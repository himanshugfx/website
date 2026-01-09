import prisma from './prisma';
import { revalidatePath } from 'next/cache';

/**
 * Get the next sequential order number (thread-safe using database transaction)
 */
export async function getNextOrderNumber(): Promise<number> {
    const counter = await prisma.$transaction(async (tx) => {
        // Upsert the counter - create if not exists, increment if exists
        const updated = await tx.orderCounter.upsert({
            where: { id: 'order_counter' },
            create: { id: 'order_counter', value: 1 },
            update: { value: { increment: 1 } },
        });
        return updated.value;
    });
    return counter;
}

/**
 * Assign order number to an order (only call this when payment is confirmed)
 */
export async function assignOrderNumber(orderId: string): Promise<number> {
    const orderNumber = await getNextOrderNumber();

    await prisma.order.update({
        where: { id: orderId },
        data: { orderNumber },
    });

    console.log(`Assigned order number ${orderNumber} to order ${orderId}`);
    return orderNumber;
}

/**
 * Increment promo code usage count
 */
export async function incrementPromoCodeUsage(promoCode: string): Promise<void> {
    try {
        await prisma.promoCode.update({
            where: { code: promoCode },
            data: { usedCount: { increment: 1 } },
        });
        console.log(`Incremented usage count for promo code: ${promoCode}`);
    } catch (error) {
        console.error(`Failed to increment promo code usage for ${promoCode}:`, error);
    }
}

/**
 * Finalizes an order by updating its status, reducing product stock,
 * incrementing sold count, assigning order number, and updating promo usage.
 */
export async function finalizeOrder(orderId: string): Promise<number | null> {
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
            return null;
        }

        // If order is already processed, skip
        if (order.status !== 'PENDING') {
            console.log(`Order ${orderId} already in status ${order.status}`);
            return order.orderNumber;
        }

        // 2. Assign order number if not already assigned
        let orderNumber = order.orderNumber;
        if (!orderNumber) {
            orderNumber = await assignOrderNumber(orderId);
        }

        // 3. Increment promo code usage if applicable
        if (order.promoCode) {
            await incrementPromoCodeUsage(order.promoCode);
        }

        // 4. Perform updates in a transaction
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

        // 5. Revalidate public paths
        revalidatePath('/');
        revalidatePath('/shop');
        console.log(`Successfully finalized order ${orderId} with order number ${orderNumber}`);

        return orderNumber;

    } catch (error) {
        console.error(`Error finalizing order ${orderId}:`, error);
        throw error;
    }
}

