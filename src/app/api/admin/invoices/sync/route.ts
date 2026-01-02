import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getInvoices } from '@/lib/zoho';
import { requireAdmin } from '@/lib/admin/auth';

export async function POST() {
    try {
        await requireAdmin();

        // Check if Zoho is configured
        if (!process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_REFRESH_TOKEN) {
            return NextResponse.json(
                { error: 'Zoho Invoice is not configured. Please add your API credentials.' },
                { status: 400 }
            );
        }

        // Fetch invoices from Zoho (paginated)
        let page = 1;
        let hasMore = true;
        let syncedCount = 0;

        while (hasMore && page <= 100) { // Limit to 100 pages (5000 invoices max)
            const response = await getInvoices({ page, per_page: 50 });

            if (response && response.invoices && Array.isArray(response.invoices)) {
                // Use Promise.all for concurrent processing
                await Promise.all(response.invoices.map(async (invoice) => {
                    // Upsert invoice to database
                    const savedInvoice = await prisma.invoice.upsert({
                        where: { zohoInvoiceId: invoice.invoice_id },
                        update: {
                            invoiceNumber: invoice.invoice_number,
                            customerId: invoice.customer_id,
                            customerName: invoice.customer_name,
                            status: invoice.status.toUpperCase(),
                            total: invoice.total,
                            balance: invoice.balance,
                            dueDate: invoice.due_date ? new Date(invoice.due_date) : null,
                            invoiceDate: new Date(invoice.date),
                            syncedAt: new Date(),
                            // Don't update pdfUrl here to avoid overwriting with placeholder if it exists
                        },
                        create: {
                            zohoInvoiceId: invoice.invoice_id,
                            invoiceNumber: invoice.invoice_number,
                            customerId: invoice.customer_id,
                            customerName: invoice.customer_name,
                            status: invoice.status.toUpperCase(),
                            total: invoice.total,
                            balance: invoice.balance,
                            dueDate: invoice.due_date ? new Date(invoice.due_date) : null,
                            invoiceDate: new Date(invoice.date),
                            pdfUrl: '', // Initialize empty, will update below
                        },
                    });

                    // Ensure PDF URL is set with the correct local ID
                    const expectedPdfUrl = `/api/admin/invoices/${savedInvoice.id}/pdf`;
                    if (savedInvoice.pdfUrl !== expectedPdfUrl) {
                        await prisma.invoice.update({
                            where: { id: savedInvoice.id },
                            data: { pdfUrl: expectedPdfUrl }
                        });
                    }

                    syncedCount++; // Note: incrementing simple counter inside async map isn't perfectly atomic for accurate final count but fine for this loop logic
                }));

                hasMore = response.page_context?.has_more_page || false;
                page++;
            } else {
                hasMore = false;
            }
        }

        // Redirect back to invoices page
        return NextResponse.redirect(new URL('/admin/invoices', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
    } catch (error) {
        console.error('Invoice sync error:', error);
        return NextResponse.json(
            { error: 'Failed to sync invoices from Zoho' },
            { status: 500 }
        );
    }
}
