import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
    try {
        await requireAdmin(request);

        const collabs = await prisma.collabApplication.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(collabs);
    } catch (error) {
        console.error('Error fetching collab applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch collab applications' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        await requireAdmin(request);
        const { id, status, promoCode, notes } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (promoCode !== undefined) updateData.promoCode = promoCode;
        if (notes !== undefined) updateData.notes = notes;

        const collab = await prisma.collabApplication.update({
            where: { id },
            data: updateData,
        });

        revalidatePath('/admin/collabs');

        return NextResponse.json(collab);
    } catch (error) {
        console.error('Error updating collab application:', error);
        return NextResponse.json(
            { error: 'Failed to update collab application' },
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

        await prisma.collabApplication.delete({
            where: { id },
        });

        revalidatePath('/admin/collabs');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting collab application:', error);
        return NextResponse.json(
            { error: 'Failed to delete collab application' },
            { status: 500 }
        );
    }
}
