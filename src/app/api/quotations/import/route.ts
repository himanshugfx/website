import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getEstimates, getCustomers } from '@/lib/zoho';

export const dynamic = 'force-dynamic';

// Default funnel stages - ensure they exist
const defaultStages = [
    { name: 'NEW', order: 1, color: '#9CA3AF' },
    { name: 'CONTACTED', order: 2, color: '#3B82F6' },
    { name: 'QUALIFIED', order: 3, color: '#8B5CF6' },
    { name: 'PROPOSAL', order: 4, color: '#F59E0B' },
    { name: 'WON', order: 5, color: '#10B981' },
    { name: 'LOST', order: 6, color: '#EF4444' },
];

async function getOrCreateProposalStage(): Promise<string> {
    // Ensure default stages exist
    const existingStages = await prisma.funnelStage.count();
    if (existingStages === 0) {
        for (const stage of defaultStages) {
            await prisma.funnelStage.create({ data: stage });
        }
    }

    // Get the PROPOSAL stage (since quotation = proposal already)
    let proposalStage = await prisma.funnelStage.findFirst({
        where: { name: 'PROPOSAL' },
    });

    if (!proposalStage) {
        proposalStage = await prisma.funnelStage.create({
            data: { name: 'PROPOSAL', order: 4, color: '#F59E0B' },
        });
    }

    return proposalStage.id;
}

export async function POST() {
    try {
        const zohoResponse = await getEstimates({ per_page: 200 });

        if (zohoResponse.code !== 0) {
            return NextResponse.json({ error: 'Failed to fetch from Zoho' }, { status: 500 });
        }

        let imported = 0;
        let updated = 0;
        let leadsCreated = 0;

        // Get the PROPOSAL stage for new leads
        const proposalStageId = await getOrCreateProposalStage();

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
                // Create the quotation
                await prisma.quotation.create({
                    data: {
                        ...quotationData,
                        zohoEstimateId: estimate.estimate_id,
                    },
                });
                imported++;

                // Try to fetch customer email from Zoho and create a lead
                try {
                    // Check if a lead already exists with this customer name
                    const existingLead = await prisma.lead.findFirst({
                        where: {
                            OR: [
                                { name: estimate.customer_name },
                                { company: estimate.customer_name },
                            ],
                        },
                    });

                    if (!existingLead) {
                        // Try to get customer details from Zoho for email
                        let customerEmail = '';
                        try {
                            const customersResponse = await getCustomers({
                                search_text: estimate.customer_name,
                                per_page: 1,
                            });
                            if (customersResponse.contacts && customersResponse.contacts.length > 0) {
                                customerEmail = customersResponse.contacts[0].email || '';
                            }
                        } catch {
                            // Continue without email if we can't fetch it
                        }

                        // Create the lead
                        await prisma.lead.create({
                            data: {
                                name: estimate.customer_name,
                                email: customerEmail || `${estimate.customer_name.toLowerCase().replace(/\s+/g, '.')}@placeholder.com`,
                                company: estimate.customer_name,
                                source: 'IMPORT',
                                stageId: proposalStageId,
                                value: estimate.total,
                                notes: `Auto-created from Zoho quotation ${estimate.estimate_number}`,
                            },
                        });
                        leadsCreated++;

                        // Create activity log for the new lead
                        const newLead = await prisma.lead.findFirst({
                            where: { company: estimate.customer_name },
                            orderBy: { createdAt: 'desc' },
                        });
                        if (newLead) {
                            await prisma.leadActivity.create({
                                data: {
                                    leadId: newLead.id,
                                    type: 'NOTE',
                                    content: `Lead created automatically from Zoho quotation ${estimate.estimate_number} (Total: ₹${estimate.total.toLocaleString('en-IN')})`,
                                },
                            });
                        }
                    }
                } catch (leadError) {
                    console.error('Error creating lead for quotation:', leadError);
                    // Continue with import even if lead creation fails
                }
            }
        }

        return NextResponse.json({
            success: true,
            imported,
            updated,
            leadsCreated,
            total: zohoResponse.estimates.length,
        });
    } catch (error) {
        console.error('Error importing quotations from Zoho:', error);
        return NextResponse.json({ error: 'Failed to import quotations' }, { status: 500 });
    }
}
