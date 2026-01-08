import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { stageId } = await request.json();

        if (!stageId) {
            return NextResponse.json({ error: 'Stage ID is required' }, { status: 400 });
        }

        // Verify the stage exists
        const stage = await prisma.funnelStage.findUnique({
            where: { id: stageId },
        });

        if (!stage) {
            return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
        }

        // Update the lead's stage
        const isWonStage = stage.name.toUpperCase() === 'WON';

        // Check if lead is already converted (don't overwrite convertedAt)
        let shouldSetConvertedAt = false;
        if (isWonStage) {
            const currentLead = await prisma.lead.findUnique({
                where: { id },
                select: { convertedAt: true },
            });
            shouldSetConvertedAt = !currentLead?.convertedAt;
        }

        const updatedLead = await prisma.lead.update({
            where: { id },
            data: {
                stageId,
                // If moving to WON stage and not already converted, mark as converted
                ...(shouldSetConvertedAt ? { convertedAt: new Date() } : {}),
            },
            include: {
                stage: true,
            },
        });

        // Create activity log
        await prisma.leadActivity.create({
            data: {
                leadId: id,
                type: 'STAGE_CHANGE',
                content: `Lead moved to ${stage.name} stage`,
            },
        });

        return NextResponse.json({ success: true, lead: updatedLead });
    } catch (error) {
        console.error('Error updating lead stage:', error);
        return NextResponse.json({ error: 'Failed to update lead stage' }, { status: 500 });
    }
}
