import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getExpenses } from '@/lib/zoho';

export const dynamic = 'force-dynamic';

// Category mapping from Zoho account names to our categories
const mapZohoCategory = (accountName: string): string => {
    const name = accountName.toLowerCase();
    if (name.includes('travel')) return 'TRAVEL';
    if (name.includes('office') || name.includes('supplies')) return 'OFFICE_SUPPLIES';
    if (name.includes('marketing') || name.includes('advertising')) return 'MARKETING';
    if (name.includes('utilities') || name.includes('electric') || name.includes('water')) return 'UTILITIES';
    if (name.includes('rent')) return 'RENT';
    if (name.includes('salary') || name.includes('wages')) return 'SALARY';
    return 'MISC';
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
                category: mapZohoCategory(expense.account_name),
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
