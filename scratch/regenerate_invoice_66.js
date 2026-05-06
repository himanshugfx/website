const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const orderId = 'cmo1ibljz0006l504n49sjkt9'; // Order #66
  
  try {
    // 1. Delete existing invoice for this order
    const deleted = await prisma.invoice.deleteMany({
      where: { orderId }
    });
    console.log(`Deleted ${deleted.count} old invoice(s) for Order #66`);

    // 2. Fetch order with items
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

    // Determine next invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: 'INV2026-27/' } },
      orderBy: { invoiceNumber: 'desc' }
    });
    let nextNum = 1;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split('/');
      if (parts.length > 1) {
        const lastNum = parseInt(parts[1], 10);
        if (!isNaN(lastNum)) nextNum = lastNum + 1;
      }
    }
    const invoiceNumber = `INV2026-27/${String(nextNum).padStart(4, '0')}`;
    const taxRate = 18;

    // Fixed calculation logic
    const items = order.items.map(item => {
      const priceInclTotal = item.price;
      const priceExclTotal = priceInclTotal / (1 + (taxRate / 100));
      const lineTaxTotal = priceInclTotal - priceExclTotal;
      
      return {
        name: item.product.name,
        description: `${item.product.brand} - ${item.product.category}`,
        quantity: item.quantity,
        rate: Number((priceExclTotal / item.quantity).toFixed(2)),
        amount: Number(priceExclTotal.toFixed(2)),
        hsnCode: item.product.hsnCode || '3304',
        taxRate: taxRate,
        taxAmount: Number(lineTaxTotal.toFixed(2)),
        total: Number(priceInclTotal.toFixed(2))
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
    const totalTaxAmount = items.reduce((sum, i) => sum + i.taxAmount, 0);

    const invoice = await prisma.invoice.create({
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
        notes: `Auto-generated from Order #66`,
        terms: "Inclusive of all taxes."
      }
    });

    console.log(`Regenerated invoice ${invoiceNumber} for Order #66`);
    console.log(`Subtotal: ${invoice.subtotal}, Tax: ${invoice.taxAmount}, Total: ${invoice.total}`);

  } catch(e) { console.error(e); }
  finally { await prisma.$disconnect(); }
}
fix();
