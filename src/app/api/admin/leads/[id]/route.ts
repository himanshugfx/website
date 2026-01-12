import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const data = await request.json();

        const { stageId, value, notes, name, email, phone, company } = data;

        const updateData: {
            stageId?: string;
            value?: number | null;
            notes?: string | null;
            name?: string;
            email?: string;
            phone?: string | null;
            company?: string | null;
            convertedAt?: Date | null;
        } = {};

        if (stageId !== undefined) {
            updateData.stageId = stageId;

            // Check if the new stage is WON to set convertedAt
            const newStage = await prisma.funnelStage.findUnique({
                where: { id: stageId },
                select: { name: true },
            });

            console.log(`[Lead Stage Change] Lead ${id} -> Stage: ${newStage?.name}`);

            if (newStage) {
                if (newStage.name.toUpperCase() === 'WON') {
                    // Get the current lead to check if already converted
                    const currentLead = await prisma.lead.findUnique({
                        where: { id },
                        select: { convertedAt: true },
                    });
                    // Only set convertedAt if not already set
                    if (!currentLead?.convertedAt) {
                        updateData.convertedAt = new Date();
                        console.log(`[Lead Stage Change] Setting convertedAt for lead ${id}`);
                    } else {
                        console.log(`[Lead Stage Change] Lead ${id} already has convertedAt: ${currentLead.convertedAt}`);
                    }
                } else {
                    // If moving away from WON, optionally clear convertedAt
                    // (Comment out if you want to preserve converted status)
                    // updateData.convertedAt = null;
                }
            }
        }

        if (value !== undefined) {
            updateData.value = value === null || value === '' ? null : parseFloat(value);
        }

        if (notes !== undefined) {
            updateData.notes = notes?.trim() || null;
        }

        // Contact details updates
        if (name !== undefined && name.trim()) {
            updateData.name = name.trim();
        }

        if (email !== undefined) {
            updateData.email = email?.trim() || null;
        }

        if (phone !== undefined && phone.trim()) {
            updateData.phone = phone.trim();
        }

        if (company !== undefined) {
            updateData.company = company?.trim() || null;
        }

        const lead = await prisma.lead.update({
            where: { id },
            data: updateData,
            include: {
                stage: true,
                activities: {
                    orderBy: { createdAt: 'desc' }
                }
            },
        });

        // Create activity log for stage change
        if (stageId !== undefined) {
            await prisma.leadActivity.create({
                data: {
                    leadId: id,
                    type: 'STAGE_CHANGE',
                    content: `Lead moved to ${lead.stage.name} stage`,
                },
            });
        }

        revalidatePath('/admin/funnel');
        revalidatePath('/admin/funnel/leads');
        revalidatePath(`/admin/funnel/leads/${id}`);

        return NextResponse.json(lead);
    } catch (error) {
        console.error('Error updating lead:', error);
        return NextResponse.json(
            { error: 'Failed to update lead' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                stage: true,
                activities: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!lead) {
            return NextResponse.json(
                { error: 'Lead not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(lead);
    } catch (error) {
        console.error('Error fetching lead:', error);
        return NextResponse.json(
            { error: 'Failed to fetch lead' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        // Check if lead exists
        const existingLead = await prisma.lead.findUnique({
            where: { id },
        });

        if (!existingLead) {
            return NextResponse.json(
                { error: 'Lead not found' },
                { status: 404 }
            );
        }

        // Delete associated activities first
        await prisma.leadActivity.deleteMany({
            where: { leadId: id },
        });

        // Delete the lead
        await prisma.lead.delete({
            where: { id },
        });

        revalidatePath('/admin/funnel');
        revalidatePath('/admin/funnel/leads');

        return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        return NextResponse.json(
            { error: 'Failed to delete lead' },
            { status: 500 }
        );
    }
}
