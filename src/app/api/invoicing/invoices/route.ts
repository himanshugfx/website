import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/prisma';

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
            partiallyPaidAmount: invoices.filter(i => ['DRAFT', 'SENT', 'PARTIALLY_PAID'].includes(i.status)).reduce((sum, i) => sum + i.balance, 0),
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

        const { customerName, customerEmail, customerPhone, invoiceDate, dueDate, lineItems, notes, terms, taxRate, discount, discountType } = body;

        if (!customerName || !lineItems || lineItems.length === 0) {
            return NextResponse.json({ error: 'Customer name and at least one line item are required' }, { status: 400 });
        }

        // Auto-generate invoice number: INV-YYYY-NNNN
        const year = new Date().getFullYear();
        const lastInvoice = await prisma.invoice.findFirst({
            where: { invoiceNumber: { startsWith: `INV-${year}` } },
            orderBy: { invoiceNumber: 'desc' },
        });

        let nextNum = 1;
        if (lastInvoice) {
            const match = lastInvoice.invoiceNumber.match(/INV-\d{4}-(\d+)/);
            if (match) nextNum = parseInt(match[1]) + 1;
        }
        const invoiceNumber = `INV-${year}-${String(nextNum).padStart(4, '0')}`;

        // Calculate totals
        const items = lineItems.map((item: any) => ({
            name: item.name,
            description: item.description || '',
            quantity: Number(item.quantity),
            rate: Number(item.rate),
            amount: Number(item.quantity) * Number(item.rate),
            hsnCode: item.hsnCode || '',
        }));

        const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);

        let discountAmount = 0;
        if (discount && discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * Number(discount)) / 100;
        } else if (discount) {
            discountAmount = Number(discount);
        }

        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxRate ? (taxableAmount * Number(taxRate)) / 100 : 0;
        const total = taxableAmount + taxAmount;

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                customerName,
                customerEmail: customerEmail || null,
                customerPhone: customerPhone || null,
                invoiceDate: new Date(invoiceDate || new Date()),
                dueDate: dueDate ? new Date(dueDate) : null,
                lineItems: items,
                notes: notes || null,
                terms: terms || null,
                subtotal,
                discount: discountAmount,
                discountType: discountType || null,
                taxRate: Number(taxRate || 0),
                taxAmount,
                total,
                balance: total,
                status: 'DRAFT',
            },
        });

        return NextResponse.json({ success: true, invoice });
    } catch (error: any) {
        console.error('Create invoice error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
