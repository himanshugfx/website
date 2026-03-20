import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Printer } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Screen-only Print Bar */}
            <div className="w-full bg-purple-900 text-white p-4 flex justify-between items-center print:hidden shadow-md fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center gap-3 max-w-[21cm] mx-auto w-full px-4">
                    <Printer className="w-5 h-5 text-purple-300" />
                    <span className="font-semibold tracking-wide">Ready to Print or Save as PDF</span>
                    <button 
                        onClick={() => window.print()}
                        className="ml-auto bg-white text-purple-900 px-6 py-2 rounded-lg font-bold text-sm shadow hover:bg-purple-50 transition-colors"
                    >
                        Print Details
                    </button>
                    <button 
                        onClick={() => window.close()}
                        className="bg-purple-800 text-purple-100 px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* A4 Printable Page Container */}
            <div className="w-full max-w-[21cm] bg-white min-h-[29.7cm] shadow-2xl mt-24 mb-10 print:mt-0 print:mb-0 print:shadow-none mx-auto relative overflow-hidden">
                
                {/* Purple Decorative Header */}
                <div className="h-6 w-full bg-purple-900" />
                <div className="p-12 pb-6 print:p-8">
                    
                    {/* Header: Company & Invoice Info */}
                    <div className="flex justify-between items-start mb-12">
                        {/* Company Details */}
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Anose <span className="text-purple-600">Beauty</span></h1>
                            <p className="text-sm text-gray-500 font-medium">wecare@anosebeauty.com</p>
                            <p className="text-sm text-gray-500 font-medium">+91 9110134408</p>
                        </div>

                        {/* Invoice Quick Stats */}
                        <div className="text-right space-y-2">
                            <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest leading-none mb-4">Invoice</h2>
                            <div className="flex justify-end gap-6 text-sm">
                                <div className="text-right">
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-0.5">Invoice No</p>
                                    <p className="font-bold text-gray-900">{invoice.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-0.5">Date</p>
                                    <p className="font-bold text-gray-900">{formatDate(invoice.invoiceDate)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-0.5">Status</p>
                                    <p className={`font-bold ${invoice.status === 'PAID' ? 'text-emerald-600' : invoice.status === 'OVERDUE' ? 'text-rose-600' : 'text-amber-600'}`}>
                                        {invoice.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-12 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <p className="text-xs font-black uppercase tracking-widest text-purple-600 mb-3">Billed To</p>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{invoice.customerName}</h3>
                        {invoice.customerEmail && <p className="text-sm text-gray-600 font-medium">{invoice.customerEmail}</p>}
                        {invoice.customerPhone && <p className="text-sm text-gray-600 font-medium">{invoice.customerPhone}</p>}
                        {invoice.dueDate && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs font-bold text-gray-500">Payment Due: <span className="text-gray-900">{formatDate(invoice.dueDate)}</span></p>
                            </div>
                        )}
                    </div>

                    {/* Line Items */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-purple-100 text-left">
                                <th className="py-3 px-2 text-xs font-black uppercase tracking-wider text-purple-900">Description</th>
                                <th className="py-3 px-2 text-xs font-black uppercase tracking-wider text-purple-900 text-center w-24">HSN</th>
                                <th className="py-3 px-2 text-xs font-black uppercase tracking-wider text-purple-900 text-center w-24">Qty</th>
                                <th className="py-3 px-2 text-xs font-black uppercase tracking-wider text-purple-900 text-right w-32">Rate</th>
                                <th className="py-3 px-2 text-xs font-black uppercase tracking-wider text-purple-900 text-right w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {lineItems.map((item, i) => (
                                <tr key={i} className="group">
                                    <td className="py-4 px-2">
                                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                        {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>}
                                    </td>
                                    <td className="py-4 px-2 text-center text-sm font-medium text-gray-600">{item.hsnCode || '-'}</td>
                                    <td className="py-4 px-2 text-center text-sm font-bold text-gray-900">{item.quantity}</td>
                                    <td className="py-4 px-2 text-right text-sm font-medium text-gray-600">{formatCurrency(item.rate)}</td>
                                    <td className="py-4 px-2 text-right text-sm font-bold text-gray-900">{formatCurrency(item.amount || item.quantity * item.rate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className="flex justify-end mb-16">
                        <div className="w-80 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between font-medium text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                {invoice.discount > 0 && (
                                    <div className="flex justify-between font-medium text-emerald-600">
                                        <span>Discount {invoice.discountType === 'PERCENTAGE' ? `(${invoice.discount}%)` : ''}</span>
                                        <span>-{formatCurrency(invoice.discountType === 'PERCENTAGE' ? (invoice.subtotal * invoice.discount / 100) : invoice.discount)}</span>
                                    </div>
                                )}
                                {invoice.taxAmount > 0 && (
                                    <div className="flex justify-between font-medium text-gray-600">
                                        <span>Tax ({invoice.taxRate}%)</span>
                                        <span>{formatCurrency(invoice.taxAmount)}</span>
                                    </div>
                                )}
                                <div className="pt-3 mt-3 border-t-2 border-dashed border-gray-200 flex justify-between items-center pb-1">
                                    <span className="font-black text-gray-900 text-base uppercase tracking-wider">Total</span>
                                    <span className="font-black text-purple-700 text-xl">{formatCurrency(invoice.total)}</span>
                                </div>
                                {invoice.status !== 'PAID' && (
                                    <div className="flex justify-between items-center pt-2 text-xs font-bold">
                                        <span className="text-gray-500 uppercase">Balance Due</span>
                                        <span className="text-rose-600 text-sm">{formatCurrency(invoice.balance)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Notes */}
                    <div className="grid grid-cols-2 gap-8 text-sm text-gray-600">
                        {invoice.notes && (
                            <div>
                                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-2">Notes</h4>
                                <p className="whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                            </div>
                        )}
                        {invoice.terms && (
                            <div>
                                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-2">Terms & Conditions</h4>
                                <p className="whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                        <p className="text-purple-900 font-bold uppercase tracking-widest text-xs">Thank you for your business!</p>
                    </div>

                </div>
            </div>

            {/* Auto Print Script */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `window.onload = function() { setTimeout(function() { window.print(); }, 500); }`
                }}
            />
        </div>
    );
}
