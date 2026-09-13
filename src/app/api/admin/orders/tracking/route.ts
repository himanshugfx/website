import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

// GET - Fetch tracking info for an order
export async function GET(request: Request) {
    try {
        await requireAdmin(request);
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const awbNumber = searchParams.get('awb');

        if (!orderId && !awbNumber) {
            return NextResponse.json({ error: 'Order ID or AWB number is required' }, { status: 400 });
        }

        let order: any = null;

        if (orderId) {
            order = await prisma.order.findUnique({
                where: { id: orderId },
                select: {
                    id: true,
                    orderNumber: true,
                    awbNumber: true,
                    shippingStatus: true,
                    shippingProvider: true,
                    shippedAt: true,
                    deliveredAt: true,
                    estimatedDelivery: true,
                    trackingUrl: true,
                    lastTrackingSync: true,
                },
            });

            if (!order) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }
        } else if (awbNumber) {
            order = await prisma.order.findFirst({
                where: { awbNumber },
                select: {
                    id: true,
                    orderNumber: true,
                    awbNumber: true,
                    shippingStatus: true,
                    shippingProvider: true,
                    shippedAt: true,
                    deliveredAt: true,
                    estimatedDelivery: true,
                    trackingUrl: true,
                    lastTrackingSync: true,
                },
            });
        }

        if (!order || !order.awbNumber) {
            return NextResponse.json({
                error: 'No shipment found for this order',
                shipped: false,
            }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            shipped: true,
            awbNumber: order.awbNumber,
            status: order.shippingStatus || 'SHIPPED',
            shippingProvider: order.shippingProvider,
            trackingUrl: order.trackingUrl,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            estimatedDelivery: order.estimatedDelivery,
            lastSync: order.lastTrackingSync,
        });
    } catch (error) {
        console.error('Tracking fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 });
    }
}

// POST - Update tracking details for an order
export async function POST(request: Request) {
    try {
        await requireAdmin(request);
        const { orderId, awbNumber, shippingProvider, trackingUrl, shippingStatus, estimatedDelivery } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                awbNumber: awbNumber || undefined,
                shippingProvider: shippingProvider || undefined,
                trackingUrl: trackingUrl || undefined,
                shippingStatus: shippingStatus || undefined,
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
                lastTrackingSync: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            order: updatedOrder,
        });
    } catch (error) {
        console.error('Update tracking error:', error);
        return NextResponse.json({ error: 'Failed to update tracking' }, { status: 500 });
    }
}
