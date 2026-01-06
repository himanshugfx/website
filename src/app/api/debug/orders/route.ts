import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simple debug endpoint to check orders directly - no auth required for debugging
export async function GET() {
    try {
        // Try the simplest possible query - just get order count and basic fields
        const count = await prisma.order.count();

        // Get orders with only the original fields (no Delhivery fields)
        const orders = await prisma.order.findMany({
            select: {
                id: true,
                orderNumber: true,
                status: true,
                total: true,
                paymentStatus: true,
                paymentMethod: true,
                createdAt: true,
                customerName: true,
                customerEmail: true,
            },
            orderBy: { orderNumber: 'desc' },
            take: 30,
        });

        return NextResponse.json({
            success: true,
            totalCount: count,
            ordersReturned: orders.length,
            orders: orders,
        });
    } catch (error) {
        console.error('Debug orders error:', error);
        return NextResponse.json({
            error: 'Failed to fetch orders',
            details: String(error),
            stack: (error as Error).stack,
        }, { status: 500 });
    }
}
