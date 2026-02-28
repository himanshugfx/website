import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { jwtVerify } from 'jose';

const getSecret = () => new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

export async function GET(request: Request) {
    const debugInfo: any = {
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            HAS_SECRET: !!process.env.NEXTAUTH_SECRET,
            SECRET_LENGTH: process.env.NEXTAUTH_SECRET?.length || 0,
        },
        headers: {},
        auth: {},
        db: {},
    };

    // 1. Check Headers
    const headersList = await headers();
    debugInfo.headers = {
        'authorization-present': !!request.headers.get('authorization') || !!request.headers.get('Authorization'),
        'host': request.headers.get('host'),
        'user-agent': request.headers.get('user-agent'),
    };

    // 2. Check Auth
    try {
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const { payload } = await jwtVerify(token, getSecret());
                debugInfo.auth = {
                    valid: true,
                    role: (payload as any).role,
                    email: (payload as any).email,
                };
            } catch (e: any) {
                debugInfo.auth = {
                    valid: false,
                    error: e.message,
                };
            }
        } else {
            debugInfo.auth = {
                valid: false,
                error: 'No Bearer token found in headers',
            };
        }
    } catch (e: any) {
        debugInfo.auth.error = 'Global auth check error: ' + e.message;
    }

    // 3. Check DB
    try {
        const [ordersCount, productsCount, usersCount, leadsCount, abandonedCount] = await Promise.all([
            prisma.order.count(),
            prisma.product.count(),
            prisma.user.count(),
            prisma.lead.count(),
            prisma.abandonedCheckout.count(),
        ]);

        const sampleOrders = await prisma.order.findMany({ select: { id: true, orderNumber: true }, take: 5, orderBy: { createdAt: 'desc' } });
        const sampleProducts = await prisma.product.findMany({ select: { id: true, name: true }, take: 5, orderBy: { createdAt: 'desc' } });

        debugInfo.db = {
            connected: true,
            counts: { orders: ordersCount, products: productsCount, users: usersCount, leads: leadsCount, abandoned: abandonedCount },
            samples: { orders: sampleOrders, products: sampleProducts }
        };
    } catch (e: any) {
        debugInfo.db = {
            connected: false,
            error: e.message,
        };
    }

    return NextResponse.json(debugInfo);
}
