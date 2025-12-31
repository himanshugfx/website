
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { code, cartTotal, userId } = await req.json();

        // 1. Basic validation
        if (!code || !cartTotal) {
            return NextResponse.json({ error: 'Code and cart total are required' }, { status: 400 });
        }

        const promoCode = await prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        // 2. Existence check
        if (!promoCode) {
            return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });
        }

        // 3. Status check
        if (!promoCode.isActive) {
            return NextResponse.json({ error: 'This promo code is inactive' }, { status: 400 });
        }

        // 4. Expiry check
        if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 });
        }

        // 5. Usage limit check
        if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
            return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
        }

        // 6. Minimum order value check
        if (promoCode.minOrderValue && cartTotal < promoCode.minOrderValue) {
            return NextResponse.json({
                error: `Minimum order value of $${promoCode.minOrderValue} required`
            }, { status: 400 });
        }

        // 7. Calculate discount
        let discountAmount = 0;
        if (promoCode.discountType === 'PERCENTAGE') {
            discountAmount = (cartTotal * promoCode.discountValue) / 100;
            if (promoCode.maxDiscount) {
                discountAmount = Math.min(discountAmount, promoCode.maxDiscount);
            }
        } else {
            discountAmount = promoCode.discountValue;
        }

        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, cartTotal);

        return NextResponse.json({
            success: true,
            discountAmount,
            finalTotal: cartTotal - discountAmount,
            code: promoCode.code,
            type: promoCode.discountType,
            value: promoCode.discountValue
        });

    } catch (error) {
        console.error('Promo code error:', error);
        return NextResponse.json({ error: 'Failed to apply promo code' }, { status: 500 });
    }
}
