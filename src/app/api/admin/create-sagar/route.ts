import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET() {
    try {
        const email = 'sagar@anosebeauty.com';
        const password = 'Anose@4184';

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            await prisma.user.update({
                where: { email },
                data: { role: 'admin' }
            });
            return NextResponse.json({ message: `User ${email} already exists and is now admin.` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name: 'Sagar',
                email: email,
                password: hashedPassword,
                role: 'admin',
            },
        });

        return NextResponse.json({ message: '✅ Sagar admin created successfully!' });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
