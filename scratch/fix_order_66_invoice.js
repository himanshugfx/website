const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const orderId = 'cmo1ibljz0006l504n49sjkt9'; // Order #66
  console.log(`Generating missing invoice for Order #66 (ID: ${orderId})...`);
  
  try {
    // We need to import the function, but it's a TS file and we are running in JS.
    // However, the project seems to use Next.js so we can't easily run TS from node without ts-node.
    // I'll just write a standalone script that uses Prisma directly to create the invoice,
    // copying the logic from createInvoiceFromOrder.
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      console.error("Order not found!");
      return;
    }

    // Logic from invoicing.ts
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: 'INV2026-27/'
        }
      },
      orderBy: {
        invoiceNumber: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split('/');
      if (parts.length > 1) {
        const lastNum = parseInt(parts[1], 10);
        if (!isNaN(lastNum)) {
          nextNumber = lastNum + 1;
        }
      }
    }

    const invoiceNumber = `INV2026-27/${String(nextNumber).padStart(4, '0')}`;
    const taxRate = 18;

    const items = order.items.map(item => {
      const priceIncl = item.price;
      const priceExcl = priceIncl / (1 + (taxRate / 100));
      const totalTax = priceIncl - priceExcl;
      
      return {
        name: item.product.name,
        description: `${item.product.brand} - ${item.product.category}`,
        quantity: item.quantity,
        rate: Number(priceExcl.toFixed(2)),
        amount: Number((priceExcl * item.quantity).toFixed(2)),
        hsnCode: item.product.hsnCode || '3304',
        taxRate: taxRate,
        taxAmount: Number((totalTax * item.quantity).toFixed(2)),
        total: Number((priceIncl * item.quantity).toFixed(2))
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
    const totalTaxAmount = items.reduce((sum, i) => sum + i.taxAmount, 0);
    
    await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        customerName: order.customerName || "Customer",
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        billingAddress: order.address,
        shippingAddress: order.address,
        invoiceDate: new Date(),
        subtotal: Number(subtotal.toFixed(2)),
        taxRate: taxRate,
        taxAmount: Number(totalTaxAmount.toFixed(2)),
        discount: order.discountAmount,
        total: order.total,
        balance: 0,
        status: 'PAID',
        lineItems: items,
        notes: `Auto-generated from Order #${order.orderNumber}`,
        terms: "Inclusive of all taxes."
      }
    });

    console.log(`Successfully generated invoice ${invoiceNumber} for Order #66`);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
