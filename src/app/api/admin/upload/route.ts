import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Route segment config for App Router
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for large uploads

// Max file sizes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos

export async function POST(request: Request) {
    console.log('[Upload API] Starting upload...');

    try {
        // Parse form data
        console.log('[Upload API] Parsing form data...');
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            console.log('[Upload API] Error: No file in request');
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        console.log('[Upload API] File received:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        // Check file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            console.log('[Upload API] Error: Invalid file type:', file.type);
            return NextResponse.json({ error: 'Invalid file type. Only images and videos are allowed.' }, { status: 400 });
        }

        // Check file size
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            console.log('[Upload API] Error: File too large:', file.size);
            return NextResponse.json({ error: `File too large. Maximum size is ${maxSizeMB}MB` }, { status: 400 });
        }

        // Get buffer
        console.log('[Upload API] Converting to buffer...');
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log('[Upload API] Buffer size:', buffer.length);

        // Sanitize filename
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = Date.now() + '-' + sanitizedName;

        // Get upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        console.log('[Upload API] Upload directory:', uploadDir);

        // Ensure uploads directory exists
        if (!existsSync(uploadDir)) {
            console.log('[Upload API] Creating uploads directory...');
            await mkdir(uploadDir, { recursive: true });
        }

        // Write file
        const filePath = path.join(uploadDir, filename);
        console.log('[Upload API] Writing file to:', filePath);
        await writeFile(filePath, buffer);

        console.log('[Upload API] Upload successful! URL:', `/uploads/${filename}`);
        return NextResponse.json({
            url: `/uploads/${filename}`,
            filename: filename,
            size: buffer.length
        });

    } catch (error) {
        console.error('[Upload API] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Upload failed: ' + errorMessage,
            details: String(error)
        }, { status: 500 });
    }
}
