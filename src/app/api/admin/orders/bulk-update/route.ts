import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Update all existing orders to DELIVERED status
export async function POST(request: Request) {
    try {
        // Check admin authorization
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use updateMany for efficient bulk update - only update status field
        // Don't touch Delhivery fields since they might not exist in DB yet
        const result = await prisma.order.updateMany({
            where: {
                // Update all orders that are not already DELIVERED or CANCELLED
                status: {
                    notIn: ['DELIVERED', 'CANCELLED']
                }
            },
            data: {
                status: 'DELIVERED',
            },
        });

        return NextResponse.json({
            success: true,
            message: `Updated ${result.count} orders to DELIVERED status`,
            updatedCount: result.count,
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
