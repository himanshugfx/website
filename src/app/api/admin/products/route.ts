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

export async function GET(request: Request) {
    try {
        await requireAdmin();
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
        await requireAdmin();
        const data = await request.json();

        const product = await prisma.product.create({
            data: {
                category: data.category,
                type: data.type,
                name: data.name,
                gender: data.gender,
                new: data.new || false,
                sale: data.sale || false,
                bestSeller: data.bestSeller || false,
                rate: data.rate || 0,

                price: data.price ? parseFloat(data.price) : 0,
                originPrice: data.originPrice ? parseFloat(data.originPrice) : 0,
                brand: data.brand || 'Anose',
                quantity: data.quantity !== undefined ? parseInt(data.quantity) : undefined,
                quantityPurchase: 1,
                sizes: data.sizes || '',
                description: data.description,
                slug: data.slug,
                images: data.images,
                thumbImage: data.thumbImage,
                variations: data.variations ? {
                    create: data.variations.map((v: VariationInput) => ({
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

        return NextResponse.json(product, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product', details: String(error) },
            { status: 500 }
        );
    }
}

