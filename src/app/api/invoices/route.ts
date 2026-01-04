import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: { invoiceDate: 'desc' },
            take: 100,
        });

        const [total, paid, pending, overdue] = await Promise.all([
            prisma.invoice.count(),
            prisma.invoice.count({ where: { status: 'PAID' } }),
            prisma.invoice.count({ where: { status: { in: ['SENT', 'DRAFT'] } } }),
            prisma.invoice.count({ where: { status: 'OVERDUE' } }),
        ]);

        const totalAmount = await prisma.invoice.aggregate({
            _sum: { total: true },
        });

        const paidAmount = await prisma.invoice.aggregate({
            where: { status: 'PAID' },
            _sum: { total: true },
        });

        const stats = {
            total,
            paid,
            pending,
            overdue,
            totalAmount: totalAmount._sum.total || 0,
            paidAmount: paidAmount._sum.total || 0,
        };

        return NextResponse.json({ invoices, stats });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Failed to fetch invoices', invoices: [], stats: null }, { status: 500 });
    }
}
