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
        const { name, templateId, recipients, audience = 'MANUAL' } = await request.json();

        if (!name || !templateId || !recipients || recipients.length === 0) {
            return NextResponse.json({
                error: 'Name, template, and at least one recipient are required'
            }, { status: 400 });
        }

        // Get the template
        const template = await prisma.whatsAppTemplate.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Create the campaign record first
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

        // Process message sending in a controlled way (sequential for now to be safe with Meta limits)
        // In a real production environment, you might use a queue/worker
        for (const recipient of recipients) {
            const { phone, name: recipientName } = recipient;

            // Replace variables if present (like {{name}})
            const variables = {
                name: recipientName || 'Customer',
                // Add more default variables if needed
            };

            const result = await whatsappService.sendTextMessage(
                phone,
                template.content,
                variables
            );

            if (result.success) {
                sentCount++;
                // Log individual message
                await prisma.whatsAppMessage.create({
                    data: {
                        campaignId: campaign.id,
                        phone: whatsappService.formatPhoneNumber(phone),
                        content: whatsappService.replaceVariables(template.content, variables),
                        status: 'SENT',
                    },
                });
            } else {
                failedCount++;
                console.error(`Failed to send campaign message to ${phone}:`, result.error);
                await prisma.whatsAppMessage.create({
                    data: {
                        campaignId: campaign.id,
                        phone: whatsappService.formatPhoneNumber(phone),
                        content: whatsappService.replaceVariables(template.content, variables),
                        status: 'FAILED',
                    },
                });
            }

            // Small delay to prevent hitting rate limits too fast
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Update campaign with final results
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
            totalCount: recipients.length,
        });
    } catch (error) {
        console.error('Error creating campaign:', error);
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }
}
