import AdminLayout from '@/components/admin/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import Link from 'next/link';

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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                                <p className="text-sm text-gray-500 mt-1">Latest orders from your store</p>
                            </div>
                            <Link
                                href="/admin/orders"
                                className="group flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-200"
                            >
                                View All
                                <TrendingUp className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
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
                                                    <p className="text-gray-500 text-sm">When you get orders, they'll show up here.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                                                        #{order.id.slice(0, 8)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-700 font-bold text-xs">
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
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
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
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20">
                            <h3 className="text-lg font-bold mb-1">Quick Action</h3>
                            <p className="text-purple-100 text-sm mb-6 opacity-90">Add new products to your store inventory.</p>
                            <Link
                                href="/admin/products/add"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg"
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
