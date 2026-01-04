'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { ClipboardList, Plus, Download, RefreshCw, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Quotation {
    id: string;
    zohoEstimateId: string | null;
    quotationNumber: string;
    customerName: string;
    customerEmail: string | null;
    status: string;
    total: number;
    quotationDate: string;
    expiryDate: string | null;
}

interface QuotationStats {
    total: number;
    draft: number;
    sent: number;
    invoiced: number;
    declined: number;
    totalValue: number;
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SENT: 'bg-blue-100 text-blue-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
    EXPIRED: 'bg-yellow-100 text-yellow-700',
    INVOICED: 'bg-purple-100 text-purple-700',
};

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [stats, setStats] = useState<QuotationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const res = await fetch('/api/quotations');
            const data = await res.json();
            setQuotations(data.quotations || []);
            setStats(data.stats || null);
        } catch (error) {
            console.error('Error fetching quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImportFromZoho = async () => {
        setImporting(true);
        try {
            const res = await fetch('/api/quotations/import', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                fetchQuotations();
                alert(`Successfully imported ${data.imported} quotations from Zoho`);
            } else {
                alert('Import failed: ' + data.error);
            }
        } catch (error) {
            console.error('Error importing:', error);
            alert('Failed to import quotations');
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

    const filteredQuotations = quotations.filter(q =>
        q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
        q.customerName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quotations</h1>
                        <p className="text-sm text-gray-500 mt-1">Create and manage customer quotations</p>
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
                            href="/admin/finances/quotations/add"
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-black/80"
                        >
                            <Plus className="w-4 h-4" />
                            New Quotation
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase">Draft</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-600 mt-1">{stats.draft}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase">Sent</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{stats.sent}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase">Invoiced</p>
                            <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{stats.invoiced}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 col-span-2 sm:col-span-1">
                            <p className="text-xs font-medium text-gray-500 uppercase">Total Value</p>
                            <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">{formatCurrency(stats.totalValue)}</p>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by quotation number or customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* Quotations List */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading quotations...</div>
                    ) : filteredQuotations.length === 0 ? (
                        <div className="p-8 text-center">
                            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No quotations found</p>
                            <p className="text-sm text-gray-400 mt-1">Create your first quotation or import from Zoho</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredQuotations.map((quotation) => (
                                        <tr key={quotation.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-medium text-purple-600">
                                                    {quotation.quotationNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{quotation.customerName}</p>
                                                    {quotation.customerEmail && (
                                                        <p className="text-xs text-gray-500">{quotation.customerEmail}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(quotation.quotationDate)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {quotation.expiryDate ? formatDate(quotation.expiryDate) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                                                {formatCurrency(quotation.total)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[quotation.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {quotation.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/finances/quotations/${quotation.id}`}
                                                    className="inline-flex items-center justify-center w-8 h-8 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                                                >
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
