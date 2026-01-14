import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET - List all hotel amenities
export async function GET(request: NextRequest) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';

        const where: Prisma.HotelAmenityWhereInput = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (category && category !== 'ALL') {
            where.category = category;
        }

        const [amenities, total] = await Promise.all([
            prisma.hotelAmenity.findMany({
                where,
                orderBy: [
                    { priority: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.hotelAmenity.count({ where }),
        ]);

        return NextResponse.json({
            amenities,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching hotel amenities:', error);
        return NextResponse.json({ error: 'Failed to fetch amenities' }, { status: 500 });
    }
}

// POST - Create new hotel amenity
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();

        const {
            name,
            category,
            description,
            image,
            price,
            minOrderQty,
            sizes,
            packing,
            contents,
            material,
            dimensions,
            color,
            isActive,
            priority,
        } = body;

        const errors = [];
        if (!name) errors.push('Product name is required');
        if (!category) errors.push('Category is required');
        if (!image) errors.push('Product image is required');
        if (price === undefined || price === '' || isNaN(parseFloat(price))) errors.push('Valid price is required');

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(', ') },
                { status: 400 }
            );
        }

        const amenity = await prisma.hotelAmenity.create({
            data: {
                name,
                category,
                description: description || null,
                image,
                price: parseFloat(price),
                minOrderQty: parseInt(minOrderQty) || 100,
                sizes: sizes || null,
                packing: packing || null,
                contents: contents || null,
                material: material || null,
                dimensions: dimensions || null,
                color: color || null,
                isActive: isActive !== false,
                priority: parseInt(priority) || 0,
            },
        });

        return NextResponse.json(amenity);
    } catch (error) {
        console.error('Error creating hotel amenity:', error);
        return NextResponse.json({ error: 'Failed to create amenity' }, { status: 500 });
    }
}
