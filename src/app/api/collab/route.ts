import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';

const collabLimiter = createRateLimiter('collab', {
    intervalMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 5,             // 5 submissions max per IP
});

export async function POST(request: Request) {
    try {
        const clientIp = getClientIp(request);
        const limitResult = collabLimiter.check(clientIp);
        if (!limitResult.success) {
            return NextResponse.json(
                { error: 'Too many collaboration requests submitted. Please wait before trying again.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((limitResult.reset - Date.now()) / 1000)),
                    },
                }
            );
        }

        const body = await request.json();
        const { name, email, phone, platform, profileId, wantsProducts, address } = body;

        if (!name || !email || !phone || !platform || !profileId) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (wantsProducts && !address) {
            return NextResponse.json(
                { error: 'Shipping address is required to receive products' },
                { status: 400 }
            );
        }

        // Validate platform
        const validPlatforms = ['INSTAGRAM', 'FACEBOOK', 'X', 'LINKEDIN'];
        if (!validPlatforms.includes(platform)) {
            return NextResponse.json(
                { error: 'Invalid platform selected' },
                { status: 400 }
            );
        }

        // Check if email already applied
        const existing = await prisma.collabApplication.findFirst({
            where: { email: email.toLowerCase() },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'An application with this email already exists. We will get back to you soon!' },
                { status: 409 }
            );
        }

        const application = await prisma.collabApplication.create({
            data: {
                name,
                email: email.toLowerCase(),
                phone,
                platform,
                profileId,
                wantsProducts: wantsProducts || false,
                address: wantsProducts ? address : null,
            },
        });

        // Send push notification to admin
        try {
            const { sendAdminPushNotification } = await import('@/lib/notifications');
            sendAdminPushNotification(
                '🤝 New Collab Application',
                `${name} (${platform}) wants to collaborate!`,
                { type: 'new_collab', collabId: application.id }
            ).catch(err => console.error('Failed to send collab push notification:', err));
        } catch (e) {
            console.error('Push notification error:', e);
        }

        return NextResponse.json({ success: true, application });
    } catch (error) {
        console.error('Error saving collab application:', error);
        return NextResponse.json(
            { error: 'Failed to submit application. Please try again later.' },
            { status: 500 }
        );
    }
}
