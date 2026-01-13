import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

// Seed hotel amenities with dummy data
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        // Check if already seeded
        const existingCount = await prisma.hotelAmenity.count();
        if (existingCount > 0) {
            return NextResponse.json({ message: 'Already seeded', count: existingCount });
        }

        const amenities = [
            // Cosmetics
            {
                name: 'Luxury Shampoo',
                category: 'COSMETIC',
                description: 'Premium herbal shampoo with natural extracts. Gentle on scalp, suitable for all hair types.',
                image: '/assets/images/product/1000x1000.png',
                price: 8.00,
                minOrderQty: 100,
                sizes: JSON.stringify(['30ml', '50ml', '100ml']),
                packing: 'Box of 100',
            },
            {
                name: 'Silky Conditioner',
                category: 'COSMETIC',
                description: 'Deep conditioning formula that leaves hair soft and manageable. Enriched with argan oil.',
                image: '/assets/images/product/1000x1000.png',
                price: 9.00,
                minOrderQty: 100,
                sizes: JSON.stringify(['30ml', '50ml', '100ml']),
                packing: 'Box of 100',
            },
            {
                name: 'Moisturizing Body Lotion',
                category: 'COSMETIC',
                description: 'Luxurious body lotion with shea butter and vitamin E. Non-greasy formula.',
                image: '/assets/images/product/1000x1000.png',
                price: 7.50,
                minOrderQty: 100,
                sizes: JSON.stringify(['30ml', '50ml', '100ml']),
                packing: 'Box of 100',
            },
            {
                name: 'Refreshing Shower Gel',
                category: 'COSMETIC',
                description: 'Invigorating shower gel with citrus fragrance. Creates rich lather.',
                image: '/assets/images/product/1000x1000.png',
                price: 8.50,
                minOrderQty: 100,
                sizes: JSON.stringify(['30ml', '50ml', '100ml']),
                packing: 'Box of 100',
            },
            {
                name: 'Gentle Face Wash',
                category: 'COSMETIC',
                description: 'pH-balanced face wash suitable for all skin types. Removes impurities gently.',
                image: '/assets/images/product/1000x1000.png',
                price: 6.00,
                minOrderQty: 100,
                sizes: JSON.stringify(['30ml', '50ml']),
                packing: 'Box of 100',
            },
            {
                name: 'Nourishing Hand Cream',
                category: 'COSMETIC',
                description: 'Fast-absorbing hand cream with aloe vera. Perfect for hotel vanities.',
                image: '/assets/images/product/1000x1000.png',
                price: 5.00,
                minOrderQty: 100,
                sizes: JSON.stringify(['30ml']),
                packing: 'Box of 100',
            },
            {
                name: 'Premium Soap Bar',
                category: 'COSMETIC',
                description: 'Handcrafted soap with natural ingredients. Available in multiple fragrances.',
                image: '/assets/images/product/1000x1000.png',
                price: 4.00,
                minOrderQty: 100,
                sizes: JSON.stringify(['25g', '40g', '50g']),
                packing: 'Box of 100',
            },
            // Kits
            {
                name: 'Dental Kit',
                category: 'DENTAL_KIT',
                description: 'Complete dental hygiene kit for guests. Includes high-quality toothbrush and toothpaste.',
                image: '/assets/images/product/1000x1000.png',
                price: 12.00,
                minOrderQty: 100,
                contents: JSON.stringify(['Premium Toothbrush', 'Toothpaste (10g)']),
                packing: 'Box of 100',
            },
            {
                name: 'Shaving Kit',
                category: 'SHAVING_KIT',
                description: 'Premium shaving essentials for gentlemen. Twin-blade razor with shaving cream.',
                image: '/assets/images/product/1000x1000.png',
                price: 15.00,
                minOrderQty: 100,
                contents: JSON.stringify(['Twin-blade Razor', 'Shaving Cream (15g)']),
                packing: 'Box of 100',
            },
            {
                name: 'Vanity Kit',
                category: 'VANITY_KIT',
                description: 'Essential vanity items for guests. Neatly packaged in elegant pouch.',
                image: '/assets/images/product/1000x1000.png',
                price: 10.00,
                minOrderQty: 100,
                contents: JSON.stringify(['Cotton Buds (4 pcs)', 'Cotton Pads (2 pcs)', 'Nail File', 'Ear Buds']),
                packing: 'Box of 100',
            },
            // Accessories
            {
                name: 'Guest Slippers',
                category: 'SLIPPER',
                description: 'Comfortable open-toe slippers with anti-slip sole. Soft and durable.',
                image: '/assets/images/product/1000x1000.png',
                price: 18.00,
                minOrderQty: 50,
                material: 'Non-woven fabric with EVA sole',
                color: 'White, Brown, Grey',
                dimensions: 'Universal fit (28cm)',
            },
            {
                name: 'Premium Coaster',
                category: 'COASTER',
                description: 'Elegant coasters with hotel branding option. Protects surfaces from moisture.',
                image: '/assets/images/product/1000x1000.png',
                price: 3.00,
                minOrderQty: 200,
                material: 'Premium cardboard with glossy finish',
                color: 'White, Cream, Black',
                dimensions: '9cm diameter (Round) / 9x9cm (Square)',
            },
            {
                name: 'Laundry Bag',
                category: 'LAUNDRY_BAG',
                description: 'Durable laundry bags with drawstring closure. Can be customized with hotel logo.',
                image: '/assets/images/product/1000x1000.png',
                price: 8.00,
                minOrderQty: 100,
                material: 'Non-woven fabric',
                color: 'White, Cream',
                dimensions: 'Small (35x45cm), Medium (45x60cm), Large (60x75cm)',
            },
            {
                name: 'Garbage Bag',
                category: 'GARBAGE_BAG',
                description: 'High-quality waste bags for in-room bins. Leak-proof and odor-resistant.',
                image: '/assets/images/product/1000x1000.png',
                price: 2.50,
                minOrderQty: 500,
                material: 'HDPE',
                color: 'Black, Transparent',
                dimensions: '10L, 20L, 35L',
            },
            {
                name: 'Shower Cap',
                category: 'SHOWER_CAP',
                description: 'Waterproof shower caps with elastic band. One size fits all.',
                image: '/assets/images/product/1000x1000.png',
                price: 2.00,
                minOrderQty: 200,
                material: 'PE (Polyethylene)',
                color: 'White, Clear',
            },
            {
                name: 'Guest Comb',
                category: 'COMB',
                description: 'High-quality combs in individual packaging. Pocket-sized for convenience.',
                image: '/assets/images/product/1000x1000.png',
                price: 1.50,
                minOrderQty: 200,
                material: 'ABS Plastic',
                color: 'Black, White',
                dimensions: 'Pocket (13cm), Wide-tooth (18cm)',
            },
        ];

        await prisma.hotelAmenity.createMany({
            data: amenities.map((a, index) => ({
                ...a,
                priority: amenities.length - index,
            })),
        });

        return NextResponse.json({ success: true, count: amenities.length });
    } catch (error) {
        console.error('Error seeding amenities:', error);
        return NextResponse.json({ error: 'Failed to seed amenities' }, { status: 500 });
    }
}
