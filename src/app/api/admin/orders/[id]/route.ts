import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(request);
        const { id } = await params;

        const order = await prisma.order.findUnique({
            where: { id },
            select: {
                id: true,
                orderNumber: true,
                userId: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                total: true,
                status: true,
                paymentStatus: true,
                paymentMethod: true,
                shippingFee: true,
                discountAmount: true,
                promoCode: true,
                address: true,
                cancelRequest: true,
                returnRequest: true,
                cancelReason: true,
                returnReason: true,
                createdAt: true,
                updatedAt: true,
                awbNumber: true,
                shippingStatus: true,
                shippingProvider: true,
                weight: true,
                shippedAt: true,
                deliveredAt: true,
                estimatedDelivery: true,
                trackingUrl: true,
                lastTrackingSync: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                items: {
                    select: {
                        id: true,
                        quantity: true,
                        price: true,
                        product: {
                            select: {
                                name: true,
                                thumbImage: true,
                                brand: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(request);
        const { id } = await params;
        const { status } = await request.json();

        const order = await prisma.order.update({
            where: { id },
            data: { status },
        });

        revalidatePath('/admin');
        revalidatePath('/admin/orders');

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
