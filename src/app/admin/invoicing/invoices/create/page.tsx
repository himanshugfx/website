'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Plus, Trash2, Save, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { IndianRupee, Calendar, FileText, User, ShoppingBag } from 'lucide-react';

interface LineItem {
    name: string;
    description: string;
    quantity: number;
    rate: number;
    hsnCode: string;
    taxRate: number;
    taxAmount: number;
}

export default function CreateInvoicePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [billingAddress, setBillingAddress] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [terms, setTerms] = useState('Payment is due within the specified date. Thank you for your business.');
    const [taxRate, setTaxRate] = useState(18);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { name: '', description: '', quantity: 1, rate: 0, hsnCode: '', taxRate: 18, taxAmount: 0 }
    ]);

    // Smart Defaults: Due Date = +30 days
    useEffect(() => {
        if (invoiceDate && !dueDate) {
            const date = new Date(invoiceDate);
            date.setDate(date.getDate() + 30);
            setDueDate(date.toISOString().split('T')[0]);
        }
    }, [invoiceDate]);

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products/lite');
                const data = await res.json();
                if (data.success) setProducts(data.products);
            } catch (err) {
                console.error('Failed to fetch products');
            }
        };
        fetchProducts();
    }, []);

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const updated = [...lineItems];
            const rate = product.price || 0;
            const taxRate = product.taxRate || 18;
            const quantity = updated[index].quantity || 1;
            const taxAmount = (rate * quantity * taxRate) / 100;
            
            updated[index] = {
                ...updated[index],
                name: product.name,
                rate: rate,
                hsnCode: product.hsnCode || '',
                taxRate: taxRate,
                taxAmount: taxAmount,
            };
            setLineItems(updated);
        }
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { name: '', description: '', quantity: 1, rate: 0, hsnCode: '', taxRate: 18, taxAmount: 0 }]);
    };

    const removeLineItem = (index: number) => {
        if (lineItems.length === 1) return;
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
        const updated = [...lineItems];
        (updated[index] as any)[field] = value;
        
        // Recalculate taxAmount for this item
        const item = updated[index];
        item.taxAmount = (item.quantity * item.rate * item.taxRate) / 100;
        
        setLineItems(updated);
    };

    // Calculations
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = lineItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const discountAmount = discountType === 'PERCENTAGE' ? (subtotal * discount / 100) : discount;
    const total = subtotal + taxAmount - discountAmount;

    const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const handleSubmit = async (action: 'draft' | 'send') => {
        if (!customerName.trim()) return alert('Please enter a customer name');
        if (lineItems.some(item => !item.name.trim() || item.rate <= 0)) return alert('Please fill in all line items with valid rates');

        setSaving(true);
        try {
            const res = await fetch('/api/invoicing/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName, customerEmail, customerPhone, billingAddress, shippingAddress,
                    invoiceDate, dueDate: dueDate || null,
                    lineItems, notes, terms, taxRate, discount, discountType,
                }),
            });
            const data = await res.json();
            if (data.success) {
                if (action === 'send' && data.invoice?.id) {
                    await fetch(`/api/invoicing/invoices/${data.invoice.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'SENT' }),
                    });
                }
                router.push('/admin/invoicing/invoices');
            } else {
                alert(data.error || 'Failed to create invoice');
            }
        } catch (err) {
            alert('Error creating invoice');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-[1200px] mx-auto pb-32">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/invoicing/invoices" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">New Invoice</h1>
                        <p className="text-sm text-gray-500">Draft your invoice and send it to your customer</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Customer & Dates Section */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-600" />
                                <h2 className="font-bold text-gray-900">Basic Information</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Name *</label>
                                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium" 
                                            placeholder="Who is this invoice for?" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                        <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
                                            placeholder="billing@customer.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                        <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
                                            placeholder="+91 XXX-XXX-XXXX" />
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Billing Address</label>
                                            <textarea value={billingAddress} onChange={e => setBillingAddress(e.target.value)} rows={3}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm resize-none" 
                                                placeholder="123 Customer St..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</label>
                                            <textarea value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} rows={3}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm resize-none" 
                                                placeholder="Leave empty if same as billing" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-blue-500" /> Invoice Date
                                        </label>
                                        <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-amber-500" /> Due Date
                                        </label>
                                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items Section */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                                    <h2 className="font-bold text-gray-900">Line Items</h2>
                                </div>
                                <button type="button" onClick={addLineItem}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-100">
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>

                            <div className="p-0 sm:p-6">
                                <div className="space-y-4 px-4 sm:px-0">
                                    {lineItems.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                                <ShoppingBag className="w-10 h-10 text-emerald-200" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">No items added yet</h3>
                                            <p className="text-gray-500 text-sm max-w-xs mt-1">Get started by adding your first product to this invoice.</p>
                                            <button type="button" onClick={addLineItem} className="mt-6 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                                                Add First Item
                                            </button>
                                        </div>
                                    ) : (
                                        lineItems.map((item, i) => (
                                            <div key={i} className="group relative grid grid-cols-12 gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                                <div className="col-span-12 sm:col-span-4 space-y-3">
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Product / Service Name</label>
                                                    <div className="relative">
                                                        <select
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) => handleProductSelect(i, e.target.value)}
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>Select a product...</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                        <input type="text" value={item.name} onChange={e => updateLineItem(i, 'name', e.target.value)} required
                                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold pr-8" 
                                                            placeholder="Product name..." />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            <Plus className="w-3 h-3 text-gray-400" />
                                                        </div>
                                                    </div>
                                                    <textarea value={item.description} onChange={e => updateLineItem(i, 'description', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-gray-500 resize-none" 
                                                        placeholder="Description (optional)" rows={1} />
                                                </div>
                                                <div className="col-span-4 sm:col-span-2 pt-0 sm:pt-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">HSN Code</label>
                                                    <input type="text" value={item.hsnCode} onChange={e => updateLineItem(i, 'hsnCode', e.target.value)}
                                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-center font-mono" placeholder="HSN" />
                                                </div>
                                                <div className="col-span-4 sm:col-span-1 pt-0 sm:pt-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider text-center">Qty</label>
                                                    <input type="number" value={item.quantity} onChange={e => updateLineItem(i, 'quantity', Number(e.target.value))} min="1"
                                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-center font-bold" placeholder="Qty" />
                                                </div>
                                                <div className="col-span-4 sm:col-span-2 pt-0 sm:pt-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider text-center">Rate (₹)</label>
                                                    <input type="number" value={item.rate || ''} onChange={e => updateLineItem(i, 'rate', Number(e.target.value))} min="0" step="0.01"
                                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-center font-bold" placeholder="Rate (₹)" />
                                                </div>
                                                <div className="col-span-4 sm:col-span-1 pt-0 sm:pt-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider text-center">Tax %</label>
                                                    <input type="number" value={item.taxRate} onChange={e => updateLineItem(i, 'taxRate', Number(e.target.value))} min="0" max="100" step="0.5"
                                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-center font-bold" placeholder="Tax %" />
                                                    <div className="text-[10px] text-gray-400 text-right mt-1">+ {formatCurrency(item.taxAmount)}</div>
                                                </div>
                                                <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 border-gray-100 pt-3 sm:pt-4">
                                                    <div className="text-right">
                                                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Amount</label>
                                                        <span className="font-black text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">{formatCurrency(item.quantity * item.rate + item.taxAmount)}</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeLineItem(i)} disabled={lineItems.length === 1}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8 sticky top-6">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-black rounded-3xl p-8 text-white shadow-xl shadow-purple-900/20">
                            <h2 className="text-xs font-black text-purple-300 uppercase tracking-widest mb-6">Total Calculation</h2>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-purple-200/60 font-medium">Subtotal</span>
                                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                                </div>

                                <div className="py-4 border-y border-white/10 space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-purple-400 font-medium">Total GST</span>
                                            <span className="font-bold text-emerald-400">+{formatCurrency(taxAmount)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-purple-200/60 font-medium whitespace-nowrap">Discount</span>
                                            <div className="flex items-center gap-1">
                                                <input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} min="0"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-purple-400" placeholder="0" />
                                                <select value={discountType} onChange={e => setDiscountType(e.target.value as any)}
                                                    className="bg-white/10 border-0 rounded-lg px-1 py-1 text-[10px] font-black uppercase">
                                                    <option className="bg-gray-900" value="PERCENTAGE">%</option>
                                                    <option className="bg-gray-900" value="FIXED">₹</option>
                                                </select>
                                            </div>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-red-400">Savings Applied</span>
                                                <span className="font-medium text-red-400">-{formatCurrency(discountAmount)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none mb-1">Grand Total</span>
                                            <div className="flex items-center gap-1.5 text-xs text-purple-200/50">
                                                <IndianRupee className="w-3 h-3" />
                                                <span>Final Amount</span>
                                            </div>
                                        </div>
                                        <span className="text-4xl font-black tracking-tighter text-white">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Terms */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <FileText className="w-3 h-3 text-purple-500" /> Customer Notes
                                </label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm font-medium" 
                                    placeholder="Add a friendly note..." />
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                    <FileText className="w-3 h-3 text-blue-500" /> Terms & Conditions
                                </label>
                                <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-xs text-gray-500 leading-relaxed" 
                                    placeholder="Company policies..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 sm:left-64 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-40 transform transition-all duration-300 translate-y-0 group">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <IndianRupee className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Total</div>
                                <div className="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(total)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Link href="/admin/invoicing/invoices" className="flex-1 sm:flex-none px-6 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all text-center">
                            Discard
                        </Link>
                        <button onClick={() => handleSubmit('draft')} disabled={saving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Save className="w-4 h-4 text-gray-400" />}
                            Draft
                        </button>
                        <button onClick={() => handleSubmit('send')} disabled={saving}
                            className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-black text-white bg-black rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-gray-200 active:scale-[0.98]">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Create & Send
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
