const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const product = await p.product.findFirst({
        select: {
            id: true,
            name: true,
            thumbImage: true,
            images: true,
            videoUrl: true
        }
    });
    console.log('Product:', JSON.stringify(product, null, 2));

    if (product && product.thumbImage) {
        const media = await p.media.findFirst({
            where: { id: product.thumbImage },
            select: { id: true, name: true, mimeType: true, size: true }
        });
        console.log('Media:', JSON.stringify(media, null, 2));
    }
}

main().then(() => p.$disconnect());
