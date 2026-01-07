'use server';

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Max file sizes - Server Action limit is 100MB as configured in next.config.ts
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

interface UploadResult {
    url?: string;
    error?: string;
    details?: string;
}

export async function uploadFile(formData: FormData): Promise<UploadResult> {
    console.log('[Server Action] Starting upload...');

    try {
        const file = formData.get('file') as File | null;

        if (!file) {
            console.log('[Server Action] Error: No file provided');
            return { error: 'No file uploaded' };
        }

        console.log('[Server Action] File received:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        // Check file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            return { error: 'Invalid file type. Only images and videos are allowed.' };
        }

        // Check file size
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            return { error: `File too large. Maximum size is ${maxSizeMB}MB` };
        }

        // Convert to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Sanitize filename
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = Date.now() + '-' + sanitizedName;

        // Get upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Ensure uploads directory exists
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Write file
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        console.log('[Server Action] Upload successful:', `/uploads/${filename}`);
        return { url: `/uploads/${filename}` };

    } catch (error) {
        console.error('[Server Action] Error:', error);
        return {
            error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
            details: String(error)
        };
    }
}
