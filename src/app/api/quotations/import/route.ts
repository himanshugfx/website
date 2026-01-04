import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getEstimates } from '@/lib/zoho';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const zohoResponse = await getEstimates({ per_page: 200 });

        if (zohoResponse.code !== 0) {
            return NextResponse.json({ error: 'Failed to fetch from Zoho' }, { status: 500 });
        }

        let imported = 0;
        let updated = 0;

        for (const estimate of zohoResponse.estimates) {
            const existingQuotation = await prisma.quotation.findUnique({
                where: { zohoEstimateId: estimate.estimate_id },
            });

            // Map Zoho status to our status
            const statusMap: Record<string, string> = {
                draft: 'DRAFT',
                sent: 'SENT',
                accepted: 'ACCEPTED',
                declined: 'DECLINED',
                expired: 'EXPIRED',
                invoiced: 'INVOICED',
            };

            const quotationData = {
                quotationNumber: estimate.estimate_number,
                customerId: estimate.customer_id,
                customerName: estimate.customer_name,
                status: statusMap[estimate.status.toLowerCase()] || 'DRAFT',
                total: estimate.total,
                subtotal: estimate.sub_total,
                discount: estimate.discount,
                tax: estimate.tax_total,
                quotationDate: new Date(estimate.date),
                expiryDate: estimate.expiry_date ? new Date(estimate.expiry_date) : null,
                notes: estimate.notes || null,
                terms: estimate.terms || null,
                lineItems: estimate.line_items,
                syncedAt: new Date(),
            };

            if (existingQuotation) {
                await prisma.quotation.update({
                    where: { id: existingQuotation.id },
                    data: quotationData,
                });
                updated++;
            } else {
                await prisma.quotation.create({
                    data: {
                        ...quotationData,
                        zohoEstimateId: estimate.estimate_id,
                    },
                });
                imported++;
            }
        }

        return NextResponse.json({
            success: true,
            imported,
            updated,
            total: zohoResponse.estimates.length,
        });
    } catch (error) {
        console.error('Error importing quotations from Zoho:', error);
        return NextResponse.json({ error: 'Failed to import quotations' }, { status: 500 });
    }
}
