'use client';

import { 
    Package, AlertTriangle, ArrowUpRight, ArrowDownRight, 
    Layers, ShoppingBag 
} from 'lucide-react';

export default function ProductAnalytics() {
    const topProducts = [
        { name: 'SPF 50 Glow Sunscreen', conversion: '4.2%', sales: 450, stock: 'Healthy' },
        { name: 'Vitamin C Night Serum', conversion: '3.8%', sales: 320, stock: 'Low' },
        { name: 'Hydrating Face Mist', conversion: '2.5%', sales: 210, stock: 'Healthy' }
    ];

    const alerts = [
        { product: 'Charcoal Face Wash', status: 'Out of Stock', estLoss: '₹12,000/week' },
        { product: 'Summer Glow Bundle', status: 'Dead Stock', age: '90+ Days' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Layers className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Turnover</p>
                            <p className="text-2xl font-black text-gray-900">4.2x</p>
                        </div>
                    </div>
                    <p className="text-xs text-emerald-600 font-bold bg-emerald-50 inline-block px-2 py-1 rounded-md">Excellent flow</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Product Conv.</p>
                            <p className="text-2xl font-black text-gray-900">2.8%</p>
                        </div>
                    </div>
                    <p className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-1 rounded-md">Industry Standard</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Dead Stock Value</p>
                            <p className="text-2xl font-black text-rose-600">₹45,000</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-rose-500 font-bold">Requires clearance action</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Top Converting Products</h3>
                    </div>
                    <div className="space-y-4">
                        {topProducts.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-gray-300">{i + 1}</span>
                                    <span className="text-sm font-bold text-gray-800">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{p.conversion}</span>
                                    <span className="text-sm font-black text-gray-900">{p.sales} Sales</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Inventory & Lost Revenue Alerts</h3>
                    </div>
                    <div className="space-y-4">
                        {alerts.map((a, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{a.product}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mt-1">{a.status}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-rose-600">
                                        {a.estLoss ? `Est. Loss ${a.estLoss}` : `Stagnant ${a.age}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
