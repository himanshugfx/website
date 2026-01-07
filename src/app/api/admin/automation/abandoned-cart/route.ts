import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import whatsappService from '@/lib/whatsapp';

/**
 * API Route for Abandoned Cart WhatsApp Alerts
 * This should be triggered by a Cron Job every 30-60 minutes
 */
export async function GET(req: NextRequest) {
    // 1. Define time window (orders created between 1 and 2 hours ago)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000);

    try {
        // 2. Find pending orders in the window
        const abandonedOrders = await (prisma.order as any).findMany({
            where: {
                paymentStatus: 'PENDING',
                status: 'PENDING',
                createdAt: {
                    gte: twoHoursAgo,
                    lte: oneHourAgo,
                },
                whatsappAlertSent: false
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (abandonedOrders.length === 0) {
            return NextResponse.json({ message: 'No abandoned checkouts found in this window.' });
        }

        const results = [];

        for (const order of abandonedOrders) {
            if (!order.customerPhone) continue;

            // 3. Prepare the message
            // You can use a Template or a text message. Using text for flexibility.
            const firstName = order.customerName?.split(' ')[0] || 'there';
            const firstItem = order.items[0]?.product?.name || 'items';
            const checkoutUrl = `https://anose.in/checkout?orderId=${order.id}`; // Assuming you can resume checkout

            const message = `Hey ${firstName}! 👋 We noticed you left some premium skincare in your cart, including the ${firstItem}. 

Use code SAVE5 at checkout for an extra 5% OFF! ✨

Complete your purchase here: ${checkoutUrl}

Stay Radiant,
Team Anose`;

            // 4. Send WhatsApp
            const sent = await whatsappService.sendTextMessage(order.customerPhone, message);

            if (sent.success) {
                // 5. Mark as sent if field exists
                try {
                    await (prisma.order as any).update({
                        where: { id: order.id },
                        data: { whatsappAlertSent: true }
                    });
                } catch (e) {
                    // Ignore if field doesn't exist
                }
            }

            results.push({
                orderId: order.id,
                phone: order.customerPhone,
                success: sent.success,
                error: sent.error
            });
        }

        return NextResponse.json({
            processed: abandonedOrders.length,
            details: results
        });

    } catch (error) {
        console.error('Abandoned cart automation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
