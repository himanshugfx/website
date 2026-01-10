import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const leads = await prisma.lead.findMany({
            where: {
                AND: [
                    { phone: { not: null } },
                    { phone: { not: '' } }
                ]
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, leads });
    } catch (error) {
        console.error('Error fetching leads for WhatsApp:', error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}
