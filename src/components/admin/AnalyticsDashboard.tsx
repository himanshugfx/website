'use client';

import { useState, useEffect } from 'react';
import { MapPin, Globe, TrendingUp, FileText, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import TrafficAnalytics from './analytics/TrafficAnalytics';
import RevenueAnalytics from './analytics/RevenueAnalytics';
import ProductAnalytics from './analytics/ProductAnalytics';
import CustomerExperience from './analytics/CustomerExperience';
import RetentionAnalytics from './analytics/RetentionAnalytics';

type Tab = 'revenue' | 'products' | 'traffic' | 'experience' | 'retention';

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
    const [activeTab, setActiveTab] = useState<Tab>('revenue');
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

            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                {(['revenue', 'products', 'traffic', 'experience', 'retention'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === tab
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100/80'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="mt-6">
                {activeTab === 'revenue' && <RevenueAnalytics />}
                {activeTab === 'products' && <ProductAnalytics />}
                {activeTab === 'traffic' && <TrafficAnalytics data={data} />}
                {activeTab === 'experience' && <CustomerExperience />}
                {activeTab === 'retention' && <RetentionAnalytics />}
            </div>
        </div>
    );
}
