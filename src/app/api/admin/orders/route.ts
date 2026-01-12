import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET(request: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status') || '';
        const search = searchParams.get('search') || '';
        const abandoned = searchParams.get('abandoned') === 'true';

        const skip = (page - 1) * limit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let where: any = {};

        if (abandoned) {
            where = {
                status: 'PENDING',
                paymentStatus: 'PENDING',
                paymentMethod: {
                    not: 'COD'
                }
            };
        } else {
            // Main orders list: show everything EXCEPT abandoned carts
            // UNLESS searching, then show everything that matches
            const abandonedFilter = {
                NOT: {
                    AND: [
                        { status: 'PENDING' },
                        { paymentStatus: 'PENDING' },
                        { paymentMethod: { not: 'COD' } }
                    ]
                }
            };

            where = {
                AND: [
                    status ? { status } : {},
                    search ? {} : abandonedFilter, // Don't filter if searching
                ]
            };

            if (search) {
                const isNumeric = /^\d+$/.test(search);
                where.AND.push({
                    OR: [
                        isNumeric ? { orderNumber: parseInt(search) } : {},
                        { customerName: { contains: search, mode: 'insensitive' } },
                        { customerEmail: { contains: search, mode: 'insensitive' } },
                        { customerPhone: { contains: search, mode: 'insensitive' } },
                        { address: { contains: search, mode: 'insensitive' } },
                        {
                            user: {
                                OR: [
                                    { name: { contains: search, mode: 'insensitive' } },
                                    { email: { contains: search, mode: 'insensitive' } },
                                ]
                            }
                        }
                    ].filter(cond => Object.keys(cond).length > 0)
                });
            }
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc', // Newest order on top
                },
                select: {
                    id: true,
                    orderNumber: true,
                    userId: true,
                    customerName: true,
                    customerEmail: true,
                    customerPhone: true,
                    address: true,
                    total: true,
                    status: true,
                    paymentStatus: true,
                    paymentMethod: true,
                    createdAt: true,
                    awbNumber: true,
                    shippingStatus: true,
                    shippingProvider: true,
                    weight: true,
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
        await requireAdmin();
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
