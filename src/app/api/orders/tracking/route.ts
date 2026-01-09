import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { trackRapidShypShipment, getRapidShypTrackingUrl } from '@/lib/rapidshyp';

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
        let order = null;
        if (orderId) {
            order = await prisma.order.findUnique({ where: { id: orderId } });
        } else if (orderNumber) {
            order = await prisma.order.findUnique({
                where: { orderNumber: parseInt(orderNumber) }
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

        // Get tracking from RapidShyp
        const tracking = await trackRapidShypShipment(awbNumber);

        if (!tracking.success) {
            // Return cached data from order
            return NextResponse.json({
                success: true,
                shipped: true,
                awbNumber,
                status: order?.shippingStatus || 'Unknown',
                trackingUrl: order?.trackingUrl || getRapidShypTrackingUrl(awbNumber),
                shippedAt: order?.shippedAt,
                estimatedDelivery: order?.estimatedDelivery,
                deliveredAt: order?.deliveredAt,
                cached: true,
            });
        }

        return NextResponse.json({
            success: true,
            shipped: true,
            awbNumber,
            status: tracking.status,
            location: tracking.location,
            expectedDelivery: tracking.expectedDelivery,
            scans: tracking.scans?.slice(0, 20), // Limit scan history
            trackingUrl: getRapidShypTrackingUrl(awbNumber),
        });
    } catch (error) {
        console.error('Public tracking error:', error);
        return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 });
    }
}
