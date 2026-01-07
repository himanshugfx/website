/**
 * Script to restore product images from uploads folder
 * Run with: npx tsx scripts/restore-product-images.ts
 */

import prisma from '../src/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Known product-to-image mappings based on filenames
// These are approximate mappings - adjust as needed
const productImageMappings: Record<string, string[]> = {
    // Shampoo products - based on the shampoo image we saw
    'hibiscus-shampoo-100ml': ['/uploads/1767096909817-1.png'],
    'hibiscus-shampoo-200ml': ['/uploads/1767096926177-1.png'],
    // Face cream
    'anose-face-cream-15g': ['/uploads/1767097025150-face-cream-transparent.jpg'],
};

async function main() {
    console.log('Restoring product images from uploads folder...\n');

    // List all files in uploads
    const uploadFiles = fs.readdirSync(UPLOADS_DIR);
    console.log('Available upload files:');
    uploadFiles.forEach(file => console.log(`  /uploads/${file}`));
    console.log('');

    // Update products with known mappings
    for (const [slug, images] of Object.entries(productImageMappings)) {
        const product = await prisma.product.findFirst({
            where: { slug }
        });

        if (product) {
            console.log(`Updating: ${product.name} (${slug})`);
            console.log(`  Setting images: ${images.join(', ')}`);

            await prisma.product.update({
                where: { id: product.id },
                data: {
                    thumbImage: images[0],
                    images: JSON.stringify(images)
                }
            });

            console.log('  ✓ Updated\n');
        } else {
            console.log(`Product not found: ${slug}\n`);
        }
    }

    // For products without mappings, show which ones still use placeholder
    const products = await prisma.product.findMany();
    console.log('\nProducts still using placeholder:');
    for (const product of products) {
        if (product.thumbImage.includes('1000x1000')) {
            console.log(`  - ${product.name} (${product.slug})`);
        }
    }

    console.log('\n=== Done! ===');
    console.log('For products still using placeholder, upload new images via the admin panel.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
