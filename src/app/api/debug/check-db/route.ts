import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Check max order number
        const maxOrder = await prisma.order.findFirst({
            orderBy: { orderNumber: 'desc' },
            select: { orderNumber: true }
        });

        // 2. Try to create a small test order
        const testOrder = await prisma.order.create({
            data: {
                total: 0,
                status: 'DRAFT',
                paymentMethod: 'TEST',
                paymentStatus: 'PENDING',
                items: {
                    create: []
                }
            }
        });

        const assignedNumber = testOrder.orderNumber;

        // Delete it immediately
        await prisma.order.delete({
            where: { id: testOrder.id }
        });

        return NextResponse.json({
            success: true,
            maxOrderNumber: maxOrder?.orderNumber || 0,
            testOrderAssignedNumber: assignedNumber,
            message: "Database insertion test passed"
        });
    } catch (error: any) {
        console.error('Test order creation failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            meta: error.meta
        }, { status: 500 });
    }
}
