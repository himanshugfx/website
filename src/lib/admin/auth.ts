import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

export async function getAdminSession() {
    const session = await getServerSession(authOptions);
    return session;
}

export async function isAdmin() {
    const session = await getAdminSession();
    return session?.user?.role === 'admin';
}

// Verify mobile JWT token from Authorization header
async function isAdminFromMobileToken(request?: Request): Promise<boolean> {
    try {
        let authHeader: string | null = null;

        // Try to get auth header from request object first (most reliable in route handlers)
        if (request) {
            authHeader = request.headers.get('authorization');
        }

        // Fallback to next/headers  
        if (!authHeader) {
            try {
                const headersList = await headers();
                authHeader = headersList.get('authorization');
            } catch (e) {
                console.log('[MobileAuth] headers() failed:', e);
            }
        }

        console.log('[MobileAuth] Authorization header present:', !!authHeader);
        if (!authHeader?.startsWith('Bearer ')) return false;

        const token = authHeader.split(' ')[1];
        console.log('[MobileAuth] Token length:', token.length);
        const { payload } = await jwtVerify(token, SECRET);
        console.log('[MobileAuth] Token verified, role:', (payload as any).role);
        return (payload as any).role === 'admin';
    } catch (e: any) {
        console.error('[MobileAuth] Token verification error:', e?.message || e);
        return false;
    }
}

export async function requireAdmin(request?: Request) {
    // First try session-based auth (web panel)
    try {
        const sessionAdmin = await isAdmin();
        if (sessionAdmin) return true;
    } catch (e) {
        // Session check may fail for mobile requests — continue to token auth
        console.log('[requireAdmin] Session check failed, trying mobile token');
    }

    // Then try mobile token auth
    const mobileAdmin = await isAdminFromMobileToken(request);
    if (mobileAdmin) return true;

    throw new Error('Unauthorized: Admin access required');
}
