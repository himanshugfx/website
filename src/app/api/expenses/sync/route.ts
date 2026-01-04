import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createExpense } from '@/lib/zoho';

export const dynamic = 'force-dynamic';

// Map our categories to Zoho account IDs (you may need to update these)
// These are placeholder IDs - replace with actual Zoho account IDs
const CATEGORY_ACCOUNT_IDS: Record<string, string> = {
    TRAVEL: process.env.ZOHO_ACCOUNT_ID_TRAVEL || '',
    OFFICE_SUPPLIES: process.env.ZOHO_ACCOUNT_ID_OFFICE || '',
    MARKETING: process.env.ZOHO_ACCOUNT_ID_MARKETING || '',
    UTILITIES: process.env.ZOHO_ACCOUNT_ID_UTILITIES || '',
    RENT: process.env.ZOHO_ACCOUNT_ID_RENT || '',
    SALARY: process.env.ZOHO_ACCOUNT_ID_SALARY || '',
    MISC: process.env.ZOHO_ACCOUNT_ID_MISC || '',
};

export async function POST(request: Request) {
    try {
        const { expenseId } = await request.json();

        if (!expenseId) {
            return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });
        }

        // Get the expense from our database
        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
        });

        if (!expense) {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        }

        if (expense.zohoExpenseId) {
            return NextResponse.json({ error: 'Expense already synced to Zoho' }, { status: 400 });
        }

        // Get account ID for this category
        const accountId = CATEGORY_ACCOUNT_IDS[expense.category];
        if (!accountId) {
            // If no account ID configured, just mark as synced without actually syncing
            await prisma.expense.update({
                where: { id: expenseId },
                data: { status: 'RECORDED' },
            });
            return NextResponse.json({
                success: false,
                error: 'Zoho account ID not configured for this category',
            });
        }

        // Create expense in Zoho
        const zohoResponse = await createExpense({
            account_id: accountId,
            date: expense.date.toISOString().split('T')[0],
            amount: expense.amount,
            description: expense.description || undefined,
            reference_number: expense.reference || undefined,
        });

        // Update our expense with Zoho ID
        await prisma.expense.update({
            where: { id: expenseId },
            data: {
                zohoExpenseId: zohoResponse.expense.expense_id,
                status: 'SYNCED',
                syncedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            zohoExpenseId: zohoResponse.expense.expense_id,
        });
    } catch (error) {
        console.error('Error syncing expense to Zoho:', error);
        return NextResponse.json({ error: 'Failed to sync expense' }, { status: 500 });
    }
}
