import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, platform, profileId, wantsProducts } = body;

        if (!name || !email || !phone || !platform || !profileId) {
            return NextResponse.json(
                { error: 'All fields are required' },
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
            { error: 'Failed to submit application', details: String(error) },
            { status: 500 }
        );
    }
}
