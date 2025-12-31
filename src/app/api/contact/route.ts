import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { name, email, phone, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        const inquiry = await prisma.contactInquiry.create({
            data: {
                name,
                email,
                phone,
                message,
            },
        });

        return NextResponse.json({ success: true, inquiry });
    } catch (error) {
        console.error('Error saving contact inquiry:', error);
        return NextResponse.json(
            { error: 'Failed to send message', details: String(error) },
            { status: 500 }
        );
    }
}
