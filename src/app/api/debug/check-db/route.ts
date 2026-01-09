import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Known valid product ID for Herbal Facewash 200ml
        const validProductId = 'cmk4ffv7p000i0c5st7ic0yfh';

        // 1. Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: validProductId }
        });

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found in DB' });
        }

        // 2. Try to create an order with this product
        const testOrder = await prisma.order.create({
            data: {
                total: 299,
                status: 'DRAFT',
                paymentMethod: 'TEST',
                paymentStatus: 'PENDING',
                items: {
                    create: [{
                        productId: validProductId,
                        quantity: 1,
                        price: 299
                    }]
                }
            },
            include: {
                items: true
            }
        });

        // Delete it immediately
        await prisma.order.delete({
            where: { id: testOrder.id }
        });

        return NextResponse.json({
            success: true,
            message: "Order creation with real product passed",
            orderNumber: testOrder.orderNumber
        });
    } catch (error: any) {
        console.error('Test order creation failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code
        }, { status: 500 });
    }
}
