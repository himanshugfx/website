import prisma from '../src/lib/prisma';

async function main() {
  console.log('Testing Homepage Data Fetch...');
  try {
    console.time('bestSellers');
    const bestSellers = await prisma.product.findMany({
      take: 8,
      where: { bestSeller: true },
      orderBy: { sold: 'desc' },
    });
    console.timeEnd('bestSellers');
    console.log(`Found ${bestSellers.length} best sellers`);

    console.time('onSale');
    const onSale = await prisma.product.findMany({
      take: 8,
      where: { sale: true },
      orderBy: { createdAt: 'desc' },
    });
    console.timeEnd('onSale');
    console.log(`Found ${onSale.length} items on sale`);

    console.time('newArrivals');
    const newArrivals = await prisma.product.findMany({
      take: 8,
      where: { new: true },
      orderBy: { createdAt: 'desc' },
    });
    console.timeEnd('newArrivals');
    console.log(`Found ${newArrivals.length} new arrivals`);

    // Also check total products count
    const totalProducts = await prisma.product.count();
    console.log(`Total products in database: ${totalProducts}`);

    if (totalProducts > 0) {
      const sample = await prisma.product.findFirst();
      console.log('Sample Product:', {
        id: sample?.id,
        name: sample?.name,
        bestSeller: sample?.bestSeller,
        sale: sample?.sale,
        new: sample?.new,
      });
    }

  } catch (error) {
    console.error('Error during fetch:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
