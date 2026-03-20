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
                    <div className="space-y-4">
                        {data.cities.slice(0, 10).map((city, i) => {
                            const maxSessions = data.cities[0]?.sessions || 1;
                            const barWidth = (city.sessions / maxSessions) * 100;
                            return (
                                <div key={city.city} className="relative group">
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-purple-50 rounded-lg group-hover:bg-purple-100/70 transition-all duration-500" 
                                        style={{ width: `${barWidth}%` }}
                                    />
                                    <div className="relative flex items-center gap-3 px-3 py-2">
                                        <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-purple-400 bg-white border border-purple-100 rounded-full shadow-sm">
                                            {i + 1}
                                        </span>
                                        <span className="flex-1 text-sm font-medium text-gray-700 truncate">{city.city || 'Unknown'}</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-gray-900">{city.sessions.toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{((city.sessions / totalSessions) * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {data.cities.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4 italic">No city data available yet</p>
                        )}
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Traffic Sources</h3>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                        {/* Simple SVG Donut Chart */}
                        {data.trafficSources.length > 0 && (
                            <div className="relative w-32 h-32 flex-shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                                    {data.trafficSources.reduce((acc: any, source, i) => {
                                        const percent = (source.sessions / totalSessions) * 100;
                                        const colors = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                                        const offset = acc.total;
                                        acc.total += percent;
                                        acc.elements.push(
                                            <circle
                                                key={source.source}
                                                cx="18" cy="18" r="15.915"
                                                fill="none"
                                                stroke={colors[i % colors.length]}
                                                strokeWidth="3.5"
                                                strokeDasharray={`${percent} ${100 - percent}`}
                                                strokeDashoffset={100 - offset}
                                                className="transition-all duration-1000"
                                            />
                                        );
                                        return acc;
                                    }, { total: 0, elements: [] }).elements}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xs font-bold text-gray-900">Total</span>
                                    <span className="text-[10px] text-gray-500 font-medium">Sessions</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex-1 w-full space-y-3">
                            {data.trafficSources.map((source, i) => {
                                const percent = totalSessions > 0 ? (source.sessions / totalSessions) * 100 : 0;
                                const colors = ['bg-purple-600', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                                return (
                                    <div key={source.source} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                                                <span className="text-gray-600">{source.source}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-900">{source.sessions.toLocaleString()}</span>
                                                <span className="text-gray-400 font-normal">{percent.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {data.trafficSources.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4 italic">No source data found</p>
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
                    <div className="relative overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                                <tr>
                                    <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest py-3 pr-4 px-2">Page Path</th>
                                    <th className="text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest py-3 px-4">Page Views</th>
                                    <th className="text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest py-3 pl-4">Avg. Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.topPages.filter(page => !page.path.startsWith('/admin')).slice(0, 15).map((page) => (
                                    <tr 
                                        key={page.path} 
                                        onClick={() => window.open(page.path, '_blank')}
                                        className="group hover:bg-purple-50/40 transition-all cursor-pointer"
                                    >
                                        <td className="py-3 pr-4 px-2">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-xs text-gray-600 font-mono font-medium truncate group-hover:text-purple-600 transition-colors">
                                                    {page.path}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            <span className="text-sm font-bold text-gray-900">{page.views.toLocaleString()}</span>
                                        </td>
                                        <td className="text-right py-3 pl-4">
                                            <span className="text-xs text-gray-500 font-medium">
                                                {Math.floor(page.avgDuration / 60)}m {String(Math.floor(page.avgDuration % 60)).padStart(2, '0')}s
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.topPages.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-10 text-sm text-gray-400 italic">No page activity found</td>
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
