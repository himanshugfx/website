const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProduct() {
  const product = await prisma.product.findUnique({
    where: { slug: 'facewash-100ml-sunscreen-bundle' }
  });
  if (product) {
    console.log('Product found:', product.name, 'Price:', product.price);
  } else {
    console.log('Product NOT found');
  }
  await prisma.$disconnect();
}

checkProduct();
