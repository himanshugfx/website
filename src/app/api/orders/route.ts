import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { cart, shippingInfo, userId, total, paymentMethod } = await request.json();

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
                status: 'PENDING',
                paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESSFUL',
                paymentMethod: paymentMethod || 'ONLINE',
                address: shippingInfo ? JSON.stringify(shippingInfo) : null,
                items: {
                    create: cart.map((item: any) => ({
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

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
