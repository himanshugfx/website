import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Fetch single amenity
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const amenity = await prisma.hotelAmenity.findUnique({
            where: { id },
        });

        if (!amenity) {
            return NextResponse.json({ error: 'Amenity not found' }, { status: 404 });
        }

        return NextResponse.json(amenity);
    } catch (error) {
        console.error('Error fetching amenity:', error);
        return NextResponse.json({ error: 'Failed to fetch amenity' }, { status: 500 });
    }
}

// PUT - Update amenity
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        const amenity = await prisma.hotelAmenity.update({
            where: { id },
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
        console.error('Error updating amenity:', error);
        return NextResponse.json({ error: 'Failed to update amenity' }, { status: 500 });
    }
}

// DELETE - Delete amenity
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.hotelAmenity.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting amenity:', error);
        return NextResponse.json({ error: 'Failed to delete amenity' }, { status: 500 });
    }
}
