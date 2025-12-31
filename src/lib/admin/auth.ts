import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getAdminSession() {
    const session = await getServerSession(authOptions);
    return session;
}

export async function isAdmin() {
    const session = await getAdminSession();
    return session?.user?.role === 'admin';
}

export async function requireAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        throw new Error('Unauthorized: Admin access required');
    }
    return true;
}
