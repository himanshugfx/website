import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST: Convert a quotation into an invoice
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin(request);
        const { id } = await params;

        const quotation = await prisma.quotation.findUnique({ where: { id } });
        if (!quotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        // Generate invoice number
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

        // Create invoice from quotation data
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                customerName: quotation.customerName,
                customerEmail: quotation.customerEmail,
                invoiceDate: new Date(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                lineItems: quotation.lineItems || [],
                subtotal: quotation.subtotal,
                discount: quotation.discount,
                taxAmount: quotation.tax,
                total: quotation.total,
                balance: quotation.total,
                notes: quotation.notes,
                terms: quotation.terms,
                status: 'DRAFT',
            },
        });

        // Mark quotation as invoiced
        await prisma.quotation.update({
            where: { id },
            data: { status: 'INVOICED' },
        });

        return NextResponse.json({ success: true, invoiceId: invoice.id });
    } catch (error: any) {
        console.error('Convert to invoice error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
