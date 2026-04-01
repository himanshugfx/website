import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await requireAdmin(request);
        
        const [products, amenities] = await Promise.all([
            prisma.product.findMany({
                select: { id: true, name: true, price: true, hsnCode: true, taxRate: true },
                orderBy: { name: 'asc' }
            }),
            prisma.hotelAmenity.findMany({
                where: { isActive: true },
                select: { id: true, name: true, price: true, hsnCode: true, taxRate: true },
                orderBy: { name: 'asc' }
            })
        ]);

        // Merge and tag for the UI
        const allItems = [
            ...products.map(p => ({ ...p, type: 'PRODUCT' })),
            ...amenities.map(a => ({ ...a, type: 'AMENITY', name: `[Amenity] ${a.name}` }))
        ].sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json({ success: true, products: allItems });
    } catch (error: any) {
        console.error('Error fetching lite products:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
