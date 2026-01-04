import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const range = searchParams.get('range') || 'this_month';

        // Build date filters
        const now = new Date();
        let dateFilter: { gte?: Date; lte?: Date } = {};

        switch (range) {
            case 'this_month':
                dateFilter = {
                    gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
                };
                break;
            case 'last_month':
                dateFilter = {
                    gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                    lte: new Date(now.getFullYear(), now.getMonth(), 0),
                };
                break;
            case 'this_quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                dateFilter = {
                    gte: new Date(now.getFullYear(), quarter * 3, 1),
                    lte: new Date(now.getFullYear(), (quarter + 1) * 3, 0),
                };
                break;
            case 'this_year':
                dateFilter = {
                    gte: new Date(now.getFullYear(), 0, 1),
                    lte: new Date(now.getFullYear(), 11, 31),
                };
                break;
            case 'all':
            default:
                dateFilter = {};
                break;
        }

        // Build where clause
        const where: {
            category?: string;
            date?: { gte?: Date; lte?: Date };
        } = {};

        if (category && category !== 'all') {
            where.category = category;
        }
        if (Object.keys(dateFilter).length > 0) {
            where.date = dateFilter;
        }

        // Fetch expenses
        const expenses = await prisma.expense.findMany({
            where,
            orderBy: { date: 'desc' },
        });

        // Calculate stats
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const [totalResult, thisMonthResult, lastMonthResult, countResult] = await Promise.all([
            prisma.expense.aggregate({ _sum: { amount: true } }),
            prisma.expense.aggregate({
                _sum: { amount: true },
                where: { date: { gte: thisMonthStart, lte: thisMonthEnd } },
            }),
            prisma.expense.aggregate({
                _sum: { amount: true },
                where: { date: { gte: lastMonthStart, lte: lastMonthEnd } },
            }),
            prisma.expense.count(),
        ]);

        const stats = {
            totalExpenses: totalResult._sum.amount || 0,
            thisMonth: thisMonthResult._sum.amount || 0,
            lastMonth: lastMonthResult._sum.amount || 0,
            count: countResult,
        };

        return NextResponse.json({ expenses, stats });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}
