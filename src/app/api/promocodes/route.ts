import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const now = new Date();
        const promoCodes = await prisma.promoCode.findMany({
            where: {
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(promoCodes);
    } catch (error) {
        console.error('Failed to fetch promocodes:', error);
        return NextResponse.json({ error: 'Failed to fetch promocodes' }, { status: 500 });
    }
}
