const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    // Find the test product
    const testProduct = await p.product.findFirst({
        where: { name: { contains: 'Test Product' } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, thumbImage: true, images: true, createdAt: true }
    });
    console.log('Test Product:', JSON.stringify(testProduct, null, 2));

    // Check recent media
    const media = await p.media.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, mimeType: true, size: true, createdAt: true }
    });
    console.log('Recent Media:', JSON.stringify(media, null, 2));

    // Check if thumbImage matches a media ID
    if (testProduct && testProduct.thumbImage) {
        const matchingMedia = await p.media.findUnique({
            where: { id: testProduct.thumbImage },
            select: { id: true, name: true }
        });
        console.log('Matching Media for thumbImage:', JSON.stringify(matchingMedia, null, 2));
    }
}

main().then(() => p.$disconnect());
