import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Try to create a small test order to see if it fails and why
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

        // Delete it immediately
        await prisma.order.delete({
            where: { id: testOrder.id }
        });

        return NextResponse.json({
            success: true,
            message: "Database insertion test passed",
            schema: "Order model is functional"
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
