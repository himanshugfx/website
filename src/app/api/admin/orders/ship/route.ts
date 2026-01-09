import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createDelhiveryShipment, getTrackingUrl } from '@/lib/delhivery';
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
                            select: { name: true },
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

        // Create shipment with Delhivery
        const result = await createDelhiveryShipment({
            orderId: order.id,
            orderNumber: order.orderNumber || 0, // Fallback to 0 if not assigned yet
            customerName: addressData.firstName + ' ' + (addressData.lastName || ''),
            customerPhone: addressData.phone || order.customerPhone || '',
            address: addressData.address || '',
            city: addressData.city || '',
            state: addressData.state || '',
            pincode: addressData.postalCode || '',
            paymentMethod: order.paymentMethod,
            total: order.total,
            products: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
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
                delhiveryStatus: 'Manifested',
                status: 'PROCESSING',
                shippedAt: new Date(),
                trackingUrl: result.awbNumber ? getTrackingUrl(result.awbNumber) : null,
                lastTrackingSync: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            awbNumber: result.awbNumber,
            trackingUrl: updatedOrder.trackingUrl,
            message: 'Shipment created successfully',
        });
    } catch (error) {
        console.error('Delhivery ship error:', error);
        return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
    }
}
