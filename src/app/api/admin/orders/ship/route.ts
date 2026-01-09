import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createRapidShypOrder, getRapidShypTrackingUrl } from '@/lib/rapidshyp';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Check admin authorization
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // Fetch order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, price: true },
                        },
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.awbNumber) {
            return NextResponse.json({
                error: 'Order already has a shipment',
                awbNumber: order.awbNumber
            }, { status: 400 });
        }

        // Parse address
        let addressData: any = {};
        try {
            addressData = order.address ? JSON.parse(order.address) : {};
        } catch (e) {
            return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
        }

        // Create shipment with RapidShyp
        const result = await createRapidShypOrder({
            orderNumber: order.orderNumber,
            customerName: addressData.firstName + ' ' + (addressData.lastName || ''),
            customerEmail: addressData.email || order.customerEmail || '',
            customerPhone: addressData.phone || order.customerPhone || '',
            address: `${addressData.address || ''}, ${addressData.city || ''}, ${addressData.state || ''}`,
            city: addressData.city || '',
            state: addressData.state || '',
            pincode: addressData.postalCode || '',
            paymentMethod: order.paymentMethod,
            total: order.total,
            weight: (order as any).weight || 0.5,
            products: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
            })),
        });

        if (!result.success) {
            return NextResponse.json({
                error: result.error || 'Failed to create shipment'
            }, { status: 500 });
        }

        // Update order with AWB number and shipping details
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                awbNumber: result.awbNumber,
                shippingStatus: 'MANIFESTED',
                shippingProvider: 'RAPIDSHYP',
                status: 'PROCESSING',
                shippedAt: new Date(),
                trackingUrl: result.awbNumber ? getRapidShypTrackingUrl(result.awbNumber) : null,
                lastTrackingSync: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            awbNumber: result.awbNumber,
            trackingUrl: updatedOrder.trackingUrl,
            message: 'Shipment created successfully on RapidShyp',
        });
    } catch (error) {
        console.error('RapidShyp ship error:', error);
        return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
    }
}
