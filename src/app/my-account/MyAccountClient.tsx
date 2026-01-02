'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Session } from 'next-auth';

interface MyAccountClientProps {
    user: Session['user'];
}

interface OrderItem {
    id: string;
    product: {
        name: string;
        thumbImage: string;
    };
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    orderNumber: number;
    total: number;
    status: string;
    paymentStatus: string;
    cancelRequest: string | null;
    returnRequest: string | null;
    cancelReason: string | null;
    returnReason: string | null;
    items: OrderItem[];
    createdAt: string;
}

export default function MyAccountClient({ user }: MyAccountClientProps) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [returnReason, setReturnReason] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'cancel' | 'return' | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
        }
    }, [user?.id]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/orders?userId=${user?.id}`);
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (orderId: string) => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }
        try {
            const res = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, reason: cancelReason }),
            });
            if (res.ok) {
                alert('Cancellation request submitted successfully');
                setCancelReason('');
                setSelectedOrder(null);
                setActionType(null);
                fetchOrders();
            } else {
                alert('Failed to submit cancellation request');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Failed to submit cancellation request');
        }
    };

    const handleReturnRequest = async (orderId: string) => {
        if (!returnReason.trim()) {
            alert('Please provide a reason for return');
            return;
        }
        try {
            const res = await fetch('/api/orders/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, reason: returnReason }),
            });
            if (res.ok) {
                alert('Return request submitted successfully');
                setReturnReason('');
                setSelectedOrder(null);
                setActionType(null);
                fetchOrders();
            } else {
                alert('Failed to submit return request');
            }
        } catch (error) {
            console.error('Error returning order:', error);
            alert('Failed to submit return request');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200';
            case 'PROCESSING': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: 'ph-house-line' },
        { id: 'orders', label: 'Order History', icon: 'ph-package' },
        { id: 'address', label: 'Addresses', icon: 'ph-map-pin' },
        { id: 'setting', label: 'Settings', icon: 'ph-gear-six' },
    ];

    return (
        <div className="my-account-section relative w-full bg-white">
            {/* Breadcrumb */}
            <div className="breadcrumb-block py-6 bg-zinc-50 border-b border-zinc-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-zinc-900 font-medium">My Account</span>
                    </div>
                    <div className="heading3 mt-2 font-bold text-2xl">My Account</div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 lg:py-16">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                    {/* Left Sidebar */}
                    <div className="w-full md:w-1/3 lg:w-1/4">
                        <div className="user-card bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900">{user?.name}</h3>
                                <p className="text-zinc-500 text-sm mt-1">{user?.email}</p>
                            </div>

                            <div className="mt-8 flex flex-col gap-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 w-full text-left
                                            ${activeTab === tab.id
                                                ? 'bg-purple-50 text-black shadow-sm ring-1 ring-purple-100'
                                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-purple-600'
                                            }`}
                                    >
                                        <i className={`ph ${tab.icon} text-xl ${activeTab === tab.id ? 'text-purple-600' : ''}`}></i>
                                        {tab.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-base font-medium transition-all duration-300 w-full text-left text-red-500 hover:bg-red-50"
                                >
                                    <i className="ph ph-sign-out text-xl"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="w-full md:w-2/3 lg:w-3/4">

                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="heading flex items-center justify-between">
                                    <h4 className="text-2xl font-bold text-zinc-900">Dashboard</h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Total Orders', value: orders.length.toString(), icon: 'ph-shopping-bag', color: 'text-purple-600', bg: 'bg-purple-50' },
                                        { label: 'Pending', value: orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length.toString(), icon: 'ph-clock', color: 'text-orange-600', bg: 'bg-orange-50' },
                                        { label: 'Completed', value: orders.filter(o => o.status === 'COMPLETED').length.toString(), icon: 'ph-check-circle', color: 'text-green-600', bg: 'bg-green-50' }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="p-6 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                                    <i className={`ph-bold ${stat.icon} text-2xl`}></i>
                                                </div>
                                                <span className="text-3xl font-bold text-zinc-900">{stat.value}</span>
                                            </div>
                                            <p className="text-zinc-500 font-medium">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {orders.length > 0 ? (
                                    <div className="recent-orders bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 mt-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h5 className="text-lg font-bold text-zinc-900">Recent Orders</h5>
                                            <button onClick={() => setActiveTab('orders')} className="text-purple-600 font-bold text-sm hover:underline">View All</button>
                                        </div>
                                        <div className="space-y-4">
                                            {orders.slice(0, 3).map((order) => (
                                                <div key={order.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-lg border border-zinc-200 flex items-center justify-center">
                                                            <i className="ph ph-receipt text-xl text-zinc-400"></i>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-zinc-900">Order #{order.orderNumber}</p>
                                                            <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-zinc-900">₹{order.total.toLocaleString()}</p>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="recent-orders bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 text-center mt-8">
                                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                                            <i className="ph ph-shopping-cart text-3xl"></i>
                                        </div>
                                        <h5 className="text-lg font-bold text-zinc-900">No Recent Orders</h5>
                                        <p className="text-zinc-500 mt-2 mb-6">Looks like you haven&apos;t placed any orders yet.</p>
                                        <Link href="/shop" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105">
                                            Start Shopping
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6 animate-fade-in">
                                <h4 className="text-2xl font-bold text-zinc-900">Order History</h4>
                                {loading ? (
                                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                                        <p className="text-zinc-500 mt-4">Loading orders...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 text-center">
                                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <i className="ph ph-receipt text-4xl text-zinc-300"></i>
                                        </div>
                                        <h5 className="text-lg font-bold text-zinc-900">No Orders Found</h5>
                                        <p className="text-zinc-500 mt-2">You haven&apos;t placed any orders yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-zinc-100">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-sm font-semibold text-zinc-500">Order #</span>
                                                            <span className="text-lg font-bold text-zinc-900">{order.orderNumber}</span>
                                                        </div>
                                                        <div className="text-sm text-zinc-500">
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                        <span className="text-lg font-bold text-zinc-900">₹{order.total.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-4">
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-xl">
                                                            <img
                                                                src={(() => {
                                                                    try {
                                                                        if (typeof item.product.thumbImage === 'string') {
                                                                            if (item.product.thumbImage.startsWith('[') || item.product.thumbImage.startsWith('{')) {
                                                                                const parsed = JSON.parse(item.product.thumbImage);
                                                                                return Array.isArray(parsed) ? parsed[0] : parsed;
                                                                            }
                                                                            return item.product.thumbImage;
                                                                        }
                                                                        return '/images/placeholder.jpg';
                                                                    } catch (e) {
                                                                        return '/images/placeholder.jpg';
                                                                    }
                                                                })()}
                                                                alt={item.product.name}
                                                                className="w-16 h-16 object-cover rounded-lg"
                                                            />
                                                            <div className="flex-1">
                                                                <h5 className="font-semibold text-zinc-900">{item.product.name}</h5>
                                                                <p className="text-sm text-zinc-500">Quantity: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                                                            </div>
                                                            <span className="font-bold text-zinc-900">₹{(item.quantity * item.price).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {order.status === 'COMPLETED' && (
                                                    <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-100">
                                                        {!order.cancelRequest && !order.returnRequest && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedOrder(order.id);
                                                                        setActionType('cancel');
                                                                    }}
                                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                                                                >
                                                                    Request Cancellation
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedOrder(order.id);
                                                                        setActionType('return');
                                                                    }}
                                                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                                                                >
                                                                    Request Return
                                                                </button>
                                                            </>
                                                        )}
                                                        {order.cancelRequest && (
                                                            <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg font-semibold">
                                                                Cancellation {order.cancelRequest}
                                                            </span>
                                                        )}
                                                        {order.returnRequest && (
                                                            <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg font-semibold">
                                                                Return {order.returnRequest}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cancel/Return Modal */}
                        {(actionType === 'cancel' || actionType === 'return') && selectedOrder && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                                    <h3 className="text-xl font-bold text-zinc-900 mb-4">
                                        {actionType === 'cancel' ? 'Request Cancellation' : 'Request Return'}
                                    </h3>
                                    <textarea
                                        value={actionType === 'cancel' ? cancelReason : returnReason}
                                        onChange={(e) => actionType === 'cancel' ? setCancelReason(e.target.value) : setReturnReason(e.target.value)}
                                        placeholder={`Please provide a reason for ${actionType === 'cancel' ? 'cancellation' : 'return'}...`}
                                        className="w-full h-32 p-3 border border-zinc-200 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none resize-none"
                                    />
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(null);
                                                setActionType(null);
                                                setCancelReason('');
                                                setReturnReason('');
                                            }}
                                            className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg font-semibold hover:bg-zinc-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => actionType === 'cancel' ? handleCancelRequest(selectedOrder) : handleReturnRequest(selectedOrder)}
                                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Address Tab */}
                        {activeTab === 'address' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-2xl font-bold text-zinc-900">My Addresses</h4>
                                    <button className="text-purple-600 font-bold hover:underline flex items-center gap-1">
                                        <i className="ph-bold ph-plus"></i> Add New
                                    </button>
                                </div>
                                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 text-center border-dashed border-2">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="ph ph-map-pin text-4xl text-zinc-300"></i>
                                    </div>
                                    <h5 className="text-lg font-bold text-zinc-900">No Addresses Saved</h5>
                                    <p className="text-zinc-500 mt-2">Add an address for a faster checkout.</p>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'setting' && (
                            <div className="space-y-6 animate-fade-in">
                                <h4 className="text-2xl font-bold text-zinc-900">Account Settings</h4>
                                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
                                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-zinc-900">Full Name</label>
                                                <div className="relative">
                                                    <i className="ph ph-user absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg"></i>
                                                    <input
                                                        type="text"
                                                        defaultValue={user?.name || ''}
                                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none transition-all"
                                                        placeholder="Your Name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-zinc-900">Email Address</label>
                                                <div className="relative">
                                                    <i className="ph ph-envelope absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg"></i>
                                                    <input
                                                        type="email"
                                                        defaultValue={user?.email || ''}
                                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 cursor-not-allowed outline-none"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
