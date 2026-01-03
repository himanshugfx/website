import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const data = await request.json();

        const { new: isNew, sale, bestSeller, priority } = data;

        const product = await prisma.product.update({
            where: { id },
            data: {
                new: isNew !== undefined ? isNew : undefined,
                sale: sale !== undefined ? sale : undefined,
                bestSeller: bestSeller !== undefined ? bestSeller : undefined,
                priority: priority !== undefined ? parseInt(priority) : undefined,
            },
        });

        revalidatePath('/');
        revalidatePath('/shop');

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product status:', error);
        return NextResponse.json(
            { error: 'Failed to update product status' },
            { status: 500 }
        );
    }
}
