import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

/**
 * GET: Fetch all abandoned checkouts for admin view
 */
export async function GET(request: Request) {
    try {
        await requireAdmin(request);
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [abandonedCheckouts, total] = await Promise.all([
            prisma.abandonedCheckout.findMany({
                where: {
                    status: 'ABANDONED'
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.abandonedCheckout.count({
                where: {
                    status: 'ABANDONED'
                }
            })
        ]);

        // Parse JSON fields
        const formattedCheckouts = abandonedCheckouts.map(checkout => ({
            ...checkout,
            cartItems: checkout.cartItems ? JSON.parse(checkout.cartItems) : [],
            shippingInfo: checkout.shippingInfo ? JSON.parse(checkout.shippingInfo) : null,
        }));

        return NextResponse.json({
            success: true,
            checkouts: formattedCheckouts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error: any) {
        console.error('Error fetching abandoned checkouts:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE: Mark abandoned checkout as recovered or delete
 */
export async function DELETE(request: Request) {
    try {
        await requireAdmin(request);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Checkout ID required' },
                { status: 400 }
            );
        }

        await prisma.abandonedCheckout.update({
            where: { id },
            data: { status: 'RECOVERED' }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating abandoned checkout:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
