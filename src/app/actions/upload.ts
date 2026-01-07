'use server';

import { put } from '@vercel/blob';

// Max file sizes - Server Action limit is 100MB as configured in next.config.ts
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

interface UploadResult {
    url?: string;
    error?: string;
    details?: string;
}

export async function uploadFile(formData: FormData): Promise<UploadResult> {
    console.log('[Server Action] Starting upload (Vercel Blob)...');

    // Check for Vercel Blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('[Server Action] Error: Missing BLOB_READ_WRITE_TOKEN');
        return { error: 'Server configuration error: Missing Vercel Blob token' };
    }

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

        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        });

        console.log('[Server Action] Upload successful:', blob.url);
        return { url: blob.url };

    } catch (error) {
        console.error('[Server Action] Error:', error);
        return {
            error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
            details: String(error)
        };
    }
}
