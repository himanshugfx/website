import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Public tracking endpoint for customers
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const orderNumber = searchParams.get('orderNumber');
        const awb = searchParams.get('awb');

        if (!orderId && !orderNumber && !awb) {
            return NextResponse.json({
                error: 'Order ID, order number, or AWB is required'
            }, { status: 400 });
        }

        // Find order
        let order: any = null;
        if (orderId) {
            order = await prisma.order.findUnique({ where: { id: orderId } });
        } else if (orderNumber) {
            order = await prisma.order.findUnique({
                where: { orderNumber: parseInt(orderNumber) }
            });
        } else if (awb) {
            order = await prisma.order.findFirst({
                where: { awbNumber: awb }
            });
        }

        const awbNumber = awb || order?.awbNumber;

        if (!awbNumber) {
            return NextResponse.json({
                success: true,
                shipped: false,
                message: 'Order has not been shipped yet',
            });
        }

        return NextResponse.json({
            success: true,
            shipped: true,
            awbNumber,
            status: order?.shippingStatus || order?.status || 'In Transit',
            shippingProvider: order?.shippingProvider,
            trackingUrl: order?.trackingUrl,
            shippedAt: order?.shippedAt,
            estimatedDelivery: order?.estimatedDelivery,
            deliveredAt: order?.deliveredAt,
        });
    } catch (error) {
        console.error('Public tracking error:', error);
        return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 });
    }
}
