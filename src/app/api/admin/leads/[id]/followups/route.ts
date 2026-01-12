import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';

// GET - List all follow-ups for a lead
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        const followUps = await prisma.leadFollowUp.findMany({
            where: { leadId: id },
            orderBy: { scheduledAt: 'asc' },
        });

        return NextResponse.json(followUps);
    } catch (error) {
        console.error('Error fetching follow-ups:', error);
        return NextResponse.json(
            { error: 'Failed to fetch follow-ups' },
            { status: 500 }
        );
    }
}

// POST - Create a new scheduled follow-up
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const { scheduledAt, notes } = await request.json();

        if (!scheduledAt) {
            return NextResponse.json(
                { error: 'Scheduled date/time is required' },
                { status: 400 }
            );
        }

        // Verify lead exists
        const lead = await prisma.lead.findUnique({
            where: { id },
        });

        if (!lead) {
            return NextResponse.json(
                { error: 'Lead not found' },
                { status: 404 }
            );
        }

        // Create the follow-up
        const followUp = await prisma.leadFollowUp.create({
            data: {
                leadId: id,
                scheduledAt: new Date(scheduledAt),
                notes: notes?.trim() || null,
            },
        });

        // Also create an activity log
        await prisma.leadActivity.create({
            data: {
                leadId: id,
                type: 'NOTE',
                content: `Follow-up scheduled for ${new Date(scheduledAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                })}${notes ? `: ${notes}` : ''}`,
            },
        });

        revalidatePath(`/admin/funnel/leads/${id}`);
        revalidatePath('/admin/funnel');

        return NextResponse.json(followUp, { status: 201 });
    } catch (error) {
        console.error('Error creating follow-up:', error);
        return NextResponse.json(
            { error: 'Failed to create follow-up' },
            { status: 500 }
        );
    }
}
