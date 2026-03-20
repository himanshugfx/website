import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/prisma';

// GET: List payments for an invoice
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin(request);
        const { id } = params;

        const payments = await prisma.payment.findMany({
            where: { invoiceId: id },
            orderBy: { paymentDate: 'desc' },
        });

        return NextResponse.json({ success: true, payments });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Record a new payment
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin(request);
        const { id } = params;
        const body = await request.json();
        const { amount, paymentDate, paymentMode, reference, notes } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
        }

        // 1. Get current invoice
        const invoice = await prisma.invoice.findUnique({
            where: { id },
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // 2. Create the payment
        const payment = await prisma.payment.create({
            data: {
                invoiceId: id,
                amount: Number(amount),
                paymentDate: new Date(paymentDate || new Date()),
                paymentMode,
                reference: reference || null,
                notes: notes || null,
            },
        });

        // 3. Update invoice balance and status
        const newBalance = Math.max(0, invoice.balance - Number(amount));
        let newStatus = invoice.status;

        if (newBalance === 0) {
            newStatus = 'PAID';
        } else if (newBalance < invoice.total) {
            newStatus = 'PARTIALLY_PAID';
        }

        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: {
                balance: newBalance,
                status: newStatus,
            },
        });

        return NextResponse.json({ success: true, payment, invoice: updatedInvoice });
    } catch (error: any) {
        console.error('Record payment error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
