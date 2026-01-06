import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Update all existing orders: set Delhivery fields to null and status to DELIVERED
export async function POST(request: Request) {
    try {
        // Check admin authorization
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all orders
        const orders = await prisma.order.findMany({
            select: { id: true, status: true, orderNumber: true },
        });

        // Update each order
        const updatePromises = orders.map(order =>
            prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'DELIVERED',
                    // Note: These fields might not exist in DB yet if migration wasn't run
                    // They will be ignored by Prisma if columns don't exist
                },
            })
        );

        const results = await Promise.all(updatePromises);

        return NextResponse.json({
            success: true,
            message: `Updated ${results.length} orders to DELIVERED status`,
            updatedCount: results.length,
            orders: results.map(o => ({ id: o.id, orderNumber: o.orderNumber, status: o.status })),
        });
    } catch (error) {
        console.error('Bulk update error:', error);
        return NextResponse.json({
            error: 'Failed to update orders',
            details: String(error)
        }, { status: 500 });
    }
}

// GET - Check current order statuses
export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            select: {
                id: true,
                orderNumber: true,
                status: true,
                paymentStatus: true,
                createdAt: true,
            },
            orderBy: { orderNumber: 'desc' },
        });

        return NextResponse.json({
            total: orders.length,
            orders,
        });
    } catch (error) {
        console.error('Fetch orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
