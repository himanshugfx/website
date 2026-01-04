import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const quotations = await prisma.quotation.findMany({
            orderBy: { quotationDate: 'desc' },
            take: 50,
        });

        const [total, draft, sent, accepted, declined, totalValue] = await Promise.all([
            prisma.quotation.count(),
            prisma.quotation.count({ where: { status: 'DRAFT' } }),
            prisma.quotation.count({ where: { status: 'SENT' } }),
            prisma.quotation.count({ where: { status: 'ACCEPTED' } }),
            prisma.quotation.count({ where: { status: 'DECLINED' } }),
            prisma.quotation.aggregate({ _sum: { total: true } }),
        ]);

        const stats = {
            total,
            draft,
            sent,
            accepted,
            declined,
            totalValue: totalValue._sum.total || 0,
        };

        return NextResponse.json({ quotations, stats });
    } catch (error) {
        console.error('Error fetching quotations:', error);
        return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
    }
}
