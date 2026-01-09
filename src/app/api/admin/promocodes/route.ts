
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const promoCodes = await prisma.promoCode.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Get usage counts from the Order table
        const promoUsageCounts = await prisma.order.groupBy({
            by: ['promoCode'],
            _count: {
                promoCode: true,
            },
            where: {
                promoCode: { not: null },
            },
        });

        const usageMap = promoUsageCounts.reduce((acc: any, curr) => {
            if (curr.promoCode) {
                acc[curr.promoCode] = curr._count.promoCode;
            }
            return acc;
        }, {});

        const promoWithCounts = promoCodes.map(promo => ({
            ...promo,
            usedCount: usageMap[promo.code] || 0,
        }));

        return NextResponse.json(promoWithCounts);
    } catch (error) {
        console.error('Failed to fetch promo codes:', error);
        return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive } = body;

        const existingCode = await prisma.promoCode.findUnique({
            where: { code },
        });

        if (existingCode) {
            return NextResponse.json({ error: 'Promo code already exists' }, { status: 400 });
        }

        const newPromoCode = await prisma.promoCode.create({
            data: {
                code,
                discountType,
                discountValue: parseFloat(discountValue),
                minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: isActive !== undefined ? isActive : true,
            },
        });

        return NextResponse.json(newPromoCode);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating promo code' }, { status: 500 });
    }
}
