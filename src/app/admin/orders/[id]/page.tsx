'use client';

import { useState, useEffect, use } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, MapPin, CreditCard, Calendar, AlertTriangle, CheckCircle, Clock, XCircle, Truck, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface OrderDetails {
    id: string;
    orderNumber: number;
    userId: string | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    shippingFee: number;
    discountAmount: number;
    promoCode: string | null;
    address: string | null;
    createdAt: string;
    awbNumber?: string | null;
    shippingStatus?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    estimatedDelivery?: string | null;
    trackingUrl?: string | null;
    shippingProvider?: string | null;
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

interface TrackingData {
    success: boolean;
    shipped: boolean;
    awbNumber?: string;
    status?: string;
    statusDateTime?: string;
    location?: string;
    expectedDelivery?: string;
    deliveredAt?: string;
    trackingUrl?: string;
    scans?: Array<{
        status: string;
        dateTime: string;
        location: string;
        instructions?: string;
    }>;
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [shipping, setShipping] = useState(false);
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

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

    const shipWithRapidShyp = async () => {
        if (!order) return;
        if (!confirm('Create shipment with RapidShyp for this order?')) return;

        try {
            setShipping(true);
            const res = await fetch('/api/admin/orders/ship', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.id }),
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
                fetchOrder();
                fetchTracking();
            } else {
                alert(data.error || data.message || 'Failed to create shipment');
            }
        } catch (error) {
            console.error('RapidShyp shipping error:', error);
            alert('Failed to create shipment');
        } finally {
            setShipping(false);
        }
    };

    const fetchTracking = async () => {
        if (!order?.id) return;

        try {
            setTrackingLoading(true);
            const res = await fetch(`/api/admin/orders/tracking?orderId=${order.id}`);
            const data = await res.json();
            setTracking(data);

            // Refresh order to get updated status
            if (data.success && data.shipped) {
                fetchOrder();
            }
        } catch (error) {
            console.error('Tracking fetch error:', error);
        } finally {
            setTrackingLoading(false);
        }
    };

    useEffect(() => {
        if (order?.awbNumber) {
            fetchTracking();
        }
    }, [order?.awbNumber]);

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
        const styles: Record<string, string> = {
            COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
            PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
            SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200',
            OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            CANCELLED: 'bg-red-100 text-red-700 border-red-200',
            RTO: 'bg-orange-100 text-orange-700 border-orange-200',
            DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        const icons: Record<string, any> = {
            COMPLETED: CheckCircle,
            DELIVERED: CheckCircle,
            PENDING: Clock,
            PROCESSING: Package,
            SHIPPED: Truck,
            OUT_FOR_DELIVERY: Truck,
            CANCELLED: XCircle,
            RTO: AlertTriangle,
            DRAFT: AlertTriangle,
        };
        const Icon = icons[status] || AlertTriangle;

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
                            className="p-2.5 bg-black text-white hover:bg-gray-900 rounded-xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Order #{order.orderNumber}
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
                        {/* Ship with RapidShyp button - only show if not yet shipped */}
                        {!order.awbNumber && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                            order.paymentStatus === 'SUCCESSFUL' || order.paymentMethod === 'COD'
                        ) && (
                                <button
                                    onClick={shipWithRapidShyp}
                                    disabled={shipping}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {shipping ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Truck className="w-4 h-4" />
                                    )}
                                    Ship with RapidShyp
                                </button>
                            )}
                        {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && order.status !== 'DELIVERED' && (
                            <button
                                onClick={() => updateStatus('CANCELLED')}
                                disabled={updating}
                                className="px-5 py-2.5 bg-black text-white font-medium rounded-xl disabled:opacity-50"
                            >
                                Cancel Order
                            </button>
                        )}
                        {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                            <button
                                onClick={() => updateStatus('COMPLETED')}
                                disabled={updating}
                                className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl transition-all disabled:opacity-50"
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
                                        <span>Items Subtotal</span>
                                        <span>₹{order.items.reduce((acc, item) => acc + item.price, 0).toLocaleString()}</span>
                                    </div>
                                    {order.discountAmount > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                                            <span>-₹{order.discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-500">
                                        <span>Shipping</span>
                                        {order.shippingFee > 0 ? (
                                            <span>₹{order.shippingFee.toLocaleString()}</span>
                                        ) : (
                                            <span className="text-emerald-600 font-medium">Free</span>
                                        )}
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
                                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                                        {(order.customerName || order.user?.name || 'G').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{order.customerName || order.user?.name || 'Guest User'}</p>
                                        <p className="text-sm text-gray-500">{order.customerEmail || order.user?.email || ''}</p>
                                        {order.customerPhone && <p className="text-sm text-gray-500">{order.customerPhone}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipment Tracking Info */}
                        {order.awbNumber && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-blue-600" />
                                        Shipment Tracking
                                    </h2>
                                    <button
                                        onClick={fetchTracking}
                                        disabled={trackingLoading}
                                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                        title="Refresh tracking"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${trackingLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">AWB Number</span>
                                        <a
                                            href={order.trackingUrl || `https://www.rapidshyp.com/tracking?awb=${order.awbNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            {order.awbNumber}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    {tracking?.status && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Status</span>
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${tracking.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                tracking.status === 'Out For Delivery' ? 'bg-indigo-100 text-indigo-700' :
                                                    tracking.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {tracking.status}
                                            </span>
                                        </div>
                                    )}
                                    {tracking?.location && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Location</span>
                                            <span className="text-sm font-medium text-gray-900">{tracking.location}</span>
                                        </div>
                                    )}
                                    {(tracking?.expectedDelivery || order.estimatedDelivery) && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Expected Delivery</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(tracking?.expectedDelivery || order.estimatedDelivery!).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                            </span>
                                        </div>
                                    )}
                                    {order.shippedAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Shipped On</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(order.shippedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                            </span>
                                        </div>
                                    )}
                                    {order.deliveredAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Delivered On</span>
                                            <span className="text-sm font-medium text-emerald-600">
                                                {new Date(order.deliveredAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                            </span>
                                        </div>
                                    )}

                                    {/* Tracking Timeline */}
                                    {tracking?.scans && tracking.scans.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <h3 className="text-sm font-bold text-gray-700 mb-3">Tracking History</h3>
                                            <div className="space-y-3 max-h-48 overflow-y-auto">
                                                {tracking.scans.slice(0, 10).map((scan, idx) => (
                                                    <div key={idx} className="flex gap-3 text-sm">
                                                        <div className="flex flex-col items-center">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-purple-600' : 'bg-gray-300'}`} />
                                                            {idx < tracking.scans!.length - 1 && (
                                                                <div className="w-0.5 h-full bg-gray-200 mt-1" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 pb-3">
                                                            <p className="font-medium text-gray-900">{scan.status}</p>
                                                            <p className="text-xs text-gray-500">{scan.location}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {new Date(scan.dateTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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
                                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                                    {(() => {
                                        try {
                                            const addr = JSON.parse(order.address);
                                            return (
                                                <div className="space-y-1 text-sm">
                                                    <p className="font-bold text-gray-900">{addr.firstName} {addr.lastName}</p>
                                                    <p className="text-gray-600">{addr.email}</p>
                                                    <p className="text-gray-600">{addr.phone}</p>
                                                    <div className="pt-2">
                                                        <p className="text-gray-900 leading-relaxed">{addr.address}</p>
                                                        <p className="text-gray-900">{addr.city}, {addr.postalCode}</p>
                                                        <p className="text-gray-900">{addr.country}</p>
                                                    </div>
                                                    {addr.notes && (
                                                        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100 italic text-amber-800 text-xs">
                                                            <strong>Note:</strong> {addr.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } catch (e) {
                                            return (
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                                    {order.address.replace(/^"|"$/g, '').split('\\n').join('\n')}
                                                </p>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
