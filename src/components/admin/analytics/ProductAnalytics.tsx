'use client';

import { 
    Package, AlertTriangle, ArrowUpRight, ArrowDownRight, 
    Layers, ShoppingBag, Target, TrendingUp, BarChart, Percent
} from 'lucide-react';

export default function ProductAnalytics({ data }: { data?: any }) {
    if (!data) return null;

    const topProducts = data.topProducts.map((p: any) => ({
        name: p.name,
        conversion: p.sales > 0 ? (p.sales / 10).toFixed(1) : 0, // Placeholder conversion based on sales
        sales: p.sales,
        target: Math.max(100, p.sales * 1.2).toFixed(0),
        stock: p.stock > 10 ? 'Healthy' : p.stock > 0 ? 'Low' : 'Out of Stock',
        revenue: p.revenue
    }));

    const alerts = data.inventoryAlerts.map((a: any) => ({
        product: a.product,
        status: a.status,
        estLoss: a.status === 'Out of Stock' ? 'Lost Sales' : null,
        age: a.status === 'Dead Stock' ? '60+ Days' : null,
        urgency: a.urgency
    }));

    const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Target Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Inventory Turnover Target */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 blur-xl" />
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                                    <Layers className="w-5 h-5 text-purple-600" />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Turnover</p>
                            </div>
                            <div className="px-2 py-1 bg-gray-50 rounded text-[10px] font-bold text-gray-500 border border-gray-100">
                                Target: &gt;4.0x
                            </div>
                        </div>
                        <div className="flex items-end gap-3 border-b border-gray-50 pb-4">
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">4.2x</p>
                            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded mb-1">Hitting Target</span>
                        </div>
                    </div>
                </div>

                {/* Conversion Rate Target */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 blur-xl" />
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                                    <Percent className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catalog Conv. Rate</p>
                            </div>
                            <div className="px-2 py-1 bg-gray-50 rounded text-[10px] font-bold text-gray-500 border border-gray-100">
                                Target: 3.0%
                            </div>
                        </div>
                        <div className="flex items-end gap-3 border-b border-gray-50 pb-4">
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">2.8%</p>
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded mb-1">Below Target</span>
                        </div>
                    </div>
                    {/* Mini progress */}
                    <div className="mt-4 space-y-1">
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '93%' }} />
                        </div>
                    </div>
                </div>

                {/* Dead Stock Liability Target */}
                <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full opacity-50 blur-xl" />
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                                    <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
                                </div>
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Dead Stock Liability</p>
                            </div>
                            <div className="px-2 py-1 bg-rose-50 rounded text-[10px] font-bold text-rose-600 border border-rose-200">
                                Limit: {formatCurrency(30000)}
                            </div>
                        </div>
                        <div className="flex items-end gap-3 border-b border-rose-50 pb-4">
                            <p className="text-4xl font-black text-rose-600 tracking-tighter">{formatCurrency(45000)}</p>
                        </div>
                    </div>
                    {/* Warning text */}
                    <p className="text-[10px] text-rose-500 font-bold mt-4 uppercase tracking-wider text-center bg-rose-50 py-1.5 rounded-lg border border-rose-100">
                        Critical: Exceeds liability limit
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hero Product Performance vs Targets */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-emerald-600" />
                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Unit Sales vs Targets</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">Hero Products</span>
                    </div>
                    
                    <div className="space-y-6">
                        {topProducts.map((p, i) => {
                            const percent = (p.sales / p.target) * 100;
                            const isMet = percent >= 100;
                            return (
                                <div key={i} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800">{p.name}</span>
                                            <span className="text-[10px] font-medium text-gray-400">Conv: {p.conversion}% • Rev: {formatCurrency(p.revenue)}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-gray-900">{p.sales}</span>
                                            <span className="text-xs font-bold text-gray-400 ml-1">/ {p.target}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-3 bg-gray-50 rounded-full border border-gray-100 overflow-hidden relative">
                                            {/* Target Line marker at 100% implicitly the end, but let's say the bar can represent up to 120% of target */}
                                            <div className="absolute top-0 bottom-0 left-[83.33%] w-0.5 bg-gray-300 z-10" title="Target (100%)" />
                                            <div 
                                                className={`h-full ${isMet ? 'bg-emerald-400' : 'bg-blue-400'} rounded-full transition-all duration-1000 group-hover:opacity-80`}
                                                style={{ width: `${Math.min(100, (percent / 120) * 100)}%` }}
                                            />
                                        </div>
                                        <span className={`text-[10px] font-black w-12 text-right ${isMet ? 'text-emerald-600' : 'text-gray-500'}`}>
                                            {percent.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Advanced Inventory Alerts */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Inventory Liabilities</h3>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                        {alerts.map((a, i) => (
                            <div key={i} className={`flex items-start justify-between p-4 rounded-xl border ${
                                a.urgency === 'high' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'
                            }`}>
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${a.urgency === 'high' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                                        <p className={`text-sm font-bold ${a.urgency === 'high' ? 'text-rose-900' : 'text-amber-900'}`}>{a.product}</p>
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest pl-4 ${a.urgency === 'high' ? 'text-rose-600' : 'text-amber-600'}`}>
                                        {a.status}
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        a.urgency === 'high' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                                    }`}>
                                        {a.urgency.toUpperCase()} PRIORITY
                                    </span>
                                    <p className={`text-xs font-black mt-2 ${a.urgency === 'high' ? 'text-rose-600' : 'text-amber-700'}`}>
                                        {a.estLoss ? `Est. Loss ${a.estLoss}` : `Stagnant ${a.age}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="mt-6 w-full py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.98]">
                        Generate Restock/Clearance Report
                    </button>
                </div>
            </div>
        </div>
    );
}
