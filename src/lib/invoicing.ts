import prisma from './prisma';

/**
 * Calculates Indian Financial Year string (e.g., "2026-27") for a given date
 */
export function getFinancialYear(date: Date = new Date()): string {
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth(); // 0-indexed, 3 is April

    let startYear: number;
    let endYear: number;

    if (currentMonth >= 3) {
        // From April onwards
        startYear = currentYear;
        endYear = currentYear + 1;
    } else {
        // Jan, Feb, Mar belong to previous year's FY
        startYear = currentYear - 1;
        endYear = currentYear;
    }

    return `${startYear}-${String(endYear).slice(-2)}`;
}

/**
 * Generates an auto-incrementing invoice number for the specified date's financial year
 */
export async function generateInvoiceNumber(date: Date = new Date()): Promise<string> {
    const fy = getFinancialYear(date);
    const prefix = `INV${fy}/`;

    // Find the latest invoice for this financial year
    const lastInvoice = await prisma.invoice.findFirst({
        where: {
            invoiceNumber: {
                startsWith: prefix
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

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Automatically creates an invoice for an order.
 * Assumes prices are inclusive of 18% GST.
 */
export async function createInvoiceFromOrder(orderId: string): Promise<void> {
    try {
        // 1. Check if invoice already exists for this order
        const existingInvoice = await prisma.invoice.findFirst({
            where: { orderId }
        });
        if (existingInvoice) return;

        // 2. Fetch order with items and products
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
            console.error(`Order ${orderId} not found for invoice generation`);
            return;
        }

        // Determine FY based on Order creation date
        const invoiceNumber = await generateInvoiceNumber(order.createdAt);
        const addressData = order.address ? JSON.parse(order.address) : null;
        
        // Use a generic tax rate of 18% (inclusive) as requested
        const taxRate = 18;
        
        // Calculate item breakdowns (Inclusive to Exclusive)
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
                hsnCode: item.product.hsnCode || '3304', // default HSN for cosmetics
                taxRate: taxRate,
                taxAmount: Number((totalTax * item.quantity).toFixed(2)),
                total: Number((priceIncl * item.quantity).toFixed(2))
            };
        });

        const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
        const totalTaxAmount = items.reduce((sum, i) => sum + i.taxAmount, 0);
        
        // Handle discount (proportionally applied to subtotal)
        // Order's total is the final amount paid
        const total = order.total;
        const discount = order.discountAmount;

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
                discount: discount,
                total: total,
                balance: 0, // Always paid for completed website orders
                status: 'PAID', // Always paid for completed website orders
                lineItems: items,
                notes: `Auto-generated from Order #${order.orderNumber}`,
                terms: "Inclusive of all taxes."
            }
        });

        console.log(`Successfully generated invoice ${invoiceNumber} for order #${order.orderNumber}`);

    } catch (error) {
        console.error('Error creating automatic invoice:', error);
    }
}
