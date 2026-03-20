import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PrintInvoicePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    
    const invoice = await prisma.invoice.findUnique({
        where: { id }
    });

    if (!invoice) {
        notFound();
    }

    const lineItems = (invoice.lineItems as any[]) || [];

    const formatCurrency = (amount: number | null | undefined) => {
        const val = amount || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(val);
    };

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            {/* Screen-only Print Bar */}
            <div className="w-full bg-black/90 backdrop-blur-md text-white p-4 flex justify-between items-center print:hidden sticky top-0 z-50">
                <div className="max-w-[21cm] mx-auto w-full flex items-center px-4">
                    <div className="flex items-center gap-4">
                        <Printer className="w-5 h-5 text-purple-400" />
                        <span className="font-bold tracking-tight">Print Invoice: {invoice.invoiceNumber}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <button 
                            onClick={() => window.print()}
                            className="bg-purple-600 text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition-all active:scale-95"
                        >
                            Print or Save PDF
                        </button>
                        <button 
                            onClick={() => window.close()}
                            className="bg-gray-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* A4 Printable Page Container */}
            <div className="w-full max-w-[21cm] bg-white min-h-[29.7cm] shadow-2xl print:shadow-none mx-auto relative overflow-hidden my-10 print:my-0">
                
                {/* Premium Border Accent */}
                <div className="h-2 w-full bg-purple-600" />
                
                <div className="p-16 flex-1 flex flex-col pt-12">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-16">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                                Anose <span className="text-purple-600">Beauty</span>
                            </h1>
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] space-y-1">
                                <p>India's Premium Beauty & Spa Brand</p>
                                <p className="text-gray-500 font-semibold tracking-wide lowercase">wecare@anosebeauty.com | +91 9110134408</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-6xl font-black text-gray-100 uppercase tracking-tighter leading-none mb-4">Invoice</h2>
                            <div className="space-y-1 text-sm">
                                <p className="flex justify-end items-center gap-2">
                                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Number</span>
                                    <span className="font-black text-gray-900">{invoice.invoiceNumber}</span>
                                </p>
                                <p className="flex justify-end items-center gap-2">
                                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Date</span>
                                    <span className="font-bold text-gray-800">{formatDate(invoice.invoiceDate)}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Client Info Grid */}
                    <div className="grid grid-cols-2 gap-12 mb-16 border-y border-gray-100 py-10">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 mb-4">Bill To</h4>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{invoice.customerName}</h3>
                            <div className="text-sm text-gray-500 font-medium space-y-0.5">
                                {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
                                {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
                            </div>
                        </div>
                        <div className="flex flex-col justify-end items-end space-y-4">
                            <div className="text-right">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1 text-right">Due Date</h4>
                                <p className="text-lg font-black text-gray-900">{formatDate(invoice.dueDate)}</p>
                            </div>
                            <div className="px-4 py-2 bg-purple-50 rounded-xl text-right">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-0.5">Status</h4>
                                <p className={`text-sm font-black uppercase ${invoice.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {invoice.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="flex-1">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 w-12">#</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center w-24">HSN</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center w-20">Qty</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right w-32">Rate</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right w-32">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lineItems.map((item, i) => (
                                    <tr key={i} className="group">
                                        <td className="py-6 text-sm font-black text-gray-300">{(i + 1).toString().padStart(2, '0')}</td>
                                        <td className="py-6">
                                            <p className="font-black text-gray-900 text-base">{item.name}</p>
                                            {item.description && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-medium">{item.description}</p>}
                                        </td>
                                        <td className="py-6 text-center text-sm font-bold text-gray-700 font-mono tracking-tighter">{item.hsnCode || '-'}</td>
                                        <td className="py-6 text-center text-sm font-black text-gray-900">{item.quantity}</td>
                                        <td className="py-6 text-right text-sm font-medium text-gray-600">{formatCurrency(item.rate)}</td>
                                        <td className="py-6 text-right text-base font-black text-gray-900">{formatCurrency(item.amount || item.quantity * item.rate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary & Totals */}
                    <div className="mt-16 flex justify-between items-start pt-12 border-t-2 border-gray-900">
                        <div className="max-w-xs">
                            {invoice.notes && (
                                <div className="mb-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 mb-3">Notes</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{invoice.notes}</p>
                                </div>
                            )}
                            {invoice.terms && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 mb-3">Terms</h4>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">{invoice.terms}</p>
                                </div>
                            )}
                        </div>
                        <div className="w-80 space-y-4">
                            <div className="space-y-3 px-6">
                                <div className="flex justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-gray-600">{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                {invoice.taxAmount > 0 && (
                                    <div className="flex justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        <span>Tax ({invoice.taxRate}%)</span>
                                        <span className="text-gray-600">{formatCurrency(invoice.taxAmount)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-black text-white p-8 rounded-3xl flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-2">Grand Total</span>
                                <span className="text-4xl font-black tracking-tighter">{formatCurrency(invoice.total)}</span>
                                {invoice.balance > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10 w-full flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Balance Due</span>
                                        <span className="text-lg font-black text-rose-400">{formatCurrency(invoice.balance)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto Print Script */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `window.onload = function() { setTimeout(function() { window.print(); }, 1000); }`
                }}
            />
        </div>
    );
}
