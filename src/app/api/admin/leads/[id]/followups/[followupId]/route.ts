import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';

// PATCH - Update a follow-up (mark complete, reschedule, etc.)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; followupId: string }> }
) {
    try {
        await requireAdmin();
        const { id, followupId } = await params;
        const data = await request.json();

        const { status, scheduledAt, notes } = data;

        const updateData: {
            status?: string;
            scheduledAt?: Date;
            notes?: string | null;
            completedAt?: Date | null;
        } = {};

        if (status !== undefined) {
            updateData.status = status;
            if (status === 'COMPLETED') {
                updateData.completedAt = new Date();
            } else if (status === 'PENDING') {
                updateData.completedAt = null;
            }
        }

        if (scheduledAt !== undefined) {
            updateData.scheduledAt = new Date(scheduledAt);
        }

        if (notes !== undefined) {
            updateData.notes = notes?.trim() || null;
        }

        const followUp = await prisma.leadFollowUp.update({
            where: { id: followupId },
            data: updateData,
        });

        // If marked complete, add activity
        if (status === 'COMPLETED') {
            await prisma.leadActivity.create({
                data: {
                    leadId: id,
                    type: 'NOTE',
                    content: `Follow-up completed${followUp.notes ? `: ${followUp.notes}` : ''}`,
                },
            });
        }

        revalidatePath(`/admin/funnel/leads/${id}`);
        revalidatePath('/admin/funnel');

        return NextResponse.json(followUp);
    } catch (error) {
        console.error('Error updating follow-up:', error);
        return NextResponse.json(
            { error: 'Failed to update follow-up' },
            { status: 500 }
        );
    }
}

// DELETE - Delete/cancel a follow-up
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; followupId: string }> }
) {
    try {
        await requireAdmin();
        const { id, followupId } = await params;

        await prisma.leadFollowUp.delete({
            where: { id: followupId },
        });

        revalidatePath(`/admin/funnel/leads/${id}`);
        revalidatePath('/admin/funnel');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting follow-up:', error);
        return NextResponse.json(
            { error: 'Failed to delete follow-up' },
            { status: 500 }
        );
    }
}
