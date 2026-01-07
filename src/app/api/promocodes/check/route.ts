import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { code, subtotal } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
        }

        const promo = await prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!promo || !promo.isActive) {
            return NextResponse.json({ error: 'Invalid or inactive promo code' }, { status: 404 });
        }

        if (subtotal < promo.minOrderValue) {
            return NextResponse.json({ error: `Minimum order value of ₹${promo.minOrderValue} required` }, { status: 400 });
        }

        return NextResponse.json({
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue
        });

    } catch (error) {
        console.error('Promo check error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
