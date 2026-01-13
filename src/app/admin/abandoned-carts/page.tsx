'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { ChevronRight, ShoppingCart, RefreshCw, MessageCircle, Mail, MapPin, Trash2 } from 'lucide-react';

interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

interface AbandonedCheckout {
    id: string;
    userId: string | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    cartItems: CartItem[];
    shippingInfo: any;
    total: number | null;
    city: string | null;
    country: string | null;
    source: string | null;
    status: string;
    createdAt: string;
}

export default function AbandonedCartsPage() {
    const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [recovering, setRecovering] = useState<string | null>(null);

    const fetchCheckouts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/abandoned-checkouts?page=${page}`);
            const data = await res.json();
            if (data.success) {
                setCheckouts(data.checkouts || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching abandoned carts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCheckouts();
    }, [page]);

    const handleRecover = async (checkoutId: string, type: 'whatsapp' | 'email') => {
        const checkout = checkouts.find(c => c.id === checkoutId);
        if (!checkout) return;

        try {
            setRecovering(checkoutId);

            // Use the existing recovery endpoint
            const res = await fetch('/api/admin/abandoned-carts/recover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkoutId,
                    type,
                    phone: checkout.customerPhone,
                    email: checkout.customerEmail,
                    customerName: checkout.customerName,
                    cartItems: checkout.cartItems,
                    total: checkout.total
                }),
            });

            if (res.ok) {
                alert(`Recovery ${type} sent successfully!`);
            } else {
                const data = await res.json();
                alert(data.error || `Failed to send recovery ${type}`);
            }
        } catch (error) {
            console.error('Error recovering cart:', error);
            alert('An error occurred while trying to recover the cart.');
        } finally {
            setRecovering(null);
        }
    };

    const handleMarkRecovered = async (checkoutId: string) => {
        try {
            const res = await fetch(`/api/admin/abandoned-checkouts?id=${checkoutId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setCheckouts(prev => prev.filter(c => c.id !== checkoutId));
            }
        } catch (error) {
            console.error('Error marking as recovered:', error);
        }
    };

    const getDisplayName = (checkout: AbandonedCheckout): string => {
        if (checkout.customerName) return checkout.customerName;
        if (checkout.shippingInfo?.firstName) {
            return `${checkout.shippingInfo.firstName} ${checkout.shippingInfo.lastName || ''}`.trim();
        }
        return 'Guest';
    };

    const getDisplayEmail = (checkout: AbandonedCheckout): string => {
        return checkout.customerEmail || checkout.shippingInfo?.email || 'No email';
    };

    const getDisplayPhone = (checkout: AbandonedCheckout): string => {
        return checkout.customerPhone || checkout.shippingInfo?.phone || '';
    };

    const getLocation = (checkout: AbandonedCheckout): string => {
        const parts = [];
        if (checkout.city) parts.push(checkout.city);
        if (checkout.country) parts.push(checkout.country);
        return parts.length > 0 ? parts.join(', ') : 'Unknown';
    };

    const getSourceBadge = (source: string | null) => {
        if (source === 'CHECKOUT') {
            return <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">Checkout</span>;
        }
        return <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Cart</span>;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts</h1>
                        <p className="text-sm text-gray-500">Track users who added items to cart but didn't complete purchase</p>
                    </div>
                    <button onClick={fetchCheckouts} className="p-2 hover:bg-gray-100 rounded-lg">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cart Value</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stage</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">Loading...</td>
                                    </tr>
                                ) : checkouts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No abandoned carts found.</td>
                                    </tr>
                                ) : (
                                    checkouts.map((checkout) => (
                                        <tr key={checkout.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {getDisplayName(checkout)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {getDisplayEmail(checkout)}
                                                </div>
                                                {getDisplayPhone(checkout) && (
                                                    <div className="text-xs text-gray-400">
                                                        {getDisplayPhone(checkout)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                    {getLocation(checkout)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                {checkout.total ? `₹${checkout.total.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">
                                                    {checkout.cartItems?.length || 0} items
                                                </div>
                                                {checkout.cartItems?.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="text-xs text-gray-400 truncate max-w-[150px]">
                                                        {item.name} x{item.quantity}
                                                    </div>
                                                ))}
                                                {checkout.cartItems?.length > 2 && (
                                                    <div className="text-xs text-gray-400">
                                                        +{checkout.cartItems.length - 2} more
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getSourceBadge(checkout.source)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(checkout.createdAt).toLocaleDateString()}
                                                <div className="text-xs text-gray-400">
                                                    {new Date(checkout.createdAt).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {getDisplayPhone(checkout) && (
                                                        <button
                                                            onClick={() => handleRecover(checkout.id, 'whatsapp')}
                                                            disabled={recovering === checkout.id}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                            title="Send WhatsApp"
                                                        >
                                                            <MessageCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {getDisplayEmail(checkout) !== 'No email' && (
                                                        <button
                                                            onClick={() => handleRecover(checkout.id, 'email')}
                                                            disabled={recovering === checkout.id}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                            title="Send Email"
                                                        >
                                                            <Mail className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleMarkRecovered(checkout.id)}
                                                        className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded"
                                                        title="Mark as Recovered"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
