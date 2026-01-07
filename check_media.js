const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    // Check media table
    const media = await p.media.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, mimeType: true, size: true, createdAt: true }
    });
    console.log('Recent Media:', JSON.stringify(media, null, 2));

    // Check products with thumbImage that looks like a cuid
    const products = await p.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, name: true, thumbImage: true, images: true }
    });
    console.log('Recent Products:', JSON.stringify(products, null, 2));
}

main().then(() => p.$disconnect());
