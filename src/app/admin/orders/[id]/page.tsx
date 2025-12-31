'use client';

import { useState, useEffect, use } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, MapPin, CreditCard, Calendar, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderDetails {
    id: string;
    userId: string | null;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    address: string | null;
    createdAt: string;
    user: {
        name: string | null;
        email: string | null;
    } | null;
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: {
            name: string;
            thumbImage: string;
            brand: string;
        };
    }>;
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [resolvedParams.id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/admin/orders/${resolvedParams.id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                router.push('/admin/orders');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!order) return;
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        try {
            setUpdating(true);
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: order.id, status: newStatus }),
            });

            if (res.ok) {
                fetchOrder();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading order details...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!order) return null;

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
            PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
            CANCELLED: 'bg-red-100 text-red-700 border-red-200',
            DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        const icons = {
            COMPLETED: CheckCircle,
            PENDING: Clock,
            PROCESSING: Package,
            CANCELLED: XCircle,
            DRAFT: AlertTriangle,
        };
        const Icon = icons[status as keyof typeof icons] || AlertTriangle;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
                <Icon className="w-4 h-4" />
                {status}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/orders"
                            className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 rounded-xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Order #{order.id.slice(0, 8)}
                                </h1>
                                <StatusBadge status={order.status} />
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                            <button
                                onClick={() => updateStatus('CANCELLED')}
                                disabled={updating}
                                className="px-5 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                Cancel Order
                            </button>
                        )}
                        {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                            <button
                                onClick={() => updateStatus('COMPLETED')}
                                disabled={updating}
                                className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
                            >
                                Mark as Completed
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                                <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 sm:gap-6">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                            <img
                                                src={item.product.thumbImage || '/placeholder.png'}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 text-lg">{item.product.name}</h3>
                                                        <p className="text-sm text-gray-500">{item.product.brand}</p>
                                                    </div>
                                                    <p className="font-bold text-gray-900 text-lg">₹{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg">
                                                    <span>Qty:</span>
                                                    <span className="font-semibold text-gray-900">{item.quantity}</span>
                                                </div>
                                                <span>×</span>
                                                <span>₹{(item.price / item.quantity).toLocaleString()} each</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-50/50 p-6 border-t border-gray-100">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal</span>
                                        <span>₹{order.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Shipping</span>
                                        <span className="text-emerald-600 font-medium">Free</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-purple-600">₹{order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Info Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                Customer Details
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                                        {(order.user?.name || 'G').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{order.user?.name || 'Guest User'}</p>
                                        <p className="text-sm text-gray-500">{order.user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                Payment Info
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                                    <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${order.paymentStatus === 'SUCCESSFUL' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.address && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    Shipping Address
                                </h2>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                        {order.address.replace(/^"|"$/g, '').split('\\n').join('\n')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
