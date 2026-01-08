'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Eye,
    Clock,
    MousePointer,
    Smartphone,
    Monitor,
    Tablet,
    Globe,
    BarChart3,
    Activity,
    RefreshCw,
    IndianRupee,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface AnalyticsData {
    realtimeUsers: number;
    sessions: number;
    sessionsGrowth: number;
    users: number;
    usersGrowth: number;
    newUsers: number;
    pageViews: number;
    pageViewsGrowth: number;
    bounceRate: number;
    avgSessionDuration: number;
    engagementRate: number;
    topPages: { path: string; views: number; avgDuration: number }[];
    trafficSources: { source: string; sessions: number; users: number }[];
    devices: { device: string; sessions: number }[];
    ecommerce: {
        purchases: number;
        revenue: number;
        transactions: number;
        conversionRate: number;
    };
    period: string;
    lastUpdated: string;
}

function StatCard({
    title,
    value,
    growth,
    icon,
    color = 'purple'
}: {
    title: string;
    value: string | number;
    growth?: number;
    icon: React.ReactNode;
    color?: string;
}) {
    const colorClasses: { [key: string]: { bg: string; text: string; icon: string } } = {
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
        pink: { bg: 'bg-pink-50', text: 'text-pink-600', icon: 'text-pink-500' }
    };

    const colors = colorClasses[color] || colorClasses.purple;

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.icon}`}>
                    {icon}
                </div>
                {growth !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(growth).toFixed(1)}%
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-4">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
    );
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
}

function getDeviceIcon(device: string) {
    switch (device.toLowerCase()) {
        case 'mobile': return <Smartphone className="w-4 h-4" />;
        case 'tablet': return <Tablet className="w-4 h-4" />;
        default: return <Monitor className="w-4 h-4" />;
    }
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/analytics');
            const json = await res.json();

            if (json.error) {
                setError(json.error);
            } else {
                setData(json.data);
            }
        } catch (err) {
            setError('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AdminLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-gray-500 mt-1">Google Analytics data for your website</p>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                        <h3 className="text-red-800 font-semibold mb-2">Configuration Required</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                        <p className="text-red-500 text-sm mt-2">
                            Please ensure the following environment variables are set:
                        </p>
                        <ul className="text-red-500 text-sm mt-2 list-disc list-inside">
                            <li>GA4_PROPERTY_ID</li>
                            <li>GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
                            <li>GOOGLE_PRIVATE_KEY</li>
                        </ul>
                    </div>
                )}

                {loading && !data && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
                            <p className="text-gray-500">Loading analytics data...</p>
                        </div>
                    </div>
                )}

                {data && (
                    <>
                        {/* Realtime Card */}
                        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-purple-200 text-sm font-medium">LIVE</span>
                            </div>
                            <p className="text-5xl font-bold mt-4">{data.realtimeUsers}</p>
                            <p className="text-purple-200 mt-2">Active users right now</p>
                        </div>

                        {/* Overview Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                title="Sessions"
                                value={data.sessions.toLocaleString()}
                                growth={data.sessionsGrowth}
                                icon={<Activity className="w-6 h-6" />}
                                color="purple"
                            />
                            <StatCard
                                title="Total Users"
                                value={data.users.toLocaleString()}
                                growth={data.usersGrowth}
                                icon={<Users className="w-6 h-6" />}
                                color="blue"
                            />
                            <StatCard
                                title="Page Views"
                                value={data.pageViews.toLocaleString()}
                                growth={data.pageViewsGrowth}
                                icon={<Eye className="w-6 h-6" />}
                                color="green"
                            />
                            <StatCard
                                title="Avg. Session Duration"
                                value={formatDuration(data.avgSessionDuration)}
                                icon={<Clock className="w-6 h-6" />}
                                color="orange"
                            />
                        </div>

                        {/* Engagement Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                title="New Users"
                                value={data.newUsers.toLocaleString()}
                                icon={<Users className="w-6 h-6" />}
                                color="pink"
                            />
                            <StatCard
                                title="Engagement Rate"
                                value={`${data.engagementRate.toFixed(1)}%`}
                                icon={<MousePointer className="w-6 h-6" />}
                                color="purple"
                            />
                            <StatCard
                                title="Bounce Rate"
                                value={`${data.bounceRate.toFixed(1)}%`}
                                icon={<TrendingDown className="w-6 h-6" />}
                                color="orange"
                            />
                            <StatCard
                                title="Conversion Rate"
                                value={`${data.ecommerce.conversionRate.toFixed(2)}%`}
                                icon={<ShoppingCart className="w-6 h-6" />}
                                color="green"
                            />
                        </div>

                        {/* E-commerce Revenue Card */}
                        {(data.ecommerce.revenue > 0 || data.ecommerce.transactions > 0) && (
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white mb-8">
                                <h3 className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-4">
                                    E-commerce Revenue (Last 30 Days)
                                </h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-3xl font-bold">₹{data.ecommerce.revenue.toLocaleString()}</p>
                                        <p className="text-emerald-200 text-sm mt-1">Total Revenue</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold">{data.ecommerce.transactions}</p>
                                        <p className="text-emerald-200 text-sm mt-1">Transactions</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold">{data.ecommerce.purchases}</p>
                                        <p className="text-emerald-200 text-sm mt-1">Purchases</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid lg:grid-cols-2 gap-6 mb-8">
                            {/* Top Pages */}
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-purple-500" />
                                        Top Pages
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {data.topPages.slice(0, 8).map((page, index) => (
                                        <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {page.path || '/'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Avg. {formatDuration(page.avgDuration)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {page.views.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500">views</p>
                                            </div>
                                        </div>
                                    ))}
                                    {data.topPages.length === 0 && (
                                        <div className="px-6 py-8 text-center text-gray-500 text-sm">
                                            No page data available
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Traffic Sources */}
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-blue-500" />
                                        Traffic Sources
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {data.trafficSources.map((source, index) => {
                                        const totalSessions = data.trafficSources.reduce((sum, s) => sum + s.sessions, 0);
                                        const percentage = totalSessions > 0 ? (source.sessions / totalSessions) * 100 : 0;

                                        return (
                                            <div key={index} className="px-6 py-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                                        {source.source || 'Unknown'}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {source.sessions.toLocaleString()} sessions
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="bg-purple-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {data.trafficSources.length === 0 && (
                                        <div className="px-6 py-8 text-center text-gray-500 text-sm">
                                            No traffic source data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Device Breakdown */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                <Smartphone className="w-5 h-5 text-orange-500" />
                                Device Breakdown
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {data.devices.map((device, index) => {
                                    const totalSessions = data.devices.reduce((sum, d) => sum + d.sessions, 0);
                                    const percentage = totalSessions > 0 ? (device.sessions / totalSessions) * 100 : 0;

                                    return (
                                        <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                                {getDeviceIcon(device.device)}
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{percentage.toFixed(0)}%</p>
                                            <p className="text-sm text-gray-500 capitalize">{device.device}</p>
                                            <p className="text-xs text-gray-400 mt-1">{device.sessions.toLocaleString()} sessions</p>
                                        </div>
                                    );
                                })}
                                {data.devices.length === 0 && (
                                    <div className="col-span-3 text-center text-gray-500 text-sm py-8">
                                        No device data available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center text-sm text-gray-400">
                            <p>Data period: {data.period}</p>
                            <p>Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
