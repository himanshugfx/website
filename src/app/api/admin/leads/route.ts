import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { revalidatePath } from 'next/cache';
import { sendAdminPushNotification } from '@/lib/notifications';

export async function POST(request: Request) {
    try {
        await requireAdmin(request);
        const data = await request.json();

        const { name, email, phone, company, stageId, source, value, notes } = data;

        if (!name || !stageId) {
            return NextResponse.json({ error: 'Name and Stage are required' }, { status: 400 });
        }

        const newLead = await prisma.lead.create({
            data: {
                name,
                email: email || null,
                phone: phone || null,
                company: company || null,
                stageId,
                source: source || 'MANUAL',
                value: (value && !isNaN(parseFloat(value))) ? parseFloat(value) : null,
                notes: notes || null,
            },
        });

        revalidatePath('/admin/funnel');
        revalidatePath('/admin/funnel/leads');

        // Send push notification to admin devices
        sendAdminPushNotification(
            '📋 New Lead',
            `${name}${company ? ` (${company})` : ''} — ${source}`,
            { type: 'new_lead', leadId: newLead.id }
        ).catch(err => console.error('Failed to send lead push notification:', err));

        return NextResponse.json(newLead);
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json(
            { error: 'Failed to create lead' },
            { status: 500 }
        );
    }
}
