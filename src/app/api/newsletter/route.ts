import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { sendMetaCapiEvent } from '@/lib/metaCapi';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const newsletterLimiter = createRateLimiter('newsletter', {
    intervalMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 5,             // 5 subscriptions max per IP
});

export async function POST(request: Request) {
    try {
        const clientIp = getClientIp(request);
        const limitResult = newsletterLimiter.check(clientIp);
        if (!limitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a few minutes before trying again.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((limitResult.reset - Date.now()) / 1000)),
                    },
                }
            );
        }

        const { email } = await request.json();

        if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 254) {
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

        // Trigger Meta CAPI Lead event server-side for High EMQ
        sendMetaCapiEvent({
            eventName: 'Lead',
            userData: { email: email.toLowerCase() },
            customData: { content_name: 'Newsletter Subscription' },
            req: request,
        }).catch(err => console.error('Failed to send newsletter CAPI event:', err));

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

export async function GET(request: Request) {
    try {
        await requireAdmin(request);
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
