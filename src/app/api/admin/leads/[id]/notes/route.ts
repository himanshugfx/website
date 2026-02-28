import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';

// POST - Add a note to a lead
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(request);
        const { id } = await params;
        const { content } = await request.json();

        if (!content || typeof content !== 'string' || content.trim() === '') {
            return NextResponse.json(
                { error: 'Note content is required' },
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

        // Create the note as a LeadActivity
        const activity = await prisma.leadActivity.create({
            data: {
                leadId: id,
                type: 'NOTE',
                content: content.trim(),
            },
        });

        revalidatePath(`/admin/funnel/leads/${id}`);
        revalidatePath('/admin/funnel');

        return NextResponse.json(activity, { status: 201 });
    } catch (error) {
        console.error('Error adding note:', error);
        return NextResponse.json(
            { error: 'Failed to add note' },
            { status: 500 }
        );
    }
}
