import prisma from '../src/lib/prisma';

async function seedAmenities() {
    console.log('Checking existing amenities...');
    const existingCount = await prisma.hotelAmenity.count();
    console.log('Existing amenities:', existingCount);

    if (existingCount > 0) {
        console.log('Already seeded! Skipping...');
        await prisma.$disconnect();
        return;
    }

    console.log('Seeding hotel amenities...');

    const amenities = [
        { name: 'Luxury Shampoo', category: 'COSMETIC', image: '/assets/images/product/1000x1000.png', price: 8.00, minOrderQty: 100, sizes: JSON.stringify(['30ml', '50ml', '100ml']), packing: 'Box of 100', description: 'Premium herbal shampoo with natural extracts', priority: 16 },
        { name: 'Silky Conditioner', category: 'COSMETIC', image: '/assets/images/product/1000x1000.png', price: 9.00, minOrderQty: 100, sizes: JSON.stringify(['30ml', '50ml']), packing: 'Box of 100', description: 'Deep conditioning formula for smooth hair', priority: 15 },
        { name: 'Body Lotion', category: 'COSMETIC', image: '/assets/images/product/1000x1000.png', price: 7.50, minOrderQty: 100, sizes: JSON.stringify(['30ml', '50ml']), packing: 'Box of 100', description: 'Moisturizing body lotion with vitamin E', priority: 14 },
        { name: 'Shower Gel', category: 'COSMETIC', image: '/assets/images/product/1000x1000.png', price: 7.00, minOrderQty: 100, sizes: JSON.stringify(['30ml', '50ml']), packing: 'Box of 100', description: 'Refreshing shower gel with herbal essence', priority: 13 },
        { name: 'Dental Kit', category: 'DENTAL_KIT', image: '/assets/images/product/1000x1000.png', price: 12.00, minOrderQty: 100, contents: JSON.stringify(['Toothbrush', 'Toothpaste 10g']), packing: 'Box of 100', description: 'Complete dental hygiene kit', priority: 12 },
        { name: 'Premium Dental Kit', category: 'DENTAL_KIT', image: '/assets/images/product/1000x1000.png', price: 18.00, minOrderQty: 50, contents: JSON.stringify(['Bamboo Toothbrush', 'Herbal Toothpaste 15g', 'Mouthwash 10ml']), packing: 'Box of 50', description: 'Eco-friendly premium dental kit', priority: 11 },
        { name: 'Shaving Kit', category: 'SHAVING_KIT', image: '/assets/images/product/1000x1000.png', price: 15.00, minOrderQty: 100, contents: JSON.stringify(['Twin Blade Razor', 'Shaving Cream 15g']), packing: 'Box of 100', description: 'Premium shaving kit for men', priority: 10 },
        { name: 'Vanity Kit', category: 'VANITY_KIT', image: '/assets/images/product/1000x1000.png', price: 20.00, minOrderQty: 100, contents: JSON.stringify(['Cotton Buds', 'Cotton Pads', 'Nail File', 'Hair Ties']), packing: 'Box of 100', description: 'Complete vanity essentials', priority: 9 },
        { name: 'Guest Slippers', category: 'SLIPPER', image: '/assets/images/product/1000x1000.png', price: 18.00, minOrderQty: 50, material: 'Non-woven fabric', color: 'White, Brown, Grey', dimensions: 'Free Size', description: 'Comfortable disposable guest slippers', priority: 8 },
        { name: 'Wooden Coasters', category: 'COASTER', image: '/assets/images/product/1000x1000.png', price: 25.00, minOrderQty: 100, material: 'Wood', color: 'Natural Brown', dimensions: '9cm diameter', description: 'Elegant wooden coasters with logo option', priority: 7 },
        { name: 'Laundry Bag', category: 'LAUNDRY_BAG', image: '/assets/images/product/1000x1000.png', price: 12.00, minOrderQty: 100, material: 'Non-woven fabric', color: 'White, Beige', dimensions: '40x50cm', description: 'Durable laundry bag with drawstring', priority: 6 },
        { name: 'Garbage Bag Set', category: 'GARBAGE_BAG', image: '/assets/images/product/1000x1000.png', price: 8.00, minOrderQty: 500, material: 'Biodegradable plastic', color: 'Black, Green', dimensions: 'Medium, Large', description: 'Eco-friendly garbage bags', priority: 5 },
        { name: 'Shower Cap', category: 'SHOWER_CAP', image: '/assets/images/product/1000x1000.png', price: 3.00, minOrderQty: 500, material: 'Plastic', color: 'Transparent, White', description: 'Disposable shower cap', priority: 4 },
        { name: 'Hair Comb', category: 'COMB', image: '/assets/images/product/1000x1000.png', price: 5.00, minOrderQty: 200, material: 'Plastic', color: 'Black, Brown', dimensions: '15cm', description: 'Compact hair comb', priority: 3 },
    ];

    await prisma.hotelAmenity.createMany({ data: amenities });
    console.log('Seeded', amenities.length, 'hotel amenities successfully!');

    await prisma.$disconnect();
}

seedAmenities();
