'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { FileText, Plus, Search, ChevronRight, ExternalLink, AlertCircle, Filter, Pencil, CheckSquare, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Invoice {
    id: string;
    invoiceNumber: string;
    customerName: string;
    status: string;
    total: number;
    balance: number;
    invoiceDate: string;
    dueDate: string | null;
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
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<InvoiceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/invoicing/invoices');
            const data = await res.json();
            setInvoices(data.invoices || []);
            setStats(data.stats || null);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            inv.customerName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => b.invoiceNumber.localeCompare(a.invoiceNumber, undefined, { numeric: true }));

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredInvoices.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredInvoices.map(inv => inv.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkExport = () => {
        if (selectedIds.length === 0) {
            return alert('Please select at least one invoice to export');
        }
        // Redirect to bulk print page with selected IDs
        router.push(`/admin/invoicing/invoices/bulk-print?ids=${selectedIds.join(',')}`);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoices</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your invoices and billing</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={handleBulkExport}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm">
                            <ExternalLink className="w-4 h-4" />
                            {selectedIds.length > 0 ? `Export ${selectedIds.length} PDFs` : 'Export PDFs'}
                        </button>
                        <Link href="/admin/invoicing/invoices/create"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            Create Invoice
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button onClick={() => setStatusFilter('ALL')} className={`bg-white rounded-xl p-4 border text-left transition-all ${statusFilter === 'ALL' ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'}`}>
                            <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            <p className="text-xs text-gray-400">{formatCurrency(stats.totalAmount)}</p>
                        </button>
                        <button onClick={() => setStatusFilter('PAID')} className={`bg-white rounded-xl p-4 border text-left transition-all ${statusFilter === 'PAID' ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100'}`}>
                            <p className="text-xs font-medium text-gray-500 uppercase">Paid</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.paid}</p>
                            <p className="text-xs text-gray-400">{formatCurrency(stats.paidAmount)}</p>
                        </button>
                        <button onClick={() => setStatusFilter(statusFilter === 'DRAFT' ? 'ALL' : 'DRAFT')} className={`bg-white rounded-xl p-4 border text-left transition-all ${statusFilter === 'DRAFT' ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'}`}>
                            <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pending}</p>
                        </button>
                        <button onClick={() => setStatusFilter(statusFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')} className={`bg-white rounded-xl p-4 border text-left transition-all ${statusFilter === 'OVERDUE' ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100'}`}>
                            <p className="text-xs font-medium text-gray-500 uppercase">Overdue</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search by invoice number or customer..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-gray-500">Loading invoices...</p>
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-900 font-medium">No invoices found</p>
                            <p className="text-gray-500 text-sm mt-1">Create your first invoice to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-left w-12">
                                            <button onClick={toggleSelectAll} className="p-1 rounded hover:bg-gray-100 transition-colors">
                                                {selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0 ? (
                                                    <CheckSquare className="w-4 h-4 text-purple-600" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase w-16">#</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice #</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInvoices.map((invoice, index) => (
                                        <tr key={invoice.id} className={`group hover:bg-gray-50/50 transition-colors ${selectedIds.includes(invoice.id) ? 'bg-purple-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <button onClick={() => toggleSelect(invoice.id)} className="p-1 rounded hover:bg-gray-100 transition-colors">
                                                    {selectedIds.includes(invoice.id) ? (
                                                        <CheckSquare className="w-4 h-4 text-purple-600" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-400">{(index + 1).toString().padStart(2, '0')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-medium text-purple-600">{invoice.invoiceNumber}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">{invoice.customerName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">₹{invoice.total.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-semibold ${invoice.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    ₹{invoice.balance.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[invoice.status] || statusColors.DRAFT}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                {invoice.status !== 'PAID' && invoice.status !== 'VOID' && (
                                                    <Link href={`/admin/invoicing/invoices/${invoice.id}/edit`}
                                                        className="p-2 inline-flex text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                )}
                                                <Link href={`/admin/invoicing/invoices/${invoice.id}`}
                                                    className="p-2 inline-flex text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
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
