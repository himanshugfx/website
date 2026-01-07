import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitize filename - remove special characters and spaces
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = Date.now() + '-' + sanitizedName;
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        // Ensure uploads directory exists
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        console.log('File uploaded successfully:', filePath);
        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Upload failed: ' + (error as Error).message }, { status: 500 });
    }
}
