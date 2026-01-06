import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email: session.user.email! },
            data: { password: hashedNewPassword },
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }
}
