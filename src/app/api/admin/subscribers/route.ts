import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await requireAdmin(request);
        const subscribers = await prisma.newsletterSubscriber.findMany({
            orderBy: { subscribedAt: 'desc' },
        });

        return NextResponse.json({ success: true, subscribers });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if exists
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (existing) {
            return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 });
        }

        const subscriber = await prisma.newsletterSubscriber.create({
            data: { email },
        });

        return NextResponse.json({ success: true, subscriber });
    } catch (error) {
        console.error('Error creating subscriber:', error);
        return NextResponse.json({ error: 'Failed to create subscriber' }, { status: 500 });
    }
}
