'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { FileText, Plus, Search, ChevronRight, ExternalLink, AlertCircle, Filter, Pencil, CheckSquare, Square, IndianRupee, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
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
    partiallyPaid: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
    partiallyPaidPaidAmount: number;
    partiallyPaidDueAmount: number;
    overdueAmount: number;
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
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentForm, setPaymentForm] = useState({
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'UPI',
        reference: '',
        notes: ''
    });
    const [actionLoading, setActionLoading] = useState(false);

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
        
        let matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        if (statusFilter === 'PARTIALLY_PAID') {
            matchesStatus = ['SENT', 'PARTIALLY_PAID', 'DRAFT'].includes(inv.status);
        }
        
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

    const openPaymentModal = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setPaymentForm({
            amount: invoice.balance,
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMode: 'UPI',
            reference: '',
            notes: ''
        });
        setShowPaymentModal(true);
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/invoicing/invoices/${selectedInvoice.id}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentForm)
            });
            const data = await res.json();
            if (data.success) {
                setShowPaymentModal(false);
                fetchInvoices();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
                    <div>
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter font-primary">Invoicing System</h1>
                            <div className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200 shadow-sm inline-block">
                                {invoices.length} Registered Records
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-3 uppercase tracking-wider max-w-2xl">
                            Manage your <span className="text-purple-600 font-black italic underline decoration-purple-200 underline-offset-4">financial ledger</span> and settlement status
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        <button 
                            onClick={handleBulkExport}
                            className="flex items-center justify-center gap-2 px-10 py-4 bg-white border border-gray-100 rounded-2xl font-black shadow-sm hover:border-gray-200 transition-all text-sm tracking-tight text-gray-900"
                        >
                            <ExternalLink className="w-5 h-5" />
                            <span>{selectedIds.length > 0 ? `Export ${selectedIds.length} PDFs` : 'Export History'}</span>
                        </button>
                        <Link
                            href="/admin/invoicing/invoices/create"
                            className="flex items-center justify-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all text-sm tracking-tight"
                        >
                            <Plus className="w-5 h-5 stroke-[3px]" />
                            <span>Issue Invoice</span>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden grid grid-cols-2 lg:grid-cols-4 mb-8">
                        <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-8 text-left transition-all relative border-b border-r border-gray-100 lg:border-b-0 ${statusFilter === 'ALL' ? 'bg-purple-600' : 'hover:bg-gray-50'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1.5 ${statusFilter === 'ALL' ? 'text-white' : 'text-gray-400'}`}>Total 🏆</p>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-4xl font-black tracking-tighter ${statusFilter === 'ALL' ? 'text-white' : 'text-gray-900'}`}>{(stats.total || 0).toString().padStart(2, '0')}</span>
                                <span className={`text-[13px] font-black ${statusFilter === 'ALL' ? 'text-white' : 'text-gray-500'}`}>₹{(stats.totalAmount || 0).toLocaleString()}</span>
                            </div>
                        </button>
                        
                        <div className="hidden lg:block w-[1px] bg-gray-100 self-stretch" />

                        <button onClick={() => setStatusFilter('PAID')} className={`px-4 py-8 text-left transition-all relative border-b border-gray-100 lg:border-b-0 ${statusFilter === 'PAID' ? 'bg-emerald-600' : 'hover:bg-gray-50'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1.5 ${statusFilter === 'PAID' ? 'text-white' : 'text-emerald-600'}`}>Paid 💰</p>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-4xl font-black tracking-tighter ${statusFilter === 'PAID' ? 'text-white' : 'text-emerald-700'}`}>{(stats.paid || 0).toString().padStart(2, '0')}</span>
                                <span className={`text-[13px] font-black ${statusFilter === 'PAID' ? 'text-white' : 'text-emerald-600'}`}>₹{(stats.paidAmount || 0).toLocaleString()}</span>
                            </div>
                        </button>
                        
                        <div className="hidden lg:block w-[1px] bg-gray-100 self-stretch" />

                        <button onClick={() => setStatusFilter('PARTIALLY_PAID')} className={`px-4 py-8 text-left transition-all relative border-r border-gray-100 lg:border-r-0 ${statusFilter === 'PARTIALLY_PAID' ? 'bg-amber-500' : 'hover:bg-gray-50'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1.5 ${statusFilter === 'PARTIALLY_PAID' ? 'text-white' : 'text-amber-600'}`}>Partial 🍕</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-4xl font-black tracking-tighter ${statusFilter === 'PARTIALLY_PAID' ? 'text-white' : 'text-amber-700'}`}>{(stats.partiallyPaid || 0).toString().padStart(2, '0')}</span>
                                <div className="flex flex-col -mb-1">
                                    <span className={`text-[11px] font-black leading-tight ${statusFilter === 'PARTIALLY_PAID' ? 'text-white' : 'text-emerald-700'}`}>₹{(stats.partiallyPaidPaidAmount || 0).toLocaleString()} paid</span>
                                    <span className={`text-[11px] font-black leading-tight ${statusFilter === 'PARTIALLY_PAID' ? 'text-white' : 'text-red-600'}`}>₹{(stats.partiallyPaidDueAmount || 0).toLocaleString()} due</span>
                                </div>
                            </div>
                        </button>
                        
                        <div className="hidden lg:block w-[1px] bg-gray-100 self-stretch" />

                        <button onClick={() => setStatusFilter('OVERDUE')} className={`px-4 py-8 text-left transition-all relative ${statusFilter === 'OVERDUE' ? 'bg-red-600' : 'hover:bg-gray-50'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1.5 ${statusFilter === 'OVERDUE' ? 'text-white' : 'text-red-600'}`}>Overdue 🔥</p>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-4xl font-black tracking-tighter ${statusFilter === 'OVERDUE' ? 'text-white' : 'text-red-800'}`}>{(stats.overdue || 0).toString().padStart(2, '0')}</span>
                                <span className={`text-[13px] font-black ${statusFilter === 'OVERDUE' ? 'text-white' : 'text-red-700'}`}>₹{(stats.overdueAmount || 0).toLocaleString()}</span>
                            </div>
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by invoice number or customer..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        suppressHydrationWarning
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    />
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
                                                {formatDate(invoice.invoiceDate)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                                                {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
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
                                                    <>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                openPaymentModal(invoice);
                                                            }}
                                                            className="p-2 inline-flex text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                                                            title="Record Payment"
                                                        >
                                                            <IndianRupee className="w-4 h-4" />
                                                        </button>
                                                        <Link href={`/admin/invoicing/invoices/${invoice.id}/edit`}
                                                            className="p-2 inline-flex text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                                            <Pencil className="w-4 h-4" />
                                                        </Link>
                                                    </>
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

            {/* Quick Record Payment Modal */}
            {showPaymentModal && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
                    <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                            <h2 className="text-xl font-bold">Quick Record Payment</h2>
                            <p className="text-emerald-50 mt-1">Payment for {selectedInvoice.invoiceNumber}</p>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Amount (₹)</label>
                                    <input type="number" required value={paymentForm.amount}
                                        onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg"
                                        max={selectedInvoice.balance} min={0.01} step={0.01} />
                                    <p className="text-[10px] text-gray-400 mt-1">Remaining Balance: ₹{selectedInvoice.balance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment Date</label>
                                    <input type="date" required value={paymentForm.paymentDate}
                                        onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mode</label>
                                    <select value={paymentForm.paymentMode}
                                        onChange={e => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold">
                                        <option value="UPI">UPI</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="CASH">Cash</option>
                                        <option value="CHEQUE">Cheque</option>
                                        <option value="CARD">Card</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Reference / Txn ID</label>
                                    <input type="text" value={paymentForm.reference}
                                        onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                                        placeholder="UTR-xxxx"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={actionLoading}
                                    className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
