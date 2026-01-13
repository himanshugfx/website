
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

// Helper to extract client IP from headers
function getClientIP(headersList: Headers): string | null {
    // Check various headers for client IP
    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    const realIP = headersList.get('x-real-ip');
    if (realIP) {
        return realIP;
    }
    return null;
}

export async function POST(request: Request) {
    try {
        const headersList = await headers();
        const clientIP = getClientIP(headersList);

        const body = await request.json();
        const {
            checkoutId,
            userId,
            customerName,
            customerEmail,
            customerPhone,
            shippingInfo,
            cartItems,
            total,
            city,
            country,
            source // "CART" or "CHECKOUT"
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
                    city: city || undefined,
                    country: country || undefined,
                    ip: clientIP || undefined,
                    source: source || undefined,
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
                    city: city || null,
                    country: country || null,
                    ip: clientIP || null,
                    source: source || 'CART',
                }
            });
            return NextResponse.json({ success: true, id: created.id });
        }
    } catch (error: any) {
        console.error('Abandoned checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
