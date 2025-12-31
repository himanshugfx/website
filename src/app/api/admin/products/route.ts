import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { name: { contains: search } },
                    { category: { contains: search } },
                    { brand: { contains: search } },
                ],
            }
            : {};

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    variations: true,
                },
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products', details: String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const product = await prisma.product.create({
            data: {
                category: data.category,
                type: data.type,
                name: data.name,
                gender: data.gender,
                new: data.new || false,
                sale: data.sale || false,
                rate: data.rate || 0,
                price: parseFloat(data.price),
                originPrice: parseFloat(data.originPrice),
                brand: data.brand || 'Anose',
                quantity: parseInt(data.quantity) || 0,
                quantityPurchase: 1,
                sizes: data.sizes || '',
                description: data.description,
                slug: data.slug,
                images: data.images,
                thumbImage: data.thumbImage,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product', details: String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        if (!id) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...updateData,
                price: updateData.price ? parseFloat(updateData.price) : undefined,
                originPrice: updateData.originPrice ? parseFloat(updateData.originPrice) : undefined,
                quantity: updateData.quantity !== undefined ? parseInt(updateData.quantity) : undefined,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product', details: String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Delete variations first (should cascade but let's be explicit)
        await prisma.variation.deleteMany({
            where: { productId: id },
        });

        // Delete order items referencing this product
        await prisma.orderItem.deleteMany({
            where: { productId: id },
        });

        // Now delete the product
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product', details: String(error) },
            { status: 500 }
        );
    }
}
