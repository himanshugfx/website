import AdminLayout from '@/components/admin/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import { IndianRupee, ShoppingCart, Package, Users, TrendingUp, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getAnalyticsData } from '@/lib/analytics';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
    try {
        const validOrdersWhere = {
            status: { not: 'CANCELLED' },
            NOT: {
                AND: [
                    { status: 'PENDING' },
                    { paymentStatus: 'PENDING' },
                    { paymentMethod: { not: 'COD' } }
                ]
            }
        };

        // 1. Get Store Revenue
        const orders = await prisma.order.findMany({
            where: validOrdersWhere,
            select: { total: true, userId: true, customerEmail: true, customerName: true }
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

        // 3. Unique Customers (Store Users + Guest Emails/Names + Zoho)
        const customerIdentifiers = new Set<string>();

        orders.forEach(o => {
            if (o.userId) customerIdentifiers.add(o.userId);
            else if (o.customerEmail) customerIdentifiers.add(o.customerEmail);
            else if (o.customerName) customerIdentifiers.add(o.customerName);
        });

        invoices.forEach(i => {
            if (i.customerId) customerIdentifiers.add(i.customerId);
            else if (i.customerName) customerIdentifiers.add(i.customerName);
        });

        const totalUniqueCustomers = customerIdentifiers.size;
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

export default async function AdminDashboard() {
    const stats = await getStats();
    const analytics = await getAnalyticsData();

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Stats Grid - responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-y-6 gap-x-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12">
                    <StatsCard
                        title="Total Revenue"
                        value={`₹${stats.totalRevenue.toLocaleString()}`}
                        icon={IndianRupee}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Active Users */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Active Users</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                                {analytics?.data?.realtimeUsers || 0}
                            </span>
                            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                                Live
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Users currently on site</p>
                    </div>

                    {/* Traffic Sources */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-4">Traffic Sources</h3>
                        <div className="space-y-3">
                            {(analytics?.data?.trafficSources || []).slice(0, 4).map((source: any, i: number) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium text-gray-700 capitalize">{source.source}</span>
                                        <span className="text-gray-500">{source.sessions}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 rounded-full"
                                            style={{ width: `${Math.min((source.sessions / (analytics?.data?.trafficSources?.[0]?.sessions || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!analytics?.data?.trafficSources?.length) && (
                                <p className="text-xs text-gray-400 text-center py-2">No traffic data available</p>
                            )}
                        </div>
                    </div>

                    {/* Device Breakdown */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-4">Device Breakdown</h3>
                        <div className="space-y-4">
                            {(analytics?.data?.devices || []).map((device: any, i: number) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${device.device === 'mobile' ? 'bg-blue-50 text-blue-600' :
                                            device.device === 'desktop' ? 'bg-purple-50 text-purple-600' :
                                                'bg-gray-50 text-gray-600'
                                            }`}>
                                            {device.device === 'mobile' ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            ) : device.device === 'desktop' ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 capitalize">{device.device}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {((device.sessions / (analytics?.data?.devices?.reduce((a: any, b: any) => a + b.sessions, 0) || 1)) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                            {(!analytics?.data?.devices?.length) && (
                                <p className="text-xs text-gray-400 text-center py-2">No device data available</p>
                            )}
                        </div>
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
        </AdminLayout>
    );
}
