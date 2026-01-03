'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { ChevronRight, ShoppingCart, RefreshCw, MessageCircle, Mail } from 'lucide-react';

interface Order {
    id: string;
    userId: string | null;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    address: string | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    createdAt: string;
    user: {
        name: string | null;
        email: string | null;
    } | null;
}

export default function AbandonedCartsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [recovering, setRecovering] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/orders?page=${page}&abandoned=true`);
            const data = await res.json();
            setOrders(data.orders || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching abandoned carts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const handleRecover = async (orderId: string, type: 'whatsapp' | 'email') => {
        try {
            setRecovering(orderId);
            const res = await fetch('/api/admin/abandoned-carts/recover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, type }),
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

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts</h1>
                        <p className="text-sm text-gray-500">Monitor incomplete orders and failed payments</p>
                    </div>
                    <button onClick={fetchOrders} className="p-2 hover:bg-gray-100 rounded-lg">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading...</td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No abandoned carts found.</td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {(() => {
                                                        if (order.customerName) return order.customerName;
                                                        if (order.user?.name) return order.user.name;
                                                        if (order.address) {
                                                            try {
                                                                const addr = JSON.parse(order.address);
                                                                return `${addr.firstName} ${addr.lastName}`;
                                                            } catch (e) { return 'Guest'; }
                                                        }
                                                        return 'Guest';
                                                    })()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {(() => {
                                                        if (order.customerEmail) return order.customerEmail;
                                                        if (order.user?.email) return order.user.email;
                                                        if (order.address) {
                                                            try {
                                                                const addr = JSON.parse(order.address);
                                                                return addr.email;
                                                            } catch (e) { return 'No email'; }
                                                        }
                                                        return 'No email';
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">INR {order.total.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleRecover(order.id, 'whatsapp')}
                                                        disabled={recovering === order.id}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                        title="WhatsApp"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRecover(order.id, 'email')}
                                                        disabled={recovering === order.id}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Email"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
