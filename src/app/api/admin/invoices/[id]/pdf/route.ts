import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInvoicePdfBuffer } from '@/lib/zoho';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as { role?: string })?.role !== 'admin') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = params;

        // Find invoice in database to get zohoInvoiceId
        const invoice = await prisma.invoice.findUnique({
            where: { id },
        });

        if (!invoice) {
            return new NextResponse('Invoice not found', { status: 404 });
        }

        const pdfBuffer = await getInvoicePdfBuffer(invoice.zohoInvoiceId);

        return new NextResponse(pdfBuffer, {
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
