const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date('2026-04-01T00:00:00Z'),
          lt: new Date('2027-04-01T00:00:00Z')
        }
      },
      include: {
        items: true
      }
    });

    console.log(`Found ${orders.length} completed orders in FY 2026-27`);

    for (const order of orders) {
      const invoice = await prisma.invoice.findFirst({
        where: { orderId: order.id }
      });

      if (!invoice) {
        console.log(`Order #${order.orderNumber} (ID: ${order.id}) is MISSING invoice!`);
      } else {
        console.log(`Order #${order.orderNumber} has invoice: ${invoice.invoiceNumber}`);
      }
    }

  } catch(e) { 
    console.error(e); 
  } finally { 
    await prisma.$disconnect(); 
  }
}

check();
