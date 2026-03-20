'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Calendar, User, Mail, FileText, Package, Send, Check, X, Printer, FileUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    const res = await fetch(`/api/quotations?id=${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.quotation || null;
}

export default function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [quotation, setQuotation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState(false);
    const [resolvedId, setResolvedId] = useState('');

    useEffect(() => {
        params.then(p => {
            setResolvedId(p.id);
            fetch(`/api/quotations?id=${p.id}`) 
                .then(r => r.json())
                .then(d => setQuotation(d.quotation || d.quotations?.find((q: any) => q.id === p.id) || null))
                .finally(() => setLoading(false));
        });
    }, [params]);

    const handleConvertToInvoice = async () => {
        if (!confirm('Convert this quotation to an invoice?')) return;
        setConverting(true);
        try {
            const res = await fetch(`/api/invoicing/quotations/${resolvedId}/convert`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                router.push(`/admin/invoicing/invoices/${data.invoiceId}`);
            } else {
                alert(data.error || 'Failed to convert');
            }
        } catch { alert('Error converting'); }
        finally { setConverting(false); }
    };
    if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div></AdminLayout>;
    if (!quotation) return <AdminLayout><div className="text-center py-12"><p className="text-gray-500">Quotation not found</p><Link href="/admin/invoicing/quotations" className="text-purple-600 mt-2 inline-block">Go back</Link></div></AdminLayout>;
    const lineItems = (quotation.lineItems as unknown as LineItem[]) || [];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-GB');
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/invoicing/quotations"
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
                        {quotation.status === 'ACCEPTED' && (
                            <button onClick={handleConvertToInvoice} disabled={converting}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50">
                                {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                                Convert to Invoice
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


            </div>
        </AdminLayout>
    );
}
