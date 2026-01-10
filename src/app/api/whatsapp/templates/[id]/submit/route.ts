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

        // Transform content variables from {{name}} to {{1}} for Meta API
        let metaContent = template.content;
        const variablesMatch = template.content.match(/\{\{[^}]+\}\}/g);

        if (variablesMatch) {
            variablesMatch.forEach((variable, index) => {
                // Replace first occurrence of {{...}} with {{index+1}}
                // We use a specific regex to ensure we replace only the specific instance if needed, 
                // but for simple templates, global replace of specific variable string might be safer if used multiple times? 
                // Meta expects strictly sequential {{1}}, {{2}}. 
                // Creating a completely new string by strictly replacing {{anything}} with {{1}}, {{2}} in order.

                // Better approach: Split by regex and reconstruct
            });

            // Robust approach: Replace all {{...}} with {{1}}, {{2}} sequentially
            let i = 1;
            metaContent = metaContent.replace(/\{\{[^}]+\}\}/g, () => `{{${i++}}}`);
        }

        // Submit to Meta
        const result = await whatsappService.createTemplate(
            template.name,
            category,
            metaContent,
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
