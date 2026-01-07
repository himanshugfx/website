import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';

interface VariationInput {
    color: string;
    colorCode: string;
    colorImage: string;
    image: string;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        // Need to await params in Next.js 15+
        const { id } = await params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                variations: true,
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const data = await request.json();
        console.log('[API] PUT Product payload:', { id, videoUrl: data.videoUrl, thumbImage: data.thumbImage });

        const { variations, id: _id, updatedAt: _u, createdAt: _c, ...updateData } = data;

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...updateData,
                price: data.price ? parseFloat(data.price) : undefined,
                originPrice: data.originPrice ? parseFloat(data.originPrice) : undefined,
                quantity: data.quantity !== undefined ? parseInt(data.quantity) : undefined,
                bestSeller: data.bestSeller !== undefined ? data.bestSeller : undefined,
                new: data.new !== undefined ? data.new : undefined,
                sale: data.sale !== undefined ? data.sale : undefined,
                variations: variations ? {

                    deleteMany: {},
                    create: variations.map((v: VariationInput) => ({
                        color: v.color,
                        colorCode: v.colorCode,
                        colorImage: v.colorImage,
                        image: v.image,
                    }))
                } : undefined,
            },
            include: {
                variations: true,
            },
        });

        revalidatePath('/');
        revalidatePath('/shop');

        return NextResponse.json(product);

    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        // Explicitly delete related records to be safe
        await prisma.$transaction([
            prisma.variation.deleteMany({
                where: { productId: id },
            }),
            prisma.orderItem.deleteMany({
                where: { productId: id },
            }),
            prisma.product.delete({
                where: { id },
            }),
        ]);

        revalidatePath('/');
        revalidatePath('/shop');

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to delete product' },
            { status: 500 }
        );
    }
}
