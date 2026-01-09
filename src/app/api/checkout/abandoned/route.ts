
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            checkoutId,
            userId,
            customerName,
            customerEmail,
            customerPhone,
            shippingInfo,
            cartItems,
            total
        } = body;

        // Use upsert if checkoutId is provided, otherwise create new
        if (checkoutId) {
            const updated = await prisma.abandonedCheckout.update({
                where: { id: checkoutId },
                data: {
                    userId,
                    customerName,
                    customerEmail,
                    customerPhone,
                    shippingInfo: shippingInfo ? JSON.stringify(shippingInfo) : undefined,
                    cartItems: cartItems ? JSON.stringify(cartItems) : undefined,
                    total,
                }
            });
            return NextResponse.json({ success: true, id: updated.id });
        } else {
            const created = await prisma.abandonedCheckout.create({
                data: {
                    userId,
                    customerName,
                    customerEmail,
                    customerPhone,
                    shippingInfo: shippingInfo ? JSON.stringify(shippingInfo) : undefined,
                    cartItems: cartItems ? JSON.stringify(cartItems) : undefined,
                    total,
                }
            });
            return NextResponse.json({ success: true, id: created.id });
        }
    } catch (error: any) {
        console.error('Abandoned checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
