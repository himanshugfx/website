import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emailService } from '@/lib/email';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        await requireAdmin(request);

        // Find invoices that are OVERDUE, or SENT/PARTIALLY_PAID and past due date
        const today = new Date();
        const overdueInvoices = await prisma.invoice.findMany({
            where: {
                status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
                dueDate: { lt: today },
                customerEmail: { not: null },
            },
            include: {
                reminders: true,
            }
        });

        let sentCount = 0;
        let errors: any[] = [];

        for (const invoice of overdueInvoices) {
            // Update status to OVERDUE if it's not already
            if (invoice.status !== 'OVERDUE') {
                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { status: 'OVERDUE' }
                });
            }

            // Check if we've sent a reminder recently (e.g., in the last 7 days)
            const recentReminder = invoice.reminders.find(
                (r: any) => new Date(r.sendDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
            );

            if (!recentReminder && invoice.customerEmail) {
                // Send email
                const emailResult = await emailService.sendPaymentReminder(invoice, invoice.customerEmail);

                // Create reminder record
                await prisma.paymentReminder.create({
                    data: {
                        invoiceId: invoice.id,
                        sendDate: new Date(),
                        status: emailResult.success ? 'SENT' : 'FAILED',
                        message: (emailResult as any).error || null,
                    }
                });

                if (emailResult.success) {
                    sentCount++;
                } else {
                    errors.push({ invoiceId: invoice.id, error: (emailResult as any).error });
                }
            }
        }

        return NextResponse.json({
            success: true,
            detectedOverdue: overdueInvoices.length,
            remindersSent: sentCount,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error: any) {
        console.error('Payment reminders error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
