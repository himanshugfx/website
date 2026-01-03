import AdminLayout from '@/components/admin/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
    try {
        const validOrdersWhere = {
            OR: [
                { paymentStatus: 'SUCCESSFUL' },
                { paymentMethod: 'COD' }
            ],
            status: {
                not: 'CANCELLED'
            }
        };

        // 1. Get Store Revenue
        const orders = await prisma.order.findMany({
            where: validOrdersWhere,
            select: { total: true, userId: true }
        });

        // 2. Get Zoho Invoice Revenue (Avoid double counting if linked to order)
        const invoices = await prisma.invoice.findMany({
            where: {
                status: { not: 'VOID' },
                // If it has an orderId, we usually count the order total
                // but let's be safe and only count invoices that are standalone or represent the final amount
                orderId: null
            },
            select: { total: true, customerId: true, customerName: true }
        });

        const storeRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const invoiceRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalRevenue = storeRevenue + invoiceRevenue;

        const totalOrders = await prisma.order.count({
            where: validOrdersWhere
        });

        const totalProducts = await prisma.product.count();

        // 3. Unique Customers (Store Users + unique Zoho Customer IDs)
        // Note: This is an estimate since we don't have a shared ID between Store and Zoho
        const storeUserIds = new Set(orders.map(o => o.userId).filter(Boolean));
        const zohoCustomerIds = new Set(invoices.map(i => i.customerId));

        // Sum of unique store users and unique Zoho customers
        const totalUniqueCustomers = storeUserIds.size + zohoCustomerIds.size;
        const fallbackUsers = await prisma.user.count();

        return {
            totalRevenue,
            totalOrders,
            totalProducts,
            totalUsers: totalUniqueCustomers > 0 ? totalUniqueCustomers : fallbackUsers,
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        const fallbackUsers = await prisma.user.count().catch(() => 0);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalUsers: fallbackUsers,
        };
    }
}

async function getRecentOrders() {
    try {
        const orders = await prisma.order.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        return orders;
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        return [];
    }
}

export default async function AdminDashboard() {
    const stats = await getStats();
    const recentOrders = await getRecentOrders();

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Stats Grid - responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Revenue"
                        value={`₹${stats.totalRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        color="green"
                    />
                    <StatsCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        icon={ShoppingCart}
                        color="blue"
                    />
                    <StatsCard
                        title="Products"
                        value={stats.totalProducts}
                        icon={Package}
                        color="purple"
                    />
                    <StatsCard
                        title="Customers"
                        value={stats.totalUsers}
                        icon={Users}
                        color="orange"
                    />
                </div>

                {/* Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Transactions</h2>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Latest orders from your store</p>
                            </div>
                            <Link
                                href="/admin/orders"
                                className="group flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-purple-600 rounded-xl"
                            >
                                View All
                                <TrendingUp className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Mobile View - Card Layout */}
                        <div className="md:hidden p-4 space-y-3">
                            {recentOrders.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-8">
                                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                        <ShoppingCart className="w-7 h-7 text-gray-300" />
                                    </div>
                                    <p className="text-gray-900 font-medium text-sm">No orders yet</p>
                                    <p className="text-gray-500 text-xs">When you get orders, they&apos;ll show up here.</p>
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/admin/orders/${order.id}`}
                                        className="block bg-gray-50 rounded-xl p-4 active:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                                                    {(order.user?.name || 'G').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{order.user?.name || 'Guest'}</p>
                                                    <p className="text-xs text-gray-500">#{order.orderNumber}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                    order.status === 'PENDING' ? 'bg-amber-500' :
                                                        order.status === 'PROCESSING' ? 'bg-blue-500' :
                                                            'bg-red-500'
                                                    }`}></span>
                                                {order.status}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Desktop View - Table Layout */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No orders yet
                                            </td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <tr key={order.id} className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                                                        #{order.orderNumber}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                                            {(order.user?.name || 'G').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">{order.user?.name || 'Guest'}</div>
                                                            <div className="text-xs text-gray-500">{order.user?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                            order.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                'bg-red-50 text-red-700 border-red-100'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                            order.status === 'PENDING' ? 'bg-amber-500' :
                                                                order.status === 'PROCESSING' ? 'bg-blue-500' :
                                                                    'bg-red-500'
                                                            }`}></span>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions / Mini Stats */}
                    <div className="space-y-4 sm:space-y-8">
                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-5 sm:p-8 text-white shadow-lg shadow-gray-200">
                            <h3 className="text-base sm:text-lg font-bold mb-1">Quick Action</h3>
                            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 opacity-90">Add new leads to your sales funnel.</p>
                            <Link
                                href="/admin/funnel/leads/add"
                                className="flex items-center justify-center gap-2 w-full py-3 sm:py-4 bg-white text-black rounded-xl font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base mb-3"
                            >
                                <Users className="w-5 h-5" />
                                Add Lead
                            </Link>
                        </div>

                        {/* Additional widgets can go here */}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
