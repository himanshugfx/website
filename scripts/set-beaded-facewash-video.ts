/**
 * Script to set default video for Beaded Facewash products
 * Run with: npx tsx scripts/set-beaded-facewash-video.ts
 */

import prisma from '../src/lib/prisma';

const FACEWASH_VIDEO_PATH = '/assets/images/product/facewash video.mp4';

async function main() {
    console.log('Setting video for Beaded Facewash products...\n');

    // Find all products that are facewash type and have "beaded" in the name
    const beadedFacewashProducts = await prisma.product.findMany({
        where: {
            type: {
                equals: 'facewash',
                mode: 'insensitive'
            },
            name: {
                contains: 'beaded',
                mode: 'insensitive'
            }
        }
    });

    console.log(`Found ${beadedFacewashProducts.length} Beaded Facewash products\n`);

    for (const product of beadedFacewashProducts) {
        console.log(`Updating: ${product.name}`);

        await prisma.product.update({
            where: { id: product.id },
            data: {
                videoUrl: FACEWASH_VIDEO_PATH
            }
        });

        console.log(`  ✓ Set video to: ${FACEWASH_VIDEO_PATH}\n`);
    }

    console.log('\n=== Done! ===');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
