import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status') || '';
        const abandoned = searchParams.get('abandoned') === 'true';

        const skip = (page - 1) * limit;

        let where: any = {};

        if (abandoned) {
            where = {
                paymentStatus: 'PENDING',
                paymentMethod: {
                    not: 'COD'
                }
            };
        } else if (status) {
            where = { status };
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
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
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({
            orders,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json(
                { error: 'Order ID and status are required' },
                { status: 400 }
            );
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
