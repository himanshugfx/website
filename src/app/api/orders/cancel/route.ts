import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { orderId, reason } = await request.json();

        if (!orderId || !reason) {
            return NextResponse.json(
                { error: 'Order ID and reason are required' },
                { status: 400 }
            );
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: session.user.id,
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        if (order.status !== 'COMPLETED') {
            return NextResponse.json(
                { error: 'Only completed orders can be cancelled' },
                { status: 400 }
            );
        }

        if (order.cancelRequest) {
            return NextResponse.json(
                { error: 'Cancellation request already exists' },
                { status: 400 }
            );
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                cancelRequest: 'PENDING',
                cancelReason: reason,
            },
        });

        return NextResponse.json({ order: updatedOrder });
    } catch (error) {
        console.error('Error processing cancellation request:', error);
        return NextResponse.json(
            { error: 'Failed to process cancellation request' },
            { status: 500 }
        );
    }
}

