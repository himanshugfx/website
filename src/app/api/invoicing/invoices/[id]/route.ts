import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Single invoice detail
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin(request);
        const { id } = await params;

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { reminders: true },
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ invoice });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update invoice (status, details, etc.)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin(request);
        const { id } = await params;
        const body = await request.json();

        const { status, customerName, customerEmail, customerPhone, billingAddress, shippingAddress, lineItems, notes, terms, taxRate, discount, discountType, dueDate } = body;

        const updateData: any = {};

        if (status) updateData.status = status;
        if (customerName) updateData.customerName = customerName;
        if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
        if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
        if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
        if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
        if (notes !== undefined) updateData.notes = notes;
        if (terms !== undefined) updateData.terms = terms;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

        // Recalculate totals if line items changed
        if (lineItems && lineItems.length > 0) {
            const items = lineItems.map((item: any) => {
                const quantity = Number(item.quantity) || 0;
                const rate = Number(item.rate) || 0;
                const itemTaxRate = Number(item.taxRate) || 0;
                const amount = quantity * rate;
                const itemTaxAmount = (amount * itemTaxRate) / 100;
                
                return {
                    name: item.name,
                    description: item.description || '',
                    quantity,
                    rate,
                    amount,
                    hsnCode: item.hsnCode || '',
                    taxRate: itemTaxRate,
                    taxAmount: itemTaxAmount,
                    total: amount + itemTaxAmount
                };
            });

            const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
            const totalTaxAmount = items.reduce((sum: number, item: any) => sum + (item.taxAmount || 0), 0);

            let discountAmount = 0;
            if (discount && discountType === 'PERCENTAGE') {
                discountAmount = (subtotal * Number(discount)) / 100;
            } else if (discount) {
                discountAmount = Number(discount);
            }
            const total = subtotal + totalTaxAmount - discountAmount;

            updateData.lineItems = items;
            updateData.subtotal = subtotal;
            updateData.discount = discountAmount;
            updateData.discountType = discountType || null;
            updateData.taxRate = Number(taxRate || 0);
            updateData.taxAmount = totalTaxAmount;
            updateData.total = total;
            updateData.balance = total;
        }

        // If marking as paid, set balance to 0
        if (status === 'PAID') {
            updateData.balance = 0;
        }

        const invoice = await prisma.invoice.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, invoice });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Delete/void an invoice
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin(request);
        const { id } = await params;

        // Void instead of delete if the invoice has been sent
        const invoice = await prisma.invoice.findUnique({ where: { id } });
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (['SENT', 'PAID', 'PARTIALLY_PAID'].includes(invoice.status)) {
            // Void instead of deleting
            await prisma.invoice.update({
                where: { id },
                data: { status: 'VOID' },
            });
            return NextResponse.json({ success: true, message: 'Invoice voided' });
        }

        await prisma.invoice.delete({ where: { id } });
        return NextResponse.json({ success: true, message: 'Invoice deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
