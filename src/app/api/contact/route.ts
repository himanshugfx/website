import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

        return NextResponse.json({ success: true, inquiry });
    } catch (error) {
        console.error('Error saving inquiry:', error);
        return NextResponse.json(
            { error: 'Failed to send message', details: String(error) },
            { status: 500 }
        );
    }
}
