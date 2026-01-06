import { NextResponse } from 'next/server';
import whatsappService from '@/lib/whatsapp';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get templates from Meta and sync with local database
export async function GET() {
    try {
        // Fetch templates from Meta
        const metaResult = await whatsappService.getTemplates();

        // Also get local templates
        const localTemplates = await prisma.whatsAppTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            metaTemplates: metaResult.success ? metaResult.templates : [],
            localTemplates,
            metaError: metaResult.error,
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

// Create a local template
export async function POST(request: Request) {
    try {
        const { name, content, variables } = await request.json();

        if (!name || !content) {
            return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
        }

        const template = await prisma.whatsAppTemplate.create({
            data: {
                name,
                content,
                variables: JSON.stringify(variables || []),
                approved: false, // Local templates need to be approved on Meta
            },
        });

        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}
