import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { getInvoices } from '@/lib/zoho';

import { authOptions } from '@/lib/auth';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as { role?: string })?.role !== 'admin') {
            console.log('Unauthorized access attempt:', session?.user);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

            for (const invoice of response.invoices) {
                // Upsert invoice to database
                await prisma.invoice.upsert({
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
                    },
                });
                syncedCount++;
            }

            hasMore = response.page_context?.has_more_page || false;
            page++;
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
