import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Calendar, User, FileText, Download, Send, Printer, Check } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
    SENT: 'bg-blue-100 text-blue-700 border-blue-300',
    PAID: 'bg-green-100 text-green-700 border-green-300',
    OVERDUE: 'bg-red-100 text-red-700 border-red-300',
    VOID: 'bg-gray-100 text-gray-500 border-gray-300',
    PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

async function getInvoice(id: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id },
    });
    return invoice;
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const invoice = await getInvoice(params.id);

    if (!invoice) {
        notFound();
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/finances/invoices"
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {invoice.invoiceNumber}
                                </h1>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${STATUS_COLORS[invoice.status]}`}>
                                    {invoice.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Created on {formatDate(invoice.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {invoice.pdfUrl && (
                            <a
                                href={invoice.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </a>
                        )}
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h2 className="font-semibold text-gray-900">Invoice Details</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Customer Name</p>
                            <p className="font-medium text-gray-900">{invoice.customerName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Invoice Date</p>
                            <p className="font-medium text-gray-900">{formatDate(invoice.invoiceDate)}</p>
                        </div>
                        {invoice.dueDate && (
                            <div>
                                <p className="text-sm text-gray-500">Due Date</p>
                                <p className="font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(invoice.total)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Balance Due</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(invoice.balance)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Currency</p>
                            <p className="font-medium text-gray-900">{invoice.currency || 'INR'}</p>
                        </div>
                    </div>
                </div>

                {/* Amount Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Total</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.total)}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Paid</span>
                        <span className="text-lg font-semibold text-green-600">{formatCurrency(invoice.total - invoice.balance)}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 font-medium">Balance Due</span>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(invoice.balance)}</span>
                    </div>
                </div>

                {/* Zoho Sync Info */}
                {invoice.zohoInvoiceId && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600" />
                            <p className="text-sm text-green-700">
                                Synced with Zoho Invoice (ID: {invoice.zohoInvoiceId})
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
