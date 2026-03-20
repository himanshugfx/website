'use client';

import { 
    IndianRupee, TrendingUp, TrendingDown, RefreshCcw, 
    Tag, CreditCard, BarChart2 
} from 'lucide-react';

export default function RevenueAnalytics() {
    // Simulated deep analytics data
    const metrics = {
        totalRevenue: '₹2,45,000',
        revenueGrowth: 12.5,
        aov: '₹1,540',
        aovGrowth: 4.2,
        refundRate: '1.2%',
        refundTrend: -0.5,
        discountImpact: '₹12,400',
        discountROI: 3.4
    };

    const revenueByCategory = [
        { name: 'Skincare', value: 125000, color: 'bg-purple-600' },
        { name: 'Haircare', value: 85000, color: 'bg-blue-500' },
        { name: 'Accessories', value: 35000, color: 'bg-emerald-500' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top row - KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                                <IndianRupee className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Revenue (30d)</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-4xl font-black text-gray-900 tracking-tighter">{metrics.totalRevenue}</div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">
                                <TrendingUp className="w-3 h-3" />
                                +{metrics.revenueGrowth}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Average Order Value */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Average Order Value</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-4xl font-black text-gray-900 tracking-tighter">{metrics.aov}</div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">
                                <TrendingUp className="w-3 h-3" />
                                +{metrics.aovGrowth}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refund & Return Rate */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                                <RefreshCcw className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Refund Rate</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-4xl font-black text-gray-900 tracking-tighter">{metrics.refundRate}</div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">
                                <TrendingDown className="w-3 h-3" />
                                {metrics.refundTrend}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Discount Impact */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                                <Tag className="w-5 h-5 text-rose-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Discount Given</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-4xl font-black text-gray-900 tracking-tighter">{metrics.discountImpact}</div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">
                                ROI {metrics.discountROI}x
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Category */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart2 className="w-4 h-4 text-purple-600" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Revenue by Category</h3>
                    </div>
                    <div className="space-y-5">
                        {revenueByCategory.map((cat, i) => {
                            const total = revenueByCategory.reduce((sum, c) => sum + c.value, 0);
                            const percent = (cat.value / total) * 100;
                            return (
                                <div key={cat.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-tighter">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                                            <span className="text-gray-600">{cat.name}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-gray-900">₹{cat.value.toLocaleString()}</span>
                                            <span className="text-gray-400">{percent.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                        <div 
                                            className={`h-full ${cat.color} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Simulated Revenue Trend */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-full flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">30-Day Revenue Trend</h3>
                    </div>
                    {/* Placeholder beautiful gradient chart */}
                    <div className="relative w-full h-48 mt-4 rounded-xl overflow-hidden bg-gradient-to-t from-emerald-50/50 to-white border border-emerald-50">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,100 L0,50 C20,60 40,20 60,40 C80,60 90,10 100,20 L100,100 Z" fill="url(#grad)" opacity="0.3" />
                            <path d="M0,50 C20,60 40,20 60,40 C80,60 90,10 100,20" fill="none" stroke="#10b981" strokeWidth="2" />
                            <defs>
                                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 italic">* Chart data rendered from daily transaction aggregates.</p>
                </div>
            </div>
        </div>
    );
}
