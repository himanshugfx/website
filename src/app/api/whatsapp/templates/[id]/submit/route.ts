import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import whatsappService from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch local template
        const template = await prisma.whatsAppTemplate.findUnique({
            where: { id },
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Default category to MARKETING if not specified in DB (assuming DB schema update or default)
        // For now, let's guess based on name or content, or default to MARKETING
        // ideally we should store category in DB. For now, we'll try to guess or use a prompt.
        // Actually, let's default to MARKETING as it's most common, or UTILITY if it looks like one.
        // Since we don't have category in DB, we'll accept it in the body potentially, or default.
        // Let's check if the user passed category in body.

        const body = await request.json().catch(() => ({}));
        const category = body.category || 'MARKETING';

        // Submit to Meta
        const result = await whatsappService.createTemplate(
            template.name,
            category,
            template.content,
            'en_US' // Default language
        );

        if (result.success) {
            // Update local status
            await prisma.whatsAppTemplate.update({
                where: { id },
                data: { approved: true }, // Mark as approved (or pending if we had that status)
            });

            return NextResponse.json({ success: true, link: result.templateId });
        } else {
            return NextResponse.json({ error: result.error || 'Failed to submit to Meta' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error submitting template:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
