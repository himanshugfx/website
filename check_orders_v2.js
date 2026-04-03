const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const orders = await prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        transactionId: true,
        paymentMethod: true,
        createdAt: true,
        customerName: true
      }
    });
    console.log(JSON.stringify(orders, null, 2));
  } catch(e) { console.error(e.message); }
  finally { await prisma.$disconnect(); }
}
check();
