import AdminLayout from '@/components/admin/AdminLayout';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    TrendingUp,
    IndianRupee,
    Clock,
    ChevronRight,
    ExternalLink,
    Tag,
    User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getCustomerDetails(id: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { orders: true }
                }
            },
        });
        return user;
    } catch (error) {
        console.error('Error fetching customer details:', error);
        return null;
    }
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCustomerDetails(id);

    if (!user) {
        notFound();
    }

    // Calculate stats
    const totalOrders = user.orders.length;
    const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Find preferred categories (if applicable - assuming product tags/categories)
    // For now we'll just show order summary

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Users</span>
                    </Link>
                    <div className="flex gap-2">
                        {user.email && (
                            <a
                                href={`mailto:${user.email}`}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                            >
                                <Mail className="w-4 h-4" />
                                Email Customer
                            </a>
                        )}
                    </div>
                </div>

                {/* Profile Overview Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info Card */}
                    <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg shadow-purple-200">
                            {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name || 'Anonymous User'}</h1>
                        <p className="text-gray-500 mb-6">{user.email || 'No email provided'}</p>

                        <div className="w-full space-y-4 pt-6 border-t border-gray-50">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Shield className="w-4 h-4" />
                                    <span>Role</span>
                                </div>
                                <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider">
                                    {user.role}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined</span>
                                </div>
                                <span className="font-medium text-gray-900">
                                    {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 bg-emerald-50 rounded-full p-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                                    <IndianRupee className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Lifetime Value</p>
                                <p className="text-3xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 bg-purple-50 rounded-full p-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 bg-amber-50 rounded-full p-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Average Order</p>
                                <p className="text-3xl font-bold text-gray-900">₹{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 bg-blue-50 rounded-full p-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Last Order</p>
                                <p className="text-xl font-bold text-gray-900 mt-2">
                                    {user.orders.length > 0
                                        ? new Date(user.orders[0].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                        : 'Never'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchase History */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Purchase History</h2>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-tight font-medium">All orders placed by this customer</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {user.orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center">
                                            <p className="text-gray-500 font-medium">No orders found for this customer.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    user.orders.map((order) => (
                                        <tr key={order.id} className="group hover:bg-gray-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <span className="font-mono text-sm font-bold text-gray-600 group-hover:text-purple-600 transition-colors">
                                                    #{order.id.slice(0, 8)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                    order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                        'bg-blue-50 text-blue-700 border border-blue-100'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                        order.status === 'PENDING' ? 'bg-amber-500' :
                                                            'bg-blue-500'
                                                        }`}></span>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-700 underline underline-offset-4"
                                                >
                                                    View Order
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
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

function Shield({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    )
}
