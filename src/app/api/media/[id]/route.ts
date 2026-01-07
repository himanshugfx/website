import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const media = await prisma.media.findUnique({
            where: { id },
        });

        if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        }

        // Decode Base64 to binary
        const buffer = Buffer.from(media.data, 'base64');

        // Return as proper media response
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': media.mimeType,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
            },
        });
    } catch (error) {
        console.error('Media serve error:', error);
        return NextResponse.json({ error: 'Failed to serve media' }, { status: 500 });
    }
}
