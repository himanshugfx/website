import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import LeadDetailClient from './LeadDetailClient';

export const dynamic = 'force-dynamic';

async function getLead(id: string) {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                stage: true,
                activities: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        return lead;
    } catch (error) {
        console.error('Error fetching lead:', error);
        return null;
    }
}

async function getStages() {
    try {
        const stages = await prisma.funnelStage.findMany({
            orderBy: { order: 'asc' },
        });
        return stages;
    } catch (error) {
        console.error('Error fetching stages:', error);
        return [];
    }
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [lead, stages] = await Promise.all([getLead(id), getStages()]);

    if (!lead) {
        notFound();
    }

    return (
        <LeadDetailClient
            initialLead={lead as any}
            stages={stages}
        />
    );
}
