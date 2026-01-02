import AdminLayout from '@/components/admin/AdminLayout';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Users,
    Target,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Package
} from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAnalyticsData() {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // 1. Revenue & Orders (Last 30 days vs previous 30 days)
        const [currentStats, previousStats] = await Promise.all([
            prisma.order.aggregate({
                where: { createdAt: { gte: thirtyDaysAgo }, status: 'COMPLETED' },
                _sum: { total: true },
                _count: { id: true }
            }),
            prisma.order.aggregate({
                where: {
                    createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
                    status: 'COMPLETED'
                },
                _sum: { total: true },
                _count: { id: true }
            })
        ]);

        const currentRevenue = currentStats._sum.total || 0;
        const prevRevenue = previousStats._sum.total || 0;
        const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        const currentOrders = currentStats._count.id || 0;
        const prevOrders = previousStats._count.id || 0;
        const ordersGrowth = prevOrders > 0 ? ((currentOrders - prevOrders) / prevOrders) * 100 : 0;

        // 2. Daily Revenue (Last 30 days)
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: 'COMPLETED'
            },
            select: {
                createdAt: true,
                total: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // Group by day in JS
        const dailyMap = new Map<string, number>();
        // Initialize with 0s for last 14 days
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            dailyMap.set(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), 0);
        }

        orders.forEach(order => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            if (dailyMap.has(dateStr)) {
                dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + order.total);
            }
        });

        const dailyRevenue = Array.from(dailyMap.entries()).map(([date, revenue]) => ({
            date: date,
            revenue: revenue
        }));


        // 3. Top Products
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: { order: { status: 'COMPLETED' } },
            _sum: { quantity: true, price: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        // Enrich top products with names
        const enrichedTopProducts = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true }
                });
                return {
                    name: product?.name || 'Unknown',
                    quantity: item._sum.quantity || 0,
                    revenue: (item._sum.price || 0) * (item._sum.quantity || 0)
                };
            })
        );

        // 4. Conversion Rate (Rough estimate: Completed Orders / Total Orders)
        const totalAttempts = await prisma.order.count();
        const conversionRate = totalAttempts > 0 ? (await prisma.order.count({ where: { status: 'COMPLETED' } }) / totalAttempts) * 100 : 0;

        return {
            revenue: { current: currentRevenue, growth: revenueGrowth },
            orders: { current: currentOrders, growth: ordersGrowth },
            conversion: conversionRate,
            dailyRevenue,
            topProducts: enrichedTopProducts
        };
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return null;
    }
}

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    if (!data) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-gray-500 font-medium tracking-tight">Failed to load analytics data.</p>
                </div>
            </AdminLayout>
        );
    }

    // Prepare chart data (normalize to max height)
    const maxRevenue = Math.max(...data.dailyRevenue.map(d => d.revenue), 1000);
    const chartHeight = 120;

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Advanced Analytics</h1>
                        <p className="mt-1 text-gray-500 font-medium">Deep dive into your store's performance metrics</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-tighter">Last 30 Days</span>
                    </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${data.revenue.current.toLocaleString()}`}
                        growth={data.revenue.growth}
                        icon={<DollarSign className="w-6 h-6" />}
                        color="emerald"
                    />
                    <StatCard
                        title="Total Orders"
                        value={data.orders.current.toString()}
                        growth={data.orders.growth}
                        icon={<ShoppingBag className="w-6 h-6" />}
                        color="purple"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={`${data.conversion.toFixed(1)}%`}
                        growth={0} // Constant for now
                        icon={<Target className="w-6 h-6" />}
                        color="amber"
                    />
                    <StatCard
                        title="Active Customers"
                        value="1,248" // Placeholder
                        growth={12}
                        icon={<Users className="w-6 h-6" />}
                        color="blue"
                    />
                </div>

                {/* Charts & Trends Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Trend Chart */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Revenue Trend</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Daily completed sales performance</p>
                            </div>
                        </div>

                        <div className="flex-1 flex items-end gap-3 min-h-[200px] h-full">
                            {data.dailyRevenue.map((day, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center group">
                                    <div className="relative w-full">
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                            ₹{day.revenue.toLocaleString()}
                                        </div>
                                        <div
                                            className="w-full bg-purple-600 rounded-t-lg transition-all duration-500 hover:bg-purple-700 hover:scale-x-110"
                                            style={{ height: `${(day.revenue / maxRevenue) * chartHeight}px` }}
                                        ></div>
                                    </div>
                                    <div className="mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {day.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Top Selling Products</h2>
                        <div className="space-y-6">
                            {data.topProducts.map((product, idx) => (
                                <div key={idx} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors shrink-0">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">{product.quantity} sold</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-900">₹{product.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ title, value, growth, icon, color }: { title: string, value: string, growth: number, icon: React.ReactNode, color: 'emerald' | 'purple' | 'amber' | 'blue' }) {
    const colorClasses = {
        emerald: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600',
        blue: 'bg-blue-50 text-blue-600',
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${colorClasses[color]} rounded-2xl flex items-center justify-center shadow-sm`}>
                    {icon}
                </div>
                {growth !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-tighter ${growth > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(growth).toFixed(1)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                {icon}
            </div>
        </div>
    );
}
