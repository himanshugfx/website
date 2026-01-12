'use client';

import { useState, useEffect } from 'react';
import { MapPin, Globe, TrendingUp, FileText, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

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
    cities: { city: string; sessions: number }[];
    ecommerce: {
        purchases: number;
        revenue: number;
        transactions: number;
        conversionRate: number;
    };
    period: string;
    lastUpdated: string;
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/analytics');
            const json = await res.json();
            if (json.success && json.data) {
                setData(json.data);
            } else {
                setError(json.error || 'Failed to fetch analytics');
            }
        } catch (err) {
            setError('Failed to connect to analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-500">Loading analytics...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-sm text-amber-800">{error}</p>
                    <p className="text-xs text-amber-600 mt-1">Configure Google Analytics in environment variables.</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!data) return null;

    const totalSessions = data.trafficSources.reduce((sum, s) => sum + s.sessions, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Website Analytics</h2>
                    <p className="text-xs text-gray-500">{data.period} • Updated {new Date(data.lastUpdated).toLocaleTimeString()}</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100">
                    <div className="text-xs text-gray-500 mb-1">Realtime Users</div>
                    <div className="text-2xl font-bold text-purple-600">{data.realtimeUsers}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                    <div className="text-xs text-gray-500 mb-1">Total Sessions</div>
                    <div className="text-2xl font-bold text-blue-600">{data.sessions.toLocaleString()}</div>
                    <div className={`text-xs ${data.sessionsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.sessionsGrowth >= 0 ? '↑' : '↓'} {Math.abs(data.sessionsGrowth).toFixed(1)}%
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
                    <div className="text-xs text-gray-500 mb-1">Conversion Rate</div>
                    <div className="text-2xl font-bold text-green-600">{data.ecommerce.conversionRate.toFixed(2)}%</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-100">
                    <div className="text-xs text-gray-500 mb-1">Bounce Rate</div>
                    <div className="text-2xl font-bold text-orange-600">{data.bounceRate.toFixed(1)}%</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* City-wise Traffic */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">Top Cities</h3>
                        <span className="text-xs text-gray-400 ml-auto">by sessions</span>
                    </div>
                    <div className="space-y-3">
                        {data.cities.slice(0, 10).map((city, i) => (
                            <div key={city.city} className="flex items-center gap-3">
                                <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-100 rounded">
                                    {i + 1}
                                </span>
                                <span className="flex-1 text-sm text-gray-700 truncate">{city.city || 'Unknown'}</span>
                                <span className="text-sm font-semibold text-gray-900">{city.sessions.toLocaleString()}</span>
                            </div>
                        ))}
                        {data.cities.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No city data available</p>
                        )}
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Traffic Sources</h3>
                    </div>
                    <div className="space-y-3">
                        {data.trafficSources.map((source) => {
                            const percent = totalSessions > 0 ? (source.sessions / totalSessions) * 100 : 0;
                            return (
                                <div key={source.source} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">{source.source}</span>
                                        <span className="font-semibold text-gray-900">{source.sessions.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {data.trafficSources.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No traffic source data available</p>
                        )}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-4 h-4 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Top Pages</h3>
                        <span className="text-xs text-gray-400 ml-auto">by page views</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2 pr-4">Page</th>
                                    <th className="text-right text-xs font-semibold text-gray-500 uppercase py-2 px-4">Views</th>
                                    <th className="text-right text-xs font-semibold text-gray-500 uppercase py-2 pl-4">Avg. Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topPages.slice(0, 10).map((page) => (
                                    <tr key={page.path} className="border-b border-gray-50 last:border-0">
                                        <td className="py-2.5 pr-4">
                                            <span className="text-sm text-gray-700 font-mono truncate block max-w-xs">
                                                {page.path}
                                            </span>
                                        </td>
                                        <td className="text-right py-2.5 px-4">
                                            <span className="text-sm font-semibold text-gray-900">{page.views.toLocaleString()}</span>
                                        </td>
                                        <td className="text-right py-2.5 pl-4">
                                            <span className="text-sm text-gray-500">
                                                {Math.floor(page.avgDuration / 60)}:{String(Math.floor(page.avgDuration % 60)).padStart(2, '0')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.topPages.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4 text-sm text-gray-400">No page data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
