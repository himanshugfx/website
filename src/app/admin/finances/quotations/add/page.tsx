import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, ClipboardList, User, Package, FileText, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function addQuotation(formData: FormData) {
    'use server';

    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const quotationDate = formData.get('quotationDate') as string;
    const expiryDate = formData.get('expiryDate') as string;
    const notes = formData.get('notes') as string;
    const terms = formData.get('terms') as string;

    // Parse line items from form
    const itemNames = formData.getAll('itemName') as string[];
    const itemQuantities = formData.getAll('itemQuantity') as string[];
    const itemRates = formData.getAll('itemRate') as string[];

    const lineItems = itemNames.map((name, i) => ({
        name,
        quantity: parseFloat(itemQuantities[i]) || 1,
        rate: parseFloat(itemRates[i]) || 0,
        amount: (parseFloat(itemQuantities[i]) || 1) * (parseFloat(itemRates[i]) || 0),
    })).filter(item => item.name && item.rate > 0);

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

    // Generate quotation number
    const count = await prisma.quotation.count();
    const quotationNumber = `QT-${String(count + 1).padStart(4, '0')}`;

    await prisma.quotation.create({
        data: {
            quotationNumber,
            customerName,
            customerEmail: customerEmail || null,
            quotationDate: new Date(quotationDate),
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            notes: notes || null,
            terms: terms || null,
            lineItems,
            subtotal,
            total: subtotal,
            status: 'DRAFT',
        },
    });

    redirect('/admin/finances/quotations');
}

export default function AddQuotationPage() {
    const today = new Date().toISOString().split('T')[0];
    const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return (
        <AdminLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/finances/quotations"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Quotation</h1>
                        <p className="text-sm text-gray-500 mt-1">Create a new quotation for a customer</p>
                    </div>
                </div>

                {/* Form */}
                <form action={addQuotation} className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Customer Information</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Email
                                </label>
                                <input
                                    type="email"
                                    name="customerEmail"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="w-3 h-3 inline mr-1" /> Quote Date *
                                </label>
                                <input
                                    type="date"
                                    name="quotationDate"
                                    required
                                    defaultValue={today}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="w-3 h-3 inline mr-1" /> Expiry Date
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    defaultValue={defaultExpiry}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Line Items</h2>
                        </div>

                        <div className="space-y-3" id="line-items">
                            {/* Item 1 */}
                            <div className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-6">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        name="itemName"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        placeholder="Product/Service name"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                                    <input
                                        type="number"
                                        name="itemQuantity"
                                        defaultValue="1"
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Rate (₹)</label>
                                    <input
                                        type="number"
                                        name="itemRate"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            {/* Item 2 */}
                            <div className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-6">
                                    <input
                                        type="text"
                                        name="itemName"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        placeholder="Product/Service name"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        name="itemQuantity"
                                        defaultValue="1"
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <input
                                        type="number"
                                        name="itemRate"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            {/* Item 3 */}
                            <div className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-6">
                                    <input
                                        type="text"
                                        name="itemName"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        placeholder="Product/Service name"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        name="itemQuantity"
                                        defaultValue="1"
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <input
                                        type="number"
                                        name="itemRate"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">Add up to 3 line items. Empty items will be ignored.</p>
                    </div>

                    {/* Notes & Terms */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Notes & Terms</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    name="notes"
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Any notes for the customer..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                                <textarea
                                    name="terms"
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Payment terms, delivery terms, etc..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <Link
                            href="/admin/finances/quotations"
                            className="px-6 py-3 text-center font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="px-6 py-3 font-semibold text-white bg-black rounded-xl hover:bg-black/80"
                        >
                            Create Quotation
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
