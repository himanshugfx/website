'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Download, Send, Check, Ban, Loader2, Printer, Trash2, Pencil, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SENT: 'bg-blue-100 text-blue-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    OVERDUE: 'bg-red-100 text-red-700',
    VOID: 'bg-gray-100 text-gray-500',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
};

interface InvoiceDetail {
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string | null;
    status: string;
    subtotal: number;
    discount: number;
    discountType: string | null;
    taxRate: number;
    taxAmount: number;
    total: number;
    balance: number;
    invoiceDate: string;
    dueDate: string | null;
    lineItems: any[];
    notes: string | null;
    terms: string | null;
    createdAt: string;
}

interface Payment {
    id: string;
    amount: number;
    paymentDate: string;
    paymentMode: string;
    reference: string | null;
    notes: string | null;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const [resolvedId, setResolvedId] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'UPI',
        reference: '',
        notes: ''
    });

    useEffect(() => {
        params.then(p => {
            setResolvedId(p.id);
            fetchInvoice(p.id);
        });
    }, [params]);

    const fetchInvoice = async (id: string) => {
        try {
            const res = await fetch(`/api/invoicing/invoices/${id}`);
            const data = await res.json();
            setInvoice(data.invoice);
            fetchPayments(id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async (id: string) => {
        try {
            const res = await fetch(`/api/invoicing/invoices/${id}/payments`);
            const data = await res.json();
            if (data.success) setPayments(data.payments);
        } catch (err) {
            console.error('Error fetching payments:', err);
        }
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading('PAYMENT');
        try {
            const res = await fetch(`/api/invoicing/invoices/${resolvedId}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentForm)
            });
            const data = await res.json();
            if (data.success) {
                setShowPaymentModal(false);
                fetchInvoice(resolvedId); // Refresh everything
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading('');
        }
    };

    const updateStatus = async (status: string) => {
        setActionLoading(status);
        try {
            const res = await fetch(`/api/invoicing/invoices/${resolvedId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) await fetchInvoice(resolvedId);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading('');
        }
    };

    const deleteInvoice = async () => {
        if (!confirm('Are you sure? This action cannot be undone.')) return;
        setActionLoading('DELETE');
        try {
            await fetch(`/api/invoicing/invoices/${resolvedId}`, { method: 'DELETE' });
            router.push('/admin/invoicing/invoices');
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading('');
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB');

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (!invoice) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Invoice not found</p>
                    <Link href="/admin/invoicing/invoices" className="text-purple-600 mt-2 inline-block">Go back</Link>
                </div>
            </AdminLayout>
        );
    }

    const items = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/invoicing/invoices" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[invoice.status]}`}>
                                    {invoice.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Created on {formatDate(invoice.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        {invoice.status === 'DRAFT' && (
                            <button onClick={() => updateStatus('SENT')} disabled={!!actionLoading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm">
                                {actionLoading === 'SENT' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                                <span className="hidden xs:inline">Mark as Sent</span>
                                <span className="xs:hidden">Sent</span>
                            </button>
                        )}
                        {['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(invoice.status) && (
                            <button onClick={() => updateStatus('PAID')} disabled={!!actionLoading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm">
                                {actionLoading === 'PAID' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                                <span className="hidden xs:inline">Mark as Paid</span>
                                <span className="xs:hidden">Paid</span>
                            </button>
                        )}
                        {invoice.status !== 'VOID' && invoice.status !== 'PAID' && (
                            <button onClick={() => updateStatus('VOID')} disabled={!!actionLoading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm">
                                {actionLoading === 'VOID' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />} 
                                <span className="hidden xs:inline">Void</span>
                            </button>
                        )}
                        {['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(invoice.status) && (
                            <button onClick={() => {
                                setPaymentForm({ ...paymentForm, amount: invoice.balance });
                                setShowPaymentModal(true);
                            }} 
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-sm text-sm">
                                <IndianRupee className="w-4 h-4" /> 
                                <span className="hidden xs:inline">Record Payment</span>
                                <span className="xs:hidden">Pay</span>
                            </button>
                        )}
                        <Link 
                            href={`/print/invoice/${invoice.id}`} 
                            target="_blank"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors text-sm"
                        >
                            <Printer className="w-4 h-4" /> 
                            <span className="hidden xs:inline">Print / PDF</span>
                            <span className="xs:hidden">PDF</span>
                        </Link>
                        {invoice.status !== 'PAID' && invoice.status !== 'VOID' && (
                            <Link href={`/admin/invoicing/invoices/${resolvedId}/edit`}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
                                <Pencil className="w-4 h-4 text-gray-400" /> 
                                <span className="hidden xs:inline">Edit</span>
                            </Link>
                        )}
                        {invoice.status === 'DRAFT' && (
                            <button onClick={deleteInvoice} disabled={!!actionLoading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 disabled:opacity-50 transition-colors text-sm">
                                {actionLoading === 'DELETE' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} 
                                <span className="hidden xs:inline">Delete</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Customer & Invoice Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Bill To</h2>
                        <p className="text-lg font-bold text-gray-900">{invoice.customerName}</p>
                        {invoice.customerEmail && <p className="text-sm text-gray-600">{invoice.customerEmail}</p>}
                        {invoice.customerPhone && <p className="text-sm text-gray-600">{invoice.customerPhone}</p>}
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Invoice Info</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-500">Invoice Date</p>
                                <p className="font-medium text-gray-900">{formatDate(invoice.invoiceDate)}</p>
                            </div>
                            {invoice.dueDate && (
                                <div>
                                    <p className="text-gray-500">Due Date</p>
                                    <p className="font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Line Items</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">HSN</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Qty</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Tax (%)</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Rate</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-3 text-sm text-gray-400">{i + 1}</td>
                                        <td className="px-6 py-3">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                            {item.description && <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">{item.description}</p>}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600 hidden sm:table-cell">{item.hsnCode || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 text-right hidden md:table-cell">{item.taxRate}%</td>
                                        <td className="px-6 py-3 text-sm text-gray-900 text-right hidden md:table-cell">{formatCurrency(item.rate)}</td>
                                        <td className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency((item.quantity * item.rate) + (item.taxAmount || 0))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Notes & Terms */}
                    <div className="space-y-4">
                        {invoice.notes && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.notes}</p>
                            </div>
                        )}
                        {invoice.terms && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Terms & Conditions</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.terms}</p>
                            </div>
                        )}
                    </div>

                    {/* Amount Summary */}
                    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-black rounded-2xl p-6 text-white">
                        <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-wider mb-4">Amount Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Subtotal</span>
                                <span>{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            {invoice.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Discount</span>
                                    <span className="text-red-400">-{formatCurrency(invoice.discount)}</span>
                                </div>
                            )}
                            {invoice.taxAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 font-medium">Total GST</span>
                                    <span className="font-bold text-emerald-400">+{formatCurrency(invoice.taxAmount)}</span>
                                </div>
                            )}
                            <div className="border-t border-white/10 pt-3 flex justify-between items-end">
                                <span className="text-gray-400">Total</span>
                                <span className="text-2xl font-black">{formatCurrency(invoice.total)}</span>
                            </div>
                            <div className="border-t border-white/10 pt-3 flex justify-between items-end">
                                <span className="text-gray-400">Balance Due</span>
                                <span className={`text-xl font-bold ${invoice.balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {formatCurrency(invoice.balance)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payments History */}
                {payments.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                            <h2 className="font-bold text-gray-900">Payment History</h2>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{payments.length} Transaction{payments.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                        <th className="px-4 sm:px-6 py-4 text-left">Date</th>
                                        <th className="px-4 sm:px-6 py-4 text-left">Mode</th>
                                        <th className="px-6 py-4 text-left hidden sm:table-cell">Reference</th>
                                        <th className="px-4 sm:px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/30">
                                            <td className="px-4 sm:px-6 py-4 font-medium text-gray-900">{formatDate(p.paymentDate)}</td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold uppercase">{p.paymentMode}</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-gray-500 hidden sm:table-cell">{p.reference || '-'}</td>
                                            <td className="px-4 sm:px-6 py-4 text-right font-bold text-emerald-600">{formatCurrency(p.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Record Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
                    <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                            <h2 className="text-xl font-bold">Record Payment</h2>
                            <p className="text-purple-100 text-sm mt-1">Payment for {invoice.invoiceNumber}</p>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Amount (₹)</label>
                                    <input type="number" required value={paymentForm.amount}
                                        onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-lg"
                                        max={invoice.balance} min={0.01} step={0.01} />
                                    <p className="text-[10px] text-gray-400 mt-1">Maximum allowed: {formatCurrency(invoice.balance)}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment Date</label>
                                    <input type="date" required value={paymentForm.paymentDate}
                                        onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mode</label>
                                    <select value={paymentForm.paymentMode}
                                        onChange={e => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold">
                                        <option value="UPI">UPI</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="CASH">Cash</option>
                                        <option value="CHEQUE">Cheque</option>
                                        <option value="CARD">Card</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Reference / Txn ID</label>
                                    <input type="text" value={paymentForm.reference}
                                        onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                                        placeholder="e.g. UTR-1234567890"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Internal Notes</label>
                                    <textarea value={paymentForm.notes} rows={2}
                                        onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={actionLoading === 'PAYMENT'}
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
                                    {actionLoading === 'PAYMENT' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
