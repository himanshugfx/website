import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
    try {
        await requireAdmin(request);

        const inquiries = await prisma.contactInquiry.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(inquiries);
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch inquiries' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        await requireAdmin(request);
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json(
                { error: 'ID and status are required' },
                { status: 400 }
            );
        }

        const inquiry = await prisma.contactInquiry.update({
            where: { id },
            data: { status },
        });

        revalidatePath('/admin/inquiries');

        return NextResponse.json(inquiry);
    } catch (error) {
        console.error('Error updating inquiry:', error);
        return NextResponse.json(
            { error: 'Failed to update inquiry' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        await requireAdmin(request);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            );
        }

        await prisma.contactInquiry.delete({
            where: { id },
        });

        revalidatePath('/admin/inquiries');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        return NextResponse.json(
            { error: 'Failed to delete inquiry' },
            { status: 500 }
        );
    }
}
