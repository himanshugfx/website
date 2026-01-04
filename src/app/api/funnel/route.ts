import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Default funnel stages
const defaultStages = [
    { name: 'NEW', order: 1, color: '#9CA3AF' },
    { name: 'CONTACTED', order: 2, color: '#3B82F6' },
    { name: 'QUALIFIED', order: 3, color: '#8B5CF6' },
    { name: 'PROPOSAL', order: 4, color: '#F59E0B' },
    { name: 'WON', order: 5, color: '#10B981' },
    { name: 'LOST', order: 6, color: '#EF4444' },
];

async function ensureStagesExist() {
    const existingStages = await prisma.funnelStage.count();
    if (existingStages === 0) {
        for (const stage of defaultStages) {
            await prisma.funnelStage.create({
                data: stage,
            });
        }
    }
}

export async function GET() {
    try {
        await ensureStagesExist();

        const stages = await prisma.funnelStage.findMany({
            orderBy: { order: 'asc' },
            include: {
                leads: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        company: true,
                        source: true,
                        value: true,
                        stageId: true,
                    },
                },
                _count: {
                    select: { leads: true },
                },
            },
        });

        // Calculate stats
        const totalLeads = await prisma.lead.count();
        const convertedLeads = await prisma.lead.count({
            where: { convertedAt: { not: null } },
        });
        const totalValue = await prisma.lead.aggregate({
            _sum: { value: true },
        });
        const wonValue = await prisma.lead.aggregate({
            where: { stage: { name: 'WON' } },
            _sum: { value: true },
        });

        const stats = {
            totalLeads,
            convertedLeads,
            conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0',
            totalValue: totalValue._sum.value || 0,
            wonValue: wonValue._sum.value || 0,
        };

        return NextResponse.json({ stages, stats });
    } catch (error) {
        console.error('Error fetching funnel data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch funnel data', stages: [], stats: null },
            { status: 500 }
        );
    }
}
