import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, User, Calendar, FileText, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateInvoicePage() {
    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/invoices"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Invoice</h1>
                        <p className="text-sm text-gray-500 mt-1">Create a new invoice in Zoho</p>
                    </div>
                </div>

                {/* Form */}
                <form action="/api/admin/invoices" method="POST" className="space-y-6">
                    {/* Customer Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Customer Details</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Business or customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="customerEmail"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="customer@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Invoice Details</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Invoice Number
                                </label>
                                <input
                                    type="text"
                                    name="invoiceNumber"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Leave blank for auto"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Invoice Date *
                                </label>
                                <input
                                    type="date"
                                    name="invoiceDate"
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-600" />
                                <h2 className="font-semibold text-gray-900">Line Items</h2>
                            </div>
                            <button
                                type="button"
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                        </div>

                        {/* Item Row */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-12 sm:col-span-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Item/Description *
                                    </label>
                                    <input
                                        type="text"
                                        name="items[0][name]"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Product or service name"
                                    />
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Qty *
                                    </label>
                                    <input
                                        type="number"
                                        name="items[0][quantity]"
                                        required
                                        min="1"
                                        defaultValue="1"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rate (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        name="items[0][rate]"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-2 flex justify-end">
                                    <button
                                        type="button"
                                        className="p-2.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            placeholder="Any additional notes for the customer..."
                        ></textarea>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <Link
                            href="/admin/invoices"
                            className="px-6 py-3 text-center font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            name="action"
                            value="draft"
                            className="px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="submit"
                            name="action"
                            value="send"
                            className="px-6 py-3 font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700"
                        >
                            Create & Send
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
