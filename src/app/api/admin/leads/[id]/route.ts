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

        const { stageId, value } = data;

        const updateData: { stageId?: string; value?: number | null } = {};

        if (stageId !== undefined) {
            updateData.stageId = stageId;
        }

        if (value !== undefined) {
            updateData.value = value === null || value === '' ? null : parseFloat(value);
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
