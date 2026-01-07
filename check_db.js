const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestProduct() {
    try {
        const product = await prisma.product.findFirst({
            orderBy: { updatedAt: 'desc' },
            select: { id: true, name: true, videoUrl: true, thumbImage: true }
        });
        console.log('Latest product:', product);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLatestProduct();
