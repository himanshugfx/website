import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import { jwtVerify } from 'jose';

// We use a getter to ensure we always have the latest env var
function getSecret() {
    return new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
}

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
            authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        }

        // Fallback to next/headers (for Server Components calling this, unlikely in API routes)
        if (!authHeader) {
            try {
                const headersList = await headers();
                authHeader = headersList.get('authorization') || headersList.get('Authorization');
            } catch (e) {
                // headers() can throw in some contexts
            }
        }

        if (!authHeader) {
            console.log('[MobileAuth] No Authorization header found');
            return false;
        }

        if (!authHeader.startsWith('Bearer ')) {
            console.log('[MobileAuth] Auth header does not start with Bearer');
            return false;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('[MobileAuth] Empty Bearer token');
            return false;
        }

        const { payload } = await jwtVerify(token, getSecret());

        const role = (payload as any).role;
        const email = (payload as any).email;

        console.log(`[MobileAuth] SUCCESS: Verified token for ${email} with role ${role}`);
        return role === 'admin';
    } catch (e: any) {
        console.error('[MobileAuth] ERROR verifying token:', e?.message || String(e));
        return false;
    }
}

export async function requireAdmin(request?: Request) {
    // 1. If an Authorization header is present, it's likely a mobile/API request.
    // Try mobile token auth FIRST to avoid session lookup overhead/errors.
    const hasAuthHeader = request?.headers.get('authorization') || request?.headers.get('Authorization');

    if (hasAuthHeader) {
        console.log('[requireAdmin] Auth header detected, trying mobile token first');
        const mobileAdmin = await isAdminFromMobileToken(request);
        if (mobileAdmin) return true;

        // If mobile auth failed but header was present, don't fall back to session
        // because session cookies are unlikely to be present on mobile requests.
        console.log('[requireAdmin] Mobile token validation failed');
        throw new Error('Unauthorized: Invalid mobile token');
    }

    // 2. Otherwise (web/browser request), try session-based auth
    try {
        const sessionAdmin = await isAdmin();
        if (sessionAdmin) return true;
    } catch (e) {
        console.log('[requireAdmin] Session check failed');
    }

    // 3. Last resort fallback for edge cases
    if (!hasAuthHeader) {
        const mobileAdminFallback = await isAdminFromMobileToken(request);
        if (mobileAdminFallback) return true;
    }

    throw new Error('Unauthorized: Admin access required');
}
