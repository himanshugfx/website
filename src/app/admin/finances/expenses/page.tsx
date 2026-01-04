'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Receipt, Plus, Download, RefreshCw, Calendar, Filter, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Expense {
    id: string;
    zohoExpenseId: string | null;
    date: string;
    category: string;
    amount: number;
    vendor: string | null;
    description: string | null;
    reference: string | null;
    paymentMode: string | null;
    status: string;
    syncedAt: string | null;
}

interface ExpenseStats {
    totalExpenses: number;
    thisMonth: number;
    lastMonth: number;
    count: number;
}

const CATEGORY_LABELS: Record<string, string> = {
    TRAVEL: 'Travel',
    OFFICE_SUPPLIES: 'Office Supplies',
    MARKETING: 'Marketing',
    UTILITIES: 'Utilities',
    RENT: 'Rent',
    SALARY: 'Salary',
    MISC: 'Miscellaneous',
};

const CATEGORY_COLORS: Record<string, string> = {
    TRAVEL: 'bg-blue-100 text-blue-700',
    OFFICE_SUPPLIES: 'bg-green-100 text-green-700',
    MARKETING: 'bg-purple-100 text-purple-700',
    UTILITIES: 'bg-yellow-100 text-yellow-700',
    RENT: 'bg-red-100 text-red-700',
    SALARY: 'bg-pink-100 text-pink-700',
    MISC: 'bg-gray-100 text-gray-700',
};

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [stats, setStats] = useState<ExpenseStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');

    useEffect(() => {
        fetchExpenses();
    }, [filter, dateRange]);

    const fetchExpenses = async () => {
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.set('category', filter);
            if (dateRange !== 'all') params.set('range', dateRange);

            const res = await fetch(`/api/expenses?${params.toString()}`);
            const data = await res.json();
            setExpenses(data.expenses || []);
            setStats(data.stats || null);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImportFromZoho = async () => {
        setImporting(true);
        try {
            const res = await fetch('/api/expenses/import', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                fetchExpenses();
                alert(`Successfully imported ${data.imported} expenses from Zoho`);
            } else {
                alert('Import failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error importing:', error);
            alert('Failed to import expenses');
        } finally {
            setImporting(false);
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
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Expense Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Track and manage your business expenses</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleImportFromZoho}
                            disabled={importing}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            <Download className={`w-4 h-4 ${importing ? 'animate-spin' : ''}`} />
                            {importing ? 'Importing...' : 'Import from Zoho'}
                        </button>
                        <Link
                            href="/admin/finances/expenses/add"
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-black/80"
                        >
                            <Plus className="w-4 h-4" />
                            Add Expense
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
                                    <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Total Expenses</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">This Month</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.thisMonth)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 bg-gray-100 rounded-xl">
                                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Last Month</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.lastMonth)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                                    <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Total Records</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.count}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Categories</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="this_quarter">This Quarter</option>
                        <option value="this_year">This Year</option>
                        <option value="all">All Time</option>
                    </select>
                </div>

                {/* Expenses Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading expenses...</div>
                    ) : expenses.length === 0 ? (
                        <div className="p-8 text-center">
                            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No expenses found</p>
                            <p className="text-sm text-gray-400 mt-1">Add your first expense or import from Zoho</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(expense.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${CATEGORY_COLORS[expense.category] || 'bg-gray-100 text-gray-700'}`}>
                                                    {CATEGORY_LABELS[expense.category] || expense.category}
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
                                                {expense.zohoExpenseId ? (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                                        Synced
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                                                        Local
                                                    </span>
                                                )}
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
