'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Receipt, Plus, Calendar, IndianRupee, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Expense {
    id: string;
    date: string;
    category: string;
    amount: number;
    vendor: string | null;
    description: string | null;
}

interface ExpenseStats {
    totalExpenses: number;
    thisMonth: number;
    lastMonth: number;
    count: number;
}

// Predefined category labels for backward compatibility
const CATEGORY_LABELS: Record<string, string> = {
    TRAVEL: 'Travel',
    OFFICE_SUPPLIES: 'Office Supplies',
    MARKETING: 'Marketing',
    UTILITIES: 'Utilities',
    RENT: 'Rent',
    SALARY: 'Salary',
    MISC: 'Miscellaneous',
};

// Color palette for categories
const CATEGORY_COLORS: Record<string, string> = {
    TRAVEL: 'bg-blue-100 text-blue-700',
    OFFICE_SUPPLIES: 'bg-green-100 text-green-700',
    MARKETING: 'bg-purple-100 text-purple-700',
    UTILITIES: 'bg-yellow-100 text-yellow-700',
    RENT: 'bg-red-100 text-red-700',
    SALARY: 'bg-pink-100 text-pink-700',
    MISC: 'bg-gray-100 text-gray-700',
};

// Generate a consistent color for any category based on its name
const getCategoryColor = (category: string): string => {
    // Check if it's a predefined category first
    if (CATEGORY_COLORS[category]) {
        return CATEGORY_COLORS[category];
    }

    // Generate a color based on the category name hash
    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-yellow-100 text-yellow-700',
        'bg-red-100 text-red-700',
        'bg-pink-100 text-pink-700',
        'bg-indigo-100 text-indigo-700',
        'bg-teal-100 text-teal-700',
        'bg-orange-100 text-orange-700',
        'bg-cyan-100 text-cyan-700',
    ];

    // Simple hash function to get consistent color for each category
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

// Get display label for category
const getCategoryLabel = (category: string): string => {
    return CATEGORY_LABELS[category] || category;
};

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [stats, setStats] = useState<ExpenseStats | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/invoicing/expenses?range=all');
            const result = await response.json();

            if (result.expenses) {
                setExpenses(result.expenses);
            }
            if (result.stats) {
                setStats(result.stats);
            }
        } catch (err) {
            console.error('Failed to load expenses:', err);
        } finally {
            setLoading(false);
        }
    };



    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB');
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
                    <div>
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter font-primary flex items-center gap-3">
                                <Receipt className="w-10 h-10 text-purple-600" />
                                Expense Management
                            </h1>
                            <div className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200 shadow-sm inline-block">
                                {expenses.length} Logged Outflows
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-3 uppercase tracking-wider max-w-2xl">
                            Tracking your <span className="text-purple-600 font-black italic underline decoration-purple-200 underline-offset-4">operational costs</span> and business expenditure patterns
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        <Link 
                            href="/admin/invoicing/expenses/add"
                            className="flex items-center justify-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all text-sm tracking-tight"
                        >
                            <Plus className="w-5 h-5 stroke-[3px]" />
                            <span>Add Expense</span>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-xl">
                                    <IndianRupee className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total Expenses</p>
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">This Month</p>
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.thisMonth)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-xl">
                                    <TrendingDown className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Last Month</p>
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.lastMonth)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-xl">
                                    <Receipt className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total Count</p>
                                    <p className="text-lg font-bold text-gray-900">{stats.count}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expenses Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-gray-500">Loading expenses...</p>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="p-8 text-center">
                            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No expenses found</p>
                            <p className="text-sm text-gray-400 mt-1">Add your first expense to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">#</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {expenses.map((expense, index) => (
                                        <tr key={expense.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-400">{(index + 1).toString().padStart(2, '0')}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(expense.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                                                    {getCategoryLabel(expense.category)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {expense.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {expense.vendor || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                                                {formatCurrency(expense.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                                    Recorded
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
