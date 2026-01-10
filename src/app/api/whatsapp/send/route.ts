import { NextResponse } from 'next/server';
import whatsappService from '@/lib/whatsapp';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Send a quick message
export async function POST(request: Request) {
    try {
        const { phone, message, templateName, templateParams } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        let result;

        if (templateName) {
            // Send template message
            result = await whatsappService.sendTemplateMessage(
                phone,
                templateName,
                'en',
                templateParams
            );
        } else if (message) {
            // Send text message
            result = await whatsappService.sendTextMessage(phone, message);
        } else {
            return NextResponse.json({ error: 'Message or template name is required' }, { status: 400 });
        }

        if (result.success) {
            console.log('WhatsApp send success:', result);
            // Log the message
            await prisma.whatsAppMessage.create({
                data: {
                    phone: whatsappService.formatPhoneNumber(phone),
                    content: message || `Template: ${templateName}`,
                    status: 'SENT',
                },
            });

            return NextResponse.json({
                success: true,
                messageId: result.messageId,
            });
        } else {
            console.error('WhatsApp send failure:', result);
            return NextResponse.json({
                success: false,
                error: result.error,
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
