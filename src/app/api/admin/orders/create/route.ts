import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';

export async function POST(request: Request) {
    try {
        await requireAdmin(request);
        const body = await request.json();

        const {
            customerName,
            customerEmail,
            customerPhone,
            address,
            status,
            paymentStatus,
            paymentMethod,
            shippingFee,
            discountAmount,
            promoCode,
            total,
            items,
        } = body;

        if (!customerName || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Customer name and at least one item are required' },
                { status: 400 }
            );
        }

        // Validate all product IDs exist
        const productIds = items.map((item: any) => item.productId);
        const existingProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true },
        });

        if (existingProducts.length !== productIds.length) {
            return NextResponse.json(
                { error: 'One or more products not found' },
                { status: 400 }
            );
        }

        const order = await prisma.order.create({
            data: {
                customerName,
                customerEmail: customerEmail || null,
                customerPhone: customerPhone || null,
                address: address || null,
                status: status || 'DRAFT',
                paymentStatus: paymentStatus || 'PENDING',
                paymentMethod: paymentMethod || 'COD',
                shippingFee: shippingFee || 0,
                discountAmount: discountAmount || 0,
                promoCode: promoCode || null,
                total: total || 0,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        revalidatePath('/admin');
        revalidatePath('/admin/orders');

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
