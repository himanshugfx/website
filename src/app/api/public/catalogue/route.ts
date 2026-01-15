import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - List all active hotel amenities (public endpoint)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');

        const amenities = await prisma.hotelAmenity.findMany({
            where: {
                isActive: true,
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
            take: limit,
            select: {
                id: true,
                name: true,
                category: true,
                description: true,
                image: true,
                minOrderQty: true,
                sizes: true,
                packing: true,
                contents: true,
                material: true,
                dimensions: true,
                color: true,
                priority: true,
                // Note: price is excluded for public view
            },
        });

        return NextResponse.json({
            amenities,
            total: amenities.length,
        });
    } catch (error) {
        console.error('Error fetching public catalogue:', error);
        return NextResponse.json({ error: 'Failed to fetch catalogue' }, { status: 500 });
    }
}
