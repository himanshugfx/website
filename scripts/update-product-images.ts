/**
 * Script to update all product images in the database to use local paths
 * Run with: npx tsx scripts/update-product-images.ts
 */

import prisma from '../src/lib/prisma';

const DEFAULT_IMAGE = '/assets/images/product/1000x1000.png';

async function main() {
    console.log('Updating product images to local paths...\n');

    // Get all products
    const products = await prisma.product.findMany();

    console.log(`Found ${products.length} products\n`);

    for (const product of products) {
        let thumbImage = product.thumbImage;
        let images = product.images;
        let needsUpdate = false;

        // Check if thumbImage is an external URL or JSON
        if (thumbImage) {
            try {
                // Try to parse if it's JSON
                if (thumbImage.startsWith('[') || thumbImage.startsWith('"')) {
                    const parsed = JSON.parse(thumbImage);
                    const firstImage = Array.isArray(parsed) ? parsed[0] : parsed;

                    // Check if it's an external URL
                    if (firstImage && (firstImage.includes('anosebeauty.com') || firstImage.startsWith('http'))) {
                        thumbImage = DEFAULT_IMAGE;
                        needsUpdate = true;
                    }
                } else if (thumbImage.includes('anosebeauty.com') || thumbImage.startsWith('http')) {
                    thumbImage = DEFAULT_IMAGE;
                    needsUpdate = true;
                }
            } catch (e) {
                // If parse fails and it's an external URL
                if (thumbImage.includes('anosebeauty.com') || thumbImage.startsWith('http')) {
                    thumbImage = DEFAULT_IMAGE;
                    needsUpdate = true;
                }
            }
        } else {
            thumbImage = DEFAULT_IMAGE;
            needsUpdate = true;
        }

        // Check images field
        if (images) {
            try {
                const parsed = JSON.parse(images);
                if (Array.isArray(parsed)) {
                    const updatedImages = parsed.map(img => {
                        if (img && (img.includes('anosebeauty.com') || img.startsWith('http'))) {
                            needsUpdate = true;
                            return DEFAULT_IMAGE;
                        }
                        return img;
                    });
                    images = JSON.stringify(updatedImages);
                }
            } catch (e) {
                // Keep original if parse fails
            }
        } else {
            images = JSON.stringify([DEFAULT_IMAGE]);
            needsUpdate = true;
        }

        if (needsUpdate) {
            console.log(`Updating: ${product.name}`);
            console.log(`  Old thumb: ${product.thumbImage?.substring(0, 60)}...`);
            console.log(`  New thumb: ${thumbImage}`);

            await prisma.product.update({
                where: { id: product.id },
                data: {
                    thumbImage,
                    images
                }
            });

            console.log('  ✓ Updated\n');
        } else {
            console.log(`Skipping: ${product.name} (already using local paths)\n`);
        }
    }

    console.log('\n=== Done! ===');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
