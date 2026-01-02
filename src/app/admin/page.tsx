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

        const orders = await prisma.order.findMany({
            where: validOrdersWhere
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = await prisma.order.count({
            where: validOrdersWhere
        });

        const totalProducts = await prisma.product.count();
        const totalUsers = await prisma.user.count();

        return {
            totalRevenue,
            totalOrders,
            totalProducts,
            totalUsers,
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalUsers: 0,
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
            <div className="space-y-8">
                {/* Stats Grid - responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                                        <ShoppingCart className="w-8 h-8 text-gray-300" />
                                                    </div>
                                                    <p className="text-gray-900 font-medium">No orders yet</p>
                                                    <p className="text-gray-500 text-sm">When you get orders, they&apos;ll show up here.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <tr key={order.id} className="group border-b border-gray-100">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                                                        #{order.orderNumber}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
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
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white bg-purple-600"
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
                        <div className="bg-black rounded-2xl p-5 sm:p-8 text-white">
                            <h3 className="text-base sm:text-lg font-bold mb-1">Quick Action</h3>
                            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 opacity-90">Add new products to your store inventory.</p>
                            <Link
                                href="/admin/products/add"
                                className="flex items-center justify-center gap-2 w-full py-3 sm:py-4 bg-purple-600 text-white rounded-xl font-bold transition-colors text-sm sm:text-base"
                            >
                                <Package className="w-5 h-5" />
                                Add Product
                            </Link>
                        </div>

                        {/* Additional widgets can go here */}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
