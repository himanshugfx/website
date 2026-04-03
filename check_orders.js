const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const orders = await prisma.order.findMany({
      take: 10,
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
    console.log("Latest Orders:", JSON.stringify(orders, null, 2));

    const totalOrders = await prisma.order.count();
    console.log("Total Orders Count:", totalOrders);

    const pendingProcessing = await prisma.order.count({
      where: { status: { in: ['PENDING', 'PROCESSING'] } }
    });
    console.log("Pending/Processing Orders Count:", pendingProcessing);
  } catch(e) { console.error(e.message); }
  finally { await prisma.$disconnect(); }
}
check();
