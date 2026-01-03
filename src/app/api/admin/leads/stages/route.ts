import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET() {
    try {
        await requireAdmin();

        const stages = await prisma.funnelStage.findMany({
            orderBy: { order: 'asc' },
        });

        return NextResponse.json(stages);
    } catch (error) {
        console.error('Error fetching stages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stages' },
            { status: 500 }
        );
    }
}
