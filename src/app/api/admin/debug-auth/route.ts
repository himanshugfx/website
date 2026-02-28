import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

// Debug endpoint to test mobile token authentication
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');

        const debugInfo: any = {
            hasAuthHeader: !!authHeader,
            authHeaderPrefix: authHeader ? authHeader.substring(0, 10) + '...' : null,
            secretLength: SECRET.length,
            envSecretSet: !!process.env.NEXTAUTH_SECRET,
        };

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            debugInfo.tokenLength = token.length;

            try {
                const { payload } = await jwtVerify(token, SECRET);
                debugInfo.tokenValid = true;
                debugInfo.tokenPayload = {
                    role: (payload as any).role,
                    email: (payload as any).email,
                    exp: payload.exp,
                    iat: payload.iat,
                };
            } catch (e: any) {
                debugInfo.tokenValid = false;
                debugInfo.tokenError = e?.message || String(e);
            }
        }

        return NextResponse.json(debugInfo);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
    }
}
