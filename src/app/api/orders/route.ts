import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emailService } from '@/lib/email';

interface CartItem {
    id: string;
    quantity: number;
    price: number;
    name?: string;
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

        // Create order in database with items included for email
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
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                            },
                        },
                    },
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

        // Send order notification email (fire-and-forget, don't block response)
        emailService.sendOrderNotification({
            orderId: order.id,
            orderNumber: order.orderNumber,
            items: order.items,
            total: order.total,
            shippingFee: order.shippingFee || 0,
            discountAmount: order.discountAmount || 0,
            paymentMethod: order.paymentMethod || 'ONLINE',
            shippingInfo: shippingInfo || null,
        }).catch(err => console.error('Failed to send order notification:', err));

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            message: 'Order placed successfully',
        });
    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create order',
                message: error.message,
                code: error.code
            },
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
