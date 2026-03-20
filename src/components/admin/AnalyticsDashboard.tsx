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
    const [dbData, setDbData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const [gaRes, dbRes] = await Promise.all([
                fetch('/api/admin/analytics').catch(() => null),
                fetch('/api/admin/analytics/db').catch(() => null)
            ]);
            
            let gaJson = { success: false, data: null, error: null };
            let dbJson = { success: false, data: null, error: null };
            
            if (gaRes && gaRes.ok) gaJson = await gaRes.json();
            if (dbRes && dbRes.ok) dbJson = await dbRes.json();

            if (dbJson.success && dbJson.data) {
                setDbData(dbJson.data);
            } else {
                setError(dbJson.error || 'Failed to load database analytics');
                return; // Stop if core DB data fails
            }

            if (gaJson.success && gaJson.data) {
                setData(gaJson.data);
            }
        } catch (err) {
            setError('Failed to connect to analytics endpoints');
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

    if (!dbData) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Website Analytics</h2>
                    <p className="text-xs text-gray-500">Live Period • Updated {new Date().toLocaleTimeString()}</p>
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
                {activeTab === 'revenue' && <RevenueAnalytics data={dbData?.revenue} />}
                {activeTab === 'products' && <ProductAnalytics data={dbData?.products} />}
                {activeTab === 'traffic' && <TrafficAnalytics data={data} />}
                {activeTab === 'experience' && <CustomerExperience data={dbData?.experience} />}
                {activeTab === 'retention' && <RetentionAnalytics data={dbData?.retention} />}
            </div>
        </div>
    );
}
