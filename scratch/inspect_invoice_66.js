const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const orderNumber = 66; // From user's context
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true }
    });

    if (!order) {
      console.log("Order not found");
      return;
    }

    const invoice = await prisma.invoice.findFirst({
      where: { orderId: order.id }
    });

    console.log("Order #66:", JSON.stringify(order, null, 2));
    console.log("Invoice for #66:", JSON.stringify(invoice, null, 2));

  } catch(e) { console.error(e); }
  finally { await prisma.$disconnect(); }
}
check();
