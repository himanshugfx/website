import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { getInvoicePdfBuffer } from '@/lib/zoho';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(request);
        const { id } = await params;

        // Find invoice in database to get zohoInvoiceId
        const invoice = await prisma.invoice.findUnique({
            where: { id },
        });

        if (!invoice) {
            return new NextResponse('Invoice not found', { status: 404 });
        }

        const pdfBuffer = await getInvoicePdfBuffer(invoice.zohoInvoiceId);

        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error serving invoice PDF:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
