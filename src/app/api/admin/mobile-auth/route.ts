import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';

const getSecret = () => new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

// Sign a JWT for mobile auth
async function signMobileToken(payload: { id: string; email: string; name: string; role: string }) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getSecret());
}

// Verify a mobile JWT token
export async function verifyMobileToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as { id: string; email: string; name: string; role: string };
    } catch {
        return null;
    }
}

// POST - Login with email/password OR Google token, returns JWT
export async function POST(request: Request) {
    try {
        const { email, password, googleToken } = await request.json();

        let user;

        if (googleToken) {
            // Verify Google Token
            const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
            const googleData = await googleRes.json();

            if (!googleRes.ok || !googleData.email) {
                return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
            }

            const userEmail = googleData.email.toLowerCase().trim();

            // Auto-check admin emails (consistent with src/lib/auth.ts)
            const adminEmails = ['anosebeauty@gmail.com', 'himanshu@anosebeauty.com'];
            const isWhiteListed = adminEmails.includes(userEmail);

            user = await prisma.user.findUnique({
                where: { email: userEmail },
            });

            if (!user) {
                // Return unauthorized if user doesn't exist yet, 
                // or we could create them here if they are in the whitelist
                if (isWhiteListed) {
                    user = await prisma.user.create({
                        data: {
                            email: userEmail,
                            name: googleData.name || userEmail.split('@')[0],
                            role: 'admin',
                        },
                    });
                } else {
                    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
                }
            } else if (isWhiteListed && user.role !== 'admin') {
                // Ensure they are admin if they are in the list
                user = await prisma.user.update({
                    where: { email: userEmail },
                    data: { role: 'admin' },
                });
            }
        } else {
            // Email/Password login
            if (!email || !password) {
                return NextResponse.json(
                    { error: 'Email and password are required' },
                    { status: 400 }
                );
            }

            user = await prisma.user.findUnique({
                where: { email: email.toLowerCase().trim() },
            });

            if (!user || !user.password) {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (!isPasswordCorrect) {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }
        }

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const token = await signMobileToken({
            id: user.id,
            email: user.email || '',
            name: user.name || '',
            role: user.role,
        });

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Mobile auth error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}

// GET - Verify token & return user info
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyMobileToken(token);

        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // Fetch fresh user data
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, email: true, name: true, role: true },
        });

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
