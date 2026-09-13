import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Check admin authorization
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, awbNumber, shippingProvider, trackingUrl } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // Fetch order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update order with shipping details
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                awbNumber: awbNumber || null,
                shippingStatus: 'SHIPPED',
                shippingProvider: shippingProvider || 'STANDARD',
                status: 'SHIPPED',
                shippedAt: new Date(),
                trackingUrl: trackingUrl || null,
                lastTrackingSync: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            awbNumber: updatedOrder.awbNumber,
            trackingUrl: updatedOrder.trackingUrl,
            message: 'Order marked as shipped successfully',
        });
    } catch (error) {
        console.error('Ship order error:', error);
        return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
    }
}
