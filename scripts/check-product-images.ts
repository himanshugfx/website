/**
 * Script to check current product images in database
 * Run with: npx tsx scripts/check-product-images.ts
 */

import prisma from '../src/lib/prisma';

async function main() {
    console.log('Checking product images in database...\n');

    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            thumbImage: true,
            images: true
        }
    });

    console.log(`Found ${products.length} products\n`);

    for (const product of products) {
        console.log(`Product: ${product.name}`);
        console.log(`  Slug: ${product.slug}`);
        console.log(`  ThumbImage: ${product.thumbImage}`);
        console.log(`  Images: ${product.images}`);
        console.log('');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
