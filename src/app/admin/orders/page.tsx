'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Eye, ShoppingCart, Filter, Search, MoreHorizontal, Download, Truck, RefreshCw } from 'lucide-react';

interface Order {
    id: string;
    orderNumber: number;
    userId: string | null;
    total: number;
    status: string;
    createdAt: string;
    awbNumber?: string | null;
    paymentStatus: string;
    paymentMethod: string;
    customerName?: string | null;
    customerEmail?: string | null;
    user: {
        name: string | null;
        email: string | null;
    } | null;
}

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DRAFT'];

// OrderRow component for reusable table row rendering
function OrderRow({ order, handleStatusUpdate, shipWithRapidShyp, shippingOrderId }: {
    order: any;
    handleStatusUpdate: (orderId: string, newStatus: string) => void;
    shipWithRapidShyp: (orderId: string) => void;
    shippingOrderId: string | null;
}) {
    return (
        <tr className="group hover:bg-gray-50/50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-mono text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                    #{order.orderNumber}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs ring-2 ring-white">
                        {(order.customerName || order.user?.name || 'G').charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900">{order.customerName || order.user?.name || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{order.customerEmail || order.user?.email || ''}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString()}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-purple-500 cursor-pointer appearance-none pr-8 relative ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                            order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700' :
                                order.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                        }`}
                    style={{ backgroundImage: 'none' }}
                >
                    {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                {!order.awbNumber && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    order.paymentStatus === 'SUCCESSFUL' || order.paymentMethod === 'COD'
                ) && (
                        <button
                            onClick={() => shipWithRapidShyp(order.id)}
                            disabled={shippingOrderId === order.id}
                            className="inline-flex items-center justify-center p-2 bg-blue-600 text-white rounded-lg transition-all hover:bg-blue-700 disabled:opacity-50"
                            title="Ship with RapidShyp"
                        >
                            {shippingOrderId === order.id ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Truck className="w-5 h-5" />
                            )}
                        </button>
                    )}
                <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center justify-center p-2 bg-purple-600 text-white rounded-lg transition-all hover:bg-purple-700"
                    title="View Details"
                >
                    <Eye className="w-5 h-5" />
                </Link>
            </td>
        </tr>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, statusFilter, searchQuery]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const url = `/api/admin/orders?page=${page}${statusFilter ? `&status=${statusFilter}` : ''}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();
            setOrders(data.orders || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });

            if (res.ok) {
                fetchOrders();
            } else {
                alert('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status');
        }
    };

    const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);

    const shipWithRapidShyp = async (orderId: string) => {
        if (!confirm('Create shipment with RapidShyp for this order?')) return;

        try {
            setShippingOrderId(orderId);
            const res = await fetch('/api/admin/orders/ship', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });

            const text = await res.text();
            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error('Failed to parse shipping response:', text);
                alert(`Error: Invalid response from server. Status: ${res.status}. ${text.slice(0, 100)}`);
                return;
            }

            if (res.ok && data.success) {
                alert(`Shipment created with RapidShyp! AWB: ${data.awbNumber}`);
                fetchOrders();
            } else {
                alert(data.error || data.message || 'Failed to create shipment');
            }
        } catch (error) {
            console.error('RapidShyp shipping error:', error);
            alert('Failed to create shipment');
        } finally {
            setShippingOrderId(null);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                        <p className="mt-1 text-gray-500">
                            Manage and track all customer orders
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search orders by number, name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <button
                            onClick={() => fetchOrders()}
                            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-black/90 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm font-medium outline-none cursor-pointer"
                        >
                            <option value="">All Status</option>
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-gray-500">Loading orders...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
                                                    <ShoppingCart className="w-8 h-8 text-purple-400" />
                                                </div>
                                                <p className="text-gray-900 font-medium">No orders found</p>
                                                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {/* Pending Orders Section */}
                                        {orders.filter((o: any) => o.status === 'PENDING').length > 0 && !statusFilter && (
                                            <>
                                                <tr className="bg-amber-50">
                                                    <td colSpan={6} className="px-6 py-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                                                        ⏳ Pending Orders ({orders.filter((o: any) => o.status === 'PENDING').length})
                                                    </td>
                                                </tr>
                                                {orders.filter((o: any) => o.status === 'PENDING').map((order: any) => (
                                                    <OrderRow key={order.id} order={order} handleStatusUpdate={handleStatusUpdate} shipWithRapidShyp={shipWithRapidShyp} shippingOrderId={shippingOrderId} />
                                                ))}
                                            </>
                                        )}

                                        {/* Processing Orders Section */}
                                        {orders.filter((o: any) => o.status === 'PROCESSING').length > 0 && !statusFilter && (
                                            <>
                                                <tr className="bg-blue-50">
                                                    <td colSpan={6} className="px-6 py-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                        🔄 Processing Orders ({orders.filter((o: any) => o.status === 'PROCESSING').length})
                                                    </td>
                                                </tr>
                                                {orders.filter((o: any) => o.status === 'PROCESSING').map((order: any) => (
                                                    <OrderRow key={order.id} order={order} handleStatusUpdate={handleStatusUpdate} shipWithRapidShyp={shipWithRapidShyp} shippingOrderId={shippingOrderId} />
                                                ))}
                                            </>
                                        )}

                                        {/* Other Orders Section */}
                                        {orders.filter((o: any) => o.status !== 'PENDING' && o.status !== 'PROCESSING').length > 0 && !statusFilter && (
                                            <>
                                                <tr className="bg-gray-50">
                                                    <td colSpan={6} className="px-6 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                        📋 Other Orders ({orders.filter((o: any) => o.status !== 'PENDING' && o.status !== 'PROCESSING').length})
                                                    </td>
                                                </tr>
                                                {orders.filter((o: any) => o.status !== 'PENDING' && o.status !== 'PROCESSING').map((order: any) => (
                                                    <OrderRow key={order.id} order={order} handleStatusUpdate={handleStatusUpdate} shipWithRapidShyp={shipWithRapidShyp} shippingOrderId={shippingOrderId} />
                                                ))}
                                            </>
                                        )}

                                        {/* When status filter is active, show all matching orders without sections */}
                                        {statusFilter && orders.map((order: any) => (
                                            <OrderRow key={order.id} order={order} handleStatusUpdate={handleStatusUpdate} shipWithRapidShyp={shipWithRapidShyp} shippingOrderId={shippingOrderId} />
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600 font-medium">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
