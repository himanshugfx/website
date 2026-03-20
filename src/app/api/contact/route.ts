import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import emailService from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, message, hotelName, quantity, type } = body;

        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }

        // If it's an amenities inquiry or has specialized fields, bundle them into message
        let finalMessage = message || '';
        if (type === 'AMENITIES' || hotelName || quantity) {
            const metadata = {
                type: type || 'AMENITIES',
                hotelName: hotelName || 'N/A',
                quantity: quantity || 'N/A',
                originalMessage: message || 'No complementary message provided.'
            };
            finalMessage = `[metadata]:${JSON.stringify(metadata)}`;
        }

        const inquiry = await prisma.contactInquiry.create({
            data: {
                name,
                email,
                phone,
                message: finalMessage,
            },
        });

        // Send email notification asynchronously
        // We don't await this to keep the API response fast
        // unless strict delivery confirmation is needed for the client
        emailService.sendInquiryNotification({
            name,
            email,
            phone: phone || undefined,
            message: message || '',
            type,
            hotelName,
            quantity
        }).catch(err => console.error('Failed to send email notif:', err));

        // Send push notification to admin devices
        const { sendAdminPushNotification } = await import('@/lib/notifications');
        sendAdminPushNotification(
            '💬 New Web Inquiry',
            `${name}${hotelName ? ` (${hotelName})` : ''} — ${type || 'Inquiry'}`,
            { type: 'new_inquiry', inquiryId: inquiry.id }
        ).catch(err => console.error('Failed to send inquiry push notification:', err));

        // Create a lead in the Funnel automatically
        try {
            const newStage = await prisma.funnelStage.findFirst({
                where: { name: { equals: 'NEW', mode: 'insensitive' } },
            });

            if (newStage) {
                // Estimate value based on quantity string if possible
                let estimatedValue: number | null = null;
                if (quantity) {
                    if (quantity.includes('Large') || quantity.includes('2000')) estimatedValue = 10000;
                    else if (quantity.includes('Medium')) estimatedValue = 5000;
                    else if (quantity.includes('Small')) estimatedValue = 2000;
                }

                await prisma.lead.create({
                    data: {
                        name,
                        email: email || null,
                        phone: phone || null,
                        company: hotelName || null,
                        source: 'WEBSITE',
                        stageId: newStage.id,
                        notes: `Inquiry Message: ${message || 'No additional message'}. ${quantity ? `Qty Category: ${quantity}` : ''}`,
                        value: estimatedValue,
                    },
                });
            }
        } catch (leadError) {
            console.error('Failed to auto-create lead from inquiry:', leadError);
        }

        return NextResponse.json({ success: true, inquiry });
    } catch (error) {
        console.error('Error saving inquiry:', error);
        return NextResponse.json(
            { error: 'Failed to send message', details: String(error) },
            { status: 500 }
        );
    }
}
