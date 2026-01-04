'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { FileText, RefreshCw, Plus, Search, ChevronRight, ExternalLink, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Invoice {
    id: string;
    zohoInvoiceId: string | null;
    invoiceNumber: string;
    customerName: string;
    status: string;
    total: number;
    balance: number;
    invoiceDate: string;
    dueDate: string | null;
    pdfUrl: string | null;
}

interface InvoiceStats {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
}

const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-50 text-gray-700 border-gray-200',
    SENT: 'bg-blue-50 text-blue-700 border-blue-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    OVERDUE: 'bg-red-50 text-red-700 border-red-200',
    VOID: 'bg-gray-50 text-gray-500 border-gray-200',
    PARTIALLY_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<InvoiceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/invoices');
            const data = await res.json();
            setInvoices(data.invoices || []);
            setStats(data.stats || null);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/admin/invoices/sync', { method: 'POST' });
            if (res.ok) {
                fetchInvoices();
            }
        } catch (error) {
            console.error('Error syncing:', error);
        } finally {
            setSyncing(false);
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoices</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your Zoho invoices and billing</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync from Zoho'}</span>
                            <span className="sm:hidden">Sync</span>
                        </button>
                        <Link
                            href="/admin/finances/invoices/create"
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Invoice</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase">Total Invoices</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase">Paid</p>
                            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{stats.paid}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{stats.pending}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase">Overdue</p>
                            <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search invoices by number or customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                {/* Invoices List */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading invoices...</div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-900 font-medium">No invoices yet</p>
                            <p className="text-gray-500 text-sm mt-1">
                                Click "Sync from Zoho" to import your invoices
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice #</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="group hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-medium text-purple-600">
                                                    {invoice.invoiceNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">{invoice.customerName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {invoice.dueDate
                                                    ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : '-'
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">₹{invoice.total.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[invoice.status] || statusColors.DRAFT}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {invoice.pdfUrl && (
                                                        <a
                                                            href={invoice.pdfUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <Link
                                                        href={`/admin/finances/invoices/${invoice.id}`}
                                                        className="p-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
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
