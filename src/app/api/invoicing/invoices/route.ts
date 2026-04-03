import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/prisma';
import { sendAdminPushNotification } from '@/lib/notifications';
import { getFinancialYear } from '@/lib/invoicing';

export const dynamic = 'force-dynamic';

// GET: List invoices with stats
export async function GET(request: Request) {
    try {
        await requireAdmin(request);

        const invoices = await prisma.invoice.findMany({
            orderBy: { invoiceNumber: 'desc' },
        });

        const stats = {
            total: invoices.length,
            paid: invoices.filter(i => i.status === 'PAID').length,
            partiallyPaid: invoices.filter(i => ['DRAFT', 'SENT', 'PARTIALLY_PAID'].includes(i.status)).length,
            overdue: invoices.filter(i => i.status === 'OVERDUE').length,
            totalAmount: invoices.filter(i => i.status !== 'VOID').reduce((sum, i) => sum + i.total, 0),
            paidAmount: invoices.filter(i => i.status !== 'VOID').reduce((sum, i) => sum + (i.total - i.balance), 0),
            partiallyPaidPaidAmount: invoices.filter(i => ['DRAFT', 'SENT', 'PARTIALLY_PAID'].includes(i.status)).reduce((sum, i) => sum + (i.total - i.balance), 0),
            partiallyPaidDueAmount: invoices.filter(i => ['DRAFT', 'SENT', 'PARTIALLY_PAID'].includes(i.status)).reduce((sum, i) => sum + i.balance, 0),
            overdueAmount: invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.balance, 0),
        };

        return NextResponse.json({ invoices, stats });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new invoice locally
export async function POST(request: Request) {
    try {
        await requireAdmin(request);
        const body = await request.json();

        const { customerName, customerEmail, customerPhone, billingAddress, shippingAddress, invoiceDate, dueDate, lineItems, notes, terms, taxRate, discount, discountType } = body;

        if (!customerName || !lineItems || lineItems.length === 0) {
            return NextResponse.json({ error: 'Customer name and at least one line item are required' }, { status: 400 });
        }

        // Auto-generate invoice number: INV[FY]/0000
        const fy = getFinancialYear();
        const prefix = `INV${fy}/`;

        const lastInvoice = await prisma.invoice.findFirst({
            where: { invoiceNumber: { startsWith: prefix } },
            orderBy: { invoiceNumber: 'desc' },
        });

        let nextNum = 1;
        if (lastInvoice) {
            const parts = lastInvoice.invoiceNumber.split('/');
            if (parts.length > 1) {
                const lastNum = parseInt(parts[1], 10);
                if (!isNaN(lastNum)) nextNum = lastNum + 1;
            }
        }
        const invoiceNumber = `${prefix}${String(nextNum).padStart(4, '0')}`;

        // Calculate totals
        const items = lineItems.map((item: any) => {
            const quantity = Number(item.quantity) || 0;
            const rate = Number(item.rate) || 0;
            const itemTaxRate = Number(item.taxRate) || 0;
            const amount = quantity * rate;
            const itemTaxAmount = (amount * itemTaxRate) / 100;
            
            return {
                name: item.name,
                description: item.description || '',
                quantity,
                rate,
                amount,
                hsnCode: item.hsnCode || '',
                taxRate: itemTaxRate,
                taxAmount: itemTaxAmount,
                total: amount + itemTaxAmount
            };
        });

        const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
        const totalTaxAmount = items.reduce((sum: number, item: any) => sum + (item.taxAmount || 0), 0);

        let discountAmount = 0;
        if (discount && discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * Number(discount)) / 100;
        } else if (discount) {
            discountAmount = Number(discount);
        }

        const total = subtotal + totalTaxAmount - discountAmount;

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                customerName,
                customerEmail: customerEmail || null,
                customerPhone: customerPhone || null,
                billingAddress: billingAddress || null,
                shippingAddress: shippingAddress || null,
                invoiceDate: new Date(invoiceDate || new Date()),
                dueDate: dueDate ? new Date(dueDate) : null,
                lineItems: items,
                notes: notes || null,
                terms: terms || null,
                subtotal,
                discount: discountAmount,
                discountType: discountType || null,
                taxRate: Number(taxRate || 0),
                taxAmount: totalTaxAmount,
                total,
                balance: total,
                status: 'DRAFT',
            },
        });

        // Send push notification to admin devices
        sendAdminPushNotification(
            '📄 New Invoice Created',
            `${invoice.invoiceNumber} — ${invoice.customerName} (₹${invoice.total.toLocaleString('en-IN')})`,
            { type: 'new_invoice', invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber }
        ).catch(err => console.error('Failed to send invoice push notification:', err));

        return NextResponse.json({ success: true, invoice });
    } catch (error: any) {
        console.error('Create invoice error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
