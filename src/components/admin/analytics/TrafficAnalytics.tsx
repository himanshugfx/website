'use client';

import { 
    MapPin, Globe, TrendingUp, FileText, 
    Users, RefreshCw, AlertCircle 
} from 'lucide-react';

export default function TrafficAnalytics({ data }: { data: any }) {
    if (!data) return null;

    const totalSessions = data.trafficSources.reduce((sum: number, s: any) => sum + s.sessions, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Live Users & Session Target combined into 2 columns for space */}
                <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full opacity-50 blur-2xl translate-x-1/3 -translate-y-1/3" />
                    
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                                <Users className="w-5 h-5 text-purple-600 animate-pulse" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live View</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            ACTIVE NOW
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-between border-b border-gray-50 pb-4">
                        <div className="text-4xl font-black text-gray-900 tracking-tighter">{data.realtimeUsers}</div>
                    </div>

                    <div className="mt-4 pt-2">
                        <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-purple-600 mb-1">
                            <span>Monthly Sessions Target</span>
                        </div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-bold text-gray-900">{data.sessions.toLocaleString()}</span>
                            <span className="text-xs font-bold text-gray-400">/ 50,000</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-purple-500 rounded-full" 
                                style={{ width: `${Math.min(100, (data.sessions / 50000) * 100)}%` }} 
                            />
                        </div>
                    </div>
                </div>

                {/* Total Sessions */}
                <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Sessions</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-4xl font-black text-gray-900 tracking-tighter">{data.sessions.toLocaleString()}</div>
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                                data.sessionsGrowth >= 0 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                                {data.sessionsGrowth >= 0 ? '↑' : '↓'} {Math.abs(data.sessionsGrowth).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conversion Rate with Tooltip & Benchmark */}
                <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                <RefreshCw className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Conversion Rate</span>
                                <div className="group/tooltip relative">
                                    <AlertCircle className="w-3 h-3 text-gray-300 hover:text-emerald-500 transition-colors" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-900 text-white text-[9px] font-medium rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity w-32 text-center pointer-events-none z-20 shadow-xl">
                                        Orders divided by total sessions over the last 30 days.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-4xl font-black text-gray-900 tracking-tighter">{data.ecommerce.conversionRate.toFixed(2)}%</div>
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                                data.ecommerce.conversionRate > 2 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                                {data.ecommerce.conversionRate > 2 ? 'Above Avg' : 'Below Industry Avg'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bounce Rate */}
                <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                                <TrendingUp className="w-5 h-5 text-orange-600 -rotate-90" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bounce Rate</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-4xl font-black text-gray-900 tracking-tighter">{data.bounceRate.toFixed(1)}%</div>
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                                data.bounceRate < 40 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                                {data.bounceRate < 40 ? 'Great' : 'Needs Work'}
                            </div>
                        </div>
                    </div>
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
                        {data.cities.slice(0, 10).map((city: any, i: number) => {
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
                                    {data.trafficSources.reduce((acc: any, source: any, i: number) => {
                                        const percent = totalSessions > 0 ? (source.sessions / totalSessions) * 100 : 0;
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
                            {data.trafficSources.map((source: any, i: number) => {
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Device Breakdown */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Device Breakdown</h3>
                    </div>
                    <div className="space-y-5">
                        {data.devices.map((device: any, i: number) => {
                            const colors = ['bg-purple-600', 'bg-blue-500', 'bg-emerald-500'];
                            const totalDeviceSessions = data.devices.reduce((sum: number, d: any) => sum + d.sessions, 0);
                            const percent = totalDeviceSessions > 0 ? (device.sessions / totalDeviceSessions) * 100 : 0;
                            return (
                                <div key={device.device} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-black italic uppercase tracking-tighter">
                                        <span className="text-gray-500">{device.device}</span>
                                        <span className="text-gray-900">{percent.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                        <div 
                                            className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 lg:col-span-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Top Pages</h3>
                        <span className="text-[10px] font-bold text-gray-400 ml-auto uppercase opacity-60">Last 30 Days</span>
                    </div>
                    <div className="relative overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-md">
                                <tr className="border-b border-gray-100">
                                    <th className="text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] py-4 px-2">Page Title / URL</th>
                                    <th className="text-right text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] py-4 px-4">Views</th>
                                    <th className="text-right text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] py-4 px-2">Engagement</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {data.topPages.filter((page: any) => !page.path.startsWith('/admin')).slice(0, 15).map((page: any) => {
                                    // Simple mapping for readable names
                                    const getPageTitle = (path: string) => {
                                        if (path === '/') return 'Home Page';
                                        if (path.startsWith('/product/')) return path.replace('/product/', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                        if (path.startsWith('/shop')) return 'All Products';
                                        if (path.startsWith('/checkout')) return 'Checkout';
                                        if (path.startsWith('/cart')) return 'Shopping Cart';
                                        return path;
                                    };
                                    return (
                                        <tr 
                                            key={page.path} 
                                            className="group hover:bg-purple-50/30 transition-all duration-300 border-b border-transparent hover:border-purple-100"
                                        >
                                            <td className="py-4 px-2">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-black text-gray-900 group-hover:text-purple-600 transition-colors">
                                                        {getPageTitle(page.path)}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-medium font-mono">
                                                        {page.path}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-right py-4 px-4">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span className="text-sm font-black text-gray-900 tracking-tighter">{page.views.toLocaleString()}</span>
                                                    <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-emerald-400 rounded-full" 
                                                            style={{ width: `${Math.min(100, (page.views / data.pageViews) * 500)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right py-4 px-2">
                                                <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                    {Math.floor(page.avgDuration / 60)}m {String(Math.floor(page.avgDuration % 60)).padStart(2, '0')}s
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {data.topPages.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <FileText className="w-12 h-12" />
                                                <p className="text-xs font-black uppercase tracking-widest">No activity data</p>
                                            </div>
                                        </td>
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
