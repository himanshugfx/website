import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Size limits in bytes
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_VIDEO_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const mimeType = file.type;
        const isVideo = mimeType.startsWith('video/');
        const isImage = mimeType.startsWith('image/');

        if (!isImage && !isVideo) {
            return NextResponse.json({ error: 'Only images and videos are allowed' }, { status: 400 });
        }

        // Validate size
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            return NextResponse.json({
                error: `File too large. Maximum size is ${maxSizeMB}MB for ${isVideo ? 'videos' : 'images'}.`
            }, { status: 400 });
        }

        // Convert to Base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString('base64');

        // Save to database
        const media = await prisma.media.create({
            data: {
                name: file.name,
                mimeType: mimeType,
                data: base64Data,
                size: file.size,
            },
        });

        return NextResponse.json({
            id: media.id,
            url: `/api/media/${media.id}`,
            name: media.name,
            size: media.size,
        });
    } catch (error) {
        console.error('Media upload error:', error);
        return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
    }
}

// GET: List all media (optional, for media library)
export async function GET() {
    try {
        const media = await prisma.media.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                mimeType: true,
                size: true,
                createdAt: true,
            },
        });

        return NextResponse.json(media);
    } catch (error) {
        console.error('Media list error:', error);
        return NextResponse.json({ error: 'Failed to list media' }, { status: 500 });
    }
}
