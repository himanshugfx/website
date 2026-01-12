import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const data = await request.json();

        const { type, content, nextFollowUpAt } = data;

        if (!type || !content) {
            return NextResponse.json(
                { error: 'Type and content are required' },
                { status: 400 }
            );
        }

        const activity = await prisma.leadActivity.create({
            data: {
                leadId: id,
                type,
                content,
            },
        });

        // If follow-up date is provided, update the lead's nextFollowUpAt
        if (nextFollowUpAt !== undefined) {
            await prisma.lead.update({
                where: { id },
                data: {
                    nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,
                },
            });
        }

        revalidatePath(`/admin/funnel/leads/${id}`);

        return NextResponse.json(activity);
    } catch (error) {
        console.error('Error creating lead activity:', error);
        return NextResponse.json(
            { error: 'Failed to create lead activity' },
            { status: 500 }
        );
    }
}
