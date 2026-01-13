import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        // Check if already subscribed
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existing) {
            if (existing.isActive) {
                return NextResponse.json(
                    { message: 'You are already subscribed!' },
                    { status: 200 }
                );
            } else {
                // Reactivate subscription
                await prisma.newsletterSubscriber.update({
                    where: { email: email.toLowerCase() },
                    data: { isActive: true, unsubscribedAt: null }
                });
                return NextResponse.json({
                    message: 'Welcome back! Your subscription has been reactivated.'
                });
            }
        }

        // Create new subscriber
        await prisma.newsletterSubscriber.create({
            data: { email: email.toLowerCase() }
        });

        return NextResponse.json({
            message: 'Thank you for subscribing! Get 10% off with code WELCOME10'
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await requireAdmin();
        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
            orderBy: { subscribedAt: 'desc' }
        });

        return NextResponse.json({
            subscribers,
            count: subscribers.length
        });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscribers' },
            { status: 500 }
        );
    }
}
