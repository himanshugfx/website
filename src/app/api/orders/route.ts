import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface CartItem {
    id: string;
    quantity: number;
    price: number;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cart, shippingInfo, userId, total, paymentMethod, shippingFee, discountAmount, promoCode } = body;

        // Validate required fields
        if (!cart || !total) {
            return NextResponse.json(
                { error: 'Cart and total are required' },
                { status: 400 }
            );
        }

        // Create order in database
        const order = await prisma.order.create({
            data: {
                userId: userId || null,
                total: total,
                shippingFee: shippingFee || 0,
                discountAmount: discountAmount || 0,
                promoCode: promoCode || null,
                status: 'PENDING',
                paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESSFUL',
                paymentMethod: paymentMethod || 'ONLINE',
                address: shippingInfo ? JSON.stringify(shippingInfo) : null,
                items: {
                    create: cart.map((item: CartItem) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price * item.quantity,
                    })),
                },
            },
        });

        // Update product quantities
        for (const item of cart) {
            await prisma.product.update({
                where: { id: item.id },
                data: {
                    quantity: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            message: 'Order placed successfully',
        });
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const orders = await prisma.order.findMany({
            where: {
                userId: userId,
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                thumbImage: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Include all Delhivery tracking fields in response (with fallbacks for backward compatibility)
        const ordersWithTracking = orders.map(order => ({
            ...order,
            awbNumber: (order as any).awbNumber || null,
            delhiveryStatus: (order as any).delhiveryStatus || null,
            shippedAt: (order as any).shippedAt || null,
            deliveredAt: (order as any).deliveredAt || null,
            estimatedDelivery: (order as any).estimatedDelivery || null,
            trackingUrl: (order as any).trackingUrl || null,
        }));

        return NextResponse.json({ orders: ordersWithTracking });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
