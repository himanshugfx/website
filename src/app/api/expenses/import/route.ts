import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getExpenses } from '@/lib/zoho';

export const dynamic = 'force-dynamic';

// Normalize category name - clean up Zoho account names
const normalizeCategory = (accountName: string): string => {
    // Return the original name, just clean it up a bit
    // Remove common prefixes and normalize
    let name = accountName.trim();

    // If it's empty, return MISC
    if (!name) return 'MISC';

    return name;
};

export async function POST() {
    try {
        // Fetch expenses from Zoho
        const zohoResponse = await getExpenses({ per_page: 200 });

        if (zohoResponse.code !== 0) {
            return NextResponse.json({ error: 'Failed to fetch from Zoho' }, { status: 500 });
        }

        let imported = 0;
        let updated = 0;

        for (const expense of zohoResponse.expenses) {
            const existingExpense = await prisma.expense.findUnique({
                where: { zohoExpenseId: expense.expense_id },
            });

            const expenseData = {
                date: new Date(expense.date),
                category: normalizeCategory(expense.account_name),
                amount: expense.total,
                vendor: expense.vendor_name || null,
                description: expense.description || null,
                reference: expense.reference_number || null,
                isBillable: expense.is_billable,
                status: 'SYNCED',
                syncedAt: new Date(),
            };

            if (existingExpense) {
                await prisma.expense.update({
                    where: { id: existingExpense.id },
                    data: expenseData,
                });
                updated++;
            } else {
                await prisma.expense.create({
                    data: {
                        ...expenseData,
                        zohoExpenseId: expense.expense_id,
                    },
                });
                imported++;
            }
        }

        return NextResponse.json({
            success: true,
            imported,
            updated,
            total: zohoResponse.expenses.length,
        });
    } catch (error) {
        console.error('Error importing expenses from Zoho:', error);
        return NextResponse.json({ error: 'Failed to import expenses' }, { status: 500 });
    }
}
