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
    Package,
    Globe,
    FileText
} from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAnalyticsData() {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // ========== 1. TOTAL REVENUE (Website Orders + Zoho Invoices) ==========

        // Website Orders Revenue
        const [currentWebsiteStats, previousWebsiteStats] = await Promise.all([
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

        // Zoho Invoice Revenue (PAID invoices)
        const [currentInvoiceStats, previousInvoiceStats] = await Promise.all([
            prisma.invoice.aggregate({
                where: { invoiceDate: { gte: thirtyDaysAgo }, status: 'PAID' },
                _sum: { total: true },
                _count: { id: true }
            }),
            prisma.invoice.aggregate({
                where: {
                    invoiceDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
                    status: 'PAID'
                },
                _sum: { total: true },
                _count: { id: true }
            })
        ]);

        // Combined revenue
        const currentWebsiteRevenue = currentWebsiteStats._sum.total || 0;
        const currentInvoiceRevenue = currentInvoiceStats._sum.total || 0;
        const currentTotalRevenue = currentWebsiteRevenue + currentInvoiceRevenue;

        const prevWebsiteRevenue = previousWebsiteStats._sum.total || 0;
        const prevInvoiceRevenue = previousInvoiceStats._sum.total || 0;
        const prevTotalRevenue = prevWebsiteRevenue + prevInvoiceRevenue;

        const revenueGrowth = prevTotalRevenue > 0
            ? ((currentTotalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
            : 0;

        // ========== 2. TOTAL ORDERS (Website) ==========
        const currentOrders = currentWebsiteStats._count.id || 0;
        const prevOrders = previousWebsiteStats._count.id || 0;
        const ordersGrowth = prevOrders > 0 ? ((currentOrders - prevOrders) / prevOrders) * 100 : 0;

        // ========== 3. ACTIVE CUSTOMERS ==========
        // From website orders
        const currentCustomersOrders = await prisma.order.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { customerEmail: true, userId: true }
        });
        const prevCustomersOrders = await prisma.order.findMany({
            where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
            select: { customerEmail: true, userId: true }
        });

        // From Zoho invoices
        const currentInvoiceCustomers = await prisma.invoice.findMany({
            where: { invoiceDate: { gte: thirtyDaysAgo } },
            select: { customerName: true, customerId: true }
        });
        const prevInvoiceCustomers = await prisma.invoice.findMany({
            where: { invoiceDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
            select: { customerName: true, customerId: true }
        });

        // Combine unique customers
        const currentCustomerSet = new Set<string>();
        currentCustomersOrders.forEach(order => {
            if (order.customerEmail) currentCustomerSet.add(order.customerEmail);
            else if (order.userId) currentCustomerSet.add(order.userId);
        });
        currentInvoiceCustomers.forEach(inv => {
            currentCustomerSet.add(inv.customerId || inv.customerName);
        });
        const currentActiveCustomers = currentCustomerSet.size;

        const prevCustomerSet = new Set<string>();
        prevCustomersOrders.forEach(order => {
            if (order.customerEmail) prevCustomerSet.add(order.customerEmail);
            else if (order.userId) prevCustomerSet.add(order.userId);
        });
        prevInvoiceCustomers.forEach(inv => {
            prevCustomerSet.add(inv.customerId || inv.customerName);
        });
        const prevActiveCustomers = prevCustomerSet.size;

        const customersGrowth = prevActiveCustomers > 0
            ? ((currentActiveCustomers - prevActiveCustomers) / prevActiveCustomers) * 100
            : 0;

        // ========== 4. CONVERSION RATE (Unique Visitors to Orders) ==========
        // Get unique visitors (sessions) in last 30 days
        let currentVisitors = 0;
        let prevVisitors = 0;

        try {
            const currentVisitorSessions = await prisma.pageView.findMany({
                where: { createdAt: { gte: thirtyDaysAgo } },
                select: { sessionId: true },
                distinct: ['sessionId']
            });
            currentVisitors = currentVisitorSessions.length;

            const prevVisitorSessions = await prisma.pageView.findMany({
                where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
                select: { sessionId: true },
                distinct: ['sessionId']
            });
            prevVisitors = prevVisitorSessions.length;
        } catch {
            // PageView table might not exist yet after migration
            currentVisitors = 0;
            prevVisitors = 0;
        }

        // Total orders (all statuses for conversion calculation)
        const currentTotalOrderAttempts = await prisma.order.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        });

        // Conversion rate: (Orders / Unique Visitors) * 100
        // If no visitors tracked yet, fallback to completed/total orders ratio
        let conversionRate = 0;
        if (currentVisitors > 0) {
            conversionRate = (currentTotalOrderAttempts / currentVisitors) * 100;
        } else {
            // Fallback: completed orders / all orders
            const completedOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });
            const allOrders = await prisma.order.count();
            conversionRate = allOrders > 0 ? (completedOrders / allOrders) * 100 : 0;
        }

        // ========== 5. DAILY REVENUE (Last 14 days - Website + Zoho) ==========
        const websiteOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: 'COMPLETED'
            },
            select: { createdAt: true, total: true },
            orderBy: { createdAt: 'asc' }
        });

        const zohoInvoices = await prisma.invoice.findMany({
            where: {
                invoiceDate: { gte: thirtyDaysAgo },
                status: 'PAID'
            },
            select: { invoiceDate: true, total: true },
            orderBy: { invoiceDate: 'asc' }
        });

        // Initialize daily map for last 14 days
        const dailyMap = new Map<string, { website: number; zoho: number }>();
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            dailyMap.set(dateStr, { website: 0, zoho: 0 });
        }

        // Add website orders
        websiteOrders.forEach(order => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            if (dailyMap.has(dateStr)) {
                const current = dailyMap.get(dateStr)!;
                dailyMap.set(dateStr, { ...current, website: current.website + order.total });
            }
        });

        // Add Zoho invoices
        zohoInvoices.forEach(invoice => {
            const dateStr = new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            if (dailyMap.has(dateStr)) {
                const current = dailyMap.get(dateStr)!;
                dailyMap.set(dateStr, { ...current, zoho: current.zoho + invoice.total });
            }
        });

        const dailyRevenue = Array.from(dailyMap.entries()).map(([date, data]) => ({
            date,
            website: data.website,
            zoho: data.zoho,
            total: data.website + data.zoho
        }));

        // ========== 6. TOP SELLING PRODUCTS ==========
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: { order: { status: 'COMPLETED' } },
            _sum: { quantity: true, price: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

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

        // ========== 7. TOTAL STATS (All-time) ==========
        const allTimeWebsiteRevenue = await prisma.order.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { total: true }
        });
        const allTimeInvoiceRevenue = await prisma.invoice.aggregate({
            where: { status: 'PAID' },
            _sum: { total: true }
        });
        const allTimeRevenue = (allTimeWebsiteRevenue._sum.total || 0) + (allTimeInvoiceRevenue._sum.total || 0);

        return {
            revenue: {
                current: currentTotalRevenue,
                growth: revenueGrowth,
                website: currentWebsiteRevenue,
                zoho: currentInvoiceRevenue,
                allTime: allTimeRevenue
            },
            orders: { current: currentOrders, growth: ordersGrowth },
            customers: { current: currentActiveCustomers, growth: customersGrowth },
            visitors: currentVisitors,
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
    const maxRevenue = Math.max(...data.dailyRevenue.map(d => d.total), 1000);
    const chartHeight = 120;

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Advanced Analytics</h1>
                        <p className="mt-1 text-gray-500 font-medium">Website + Zoho Invoice performance metrics</p>
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
                        subtitle={`Website: ₹${data.revenue.website.toLocaleString()} | Zoho: ₹${data.revenue.zoho.toLocaleString()}`}
                    />
                    <StatCard
                        title="Website Orders"
                        value={data.orders.current.toString()}
                        growth={data.orders.growth}
                        icon={<ShoppingBag className="w-6 h-6" />}
                        color="purple"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={`${data.conversion.toFixed(1)}%`}
                        growth={0}
                        icon={<Target className="w-6 h-6" />}
                        color="amber"
                        subtitle={data.visitors > 0 ? `${data.visitors.toLocaleString()} visitors` : 'Tracking started'}
                    />
                    <StatCard
                        title="Active Customers"
                        value={data.customers.current.toLocaleString()}
                        growth={data.customers.growth}
                        icon={<Users className="w-6 h-6" />}
                        color="blue"
                    />
                </div>

                {/* Revenue Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 border border-emerald-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Website Revenue</span>
                        </div>
                        <p className="text-2xl font-black text-emerald-900">₹{data.revenue.website.toLocaleString()}</p>
                        <p className="text-xs text-emerald-600 mt-1">From online orders (30 days)</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-bold text-blue-700 uppercase tracking-wider">Zoho Invoices</span>
                        </div>
                        <p className="text-2xl font-black text-blue-900">₹{data.revenue.zoho.toLocaleString()}</p>
                        <p className="text-xs text-blue-600 mt-1">From paid invoices (30 days)</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-bold text-purple-700 uppercase tracking-wider">All-Time Revenue</span>
                        </div>
                        <p className="text-2xl font-black text-purple-900">₹{data.revenue.allTime.toLocaleString()}</p>
                        <p className="text-xs text-purple-600 mt-1">Total lifetime revenue</p>
                    </div>
                </div>

                {/* Charts & Trends Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Trend Chart */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Daily Revenue</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Website + Zoho Combined</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-purple-600"></div>
                                    <span className="text-gray-500 font-medium">Website</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-blue-400"></div>
                                    <span className="text-gray-500 font-medium">Zoho</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex items-end gap-2 min-h-[200px] h-full">
                            {data.dailyRevenue.map((day, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center group">
                                    <div className="relative w-full flex flex-col">
                                        {/* Tooltip */}
                                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold py-2 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                            <div>Total: ₹{day.total.toLocaleString()}</div>
                                            <div className="text-gray-400">Web: ₹{day.website.toLocaleString()}</div>
                                            <div className="text-blue-300">Zoho: ₹{day.zoho.toLocaleString()}</div>
                                        </div>
                                        {/* Stacked bars */}
                                        <div className="w-full flex flex-col-reverse">
                                            {/* Website portion */}
                                            <div
                                                className="w-full bg-purple-600 rounded-t-sm transition-all duration-500"
                                                style={{ height: `${(day.website / maxRevenue) * chartHeight}px` }}
                                            ></div>
                                            {/* Zoho portion */}
                                            <div
                                                className="w-full bg-blue-400 transition-all duration-500"
                                                style={{ height: `${(day.zoho / maxRevenue) * chartHeight}px` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {day.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Top Selling Products</h2>
                        {data.topProducts.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No sales data yet</p>
                            </div>
                        ) : (
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
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({
    title,
    value,
    growth,
    icon,
    color,
    subtitle
}: {
    title: string;
    value: string;
    growth: number;
    icon: React.ReactNode;
    color: 'emerald' | 'purple' | 'amber' | 'blue';
    subtitle?: string;
}) {
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
                {subtitle && (
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{subtitle}</p>
                )}
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                {icon}
            </div>
        </div>
    );
}
