'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Printer, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { numberToWords } from '@/lib/utils';

interface Invoice {
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
}

function BulkPrintContent() {
    const searchParams = useSearchParams();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    const ids = searchParams.get('ids')?.split(',') || [];

    useEffect(() => {
        if (ids.length > 0) {
            fetchInvoices();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchInvoices = async () => {
        try {
            // Fetch multiple invoices in parallel
            const promises = ids.map(id => 
                fetch(`/api/invoicing/invoices/${id}`).then(res => res.json())
            );
            const results = await Promise.all(promises);
            setInvoices(results.map(r => r.invoice).filter(Boolean));
        } catch (err) {
            console.error('Failed to fetch invoices for bulk print', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number | null | undefined) => {
        const val = amount || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(val);
    };

    const formatDate = (date: string | null | undefined) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Preparing {ids.length} Invoices...</p>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <p className="text-gray-500 mb-4">No invoices selected or found.</p>
                <Link href="/admin/invoicing/invoices" className="text-purple-600 font-bold flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Invoices
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center overflow-x-hidden">
            {/* Control Bar (Screen only) */}
            <div className="w-full bg-black/90 backdrop-blur-md text-white p-4 flex justify-between items-center print:hidden sticky top-0 z-50">
                <div className="max-w-[21cm] mx-auto w-full flex items-center px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/invoicing/invoices" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <span className="font-bold tracking-tight">Bulk Export: {invoices.length} Invoices</span>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <button 
                            onClick={() => window.print()}
                            className="bg-purple-600 text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" /> Print PDFs
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoices Stack */}
            <div className="w-full max-w-[21cm] space-y-8 print:space-y-0 print:w-full">
                {invoices.map((invoice, idx) => {
                    const cgst = (invoice.taxAmount / 2);
                    const sgst = (invoice.taxAmount / 2);
                    
                    return (
                        <div key={invoice.id} className="bg-white shadow-2xl print:shadow-none min-h-[29.7cm] flex flex-col relative page-break mb-10 print:mb-0">
                            {/* Premium Border Accent */}
                            <div className="h-2 w-full bg-purple-600" />
                            
                            <div className="p-16 flex-1 flex flex-col pt-12">
                                {/* Header Section */}
                                <div className="flex justify-between items-start mb-16">
                                    <div className="space-y-4">
                                        <div className="relative w-48 h-12 mb-4">
                                            <Image 
                                                src="/assets/images/anose-logo.webp" 
                                                alt="Anose Beauty Logo" 
                                                fill 
                                                className="object-contain object-left"
                                                priority
                                            />
                                        </div>
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] space-y-1.5 leading-relaxed">
                                            <p className="text-gray-900 font-black text-xs">Anose Beauty Private Limited</p>
                                            <p>B-103, Sector 6, Noida,</p>
                                            <p>Uttar Pradesh, India (201301)</p>
                                            <p className="text-purple-600 font-semibold lowercase tracking-normal">wecare@anosebeauty.com | +91 9110134408</p>
                                            <p className="mt-2 text-[9px] text-gray-300">GSTIN: 09AAXCA1234A1Z5 (Sample)</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-7xl font-black text-gray-50 uppercase tracking-tighter leading-none mb-6">Invoice</h2>
                                        <div className="space-y-2 text-sm">
                                            <p className="flex justify-end items-center gap-4">
                                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Invoice No.</span>
                                                <span className="font-black text-gray-900 border-b-2 border-purple-100 pb-0.5">{invoice.invoiceNumber}</span>
                                            </p>
                                            <p className="flex justify-end items-center gap-4">
                                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Dated</span>
                                                <span className="font-bold text-gray-800">{formatDate(invoice.invoiceDate)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Client Info Grid */}
                                <div className="grid grid-cols-2 gap-12 mb-16 border-y-2 border-gray-900 py-12">
                                    <div className="border-r border-gray-100 pr-12">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 mb-6 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-purple-600 rounded-full" /> Bill To
                                        </h4>
                                        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-none">{invoice.customerName}</h3>
                                        <div className="text-sm text-gray-500 font-semibold space-y-1 leading-relaxed">
                                            {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
                                            {invoice.customerPhone && <p className="text-gray-900">{invoice.customerPhone}</p>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between items-end">
                                        <div className="text-right">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Due Date</h4>
                                            <p className="text-xl font-black text-gray-900">{formatDate(invoice.dueDate)}</p>
                                        </div>
                                        <div className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-right shadow-xl shadow-purple-500/20">
                                            <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-200 mb-0.5">Status</h4>
                                            <p className="text-sm font-black uppercase tracking-tight">
                                                {invoice.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Line Items Table */}
                                <div className="flex-1">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left border-b-2 border-gray-100">
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 w-12">#</th>
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description of Goods</th>
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center w-24">HSN/SAC</th>
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center w-24">Qty/Unit</th>
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right w-32">Rate</th>
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right w-32">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(invoice.lineItems as any[] || []).map((item, i) => (
                                                <tr key={i} className="group">
                                                    <td className="py-8 text-sm font-black text-gray-300 align-top">{(i + 1).toString().padStart(2, '0')}</td>
                                                    <td className="py-8 align-top pr-10">
                                                        <p className="font-black text-gray-900 text-lg leading-tight mb-2 uppercase tracking-tight">{item.name}</p>
                                                        {item.description && <p className="text-xs text-gray-500 leading-relaxed font-semibold italic">{item.description}</p>}
                                                    </td>
                                                    <td className="py-8 align-top text-center text-sm font-bold text-gray-400 font-mono tracking-tighter">{item.hsnCode || '-'}</td>
                                                    <td className="py-8 align-top text-center">
                                                        <span className="text-sm font-black text-gray-900">{item.quantity}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Nos</span>
                                                    </td>
                                                    <td className="py-8 align-top text-right text-sm font-bold text-gray-600 tracking-tight">{formatCurrency(item.rate)}</td>
                                                    <td className="py-8 align-top text-right text-lg font-black text-gray-900 tracking-tighter">{formatCurrency(item.amount || item.quantity * item.rate)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary Section */}
                                <div className="mt-12 flex flex-col border-t-2 border-gray-900 pt-10">
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="max-w-md">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 mb-3">Amount in Words</h4>
                                            <p className="text-sm font-black text-purple-600 italic tracking-tight">{numberToWords(invoice.total)}</p>
                                            
                                            {invoice.notes && (
                                                <div className="mt-10 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">Notes</h4>
                                                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line font-medium">{invoice.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="w-80 space-y-4">
                                            <div className="space-y-4 px-6 mb-6">
                                                <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                                                    <span>Subtotal</span>
                                                    <span className="text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                                                </div>
                                                {invoice.discount > 0 && (
                                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                                        <span className="text-rose-500">Discount</span>
                                                        <span className="text-rose-500">-{formatCurrency(invoice.discount)}</span>
                                                    </div>
                                                )}
                                                {invoice.taxAmount > 0 && (
                                                    <div className="space-y-2 pt-2 border-t border-gray-50">
                                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <span>CGST ({(invoice.taxRate/2).toFixed(1)}%)</span>
                                                            <span className="text-gray-600">{formatCurrency(cgst)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <span>SGST ({(invoice.taxRate/2).toFixed(1)}%)</span>
                                                            <span className="text-gray-600">{formatCurrency(sgst)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] flex flex-col items-end shadow-2xl shadow-gray-900/20">
                                                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-purple-400 mb-3">Grand Total</span>
                                                <span className="text-5xl font-black tracking-tighter">{formatCurrency(invoice.total)}</span>
                                                {invoice.balance > 0 && (
                                                    <div className="mt-6 pt-6 border-t border-white/10 w-full flex justify-between items-center">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Due</span>
                                                        <span className="text-xl font-black text-rose-400">{formatCurrency(invoice.balance)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Details */}
                                    <div className="grid grid-cols-2 gap-20 items-end mt-12 pb-10">
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 mb-2">Terms & Conditions</h4>
                                                <p className="text-[9px] text-gray-400 leading-relaxed font-semibold italic tracking-tight uppercase">Computer generated invoice. No signature required.</p>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-full h-0.5 bg-gray-900 mb-6" />
                                            <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-1 leading-none">For Anose Beauty Private Limited</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Authorized Signatory</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Decor */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full blur-[120px] -ml-48 -mb-48 opacity-30 pointer-events-none" />

                            {/* Page Numbers for Print */}
                            <div className="absolute bottom-10 left-16 text-[9px] font-black text-gray-300 tracking-[0.5em] hidden print:block uppercase">
                                Invoice {idx + 1} of {invoices.length}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Custom Styles for Print */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                    .page-break:last-child {
                        page-break-after: auto;
                    }
                }
                @page {
                    size: A4;
                    margin: 0;
                }
            `}</style>
            
            {/* Auto-print script */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `window.onload = function() { setTimeout(function() { window.print(); }, 1500); }`
                }}
            />
        </div>
    );
}

export default function BulkPrintPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <BulkPrintContent />
        </Suspense>
    );
}
