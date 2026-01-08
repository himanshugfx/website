import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

// GET all reviews with pagination
export async function GET(request: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status') || 'all'; // all, pending, approved

        const skip = (page - 1) * limit;

        const where = status === 'pending'
            ? { isApproved: false }
            : status === 'approved'
                ? { isApproved: true }
                : {};

        const [reviews, total] = await Promise.all([
            prisma.productReview.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: {
                        select: { name: true, slug: true, thumbImage: true }
                    }
                }
            }),
            prisma.productReview.count({ where })
        ]);

        return NextResponse.json({
            reviews,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

// PUT - Approve/reject a review
export async function PUT(request: Request) {
    try {
        await requireAdmin();
        const { id, isApproved } = await request.json();

        if (!id || typeof isApproved !== 'boolean') {
            return NextResponse.json(
                { error: 'Review ID and approval status required' },
                { status: 400 }
            );
        }

        const review = await prisma.productReview.update({
            where: { id },
            data: { isApproved }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
            { error: 'Failed to update review' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a review
export async function DELETE(request: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Review ID is required' },
                { status: 400 }
            );
        }

        await prisma.productReview.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { error: 'Failed to delete review' },
            { status: 500 }
        );
    }
}
