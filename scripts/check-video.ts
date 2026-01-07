import prisma from '../src/lib/prisma';

async function main() {
    const products = await prisma.product.findMany({
        where: {
            name: { contains: 'Beaded', mode: 'insensitive' }
        },
        select: { name: true, videoUrl: true }
    });
    console.log('Beaded products:');
    console.log(JSON.stringify(products, null, 2));
}

main().finally(() => prisma.$disconnect());
