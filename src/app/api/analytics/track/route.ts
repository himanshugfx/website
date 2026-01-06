import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { path, referrer } = await request.json();
        const userAgent = request.headers.get('user-agent') || undefined;

        // Get or create session ID from cookies
        const cookieStore = await cookies();
        let sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        }

        // Record page view
        await prisma.pageView.create({
            data: {
                path: path || '/',
                sessionId,
                userAgent,
                referrer: referrer || undefined,
            },
        });

        const response = NextResponse.json({ success: true });

        // Set session cookie if it doesn't exist (expires in 30 days)
        if (!cookieStore.get('session_id')) {
            response.cookies.set('session_id', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60, // 30 days
            });
        }

        return response;
    } catch (error) {
        console.error('Error tracking page view:', error);
        return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }
}
