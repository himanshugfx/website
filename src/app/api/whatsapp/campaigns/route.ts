import { NextResponse } from 'next/server';
import whatsappService from '@/lib/whatsapp';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get all campaigns
export async function GET() {
    try {
        const campaigns = await prisma.whatsAppCampaign.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, campaigns });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}

// Create and send a campaign
export async function POST(request: Request) {
    try {
        const { name, templateId, phones, audience = 'MANUAL' } = await request.json();

        if (!name || !templateId || !phones || phones.length === 0) {
            return NextResponse.json({
                error: 'Name, template, and at least one phone number are required'
            }, { status: 400 });
        }

        // Get the template
        const template = await prisma.whatsAppTemplate.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Create the campaign
        const campaign = await prisma.whatsAppCampaign.create({
            data: {
                name,
                templateId,
                status: 'RUNNING',
                audience,
                sentCount: 0,
                deliveredCount: 0,
            },
        });

        // Send messages
        let sentCount = 0;
        let failedCount = 0;

        // Process messages (limit to 50 for now)
        for (const phone of phones.slice(0, 50)) {
            const result = await whatsappService.sendTextMessage(
                phone,
                template.content
            );

            if (result.success) {
                sentCount++;
                // Log message
                await prisma.whatsAppMessage.create({
                    data: {
                        campaignId: campaign.id,
                        phone: whatsappService.formatPhoneNumber(phone),
                        content: template.content,
                        status: 'SENT',
                    },
                });
            } else {
                failedCount++;
                await prisma.whatsAppMessage.create({
                    data: {
                        campaignId: campaign.id,
                        phone: whatsappService.formatPhoneNumber(phone),
                        content: template.content,
                        status: 'FAILED',
                    },
                });
            }
        }

        // Update campaign with final counts
        await prisma.whatsAppCampaign.update({
            where: { id: campaign.id },
            data: {
                status: 'COMPLETED',
                sentCount,
            },
        });

        return NextResponse.json({
            success: true,
            campaignId: campaign.id,
            sentCount,
            failedCount,
            totalCount: phones.length,
        });
    } catch (error) {
        console.error('Error creating campaign:', error);
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }
}
