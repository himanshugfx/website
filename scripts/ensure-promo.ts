import prisma from '../src/lib/prisma';

async function main() {
    await prisma.promoCode.upsert({
        where: { code: 'SAVE5' },
        update: {},
        create: {
            code: 'SAVE5',
            discountType: 'PERCENTAGE',
            discountValue: 5,
            minOrderValue: 0,
            isActive: true,
        },
    });
    console.log('SAVE5 promo code ensured.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
