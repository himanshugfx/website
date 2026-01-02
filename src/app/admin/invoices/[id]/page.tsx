import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Download, Send, ExternalLink, Clock, User, Calendar, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

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

async function getInvoice(id: string) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
        });
        return invoice;
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return null;
    }
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = await getInvoice(id);

    if (!invoice) {
        notFound();
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/invoices"
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {invoice.invoiceNumber}
                                </h1>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[invoice.status] || statusColors.DRAFT}`}>
                                    {invoice.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{invoice.customerName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {invoice.pdfUrl && (
                            <a
                                href={invoice.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </a>
                        )}
                        {invoice.status === 'DRAFT' && (
                            <form action={`/api/admin/invoices/${invoice.id}/send`} method="POST">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700"
                                >
                                    <Send className="w-4 h-4" />
                                    Send Invoice
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Invoice Details Card */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Summary */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Amount</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{invoice.total.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Balance Due</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{invoice.balance.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Invoice Date</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Due Date</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {invoice.dueDate
                                        ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : 'Not set'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-6">
                        {/* Customer Info */}
                        <div>
                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">Customer</span>
                            </div>
                            <p className="text-gray-900 font-medium">{invoice.customerName}</p>
                            <p className="text-sm text-gray-500">Customer ID: {invoice.customerId}</p>
                        </div>

                        {/* Timeline/Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Last Synced</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(invoice.syncedAt).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Zoho Invoice ID</p>
                                    <p className="text-xs text-gray-500 font-mono">{invoice.zohoInvoiceId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Zoho Link */}
                        <div className="pt-4 border-t border-gray-100">
                            <a
                                href={`https://invoice.zoho.in/app#/invoices/${invoice.zohoInvoiceId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View in Zoho Invoice
                            </a>
                        </div>
                    </div>
                </div>

                {/* Status Actions */}
                {invoice.status !== 'PAID' && invoice.status !== 'VOID' && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            {invoice.status !== 'PAID' && (
                                <form action={`/api/admin/invoices/${invoice.id}/mark-paid`} method="POST">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Mark as Paid
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
