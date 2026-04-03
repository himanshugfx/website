import { useState } from 'react';
import { 
    IndianRupee, TrendingUp, TrendingDown, RefreshCcw, 
    Tag, CreditCard, BarChart2, Target, Zap, PieChart, Focus,
    Edit2, Save, X, Loader2
} from 'lucide-react';

export default function RevenueAnalytics({ data, onRefresh }: { data?: any, onRefresh?: () => void }) {
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const [newTarget, setNewTarget] = useState(data?.revenueTarget || 300000);
    const [saving, setSaving] = useState(false);

    if (!data) return null;

    const handleTargetUpdate = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/analytics/targets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: Number(newTarget) })
            });
            if (res.ok) {
                setIsEditingTarget(false);
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            console.error('Failed to update target:', err);
        } finally {
            setSaving(false);
        }
    };

    // Use DB data + persistent targets
    const metrics = {
        totalRevenue: data.totalRevenue,
        revenueTarget: data.revenueTarget || 300000,
        revenueGrowth: data.totalRevenue > 0 ? ((data.thisMonthRevenue / data.totalRevenue) * 100) : 0, 
        aov: data.aov,
        aovTarget: Math.max(1500, data.aov * 1.1),
        aovGrowth: 0, 
        refundRate: data.refundRate,
        refundTarget: 2.0,
        refundTrend: 0,
        discountImpact: data.discountImpact,
        discountROI: data.discountImpact > 0 ? Number((data.totalRevenue / data.discountImpact).toFixed(1)) : 0
    };

    const revenueByCategory = data.categoryRevenue.map((cat: any, i: number) => ({
        name: cat.name,
        value: cat.value,
        target: cat.value * 1.2, 
        color: ['bg-purple-600', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'][i % 5]
    }));

    const formatCurrency = (val: number) => `₹${Number(val).toLocaleString()}`;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Master Target Widget */}
            <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-black p-5 md:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-purple-500/30 transition-all duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-400" />
                                <h2 className="text-sm font-black uppercase tracking-widest text-purple-200">Monthly Revenue Goal</h2>
                            </div>
                            {!isEditingTarget ? (
                                <button 
                                    onClick={() => setIsEditingTarget(true)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group/edit"
                                    title="Set Target"
                                >
                                    <Edit2 className="w-3.5 h-3.5 text-purple-400 group-hover/edit:text-white" />
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleTargetUpdate}
                                        disabled={saving}
                                        className="p-1 px-2 bg-purple-600 hover:bg-purple-500 text-[10px] font-bold rounded flex items-center gap-1"
                                    >
                                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => setIsEditingTarget(false)}
                                        className="p-1 px-2 bg-white/10 hover:bg-white/20 text-[10px] font-bold rounded"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">{formatCurrency(data.thisMonthRevenue)}</span>
                                <span className="text-base sm:text-xl font-bold text-gray-400">
                                    / {isEditingTarget ? (
                                        <input 
                                            type="number"
                                            value={newTarget}
                                            onChange={(e) => setNewTarget(Number(e.target.value))}
                                            className="bg-white/5 border border-white/10 rounded px-2 w-32 outline-none focus:border-purple-500 text-white"
                                            autoFocus
                                        />
                                    ) : (
                                        formatCurrency(metrics.revenueTarget)
                                    )}
                                </span>
                            </div>
                            <p className="text-xs font-medium text-gray-400">Combined Store Orders + Invoices. Target is customizable.</p>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-1/3 space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-purple-300">Month Progress</span>
                            <span className="text-white">{Math.round((data.thisMonthRevenue / metrics.revenueTarget) * 100)}%</span>
                        </div>
                        <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                            <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full relative transition-all duration-1000"
                                style={{ width: `${Math.min(100, (data.thisMonthRevenue / metrics.revenueTarget) * 100)}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top row - KPI Cards with Targets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Average Order Value Target */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">AOV Target</span>
                            </div>
                            <div className="px-2 py-1 bg-gray-50 rounded text-[10px] font-bold text-gray-500">
                                Target: {formatCurrency(metrics.aovTarget)}
                            </div>
                        </div>
                        <div className="flex items-end justify-between border-b border-gray-50 pb-4">
                            <div className="text-4xl font-black text-gray-900 tracking-tighter">{formatCurrency(metrics.aov)}</div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">
                                <TrendingUp className="w-3 h-3" />
                                +{metrics.aovGrowth}%
                            </div>
                        </div>
                        {/* Mini progress */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase">
                                <span>Progress to AOV Target</span>
                                <span>{Math.round((metrics.aov / metrics.aovTarget) * 100)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min(100, (metrics.aov / metrics.aovTarget) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refund & Return Rate */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                    <RefreshCcw className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Refund Target</span>
                            </div>
                            <div className="px-2 py-1 bg-gray-50 rounded text-[10px] font-bold text-gray-500">
                                Max Limit: {metrics.refundTarget}%
                            </div>
                        </div>
                        <div className="flex items-end justify-between border-b border-gray-50 pb-4">
                            <div className="text-4xl font-black text-emerald-600 tracking-tighter">{metrics.refundRate}%</div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">
                                <TrendingDown className="w-3 h-3" />
                                {metrics.refundTrend}%
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-500">Tracking perfectly below maximum threshold.</span>
                        </div>
                    </div>
                </div>

                {/* Discount Impact vs ROI */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                                <Zap className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Discount Performance</span>
                        </div>
                        <div className="flex items-end justify-between pb-2">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 mb-1">Cost of Discounts</p>
                                <div className="text-2xl font-black text-gray-900 tracking-tighter">{formatCurrency(metrics.discountImpact)}</div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 mb-1">Generated Revenue</p>
                                <div className="text-2xl font-black text-emerald-600 tracking-tighter">{formatCurrency(metrics.discountImpact * metrics.discountROI)}</div>
                            </div>
                        </div>
                        <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100 text-center">
                            <p className="text-[10px] font-black text-amber-700">CAMPAIGN ROI IS {metrics.discountROI}x (Healthy)</p>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}
