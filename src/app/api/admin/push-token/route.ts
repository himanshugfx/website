import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

export async function POST(request: Request) {
    try {
        await requireAdmin(request);
        const { token, platform } = await request.json();

        if (!token || !platform) {
            return NextResponse.json(
                { error: 'Token and platform are required' },
                { status: 400 }
            );
        }

        // Upsert — update if token already exists, create if not
        const pushToken = await prisma.adminPushToken.upsert({
            where: { token },
            update: { platform, updatedAt: new Date() },
            create: { token, platform },
        });

        return NextResponse.json(pushToken);
    } catch (error) {
        console.error('Error registering push token:', error);
        return NextResponse.json(
            { error: 'Failed to register push token' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        await prisma.adminPushToken.deleteMany({
            where: { token },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing push token:', error);
        return NextResponse.json(
            { error: 'Failed to remove push token' },
            { status: 500 }
        );
    }
}
