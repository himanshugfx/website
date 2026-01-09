import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { trackRapidShypShipment, mapRapidShypStatus, getRapidShypTrackingUrl } from '@/lib/rapidshyp';

// GET - Fetch tracking info for an order
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const awbNumber = searchParams.get('awb');

        if (!orderId && !awbNumber) {
            return NextResponse.json({ error: 'Order ID or AWB number is required' }, { status: 400 });
        }

        let awb = awbNumber;
        let order = null;

        if (orderId) {
            order = await prisma.order.findUnique({
                where: { id: orderId },
                select: {
                    id: true,
                    orderNumber: true,
                    awbNumber: true,
                    shippingStatus: true,
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

            awb = order.awbNumber;
        }

        if (!awb) {
            return NextResponse.json({
                error: 'No shipment found for this order',
                shipped: false,
            }, { status: 200 });
        }

        // Get real-time tracking from RapidShyp
        const trackingResult = await trackRapidShypShipment(awb);

        if (!trackingResult.success) {
            // Return cached data if API fails
            return NextResponse.json({
                success: true,
                shipped: true,
                awbNumber: awb,
                status: order?.shippingStatus || 'Unknown',
                trackingUrl: order?.trackingUrl,
                shippedAt: order?.shippedAt,
                deliveredAt: order?.deliveredAt,
                estimatedDelivery: order?.estimatedDelivery,
                lastSync: order?.lastTrackingSync,
                cached: true,
                error: trackingResult.error,
            });
        }

        // Update order with latest tracking data
        if (orderId) {
            const isDelivered = trackingResult.status?.toUpperCase() === 'DELIVERED';
            const newStatus = mapRapidShypStatus(trackingResult.status || '');

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    shippingStatus: trackingResult.status,
                    status: newStatus,
                    estimatedDelivery: trackingResult.expectedDelivery
                        ? new Date(trackingResult.expectedDelivery)
                        : undefined,
                    deliveredAt: isDelivered
                        ? new Date()
                        : undefined,
                    lastTrackingSync: new Date(),
                },
            });
        }

        return NextResponse.json({
            success: true,
            shipped: true,
            awbNumber: awb,
            status: trackingResult.status,
            location: trackingResult.location,
            expectedDelivery: trackingResult.expectedDelivery,
            scans: trackingResult.scans,
            trackingUrl: order?.trackingUrl || getRapidShypTrackingUrl(awb),
            lastSync: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Tracking fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 });
    }
}

// POST - Sync tracking for multiple orders (batch update)
export async function POST(request: Request) {
    try {
        const { orderIds } = await request.json();

        if (!orderIds || !Array.isArray(orderIds)) {
            // Sync all shipped orders that haven't been delivered
            const ordersToSync = await prisma.order.findMany({
                where: {
                    awbNumber: { not: null },
                    status: { notIn: ['DELIVERED', 'CANCELLED', 'RTO_DELIVERED'] },
                    shippingProvider: 'RAPIDSHYP'
                },
                select: {
                    id: true,
                    awbNumber: true,
                },
            });

            const results = [];

            for (const order of ordersToSync) {
                if (!order.awbNumber) continue;

                const trackingResult = await trackRapidShypShipment(order.awbNumber);

                if (trackingResult.success && trackingResult.status) {
                    const isDelivered = trackingResult.status?.toUpperCase() === 'DELIVERED';
                    const newStatus = mapRapidShypStatus(trackingResult.status);

                    await prisma.order.update({
                        where: { id: order.id },
                        data: {
                            shippingStatus: trackingResult.status,
                            status: newStatus,
                            estimatedDelivery: trackingResult.expectedDelivery
                                ? new Date(trackingResult.expectedDelivery)
                                : undefined,
                            deliveredAt: isDelivered
                                ? new Date()
                                : undefined,
                            lastTrackingSync: new Date(),
                        },
                    });

                    results.push({
                        orderId: order.id,
                        awbNumber: order.awbNumber,
                        status: trackingResult.status,
                        updated: true,
                    });
                } else {
                    results.push({
                        orderId: order.id,
                        awbNumber: order.awbNumber,
                        error: trackingResult.error,
                        updated: false,
                    });
                }
            }

            return NextResponse.json({
                success: true,
                synced: results.filter(r => r.updated).length,
                total: ordersToSync.length,
                results,
            });
        }

        return NextResponse.json({ success: true, message: 'No orders specified' });
    } catch (error) {
        console.error('Batch tracking sync error:', error);
        return NextResponse.json({ error: 'Failed to sync tracking' }, { status: 500 });
    }
}
