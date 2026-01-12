import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

// POST - Reset admin credentials
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { secretKey, email, password, name } = body;

        // Simple secret key check for security
        if (secretKey !== 'anose-admin-reset-2024') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Upsert admin user
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'admin',
                name: name || 'Admin',
            },
            create: {
                email,
                password: hashedPassword,
                role: 'admin',
                name: name || 'Admin',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Admin credentials updated',
            userId: user.id
        });
    } catch (error) {
        console.error('Error resetting admin:', error);
        return NextResponse.json({ error: 'Failed to reset admin' }, { status: 500 });
    }
}
