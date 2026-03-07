'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Package, IndianRupee, FileText, Plus, Trash2, Loader2 } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    originPrice: number;
    thumbImage: string;
}

interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DRAFT'];
const PAYMENT_STATUS_OPTIONS = ['PENDING', 'SUCCESSFUL', 'FAILED'];
const PAYMENT_METHOD_OPTIONS = ['ONLINE', 'COD', 'BANK_TRANSFER', 'UPI', 'CASH'];

export default function AddOrderPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Customer fields
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [address, setAddress] = useState('');

    // Order fields
    const [status, setStatus] = useState('DRAFT');
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [shippingFee, setShippingFee] = useState('0');
    const [discountAmount, setDiscountAmount] = useState('0');
    const [promoCode, setPromoCode] = useState('');
    const [notes, setNotes] = useState('');

    // Items
    const [items, setItems] = useState<OrderItem[]>([
        { productId: '', productName: '', quantity: 1, price: 0 },
    ]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products?limit=1000');
            const data = await res.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        setItems([...items, { productId: '', productName: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
        const updated = [...items];
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                updated[index] = {
                    ...updated[index],
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                };
            }
        } else {
            (updated[index] as any)[field] = value;
        }
        setItems(updated);
    };

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + parseFloat(shippingFee || '0') - parseFloat(discountAmount || '0');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerName.trim()) {
            alert('Customer name is required');
            return;
        }

        const validItems = items.filter(item => item.productId && item.quantity > 0);
        if (validItems.length === 0) {
            alert('Please add at least one product to the order');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    customerEmail: customerEmail || null,
                    customerPhone: customerPhone || null,
                    address: address || null,
                    status,
                    paymentStatus,
                    paymentMethod,
                    shippingFee: parseFloat(shippingFee || '0'),
                    discountAmount: parseFloat(discountAmount || '0'),
                    promoCode: promoCode || null,
                    total: total > 0 ? total : 0,
                    items: validItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push('/admin/orders');
            } else {
                alert(data.error || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/orders"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Order</h1>
                        <p className="text-sm text-gray-500 mt-1">Create a manual order entry</p>
                    </div>
                </div>

                {/* Customer Information */}
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
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="customer@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="+91 XXXXXXXXXX"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Shipping Address
                            </label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Full shipping address"
                            />
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Order Items</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-12 sm:col-span-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product *
                                    </label>
                                    <select
                                        value={item.productId}
                                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Select a product</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} — ₹{product.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Qty *
                                    </label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                        min="1"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        disabled={items.length <= 1}
                                        className="p-2.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Subtotal */}
                    <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                        <p className="text-sm text-gray-500">
                            Subtotal: <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <IndianRupee className="w-5 h-5 text-purple-600" />
                        <h2 className="font-semibold text-gray-900">Order Details</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Status
                            </label>
                            <select
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {PAYMENT_STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Method
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {PAYMENT_METHOD_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Shipping Fee (₹)
                            </label>
                            <input
                                type="number"
                                value={shippingFee}
                                onChange={(e) => setShippingFee(e.target.value)}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount (₹)
                            </label>
                            <input
                                type="number"
                                value={discountAmount}
                                onChange={(e) => setDiscountAmount(e.target.value)}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Promo Code
                            </label>
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>Shipping</span>
                            <span>₹{parseFloat(shippingFee || '0').toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>Discount</span>
                            <span>-₹{parseFloat(discountAmount || '0').toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 mt-3 pt-3 border-t border-gray-200">
                            <span>Total</span>
                            <span>₹{(total > 0 ? total : 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h2 className="font-semibold text-gray-900">Notes</h2>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder="Internal notes about this order..."
                    ></textarea>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <Link
                        href="/admin/orders"
                        className="px-6 py-3 text-center font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Order'
                        )}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
