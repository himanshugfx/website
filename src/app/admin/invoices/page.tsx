import AdminLayout from '@/components/admin/AdminLayout';
import { FileText, RefreshCw, Plus, Search, ChevronRight, ExternalLink, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Status badge colors
const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-50 text-gray-700 border-gray-200',
    SENT: 'bg-blue-50 text-blue-700 border-blue-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    OVERDUE: 'bg-red-50 text-red-700 border-red-200',
    VOID: 'bg-gray-50 text-gray-500 border-gray-200',
    PARTIALLY_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
};

async function getInvoices() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: { invoiceDate: 'desc' },
            take: 50,
        });
        return invoices;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }
}

async function getInvoiceStats() {
    try {
        const [total, paid, pending, overdue] = await Promise.all([
            prisma.invoice.count(),
            prisma.invoice.count({ where: { status: 'PAID' } }),
            prisma.invoice.count({ where: { status: { in: ['SENT', 'DRAFT'] } } }),
            prisma.invoice.count({ where: { status: 'OVERDUE' } }),
        ]);

        const totalAmount = await prisma.invoice.aggregate({
            _sum: { total: true },
        });

        const paidAmount = await prisma.invoice.aggregate({
            where: { status: 'PAID' },
            _sum: { total: true },
        });

        return {
            total,
            paid,
            pending,
            overdue,
            totalAmount: totalAmount._sum.total || 0,
            paidAmount: paidAmount._sum.total || 0,
        };
    } catch (error) {
        console.error('Error fetching invoice stats:', error);
        return { total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0, paidAmount: 0 };
    }
}

export default async function InvoicesPage() {
    const invoices = await getInvoices();
    const stats = await getInvoiceStats();

    // Check if Zoho is configured
    const zohoConfigured = !!(
        process.env.ZOHO_CLIENT_ID &&
        process.env.ZOHO_CLIENT_SECRET &&
        process.env.ZOHO_REFRESH_TOKEN &&
        process.env.ZOHO_ORGANIZATION_ID
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
                        <form action="/api/admin/invoices/sync" method="POST">
                            <button
                                type="submit"
                                disabled={!zohoConfigured}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="hidden sm:inline">Sync from Zoho</span>
                                <span className="sm:hidden">Sync</span>
                            </button>
                        </form>
                        <Link
                            href="/admin/invoices/create"
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Invoice</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                    </div>
                </div>

                {/* Zoho Configuration Warning */}
                {!zohoConfigured && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-800">Zoho Invoice not configured</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                To sync invoices from Zoho, please add your API credentials to the <code className="bg-amber-100 px-1 rounded">.env</code> file:
                                ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORGANIZATION_ID
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
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

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search invoices by number or customer..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                {/* Invoices List */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {invoices.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-900 font-medium">No invoices yet</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    {zohoConfigured
                                        ? 'Click "Sync from Zoho" to import your invoices'
                                        : 'Configure Zoho API to sync your invoices'
                                    }
                                </p>
                            </div>
                        ) : (
                            invoices.map((invoice) => (
                                <Link
                                    key={invoice.id}
                                    href={`/admin/invoices/${invoice.id}`}
                                    className="block p-4 active:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[invoice.status] || statusColors.DRAFT}`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{invoice.customerName}</span>
                                        <span className="font-bold text-gray-900">₹{invoice.total.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
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
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <FileText className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-900 font-medium">No invoices yet</p>
                                                <p className="text-gray-500 text-sm">
                                                    {zohoConfigured
                                                        ? 'Click "Sync from Zoho" to import your invoices'
                                                        : 'Configure Zoho API to sync your invoices'
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice) => (
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
                                                        href={`/admin/invoices/${invoice.id}`}
                                                        className="p-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
