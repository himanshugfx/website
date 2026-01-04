import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Receipt, Calendar, IndianRupee, Building2, FileText, CreditCard, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'UTILITIES', label: 'Utilities' },
    { value: 'RENT', label: 'Rent' },
    { value: 'SALARY', label: 'Salary' },
    { value: 'MISC', label: 'Miscellaneous' },
];

const PAYMENT_MODES = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CARD', label: 'Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'UPI', label: 'UPI' },
];

async function addExpense(formData: FormData) {
    'use server';

    const date = formData.get('date') as string;
    const category = formData.get('category') as string;
    const amount = formData.get('amount') as string;
    const vendor = formData.get('vendor') as string;
    const description = formData.get('description') as string;
    const reference = formData.get('reference') as string;
    const paymentMode = formData.get('paymentMode') as string;
    const syncToZoho = formData.get('syncToZoho') === 'on';

    const expense = await prisma.expense.create({
        data: {
            date: new Date(date),
            category,
            amount: parseFloat(amount),
            vendor: vendor || null,
            description: description || null,
            reference: reference || null,
            paymentMode: paymentMode || null,
            status: 'RECORDED',
        },
    });

    // If sync to Zoho is checked, sync the expense
    if (syncToZoho) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/expenses/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expenseId: expense.id }),
            });
            // Sync result will update the expense status
        } catch (error) {
            console.error('Failed to sync to Zoho:', error);
        }
    }

    redirect('/admin/finances/expenses');
}

export default function AddExpensePage() {
    const today = new Date().toISOString().split('T')[0];

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/expenses"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Expense</h1>
                        <p className="text-sm text-gray-500 mt-1">Record a business expense</p>
                    </div>
                </div>

                {/* Form */}
                <form action={addExpense} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Receipt className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Expense Details</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="w-3 h-3 inline mr-1" /> Date *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    defaultValue={today}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IndianRupee className="w-3 h-3 inline mr-1" /> Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <CreditCard className="w-3 h-3 inline mr-1" /> Payment Mode
                                </label>
                                <select
                                    name="paymentMode"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select mode</option>
                                    {PAYMENT_MODES.map((mode) => (
                                        <option key={mode.value} value={mode.value}>{mode.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Vendor & Reference */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Vendor & Reference</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vendor Name
                                </label>
                                <input
                                    type="text"
                                    name="vendor"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter vendor name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reference / Receipt No.
                                </label>
                                <input
                                    type="text"
                                    name="reference"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Invoice/Receipt number"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FileText className="w-3 h-3 inline mr-1" /> Description
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Brief description of the expense..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Sync Option */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <RefreshCw className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Zoho Sync</h2>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="syncToZoho"
                                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Sync to Zoho Invoice</p>
                                <p className="text-xs text-gray-500">Automatically create this expense in your Zoho Invoice account</p>
                            </div>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <Link
                            href="/admin/expenses"
                            className="px-6 py-3 text-center font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="px-6 py-3 font-semibold text-white bg-black rounded-xl hover:bg-black/80"
                        >
                            Add Expense
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
