import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Calendar, User, Mail, FileText, Package, Edit, Send, Check, X, Printer } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface LineItem {
    name: string;
    quantity: number;
    rate: number;
    amount: number;
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
    SENT: 'bg-blue-100 text-blue-700 border-blue-300',
    ACCEPTED: 'bg-green-100 text-green-700 border-green-300',
    DECLINED: 'bg-red-100 text-red-700 border-red-300',
    EXPIRED: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    INVOICED: 'bg-purple-100 text-purple-700 border-purple-300',
};

async function getQuotation(id: string) {
    const quotation = await prisma.quotation.findUnique({
        where: { id },
    });
    return quotation;
}

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const quotation = await getQuotation(id);

    if (!quotation) {
        notFound();
    }

    const lineItems = (quotation.lineItems as LineItem[]) || [];

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
                            href="/admin/finances/quotations"
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {quotation.quotationNumber}
                                </h1>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${STATUS_COLORS[quotation.status]}`}>
                                    {quotation.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Created on {formatDate(quotation.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        {quotation.status === 'DRAFT' && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                                <Send className="w-4 h-4" />
                                Send to Customer
                            </button>
                        )}
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-purple-600" />
                        <h2 className="font-semibold text-gray-900">Customer Information</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Customer Name</p>
                            <p className="font-medium text-gray-900">{quotation.customerName}</p>
                        </div>
                        {quotation.customerEmail && (
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{quotation.customerEmail}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Quote Date</p>
                            <p className="font-medium text-gray-900">{formatDate(quotation.quotationDate)}</p>
                        </div>
                        {quotation.expiryDate && (
                            <div>
                                <p className="text-sm text-gray-500">Expiry Date</p>
                                <p className="font-medium text-gray-900">{formatDate(quotation.expiryDate)}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Line Items</h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lineItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No line items
                                        </td>
                                    </tr>
                                ) : (
                                    lineItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 text-center">{item.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatCurrency(item.rate)}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-700 text-right">Subtotal</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(quotation.subtotal)}</td>
                                </tr>
                                {quotation.discount > 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-700 text-right">Discount</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-red-600 text-right">-{formatCurrency(quotation.discount)}</td>
                                    </tr>
                                )}
                                {quotation.tax > 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-700 text-right">Tax</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(quotation.tax)}</td>
                                    </tr>
                                )}
                                <tr className="bg-gray-100">
                                    <td colSpan={3} className="px-6 py-4 text-base font-bold text-gray-900 text-right">Total</td>
                                    <td className="px-6 py-4 text-lg font-bold text-gray-900 text-right">{formatCurrency(quotation.total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Notes & Terms */}
                {(quotation.notes || quotation.terms) && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Notes & Terms</h2>
                        </div>
                        <div className="space-y-4">
                            {quotation.notes && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                                    <p className="text-gray-700">{quotation.notes}</p>
                                </div>
                            )}
                            {quotation.terms && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Terms & Conditions</p>
                                    <p className="text-gray-700">{quotation.terms}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Sync Info */}
                {quotation.zohoEstimateId && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600" />
                            <p className="text-sm text-green-700">
                                Synced with Zoho Invoice (ID: {quotation.zohoEstimateId})
                                {quotation.syncedAt && ` on ${formatDate(quotation.syncedAt)}`}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
